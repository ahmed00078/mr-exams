from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, desc
from models.database import ExamResult, ExamSession, RefEtablissement, RefWilaya, RefSerie
from models.schemas import SearchParams, ExamResultResponse, SearchResponse
from core.cache import cache_manager
import uuid

class ResultsService:
    
    def __init__(self, db: Session):
        self.db = db
    
    async def search_results(self, params: SearchParams) -> SearchResponse:
        """Recherche des résultats avec cache et optimisations"""
        
        # Vérifier le cache d'abord
        cache_key = params.dict()
        cached_result = await cache_manager.get_cached_search(cache_key)
        if cached_result and isinstance(cached_result, dict):
            return SearchResponse(**cached_result)
        
        # Construire la requête
        query = self.db.query(ExamResult).options(
            joinedload(ExamResult.etablissement),
            joinedload(ExamResult.serie),
            joinedload(ExamResult.wilaya),
            joinedload(ExamResult.session)
        ).filter(ExamResult.is_published == True)
        
        # Appliquer les filtres
        if params.nni:
            query = query.filter(ExamResult.nni == params.nni)
        
        if params.numero_dossier:
            query = query.filter(ExamResult.numero_dossier == params.numero_dossier)
        
        if params.nom:
            # Recherche floue sur le nom
            search_term = f"%{params.nom}%"
            query = query.filter(
                or_(
                    ExamResult.nom_complet_fr.ilike(search_term),
                    ExamResult.nom_complet_ar.ilike(search_term)
                )
            )
        
        if params.wilaya_id:
            query = query.filter(ExamResult.wilaya_id == params.wilaya_id)
        
        if params.etablissement_id:
            query = query.filter(ExamResult.etablissement_id == params.etablissement_id)
        
        if params.serie_id:
            query = query.filter(ExamResult.serie_id == params.serie_id)
        
        if params.serie_code:
            query = query.filter(ExamResult.serie.has(RefSerie.code == params.serie_code))
        
        if params.decision:
            query = query.filter(ExamResult.decision == params.decision)
        
        if params.year:
            query = query.filter(ExamResult.session.has(ExamSession.year == params.year))
        
        if params.exam_type:
            query = query.filter(ExamResult.session.has(ExamSession.exam_type == params.exam_type))
        
        # Compter le total
        total = query.count()
        
        # Appliquer la pagination avec tri adapté selon le type d'examen
        offset = (params.page - 1) * params.size
        
        if params.exam_type == 'concours':
            # Pour les concours: trier par moyenne_generale décroissant
            results = query.order_by(
                ExamResult.moyenne_generale.desc().nullslast(),
                desc(ExamResult.created_at)
            ).offset(offset).limit(params.size).all()
        else:
            # Pour BAC/BEPC: trier par moyenne_generale décroissante
            results = query.order_by(
                ExamResult.moyenne_generale.desc().nullslast(),
                desc(ExamResult.created_at)
            ).offset(offset).limit(params.size).all()
        
        # Calculer les métadonnées de pagination
        total_pages = (total + params.size - 1) // params.size
        has_next = params.page < total_pages
        has_prev = params.page > 1
        
        # Convertir en schéma de réponse
        result_data = {
            "results": [ExamResultResponse.model_validate(result).model_dump() for result in results],
            "total": total,
            "page": params.page,
            "size": params.size,
            "total_pages": total_pages,
            "has_next": has_next,
            "has_prev": has_prev
        }
        
        # Mettre en cache
        await cache_manager.cache_search_results(cache_key, result_data)
        
        return SearchResponse(**result_data)
    
    def get_result_by_id(self, result_id: uuid.UUID) -> Optional[ExamResult]:
        """Récupère un résultat par son ID avec rangs calculés dynamiquement"""
        result = self.db.query(ExamResult).options(
            joinedload(ExamResult.etablissement),
            joinedload(ExamResult.serie),
            joinedload(ExamResult.wilaya),
            joinedload(ExamResult.session)
        ).filter(
            and_(
                ExamResult.id == result_id,
                ExamResult.is_published == True
            )
        ).first()
        
        if result and result.decision.lower() == "admis":
            # Vérifier si on a la note appropriée selon le type d'examen
            exam_type = result.session.exam_type if result.session else None
            has_score = result.moyenne_generale is not None
            
            if has_score:
                # Calculer les rangs dynamiquement pour les candidats admis seulement
                result.rang_etablissement = self._calculate_school_rank(result)
                result.rang_wilaya = self._calculate_wilaya_rank(result)
                result.rang_national = self._calculate_national_rank(result)
        
        return result
    
    def increment_view_count(self, result_id: uuid.UUID):
        """Incrémente le compteur de vues"""
        self.db.query(ExamResult).filter(ExamResult.id == result_id).update(
            {ExamResult.view_count: ExamResult.view_count + 1}
        )
        self.db.commit()
    
    def _calculate_school_rank(self, result: ExamResult) -> Optional[int]:
        """Calcule le rang dans l'établissement"""
        if not result.etablissement_id:
            return None
        
        exam_type = result.session.exam_type if result.session else None
        
        if exam_type == 'concours':
            if result.moyenne_generale is None:
                return None
            # Compter combien d'étudiants ont une meilleure note dans le même établissement
            count = self.db.query(ExamResult).filter(
                and_(
                    ExamResult.etablissement_id == result.etablissement_id,
                    ExamResult.session_id == result.session_id,
                    ExamResult.decision.ilike("admis"),
                    ExamResult.moyenne_generale > result.moyenne_generale,
                    ExamResult.is_published == True
                )
            ).count()
        else:
            if not result.moyenne_generale:
                return None
            # Compter combien d'étudiants ont une meilleure moyenne dans le même établissement
            count = self.db.query(ExamResult).filter(
                and_(
                    ExamResult.etablissement_id == result.etablissement_id,
                    ExamResult.session_id == result.session_id,
                    ExamResult.decision.ilike("admis"),
                    ExamResult.moyenne_generale > result.moyenne_generale,
                    ExamResult.is_published == True
                )
            ).count()
        
        return count + 1
    
    def _calculate_wilaya_rank(self, result: ExamResult) -> Optional[int]:
        """Calcule le rang dans la wilaya"""
        if not result.wilaya_id:
            return None
        
        exam_type = result.session.exam_type if result.session else None
        
        if exam_type == 'concours':
            if result.moyenne_generale is None:
                return None
            # Compter combien d'étudiants ont une meilleure note dans la même wilaya
            count = self.db.query(ExamResult).filter(
                and_(
                    ExamResult.wilaya_id == result.wilaya_id,
                    ExamResult.session_id == result.session_id,
                    ExamResult.decision.ilike("admis"),
                    ExamResult.moyenne_generale > result.moyenne_generale,
                    ExamResult.is_published == True
                )
            ).count()
        else:
            if not result.moyenne_generale:
                return None
            # Compter combien d'étudiants ont une meilleure moyenne dans la même wilaya
            count = self.db.query(ExamResult).filter(
                and_(
                    ExamResult.wilaya_id == result.wilaya_id,
                    ExamResult.session_id == result.session_id,
                    ExamResult.decision.ilike("admis"),
                    ExamResult.moyenne_generale > result.moyenne_generale,
                    ExamResult.is_published == True
                )
            ).count()
        
        return count + 1
    
    def _calculate_national_rank(self, result: ExamResult) -> Optional[int]:
        """Calcule le rang national"""
        exam_type = result.session.exam_type if result.session else None
        
        if exam_type == 'concours':
            if result.moyenne_generale is None:
                return None
            # Compter combien d'étudiants ont une meilleure note au niveau national
            count = self.db.query(ExamResult).filter(
                and_(
                    ExamResult.session_id == result.session_id,
                    ExamResult.decision.ilike("admis"),
                    ExamResult.moyenne_generale > result.moyenne_generale,
                    ExamResult.is_published == True
                )
            ).count()
        else:
            if not result.moyenne_generale:
                return None
            # Compter combien d'étudiants ont une meilleure moyenne au niveau national
            count = self.db.query(ExamResult).filter(
                and_(
                    ExamResult.session_id == result.session_id,
                    ExamResult.decision.ilike("admis"),
                    ExamResult.moyenne_generale > result.moyenne_generale,
                    ExamResult.is_published == True
                )
            ).count()
        
        return count + 1
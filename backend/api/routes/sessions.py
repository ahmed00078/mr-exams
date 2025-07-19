from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
from decimal import Decimal
from database import get_db
from models.database import ExamSession, ExamResult
from models.schemas import SessionResponse, SessionListResponse

router = APIRouter(prefix="/sessions", tags=["Sessions"])

@router.get("/", response_model=List[SessionResponse])
async def get_published_sessions(
    exam_type: Optional[str] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Liste toutes les sessions d'examens publiées avec statistiques calculées dynamiquement"""
    
    query = db.query(ExamSession).filter(ExamSession.is_published == True)
    
    if exam_type:
        query = query.filter(ExamSession.exam_type == exam_type)
    
    if year:
        query = query.filter(ExamSession.year == year)
    
    sessions = query.order_by(ExamSession.year.desc(), ExamSession.exam_type).all()
    
    # Calculer les statistiques dynamiquement pour chaque session
    result = []
    for session in sessions:
        # Calculer le nombre total de candidats
        total_candidates = db.query(ExamResult).filter(
            and_(
                ExamResult.session_id == session.id,
                ExamResult.is_published == True
            )
        ).count()
        
        # Calculer le nombre d'admis
        total_passed = db.query(ExamResult).filter(
            and_(
                ExamResult.session_id == session.id,
                ExamResult.is_published == True,
                ExamResult.decision.ilike("admis")
            )
        ).count()
        
        # Calculer le taux de réussite
        pass_rate = Decimal('0')
        if total_candidates > 0:
            pass_rate = Decimal(str(round((total_passed / total_candidates) * 100, 2)))
        
        # Mettre à jour les champs calculés
        session.total_candidates = total_candidates
        session.total_passed = total_passed
        session.pass_rate = pass_rate
        
        result.append(SessionResponse.from_orm(session))
    
    return result

@router.get("/current", response_model=SessionResponse)
async def get_current_session(
    exam_type: str,
    db: Session = Depends(get_db)
):
    """Récupère la session en cours pour un type d'examen"""
    
    session = db.query(ExamSession).filter(
        ExamSession.exam_type == exam_type,
        ExamSession.is_published == True
    ).order_by(ExamSession.year.desc()).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Aucune session disponible")
    
    return SessionResponse.from_orm(session)

@router.get("/{session_id}/stats")
async def get_session_summary(
    session_id: int,
    db: Session = Depends(get_db)
):
    """Statistiques résumées d'une session"""
    
    session = db.query(ExamSession).filter(ExamSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session non trouvée")
    
    return {
        "session_id": session.id,
        "year": session.year,
        "exam_type": session.exam_type,
        "session_name": session.session_name,
        "total_candidates": session.total_candidates,
        "total_passed": session.total_passed,
        "pass_rate": float(session.pass_rate) if session.pass_rate else 0,
        "publication_date": session.publication_date,
        "is_published": session.is_published
    }
import pandas as pd
import uuid
from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import UploadFile
from models.database import ExamResult, ExamSession, RefEtablissement, RefWilaya, RefSerie
from models.schemas import BulkUploadResponse, BulkUploadStatus
import asyncio
import json
import re
import os

class UploadService:
    
    # Stockage global des tâches (partagé entre instances)
    _upload_tasks = {}
    
    # Configurations de mapping par défaut basées sur les formats réels
    DEFAULT_MAPPINGS = {
        "BAC": {
            "description": "Format BAC 2024",
            "sample_columns": ["Hod Charghy", "الحوض الشرقي", "Lycée Nema", "SN", "Sciences Naturelles", "NNI", "Nom complet", "Lieu naissance", "Date naissance", "Moyenne", "Decision"],
            "mapping": {
                "nni": {"position": 13, "alternatives": ["NNI"]},
                "nom_complet_fr": {"position": 14, "alternatives": ["Nom", "NOMPL"]},
                "nom_complet_ar": {"position": None, "alternatives": ["NOM_AR"]},
                "lieu_naissance": {"position": 15, "alternatives": ["Lieu", "LIEUN"]},
                "date_naissance": {"position": 16, "alternatives": ["Date", "DATN"]},
                "moyenne_generale": {"position": 17, "alternatives": ["Moyenne", "MOYBAC", "MOYG", "Total"]},
                "decision": {"position": 18, "alternatives": ["Decision", "Resultat"]},
                "serie_code": {"position": 10, "alternatives": ["SERIE", "Serie"]},
                "wilaya_fr": {"position": 1, "alternatives": ["WILAYA_FR"]},
                "etablissement": {"position": 3, "alternatives": ["Etablissement", "Lycee"]}
            }
        },
        "CONCOURS_1AS": {
            "description": "Concours d'entrée en 1AS",
            "sample_columns": ["Noreg", "Numéro_C1AS", "NODOSS", "NOM_AR", "LIEU NAISS_AR", "TYPE", "Ecole_AR", "ANNEE_NAISS", "WILAYA_AR", "MOUGHATAA_AR", "Centre Examen_AR", "TOTAL"],
            "mapping": {
                "nni": {"column": "Numéro_C1AS", "alternatives": ["NNI", "Numero"]},
                "numero_dossier": {"column": "NODOSS", "alternatives": ["NODOSS"]},
                "nom_complet_ar": {"column": "NOM_AR", "alternatives": ["NOM_AR", "Nom_AR"]},
                "lieu_naissance": {"column": "LIEU NAISS_AR", "alternatives": ["LIEU_NAISSANCE", "Lieu"]},
                "annee_naissance": {"column": "ANNEE_NAISS", "alternatives": ["ANNEE", "Annee"]},
                "moyenne_generale": {"column": "TOTAL", "alternatives": ["TOTAL", "Moyenne", "Note"]},
                "wilaya_ar": {"column": "WILAYA_AR", "alternatives": ["WILAYA"]},
                "moughataa": {"column": "MOUGHATAA_AR", "alternatives": ["MOUGHATAA"]},
                "centre_examen": {"column": "Centre Examen_AR", "alternatives": ["Centre"]},
                "ecole": {"column": "Ecole_AR", "alternatives": ["Ecole"]},
                "type_candidat": {"column": "TYPE", "alternatives": ["Type"]},
                "decision": {"auto_calculate": True}  # Auto-calculé selon la moyenne
            }
        }
    }
    
    def __init__(self, db: Session):
        self.db = db
        
    def detect_format(self, df: pd.DataFrame) -> str:
        """Détecte automatiquement le format du fichier"""
        columns = [str(col).strip() for col in df.columns]
        
        # Vérifier pour CONCOURS_1AS
        concours_indicators = ["Numéro_C1AS", "NOM_AR", "WILAYA_AR", "MOUGHATAA_AR"]
        if any(indicator in columns for indicator in concours_indicators):
            return "CONCOURS_1AS"
            
        # Vérifier pour BAC (plus de colonnes, format différent)
        if len(columns) > 15 and "Sciences Naturelles" in ' '.join(columns):
            return "BAC"
            
        # Format par défaut
        return "CONCOURS_1AS"
    
    async def process_bulk_upload(self, file: UploadFile, session_id: int) -> BulkUploadResponse:
        """Traite l'upload en masse de résultats"""
        
        # Générer un ID de tâche unique
        task_id = str(uuid.uuid4())
        
        # Lire le fichier
        content = await file.read()
        
        # Déterminer le type de fichier et lire les données
        if file.filename.endswith('.csv'):
            df = pd.read_csv(pd.io.common.StringIO(content.decode('utf-8')))
        elif file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(pd.io.common.BytesIO(content))
        else:
            raise ValueError("Format de fichier non supporté. Utilisez CSV ou Excel.")
        
        # Détecter automatiquement le format
        detected_format = self.detect_format(df)
        print(f"Format détecté: {detected_format}")
        
        total_rows = len(df)
        
        # Initialiser le statut de la tâche
        UploadService._upload_tasks[task_id] = BulkUploadStatus(
            task_id=task_id,
            status="pending",
            progress=0,
            total_rows=total_rows,
            processed_rows=0,
            success_count=0,
            error_count=0,
            errors=[]
        )
        
        # Lancer le traitement en arrière-plan
        print(f"Lancement traitement pour tâche {task_id} avec session_id {session_id}")
        asyncio.create_task(self._process_upload_async(task_id, df, session_id, detected_format))
        
        return BulkUploadResponse(
            task_id=task_id,
            message="Upload en cours de traitement",
            total_rows=total_rows
        )
    
    async def _process_upload_async(self, task_id: str, df: pd.DataFrame, session_id: int, format_type: str):
        """Traite l'upload de manière asynchrone"""
        
        task_status = UploadService._upload_tasks[task_id]
        task_status.status = "processing"
        
        try:
            # Vérifier que la session existe
            session = self.db.query(ExamSession).filter(ExamSession.id == session_id).first()
            if not session:
                task_status.status = "failed"
                task_status.errors.append("Session d'examen introuvable")
                return
            
            # Créer des caches pour les références
            etablissements_cache = {e.code: e.id for e in self.db.query(RefEtablissement).all()}
            wilayas_cache = {w.code: w.id for w in self.db.query(RefWilaya).all()}
            series_cache = {s.code: s.id for s in self.db.query(RefSerie).all()}
            
            success_count = 0
            error_count = 0
            
            print(f"Début traitement {len(df)} lignes pour la tâche {task_id}")
            
            for index, row in df.iterrows():
                try:
                    # Valider et créer le résultat
                    result_data = self._validate_and_map_row(row, session_id, etablissements_cache, wilayas_cache, series_cache, format_type)
                    
                    if result_data:
                        # Vérifier si le résultat existe déjà
                        existing = self.db.query(ExamResult).filter(
                            and_(
                                ExamResult.nni == result_data["nni"],
                                ExamResult.session_id == session_id
                            )
                        ).first()
                        
                        if existing:
                            # Mettre à jour
                            for key, value in result_data.items():
                                setattr(existing, key, value)
                            print(f"Ligne {index + 1}: Mise à jour NNI {result_data['nni']}")
                        else:
                            # Créer nouveau
                            result = ExamResult(**result_data)
                            self.db.add(result)
                            print(f"Ligne {index + 1}: Ajout NNI {result_data['nni']}")
                        
                        success_count += 1
                    else:
                        error_count += 1
                        error_msg = f"Ligne {index + 2}: Données invalides"
                        task_status.errors.append(error_msg)
                        print(error_msg)
                    
                except Exception as e:
                    error_count += 1
                    error_msg = f"Ligne {index + 2}: {str(e)}"
                    task_status.errors.append(error_msg)
                    print(f"Erreur: {error_msg}")
                
                # Mettre à jour le progrès
                task_status.processed_rows = index + 1
                task_status.success_count = success_count
                task_status.error_count = error_count
                task_status.progress = int((index + 1) / len(df) * 100)
                
                # Commit par batches pour la performance
                if (index + 1) % 100 == 0:
                    try:
                        self.db.commit()
                        print(f"Commit batch à la ligne {index + 1}")
                    except Exception as e:
                        print(f"Erreur commit batch: {e}")
                        self.db.rollback()
            
            # Commit final
            try:
                self.db.commit()
                print(f"Commit final - {success_count} succès, {error_count} erreurs")
            except Exception as e:
                print(f"Erreur commit final: {e}")
                self.db.rollback()
                task_status.status = "failed"
                task_status.errors.append(f"Erreur lors du commit final: {str(e)}")
                return
            
            # Finaliser le statut
            task_status.status = "completed"
            task_status.progress = 100
            print(f"Traitement terminé pour la tâche {task_id}")
            
        except Exception as e:
            print(f"Erreur globale dans _process_upload_async: {e}")
            task_status.status = "failed"
            task_status.errors.append(f"Erreur globale: {str(e)}")
            self.db.rollback()
    
    def _validate_and_map_row(self, row: pd.Series, session_id: int, etablissements_cache: Dict, wilayas_cache: Dict, series_cache: Dict, format_type: str = None) -> Dict[str, Any]:
        """Valide et mappe une ligne du fichier vers un ExamResult avec mapping flexible"""
        
        # Détecter le format si non spécifié
        if not format_type:
            df_temp = pd.DataFrame([row])
            format_type = self.detect_format(df_temp)
        
        mapping_config = self.DEFAULT_MAPPINGS.get(format_type, self.DEFAULT_MAPPINGS["CONCOURS_1AS"])
        mapping = mapping_config["mapping"]
        
        result_data = {
            "session_id": session_id,
            "is_published": True,
            "is_verified": True
        }
        
        # Mapper les champs selon la configuration
        result_data["nni"] = self._extract_field(row, "nni", mapping)
        result_data["numero_dossier"] = self._extract_field(row, "numero_dossier", mapping)
        result_data["nom_complet_fr"] = self._extract_field(row, "nom_complet_fr", mapping)
        result_data["nom_complet_ar"] = self._extract_field(row, "nom_complet_ar", mapping)
        result_data["lieu_naissance"] = self._extract_field(row, "lieu_naissance", mapping)
        
        # Traitement spécial pour la date de naissance
        date_field = self._extract_field(row, "date_naissance", mapping)
        if date_field:
            result_data["date_naissance"] = self._parse_date(date_field)
        
        # Traitement pour l'année de naissance (spécifique à 1AS)
        annee_naissance = self._extract_field(row, "annee_naissance", mapping)
        if annee_naissance and not result_data.get("date_naissance"):
            try:
                # Créer une date approximative avec l'année
                result_data["date_naissance"] = pd.to_datetime(f"01/01/{annee_naissance}").date()
            except:
                pass
        
        # Moyenne
        moyenne_str = self._extract_field(row, "moyenne_generale", mapping)
        if moyenne_str:
            result_data["moyenne_generale"] = self._parse_float(moyenne_str)
        
        # Décision
        decision = self._extract_field(row, "decision", mapping)
        if decision:
            result_data["decision"] = str(decision).strip()
        elif mapping.get("decision", {}).get("auto_calculate"):
            # Auto-calculer la décision selon la moyenne
            moyenne = result_data.get("moyenne_generale", 0)
            if moyenne >= 85:  # Seuil d'admission pour 1AS
                result_data["decision"] = "Admis"
            else:
                result_data["decision"] = "Ajourné"
        
        # Série (pour BAC)
        serie_code = self._extract_field(row, "serie_code", mapping)
        if serie_code and serie_code in series_cache:
            result_data["serie_id"] = series_cache[serie_code]
        
        # Wilaya avec mapping AR/FR
        wilaya_name = self._extract_field(row, "wilaya_ar", mapping) or self._extract_field(row, "wilaya_fr", mapping)
        if wilaya_name:
            wilaya_id = self._find_wilaya_id(wilaya_name, wilayas_cache)
            if wilaya_id:
                result_data["wilaya_id"] = wilaya_id
        
        # Validation minimale - adapter selon le format
        nni = result_data.get("nni")
        if not nni:
            return None
        
        # Pour CONCOURS_1AS, le NNI peut être plus court (2-3 chiffres)
        # Pour BAC, le NNI est plus long (10 chiffres)
        if format_type == "CONCOURS_1AS":
            if len(str(nni)) < 1:
                return None
        else:
            if len(str(nni)) < 8:
                return None
        
        if not result_data.get("nom_complet_fr") and not result_data.get("nom_complet_ar"):
            return None
        
        # Si pas de nom français mais nom arabe existe, copier le nom arabe
        if not result_data.get("nom_complet_fr") and result_data.get("nom_complet_ar"):
            result_data["nom_complet_fr"] = result_data["nom_complet_ar"]
        
        if not result_data.get("decision"):
            return None
        
        return result_data
    
    def _extract_field(self, row: pd.Series, field_name: str, mapping: Dict) -> str:
        """Extrait un champ selon la configuration de mapping"""
        field_config = mapping.get(field_name, {})
        
        # Si mapping par colonne
        if "column" in field_config:
            column_name = field_config["column"]
            value = row.get(column_name)
            if pd.notna(value):
                return str(value).strip()
        
        # Si mapping par position (pour BAC)
        if "position" in field_config and field_config["position"] is not None:
            try:
                value = row.iloc[field_config["position"]]
                if pd.notna(value):
                    return str(value).strip()
            except:
                pass
        
        # Essayer les alternatives
        alternatives = field_config.get("alternatives", [])
        for alt in alternatives:
            value = row.get(alt)
            if pd.notna(value):
                return str(value).strip()
        
        return None
    
    def _parse_date(self, date_str: str) -> Optional[object]:
        """Parse différents formats de date"""
        if not date_str:
            return None
        
        try:
            date_str = str(date_str).strip()
            # Format français dd-mmm-yy
            if "-" in date_str and any(month in date_str for month in ["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"]):
                return pd.to_datetime(date_str, format="%d-%b-%y").date()
            # Format dd/mm/yy
            elif "/" in date_str:
                return pd.to_datetime(date_str, format="%d/%m/%y").date()
            else:
                return pd.to_datetime(date_str).date()
        except:
            return None
    
    def _parse_float(self, value_str: str) -> Optional[float]:
        """Parse une valeur float avec gestion des virgules"""
        if not value_str:
            return None
        
        try:
            return float(str(value_str).replace(",", "."))
        except:
            return None
    
    def _find_wilaya_id(self, wilaya_name: str, wilayas_cache: Dict) -> Optional[int]:
        """Trouve l'ID de wilaya selon le nom AR ou FR"""
        if not wilaya_name:
            return None
        
        # Mapping des noms arabes vers codes (selon la base de données exacte)
        wilaya_ar_mapping = {
            "الحوض الشرقي": "01",    # Hod Charghy
            "الحوض الغربي": "02",     # Hod Gharby  
            "لعصابه": "03",         # Assaba
            "اترارزه": "06",        # Trarza
            "تكانت": "09",          # Tagant
            "اينشيري": "12",        # Inchiri
            "تيرس ازمور": "11",     # Tiris Zemour
            "انواكشوط الشمالية": "13", # Nouakchott Nord
            "انواكشوط الغربية": "14",  # Nouakchott Ouest
            "انواكشوط الجنوبية": "15", # Nouakchott Sud
        }
        
        # Mapping des noms français vers codes
        wilaya_fr_mapping = {
            "Hod Charghy": "01",
            "Hod Gharby": "02", 
            "Assaba": "03",
            "Trarza": "06",
            "Tagant": "09",
            "Inchiri": "12",
            "Tiris Zemour": "11",
            "Nouakchott Nord": "13",
            "Nouakchott Ouest": "14",
            "Nouakchott Sud": "15"
        }
        
        # Essayer mapping arabe
        wilaya_code = wilaya_ar_mapping.get(wilaya_name)
        if not wilaya_code:
            # Essayer mapping français
            wilaya_code = wilaya_fr_mapping.get(wilaya_name)
        
        if wilaya_code and wilaya_code in wilayas_cache:
            return wilayas_cache[wilaya_code]
        
        return None
    
    async def preview_upload_file(self, file: UploadFile) -> Dict[str, Any]:
        """Prévisualise un fichier avant upload complet"""
        
        # Lire le fichier
        content = await file.read()
        
        # Déterminer le type de fichier et lire les données
        if file.filename.endswith('.csv'):
            df = pd.read_csv(pd.io.common.StringIO(content.decode('utf-8')))
        elif file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(pd.io.common.BytesIO(content))
        else:
            raise ValueError("Format de fichier non supporté. Utilisez CSV ou Excel.")
        
        # Détecter le format
        detected_format = self.detect_format(df)
        
        # Prendre les premières lignes pour aperçu
        preview_df = df.head(5)
        
        # Convertir en données lisibles
        preview_data = []
        for index, row in preview_df.iterrows():
            preview_data.append({col: str(val) if pd.notna(val) else "" for col, val in row.items()})
        
        return {
            "filename": file.filename,
            "detected_format": detected_format,
            "format_description": self.DEFAULT_MAPPINGS[detected_format]["description"],
            "total_rows": len(df),
            "columns": list(df.columns),
            "preview_data": preview_data,
            "mapping_info": self._get_mapping_info(detected_format, df.columns)
        }
    
    def _get_mapping_info(self, format_type: str, columns: List[str]) -> Dict[str, Any]:
        """Retourne les informations de mapping pour le format détecté"""
        mapping_config = self.DEFAULT_MAPPINGS.get(format_type, {})
        mapping = mapping_config.get("mapping", {})
        
        mapped_fields = {}
        missing_fields = []
        
        for field_name, field_config in mapping.items():
            # Vérifier si le champ peut être mappé
            found = False
            
            if "column" in field_config and field_config["column"] in columns:
                mapped_fields[field_name] = {
                    "source": field_config["column"], 
                    "method": "column_name"
                }
                found = True
            elif "position" in field_config and field_config["position"] is not None:
                if field_config["position"] < len(columns):
                    mapped_fields[field_name] = {
                        "source": columns[field_config["position"]], 
                        "method": "position",
                        "position": field_config["position"]
                    }
                    found = True
            else:
                # Vérifier alternatives
                alternatives = field_config.get("alternatives", [])
                for alt in alternatives:
                    if alt in columns:
                        mapped_fields[field_name] = {
                            "source": alt,
                            "method": "alternative"
                        }
                        found = True
                        break
            
            if not found and not field_config.get("auto_calculate"):
                missing_fields.append(field_name)
        
        return {
            "mapped_fields": mapped_fields,
            "missing_fields": missing_fields,
            "auto_calculated": [field for field, config in mapping.items() if config.get("auto_calculate")]
        }
    
    def get_upload_status(self, task_id: str) -> Optional[BulkUploadStatus]:
        """Récupère le statut d'un upload"""
        print(f"Recherche tâche {task_id}, tâches disponibles: {list(UploadService._upload_tasks.keys())}")
        return UploadService._upload_tasks.get(task_id)
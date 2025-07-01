from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.schemas import BulkUploadResponse, BulkUploadStatus
from services.upload_service import UploadService
from core.security import get_current_user, require_permission
from models.database import AdminUser

router = APIRouter(prefix="/admin", tags=["Administration"])

@router.post("/upload", response_model=BulkUploadResponse)
async def upload_bulk_results(
    file: UploadFile = File(..., description="Fichier CSV ou Excel avec les résultats"),
    session_id: int = Form(..., description="ID de la session d'examen"),
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(require_permission("publish_results"))
):
    """Upload en masse des résultats d'examens"""
    
    # Vérifier le type de fichier
    if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(
            status_code=400,
            detail="Format de fichier non supporté. Utilisez CSV ou Excel."
        )
    
    # Vérifier la taille du fichier
    if file.size > 50 * 1024 * 1024:  # 50MB
        raise HTTPException(
            status_code=400,
            detail="Fichier trop volumineux. Taille maximale: 50MB"
        )
    
    service = UploadService(db)
    try:
        return await service.process_bulk_upload(file, session_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du traitement: {str(e)}")

@router.get("/upload/{task_id}/status", response_model=BulkUploadStatus)
async def get_upload_status(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user)
):
    """Récupère le statut d'un upload en cours"""
    
    service = UploadService(db)
    status = service.get_upload_status(task_id)
    
    if not status:
        raise HTTPException(status_code=404, detail="Tâche d'upload non trouvée")
    
    return status
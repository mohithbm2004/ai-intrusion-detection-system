import pandas as pd
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status, Response
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.api.deps import get_current_user
from app.services.prediction_service import prediction_service
from app.services.export_service import export_service
from app.services.ml_service import ml_service
from app.schemas.prediction import (
    FileUploadResponse,
    PredictionHistoryResponse,
    DashboardStatsResponse,
    SingleFlowPredictRequest,
    FlowPredictionResponse
)
from app.models.prediction import PredictionRecord

router = APIRouter(prefix="/predictions", tags=["Predictions & Analytics"])

@router.post("/upload", response_model=FileUploadResponse)
async def upload_csv_and_predict(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only CSV files are supported."
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    try:
        uploaded_file = prediction_service.process_csv_upload(
            file_bytes=file_bytes,
            filename=file.filename,
            user_id=current_user.id,
            db=db
        )
        
        # Get first 10 sample predictions for preview
        sample_records = db.query(PredictionRecord).filter(
            PredictionRecord.file_id == uploaded_file.id
        ).order_by(PredictionRecord.id).limit(10).all()

        return {
            "file_id": uploaded_file.id,
            "filename": uploaded_file.filename,
            "total_flows": uploaded_file.total_flows,
            "attack_count": uploaded_file.attack_count,
            "normal_count": uploaded_file.normal_count,
            "uploaded_at": uploaded_file.uploaded_at,
            "sample_predictions": sample_records
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to process CSV file: {str(e)}"
        )

@router.post("/predict-single", response_model=FlowPredictionResponse)
def predict_single_flow(
    payload: SingleFlowPredictRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        df = pd.DataFrame([payload.features])
        results = ml_service.predict(df)
        res = results[0]

        record = PredictionRecord(
            user_id=current_user.id,
            source_ip=payload.source_ip,
            destination_ip=payload.destination_ip,
            prediction=res["prediction"],
            attack_type=res["attack_type"],
            is_attack=res["is_attack"],
            confidence_score=res["confidence"],
            feature_snapshot=payload.features
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Prediction failed: {str(e)}"
        )

@router.get("/dashboard-stats", response_model=DashboardStatsResponse)
def get_dashboard_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stats = prediction_service.get_dashboard_stats(user_id=current_user.id, db=db)
    return stats

@router.get("/history", response_model=PredictionHistoryResponse)
def get_history(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    attack_type: Optional[str] = None,
    is_attack: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    records, total_count, total_pages = prediction_service.get_prediction_history(
        user_id=current_user.id,
        db=db,
        page=page,
        size=size,
        search=search,
        attack_type=attack_type,
        is_attack=is_attack
    )
    return {
        "total": total_count,
        "page": page,
        "size": size,
        "pages": total_pages,
        "records": records
    }

@router.get("/export")
def export_report(
    format: str = Query("csv", pattern="^(csv|xlsx|pdf)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    records = db.query(PredictionRecord).filter(
        PredictionRecord.user_id == current_user.id
    ).order_by(PredictionRecord.id.desc()).limit(1000).all()

    if not records:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No prediction records found to export."
        )

    if format == "csv":
        content = export_service.export_to_csv(records)
        return Response(
            content=content,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=intrusion_report.csv"}
        )
    elif format == "xlsx":
        content = export_service.export_to_excel(records)
        return Response(
            content=content,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=intrusion_report.xlsx"}
        )
    elif format == "pdf":
        content = export_service.export_to_pdf(records)
        return Response(
            content=content,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=intrusion_report.pdf"}
        )

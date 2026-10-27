import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, AliasChoices

class SingleFlowPredictRequest(BaseModel):
    source_ip: Optional[str] = "192.168.1.105"
    destination_ip: Optional[str] = "10.0.0.5"
    features: Dict[str, float]

class FlowPredictionResponse(BaseModel):
    id: Optional[int] = None
    flow_index: int
    source_ip: str
    destination_ip: str
    prediction: str
    attack_type: str
    is_attack: bool
    confidence: float = Field(..., validation_alias=AliasChoices('confidence', 'confidence_score'))
    timestamp: datetime.datetime

    class Config:
        from_attributes = True
        populate_by_name = True

class FileUploadResponse(BaseModel):
    file_id: int
    filename: str
    total_flows: int
    attack_count: int
    normal_count: int
    uploaded_at: datetime.datetime
    sample_predictions: List[FlowPredictionResponse]

class PredictionHistoryResponse(BaseModel):
    total: int
    page: int
    size: int
    pages: int
    records: List[FlowPredictionResponse]

class DashboardStatsResponse(BaseModel):
    total_predictions: int
    total_attacks: int
    total_normal: int
    attack_percentage: float
    model_accuracy: float
    recent_predictions: List[FlowPredictionResponse]
    attack_distribution: Dict[str, int]
    confidence_histogram: Dict[str, int]
    daily_predictions: List[Dict[str, Any]]

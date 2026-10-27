import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base

class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    file_size_bytes = Column(Integer, default=0)
    total_flows = Column(Integer, default=0)
    attack_count = Column(Integer, default=0)
    normal_count = Column(Integer, default=0)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="files")
    records = relationship("PredictionRecord", back_populates="file", cascade="all, delete-orphan")


class PredictionRecord(Base):
    __tablename__ = "prediction_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    file_id = Column(Integer, ForeignKey("uploaded_files.id", ondelete="CASCADE"), nullable=True)
    
    flow_index = Column(Integer, nullable=False, default=0)
    source_ip = Column(String(45), nullable=False, default="192.168.1.100")
    destination_ip = Column(String(45), nullable=False, default="10.0.0.1")
    
    prediction = Column(String(50), nullable=False)  # ATTACK or BENIGN
    attack_type = Column(String(100), nullable=False) # e.g. DoS Hulk, PortScan, BENIGN
    is_attack = Column(Boolean, nullable=False, default=False)
    confidence_score = Column(Float, nullable=False, default=100.0) # Percentage (0-100)
    
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    feature_snapshot = Column(JSON, nullable=True)

    # Relationships
    user = relationship("User", back_populates="predictions")
    file = relationship("UploadedFile", back_populates="records")

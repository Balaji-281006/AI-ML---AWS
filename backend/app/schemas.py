from pydantic import BaseModel, Field
from typing import Optional


class StationBase(BaseModel):
    station_id: str
    name: str
    state: str
    latitude: float
    longitude: float
    status: str = 'healthy'


class SensorReading(BaseModel):
    timestamp: str
    station_id: str
    temperature: Optional[float] = None
    pressure: Optional[float] = None
    humidity: Optional[float] = None


class AnomalyResult(BaseModel):
    anomaly_id: str
    station_id: str
    sensor_type: str
    timestamp: str
    current_value: float
    expected_value: float
    anomaly_score: float
    severity: str
    anomaly_type: str
    confidence: float
    explanation: str
    recommended_action: str


class AlertBase(BaseModel):
    alert_id: str
    station_id: str
    sensor_type: str
    alert_type: str
    severity: str
    status: str = 'open'
    explanation: str

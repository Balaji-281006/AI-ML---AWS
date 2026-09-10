import os
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Integer, String, Text, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./skyguard.db')
connect_args = {'check_same_thread': False} if DATABASE_URL.startswith('sqlite') else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


class SeedState(Base):
    __tablename__ = 'seed_state'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    dataset_version: Mapped[str] = mapped_column(String(32), default='2026.09-demo')
    initialized_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class UserRecord(Base):
    __tablename__ = 'users'
    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(180), unique=True)
    role: Mapped[str] = mapped_column(String(40))
    status: Mapped[str] = mapped_column(String(30))


class StationRecord(Base):
    __tablename__ = 'stations'
    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    state: Mapped[str] = mapped_column(String(120))
    district: Mapped[str] = mapped_column(String(120))
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(30))
    health: Mapped[int] = mapped_column(Integer)


class SensorRecord(Base):
    __tablename__ = 'sensors'
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    station_id: Mapped[str] = mapped_column(String(32), index=True)
    sensor_type: Mapped[str] = mapped_column(String(40))
    health: Mapped[int] = mapped_column(Integer)


class SensorReadingRecord(Base):
    __tablename__ = 'sensor_readings'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    timestamp: Mapped[str] = mapped_column(String(40), index=True)
    station_id: Mapped[str] = mapped_column(String(32), index=True)
    temperature: Mapped[float | None] = mapped_column(Float, nullable=True)
    pressure: Mapped[float | None] = mapped_column(Float, nullable=True)
    humidity: Mapped[float | None] = mapped_column(Float, nullable=True)
    quality_status: Mapped[str] = mapped_column(String(30), default='Valid')


class AnomalyRecord(Base):
    __tablename__ = 'anomalies'
    id: Mapped[str] = mapped_column(String(48), primary_key=True)
    station_id: Mapped[str] = mapped_column(String(32), index=True)
    sensor_type: Mapped[str] = mapped_column(String(40))
    anomaly_type: Mapped[str] = mapped_column(String(80))
    severity: Mapped[str] = mapped_column(String(20))
    score: Mapped[float] = mapped_column(Float)
    confidence: Mapped[float] = mapped_column(Float)
    timestamp: Mapped[str] = mapped_column(String(40))


class AlertRecord(Base):
    __tablename__ = 'alerts'
    id: Mapped[str] = mapped_column(String(48), primary_key=True)
    station_id: Mapped[str] = mapped_column(String(32), index=True)
    alert_type: Mapped[str] = mapped_column(String(80))
    severity: Mapped[str] = mapped_column(String(20))
    status: Mapped[str] = mapped_column(String(30))
    created_at: Mapped[str] = mapped_column(String(40))


class NotificationRecord(Base):
    __tablename__ = 'notifications'
    id: Mapped[str] = mapped_column(String(48), primary_key=True)
    title: Mapped[str] = mapped_column(String(180))
    message: Mapped[str] = mapped_column(Text)
    priority: Mapped[str] = mapped_column(String(20))
    created_at: Mapped[str] = mapped_column(String(40))


class MaintenancePredictionRecord(Base):
    __tablename__ = 'maintenance_predictions'
    id: Mapped[str] = mapped_column(String(48), primary_key=True)
    station_id: Mapped[str] = mapped_column(String(32), index=True)
    sensor: Mapped[str] = mapped_column(String(60))
    health: Mapped[int] = mapped_column(Integer)
    risk: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(40))


class AuditLogRecord(Base):
    __tablename__ = 'audit_logs'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    action: Mapped[str] = mapped_column(String(120))
    actor: Mapped[str] = mapped_column(String(180))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class SystemMetricRecord(Base):
    __tablename__ = 'system_metrics'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    metric: Mapped[str] = mapped_column(String(100))
    value: Mapped[float] = mapped_column(Float)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    from app.api.routes import ALERTS, ANOMALIES, STATIONS, USERS, make_readings

    with SessionLocal() as session:
        if session.scalar(select(StationRecord).limit(1)) is not None:
            for user in USERS:
                existing = session.get(UserRecord, user['id'])
                if existing:
                    existing.name = user['name']
                    existing.email = user['email']
                    existing.role = user['role']
                    existing.status = user['status']
            session.commit()
            return
        readings = make_readings()
        if session.scalar(select(SeedState).where(SeedState.id == 1)) is None:
            session.add(SeedState())
        session.add_all([UserRecord(id=user['id'], name=user['name'], email=user['email'], role=user['role'], status=user['status']) for user in USERS])
        session.add_all([StationRecord(id=station['id'], name=station['name'], state=station['state'], district=station['district'], latitude=station['latitude'], longitude=station['longitude'], status=station['status'], health=station['health']) for station in STATIONS])
        session.add_all([SensorRecord(id=f"{station['id']}-{sensor}", station_id=station['id'], sensor_type=sensor, health=station['health']) for station in STATIONS for sensor in ('temperature', 'pressure', 'humidity')])
        session.add_all([SensorReadingRecord(timestamp=item['timestamp'], station_id=item['stationId'], temperature=item['temperature'], pressure=item['pressure'], humidity=item['humidity']) for item in readings])
        session.add_all([AnomalyRecord(id=item['id'], station_id=item['stationId'], sensor_type=item['sensorType'], anomaly_type=item['anomalyType'], severity=item['severity'], score=item['anomalyScore'], confidence=item['confidence'], timestamp=item['timestamp']) for item in ANOMALIES])
        session.add_all([AlertRecord(id=item['id'], station_id=item['station'], alert_type=item['type'], severity=item['severity'], status=item['status'], created_at=item['time']) for item in ALERTS])
        session.add(SystemMetricRecord(metric='seeded_readings', value=len(readings)))
        session.commit()

# SkyGuard AI

SkyGuard AI is a production-style meteorological anomaly detection platform designed for Automatic Weather Stations (AWS). It combines a FastAPI backend, a React + TypeScript frontend, and a real ML-based anomaly detection engine to identify faulty sensor readings, missing data, sudden spikes/drops, drift, and cross-sensor inconsistencies.

## Problem Statement

Ministry of Earth Sciences / IMD requires a command-and-control platform that continuously monitors AWS sensors and detects abnormal readings in real time to support disaster management and field operations.

## Solution Overview

- Real-time operational dashboard for station health and alert tracking
- ML-based anomaly detection using statistical and unsupervised models
- Explainable AI reasons for each anomaly
- Demo simulation engine for realistic sensor generation when live AWS feeds are unavailable
- Role-based login and protected access
- Map, analytics, alerts, and historical data views

## Architecture

- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: FastAPI + SQLAlchemy + Pydantic
- Database: PostgreSQL-ready structure with SQLAlchemy models
- ML: pandas, numpy, scikit-learn, z-score, rolling statistics, rate-of-change checks
- Real-time updates: WebSocket-compatible live monitoring layer

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The frontend uses `http://localhost:8001/api` by default in this Windows demo workspace when port 8000 is already occupied. Set `VITE_API_URL` to use another API port.

## Demo Credentials

- Admin: admin@skyguard.ai / password123
- Meteorologist: analyst@skyguard.ai / password123
- Operator: operator@skyguard.ai / password123
- Viewer: viewer@skyguard.ai / password123

## Features

- Dashboard KPI cards and live operational summaries
- AWS map with marker-based station status
- Anomaly timeline and classification engine
- Alert management and acknowledgement workflow
- CSV upload pipeline and validation workflow
- AI explanation panel
- System health and admin console

## ML Approach

The anomaly engine uses a combination of:

- Isolation Forest-style unsupervised logic
- Z-score based outlier detection
- Rolling statistics and baseline drift detection
- Rate-of-change detection for sudden spikes or drops
- Stuck sensor detection for repeated constant values
- Missing-data detection and communication gap alerts
- Cross-sensor consistency checks across temperature, pressure, and humidity

## Data Schema

Core tables include:

- users
- stations
- sensors
- sensor_readings
- anomalies
- alerts
- notifications
- audit_logs

## API Examples

- GET /api/system/health
- GET /api/dashboard/summary
- GET /api/stations
- GET /api/anomalies
- GET /api/alerts
- GET /api/stations/{station_id}
- GET /api/readings?station_id=AWS-001
- GET /api/analytics/trends
- GET /api/insights
- POST /api/alerts/{alert_id}/acknowledge
- POST /api/data-upload/validate
- POST /api/anomalies/run

## Sample CSV

```csv
timestamp,station_id,temperature,pressure,humidity
2026-09-09T00:00:00Z,AWS-001,31.2,1012,67
2026-09-09T00:05:00Z,AWS-001,32.1,1010,66
2026-09-09T00:10:00Z,AWS-001,42.8,1005,18
```

## Docker

```bash
docker-compose up --build
```

## Future Improvements

- Real IMD AWS ingestion via authenticated APIs
- PostgreSQL persistence and Alembic migrations
- WebSocket live telemetry streaming
- Advanced forecasting and alert correlation
- Mobile field operator app

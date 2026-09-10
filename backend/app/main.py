import asyncio
import random

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router, STATIONS, ANOMALIES, ALERTS, NOW, SIMULATION_ACTIVE
from app.db import init_db

app = FastAPI(title='SkyGuard AI API', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(api_router)


@app.on_event('startup')
def initialize_database():
    init_db()

@app.get('/api/system/health')
def system_health():
    return {
        'status': 'ok',
        'backend_status': 'healthy',
        'database_status': 'seeded-demo',
        'ml_engine_status': 'ready',
        'websocket_status': 'active',
        'data_ingestion_status': 'normal',
        'connected_stations': len([station for station in STATIONS if station['online']]),
        'last_processing_time': NOW.isoformat(),
    }

@app.get('/api/dashboard/summary')
def dashboard_summary():
    return {
        'total_aws_stations': len(STATIONS),
        'online_stations': len([station for station in STATIONS if station['online']]),
        'offline_stations': len([station for station in STATIONS if not station['online']]),
        'active_anomalies': len(ANOMALIES),
        'critical_alerts': len([alert for alert in ALERTS if alert['severity'] == 'CRITICAL']),
        'sensors_under_observation': round(len(STATIONS) * .7),
        'anomaly_percentage': round(len(ANOMALIES) / len(STATIONS) * 100, 1),
        'sensor_health_percentage': round(sum(station['health'] for station in STATIONS) / len(STATIONS), 1),
    }

@app.get('/api/health')
def health():
    return {'status': 'ok'}


@app.websocket('/ws/live')
async def live_socket(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            from app.api import routes
            active = routes.SIMULATION_ACTIVE
            station = random.choice(routes.STATIONS)
            payload = {
                'type': 'telemetry', 'simulationActive': active,
                'station': {**station, 'temperature': round(station['temperature'] + random.uniform(-.4, .4), 1), 'humidity': max(0, min(100, station['humidity'] + random.randint(-1, 1))), 'lastUpdated': NOW.isoformat()},
            }
            await websocket.send_json(payload)
            await asyncio.sleep(2 if active else 8)
    except WebSocketDisconnect:
        return

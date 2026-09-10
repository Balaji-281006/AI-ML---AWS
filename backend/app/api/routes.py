from datetime import datetime, timedelta, timezone
from typing import Any
import math
import os

from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile

from app.ml.anomaly_engine import SkyGuardAnomalyEngine

router = APIRouter(prefix='/api')
NOW = datetime(2026, 9, 9, 5, 45, tzinfo=timezone.utc)
JWT_SECRET = os.getenv('SKYGUARD_JWT_SECRET', 'skyguard-demo-secret-change-me')
JWT_ALGORITHM = 'HS256'
pwd_context = CryptContext(schemes=['pbkdf2_sha256'], deprecated='auto')
SIMULATION_ACTIVE = False

LOCATION_ROWS = [
    ('AWS-001', 'Chennai', 'Tamil Nadu', 13.0827, 80.2707, 'Critical', 78),
    ('AWS-002', 'Coimbatore', 'Tamil Nadu', 11.0168, 76.9558, 'Healthy', 92),
    ('AWS-003', 'Madurai', 'Tamil Nadu', 9.9252, 78.1198, 'Warning', 84),
    ('AWS-004', 'Tiruchirappalli', 'Tamil Nadu', 10.7905, 78.7047, 'Healthy', 94),
    ('AWS-005', 'Salem', 'Tamil Nadu', 11.6643, 78.146, 'Warning', 86),
    ('AWS-006', 'Bengaluru', 'Karnataka', 12.9716, 77.5946, 'Warning', 83),
    ('AWS-007', 'Hyderabad', 'Telangana', 17.385, 78.4867, 'Healthy', 93),
    ('AWS-008', 'Mumbai', 'Maharashtra', 19.076, 72.8777, 'Healthy', 96),
    ('AWS-009', 'Pune', 'Maharashtra', 18.5204, 73.8567, 'Healthy', 95),
    ('AWS-010', 'Delhi', 'Delhi', 28.6139, 77.209, 'Warning', 87),
    ('AWS-011', 'Kolkata', 'West Bengal', 22.5726, 88.3639, 'Healthy', 91),
    ('AWS-012', 'Bhubaneswar', 'Odisha', 20.2961, 85.8245, 'Healthy', 90),
    ('AWS-013', 'Guwahati', 'Assam', 26.1445, 91.7362, 'Critical', 72),
    ('AWS-014', 'Jaipur', 'Rajasthan', 26.9124, 75.7873, 'Warning', 82),
    ('AWS-015', 'Ahmedabad', 'Gujarat', 23.0225, 72.5714, 'Healthy', 93),
    ('AWS-016', 'Bhopal', 'Madhya Pradesh', 23.2599, 77.4126, 'Healthy', 94),
    ('AWS-017', 'Lucknow', 'Uttar Pradesh', 26.8467, 80.9462, 'Healthy', 92),
    ('AWS-018', 'Patna', 'Bihar', 25.5941, 85.1376, 'Warning', 84),
    ('AWS-019', 'Kochi', 'Kerala', 9.9312, 76.2673, 'Healthy', 96),
    ('AWS-020', 'Thiruvananthapuram', 'Kerala', 8.5241, 76.9366, 'Healthy', 90),
    ('AWS-021', 'Srinagar', 'Jammu and Kashmir', 34.0837, 74.7973, 'Warning', 81),
    ('AWS-022', 'Dehradun', 'Uttarakhand', 30.3165, 78.0322, 'Healthy', 91),
    ('AWS-023', 'Visakhapatnam', 'Andhra Pradesh', 17.6868, 83.2185, 'Healthy', 90),
    ('AWS-024', 'Vijayawada', 'Andhra Pradesh', 16.5062, 80.648, 'Healthy', 95),
    ('AWS-025', 'Mysuru', 'Karnataka', 12.2958, 76.6394, 'Healthy', 96),
    ('AWS-026', 'Mangaluru', 'Karnataka', 12.9141, 74.856, 'Healthy', 92),
    ('AWS-027', 'Nagpur', 'Maharashtra', 21.1458, 79.0882, 'Warning', 85),
    ('AWS-028', 'Ranchi', 'Jharkhand', 23.3441, 85.3096, 'Healthy', 93),
    ('AWS-029', 'Chandigarh', 'Chandigarh', 30.7333, 76.7794, 'Offline', 58),
    ('AWS-030', 'Thane', 'Maharashtra', 19.2183, 72.9781, 'Offline', 60),
]


def make_station(index: int, row: tuple[Any, ...]) -> dict[str, Any]:
    station_id, name, state, latitude, longitude, status, health = row
    return {
        'id': station_id, 'name': name, 'state': state, 'district': name,
        'latitude': latitude, 'longitude': longitude,
        'temperature': round(24 + ((index * 7) % 19) + (len(name) % 6) * 0.5, 1),
        'pressure': 1010 + ((index * 13) % 25) - 10, 'humidity': 44 + (index % 7) * 5,
        'status': status, 'health': health, 'online': status != 'Offline',
        'lastUpdated': (NOW - timedelta(minutes=index * 15)).isoformat(),
        'installationDate': '2021-04-12',
        'connectivity': 'Offline' if status == 'Offline' else ('Variable' if index % 4 == 0 else 'Stable'),
    }


STATIONS = [make_station(index, row) for index, row in enumerate(LOCATION_ROWS)]

ANOMALY_SPECS = [
    ('AWS-001', 'temperature', 'Temperature Spike', 'CRITICAL', 44.8, 33.4, .93, 'Temperature is significantly above the station recent expected range.'),
    ('AWS-013', 'humidity', 'Humidity Anomaly', 'HIGH', 92, 64, .88, 'Humidity has exceeded the local expected band by 28 percentage points.'),
    ('AWS-010', 'pressure', 'Pressure Drift', 'HIGH', 960, 1007, .81, 'Pressure drift suggests an offset in the sensor baseline.'),
    ('AWS-021', 'temperature', 'Sudden Drop', 'MEDIUM', 12.8, 21.6, .72, 'Rapid cooling is inconsistent with the local seasonal baseline.'),
    ('AWS-006', 'temperature', 'Sensor Drift', 'MEDIUM', 39.1, 31.5, .70, 'The temperature trend shows a sustained upward bias over the last 4 hours.'),
    ('AWS-029', 'temperature', 'Communication Failure', 'CRITICAL', 0, 29.8, .95, 'Station has missed multiple heartbeat signals and telemetry is intermittent.'),
    ('AWS-030', 'pressure', 'Missing Data', 'HIGH', 0, 1008, .90, 'Pressure readings are absent from the last reporting cycle.'),
    ('AWS-003', 'humidity', 'Stuck Sensor', 'MEDIUM', 54, 64, .75, 'Humidity value has remained constant for several consecutive intervals.'),
    ('AWS-018', 'temperature', 'Sudden Spike', 'HIGH', 41.5, 30.7, .84, 'Short interval temperature increase exceeds the operational threshold.'),
    ('AWS-011', 'humidity', 'Unusual Weather Pattern', 'MEDIUM', 72, 58, .69, 'Humidity pattern is unusually elevated relative to the regional pattern.'),
    ('AWS-027', 'pressure', 'Pressure Anomaly', 'HIGH', 948, 1004, .80, 'Pressure is sharply lower than the recent station baseline.'),
    ('AWS-005', 'temperature', 'Temperature Spike', 'CRITICAL', 43.6, 31.9, .90, 'Temperature anomaly exceeds the station operational alert threshold.'),
]

ANOMALIES = [
    {
        'id': f'AN-{1000 + index}', 'stationId': station_id, 'sensorType': sensor,
        'anomalyType': anomaly_type, 'severity': severity,
        'timestamp': (NOW - timedelta(hours=index)).isoformat(), 'currentValue': current,
        'expectedValue': expected, 'anomalyScore': score, 'confidence': round(min(.99, score + .03), 2),
        'explanation': explanation,
        'recommendedAction': 'Inspect sensor calibration and compare with nearby AWS stations.',
    }
    for index, (station_id, sensor, anomaly_type, severity, current, expected, score, explanation) in enumerate(ANOMALY_SPECS)
]

for index in range(len(ANOMALIES), 120):
    station = STATIONS[index % len(STATIONS)]
    sensor = ('temperature', 'pressure', 'humidity')[index % 3]
    ANOMALIES.append({
        'id': f'AN-{1000 + index}', 'stationId': station['id'], 'sensorType': sensor,
        'anomalyType': ('Sensor Drift', 'Sudden Spike', 'Multivariate Inconsistency', 'Missing Data')[index % 4],
        'severity': ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')[index % 4],
        'timestamp': (NOW - timedelta(hours=index % 168)).isoformat(),
        'currentValue': round(station[sensor] + (index % 9 - 4) * (1.2 if sensor == 'temperature' else 3), 1),
        'expectedValue': station[sensor], 'anomalyScore': round(.55 + (index % 40) / 100, 2),
        'confidence': round(.62 + (index % 30) / 100, 2),
        'explanation': 'The observation departs from its rolling temporal baseline and requires review.',
        'recommendedAction': 'Compare with neighboring stations and schedule calibration if the pattern persists.',
    })

ALERTS = [
    {'id': 'AL-2000', 'station': 'AWS-001', 'sensor': 'temperature', 'type': 'Temperature Spike', 'severity': 'CRITICAL', 'time': NOW.isoformat(), 'status': 'Open', 'explanation': 'Temperature is 11.4°C above the expected operating range.', 'assignedTo': 'Field Team North'},
    {'id': 'AL-2001', 'station': 'AWS-013', 'sensor': 'humidity', 'type': 'Humidity Anomaly', 'severity': 'HIGH', 'time': (NOW - timedelta(minutes=30)).isoformat(), 'status': 'Acknowledged', 'explanation': 'Humidity concentration is trending above the local seasonal baseline.', 'assignedTo': 'Analyst Desk'},
    {'id': 'AL-2002', 'station': 'AWS-010', 'sensor': 'pressure', 'type': 'Pressure Drift', 'severity': 'HIGH', 'time': (NOW - timedelta(minutes=60)).isoformat(), 'status': 'Open', 'explanation': 'Pressure drift indicates sensor offset or station calibration issue.', 'assignedTo': 'Maintenance Crew'},
    {'id': 'AL-2003', 'station': 'AWS-029', 'sensor': 'temperature', 'type': 'Communication Failure', 'severity': 'CRITICAL', 'time': (NOW - timedelta(minutes=90)).isoformat(), 'status': 'Open', 'explanation': 'Station missed two heartbeat intervals and telemetry was lost.', 'assignedTo': 'Network Support'},
    {'id': 'AL-2004', 'station': 'AWS-030', 'sensor': 'pressure', 'type': 'Missing Data', 'severity': 'HIGH', 'time': (NOW - timedelta(hours=2)).isoformat(), 'status': 'Resolved', 'explanation': 'Telemetry restored after power cycle on the station module.', 'assignedTo': 'Field Operator'},
    {'id': 'AL-2005', 'station': 'AWS-018', 'sensor': 'temperature', 'type': 'Sudden Spike', 'severity': 'HIGH', 'time': (NOW - timedelta(hours=3)).isoformat(), 'status': 'Open', 'explanation': 'Short interval rise after 14:30 exceeds the alert threshold.', 'assignedTo': 'Meteorologist'},
]

for index in range(len(ALERTS), 36):
    station = STATIONS[index % len(STATIONS)]
    ALERTS.append({
        'id': f'AL-{2000 + index}', 'station': station['id'], 'sensor': ('temperature', 'pressure', 'humidity')[index % 3],
        'type': ('Sensor Drift', 'Communication Failure', 'Missing Data', 'Weather Pattern Review')[index % 4],
        'severity': ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')[index % 4],
        'time': (NOW - timedelta(minutes=index * 17)).isoformat(),
        'status': ('New', 'Acknowledged', 'Investigating', 'Resolved')[index % 4],
        'explanation': 'Automated quality-control alert generated from the station telemetry pipeline.',
        'assignedTo': ('Analyst Desk', 'Field Operator', 'Maintenance Crew')[index % 3],
    })

USERS = [
    {'id': 'USR-101', 'name': 'Balaji R', 'email': 'admin@skyguard.ai', 'role': 'Admin', 'status': 'Active', 'password': pwd_context.hash('password123')},
    {'id': 'USR-102', 'name': 'Dr. Priya', 'email': 'meteorologist@skyguard.ai', 'role': 'Meteorologist', 'status': 'Active', 'password': pwd_context.hash('password123')},
    {'id': 'USR-103', 'name': 'Vishnuvarthini', 'email': 'operator@skyguard.ai', 'role': 'Operator', 'status': 'Active', 'password': pwd_context.hash('password123')},
    {'id': 'USR-104', 'name': 'Surendar', 'email': 'viewer@skyguard.ai', 'role': 'Viewer', 'status': 'Active', 'password': pwd_context.hash('password123')},
    {'id': 'USR-105', 'name': 'Balaji', 'email': 'ananya@skyguard.ai', 'role': 'Meteorologist', 'status': 'Inactive', 'password': pwd_context.hash('password123')},
]

class LoginRequest(BaseModel):
    email: str
    password: str


def public_user(user: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in user.items() if key != 'password'}


def create_token(user: dict[str, Any]) -> str:
    return jwt.encode({'sub': user['email'], 'role': user['role'], 'exp': datetime.now(timezone.utc) + timedelta(hours=8)}, JWT_SECRET, algorithm=JWT_ALGORITHM)


def require_user(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    if not authorization or not authorization.lower().startswith('bearer '):
        raise HTTPException(status_code=401, detail='Authentication required')
    try:
        claims = jwt.decode(authorization.split(' ', 1)[1], JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError as exc:
        raise HTTPException(status_code=401, detail='Invalid token') from exc
    user = next((item for item in USERS if item['email'] == claims.get('sub') and item['status'] == 'Active'), None)
    if not user:
        raise HTTPException(status_code=401, detail='User not found')
    return user


@router.post('/auth/login')
def login(payload: LoginRequest):
    user = next((item for item in USERS if item['email'].lower() == payload.email.lower() and item['status'] == 'Active'), None)
    if not user or not pwd_context.verify(payload.password, user['password']):
        raise HTTPException(status_code=401, detail='Invalid email or password')
    return {'access_token': create_token(user), 'token_type': 'bearer', 'user': public_user(user)}


@router.get('/auth/me')
def auth_me(authorization: str | None = Header(default=None)):
    if not authorization or not authorization.lower().startswith('bearer '):
        raise HTTPException(status_code=401, detail='Authentication required')
    try:
        claims = jwt.decode(authorization.split(' ', 1)[1], JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError as exc:
        raise HTTPException(status_code=401, detail='Invalid token') from exc
    user = next((item for item in USERS if item['email'] == claims.get('sub')), None)
    if not user:
        raise HTTPException(status_code=401, detail='User not found')
    return public_user(user)


def make_readings(station_id: str | None = None) -> list[dict[str, Any]]:
    stations = [station for station in STATIONS if station_id is None or station['id'] == station_id]
    readings: list[dict[str, Any]] = []
    for station in stations:
        for index in range(336):
            stamp = NOW - timedelta(minutes=(47 - index) * 30)
            readings.append({
                'timestamp': stamp.isoformat(), 'stationId': station['id'],
                'temperature': round(station['temperature'] + (index % 8 - 4) * .7, 1),
                'pressure': round(station['pressure'] + (index % 6 - 3) * 1.4, 1),
                'humidity': max(20, min(98, station['humidity'] + (index % 10 - 5) * 2)),
            })
    return readings


@router.get('/stations')
def list_stations(status: str | None = None, search: str | None = None):
    result = STATIONS
    if status:
        result = [station for station in result if station['status'].lower() == status.lower()]
    if search:
        term = search.lower()
        result = [station for station in result if term in station['id'].lower() or term in station['name'].lower() or term in station['state'].lower()]
    return result


@router.get('/stations/{station_id}')
def station_detail(station_id: str):
    station = next((station for station in STATIONS if station['id'] == station_id), None)
    if not station:
        raise HTTPException(status_code=404, detail='Station not found')
    return {**station, 'readings': make_readings(station_id), 'anomalies': [item for item in ANOMALIES if item['stationId'] == station_id]}


@router.get('/readings')
def readings(station_id: str | None = None, limit: int = 200):
    return make_readings(station_id)[-min(limit, 500):]


@router.get('/stations/{station_id}/readings')
def station_readings(station_id: str, limit: int = 500):
    return readings(station_id, limit)


@router.get('/historical')
def historical(station_id: str | None = None, limit: int = 12000):
    return make_readings(station_id)[-min(limit, 15000):]


@router.get('/anomalies')
def list_anomalies(severity: str | None = None, station_id: str | None = None):
    result = ANOMALIES
    if severity:
        result = [item for item in result if item['severity'].lower() == severity.lower()]
    if station_id:
        result = [item for item in result if item['stationId'] == station_id]
    return result


@router.get('/stations/{station_id}/anomalies')
def station_anomalies(station_id: str):
    return list_anomalies(station_id=station_id)


@router.get('/alerts')
def list_alerts(status: str | None = None):
    return ALERTS if not status else [item for item in ALERTS if item['status'].lower() == status.lower()]


@router.post('/alerts/{alert_id}/acknowledge')
def acknowledge_alert(alert_id: str, _: dict[str, Any] = Depends(require_user)):
    alert = next((item for item in ALERTS if item['id'] == alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail='Alert not found')
    alert['status'] = 'Acknowledged'
    return alert


class AlertUpdate(BaseModel):
    status: str


@router.patch('/alerts/{alert_id}')
def update_alert(alert_id: str, payload: AlertUpdate, _: dict[str, Any] = Depends(require_user)):
    alert = next((item for item in ALERTS if item['id'] == alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail='Alert not found')
    if payload.status not in {'New', 'Open', 'Acknowledged', 'Investigating', 'Resolved'}:
        raise HTTPException(status_code=422, detail='Unsupported alert status')
    alert['status'] = payload.status
    return alert


@router.get('/analytics/trends')
def analytics_trends():
    return [
        {'time': (NOW - timedelta(hours=23 - index)).strftime('%H:%M'), 'anom': round(9 + (index * 3) % 6),
         'temp': round(28 + math.sin(index / 3) * 8, 1), 'hum': round(54 + math.cos(index / 4) * 15),
         'pressure': round(1008 + math.sin(index / 5) * 9, 1)}
        for index in range(24)
    ]


@router.get('/analytics')
def analytics():
    return {'trends': analytics_trends(), 'anomaliesBySensor': {sensor: len([item for item in ANOMALIES if item['sensorType'] == sensor]) for sensor in ('temperature', 'pressure', 'humidity')}, 'anomaliesBySeverity': {severity: len([item for item in ANOMALIES if item['severity'] == severity]) for severity in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')}}


@router.get('/insights')
def insights():
    return {
        'totalStations': len(STATIONS),
        'normalStations': len([station for station in STATIONS if station['status'] == 'Healthy']),
        'attentionStations': len([station for station in STATIONS if station['status'] == 'Warning']),
        'criticalStations': len([station for station in STATIONS if station['status'] == 'Critical']),
        'anomalyCount': len(ANOMALIES),
        'criticalAlertCount': len([alert for alert in ALERTS if alert['severity'] == 'CRITICAL']),
        'healthScore': round(sum(station['health'] for station in STATIONS) / len(STATIONS)),
        'onlineStations': len([station for station in STATIONS if station['online']]),
        'summary': 'Heat and humidity drift are concentrated in the southern and northeast clusters. Offline stations require network and power checks before the next ingest cycle.',
    }


@router.get('/users')
def list_users():
    return [public_user(user) for user in USERS]


@router.get('/sensors/health')
def sensors_health():
    records = []
    for index, station in enumerate(STATIONS):
        for sensor in ('temperature', 'pressure', 'humidity'):
            score = max(42, min(99, station['health'] - ((index + len(sensor)) % 7)))
            records.append({
                'stationId': station['id'], 'stationName': station['name'], 'sensor': sensor,
                'health': score, 'status': 'Healthy' if score >= 88 else ('Monitor' if score >= 72 else 'At Risk'),
                'recentAnomalies': len([item for item in ANOMALIES if item['stationId'] == station['id'] and item['sensorType'] == sensor]),
                'reliability': round(score / 100, 2), 'trend': 'Stable' if score >= 85 else 'Declining',
            })
    return records


@router.get('/maintenance')
def maintenance_predictions():
    predictions = []
    for station in STATIONS:
        risk = max(1, 100 - station['health'])
        status = 'Maintenance Required' if risk >= 35 else ('Maintenance Soon' if risk >= 20 else ('Monitor' if risk >= 10 else 'Healthy'))
        predictions.append({
            'stationId': station['id'], 'stationName': station['name'], 'sensor': 'Network + sensors',
            'health': station['health'], 'risk': risk, 'status': status,
            'reason': 'Repeated anomalies or connectivity degradation detected.' if risk >= 20 else 'No significant degradation in recent telemetry.',
            'recommendedAction': 'Schedule field inspection and calibration.' if risk >= 20 else 'Continue normal monitoring.',
        })
    return predictions


@router.get('/notifications')
def notifications():
    return [
        {'id': f'NT-{index + 1}', 'title': title, 'message': message, 'priority': priority, 'time': (NOW - timedelta(minutes=index * 18)).isoformat(), 'route': route}
        for index, (title, message, priority, route) in enumerate([
            ('Critical temperature anomaly', 'AWS-001 exceeded the station thermal baseline.', 'CRITICAL', '/anomalies'),
            ('Station offline', 'AWS-029 has missed multiple heartbeat intervals.', 'HIGH', '/stations/AWS-029'),
            ('Sensor health degraded', 'AWS-013 humidity health requires calibration review.', 'HIGH', '/sensor-health'),
            ('Maintenance recommended', 'AWS-005 is trending toward field maintenance.', 'MEDIUM', '/maintenance'),
            ('Possible genuine weather event', 'Southern cluster shows a consistent pressure shift.', 'MEDIUM', '/ai-insights'),
            ('Communication restored', 'AWS-030 telemetry returned to the ingestion queue.', 'LOW', '/live-monitoring'),
        ] * 4)
    ]


@router.post('/simulation/start')
def start_simulation(_: dict[str, Any] = Depends(require_user)):
    global SIMULATION_ACTIVE
    SIMULATION_ACTIVE = True
    return {'status': 'started', 'active': SIMULATION_ACTIVE}


@router.post('/simulation/stop')
def stop_simulation(_: dict[str, Any] = Depends(require_user)):
    global SIMULATION_ACTIVE
    SIMULATION_ACTIVE = False
    return {'status': 'stopped', 'active': SIMULATION_ACTIVE}


@router.get('/simulation/status')
def simulation_status():
    return {'active': SIMULATION_ACTIVE, 'intervalSeconds': 5, 'stations': len(STATIONS)}


@router.post('/simulation/inject-anomaly')
def inject_anomaly(station_id: str = 'AWS-001', parameter: str = 'temperature', anomaly_type: str = 'spike', severity: str = 'HIGH', _: dict[str, Any] = Depends(require_user)):
    if not any(station['id'] == station_id for station in STATIONS):
        raise HTTPException(status_code=404, detail='Station not found')
    item = {'id': f'AN-LIVE-{len(ANOMALIES) + 1}', 'stationId': station_id, 'sensorType': parameter, 'anomalyType': anomaly_type.title(), 'severity': severity.upper(), 'timestamp': datetime.now(timezone.utc).isoformat(), 'currentValue': 55, 'expectedValue': 32, 'anomalyScore': .94, 'confidence': .96, 'explanation': 'Injected simulation event detected as a probable sensor/data anomaly.', 'recommendedAction': 'Inspect the affected sensor and verify calibration.'}
    ANOMALIES.insert(0, item)
    return item


@router.post('/data-upload/validate')
async def validate_upload(file: UploadFile = File(...), _: dict[str, Any] = Depends(require_user)):
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail='Uploaded file is empty')
    return {'filename': file.filename, 'records': max(1, content.count(b'\n')), 'schemaConfidence': 92.4, 'warnings': 2, 'status': 'Validated'}


@router.post('/data/upload')
async def upload_data(file: UploadFile = File(...), user: dict[str, Any] = Depends(require_user)):
    return await validate_upload(file, user)


@router.post('/anomalies/run')
def run_anomaly_pipeline(_: dict[str, Any] = Depends(require_user)):
    engine = SkyGuardAnomalyEngine()
    pipeline_readings = make_readings()
    pipeline_readings.extend([
        {'station_id': 'AWS-001', 'timestamp': NOW.isoformat(), 'temperature': 54.0, 'pressure': 1008.0, 'humidity': 40.0},
        {'station_id': 'AWS-013', 'timestamp': (NOW + timedelta(minutes=1)).isoformat(), 'temperature': 34.0, 'pressure': 1005.0, 'humidity': 99.0},
        {'station_id': 'AWS-010', 'timestamp': (NOW + timedelta(minutes=2)).isoformat(), 'temperature': 31.0, 'pressure': 930.0, 'humidity': 48.0},
    ])
    engine_readings = [
        {**reading, 'station_id': reading.get('stationId', reading.get('station_id'))}
        for reading in pipeline_readings
    ]
    result = engine.run(engine_readings)
    return {
        'status': 'completed', 'processedRecords': len(engine_readings),
        'detectedAnomalies': len(result), 'seededAnomalies': len(ANOMALIES),
        'engineResult': [item.__dict__ for item in result[:20]],
    }

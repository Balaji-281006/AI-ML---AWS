import pandas as pd

from app.ml.anomaly_engine import SkyGuardAnomalyEngine


def test_normal_reading_no_anomaly():
    engine = SkyGuardAnomalyEngine()
    readings = [
        {'timestamp': '2026-09-09T00:00:00Z', 'station_id': 'AWS-001', 'temperature': 30.0, 'pressure': 1012.0, 'humidity': 55.0},
        {'timestamp': '2026-09-09T00:05:00Z', 'station_id': 'AWS-001', 'temperature': 30.5, 'pressure': 1011.5, 'humidity': 56.0},
        {'timestamp': '2026-09-09T00:10:00Z', 'station_id': 'AWS-001', 'temperature': 31.0, 'pressure': 1012.0, 'humidity': 54.0},
    ]
    results = engine.run(readings)
    assert len(results) == 0


def test_extreme_temperature_detected():
    engine = SkyGuardAnomalyEngine()
    readings = [
        {'timestamp': '2026-09-09T00:00:00Z', 'station_id': 'AWS-001', 'temperature': 30.0, 'pressure': 1012.0, 'humidity': 55.0},
        {'timestamp': '2026-09-09T00:05:00Z', 'station_id': 'AWS-001', 'temperature': 31.0, 'pressure': 1011.0, 'humidity': 56.0},
        {'timestamp': '2026-09-09T00:10:00Z', 'station_id': 'AWS-001', 'temperature': 58.0, 'pressure': 1012.0, 'humidity': 50.0},
    ]
    results = engine.run(readings)
    assert any(item.sensor_type == 'temperature' for item in results)


def test_missing_reading_detected():
    engine = SkyGuardAnomalyEngine()
    readings = [
        {'timestamp': '2026-09-09T00:00:00Z', 'station_id': 'AWS-001', 'temperature': 30.0, 'pressure': 1012.0, 'humidity': None},
    ]
    results = engine.run(readings)
    assert any(item.anomaly_type == 'Missing Data' for item in results)


def test_stuck_sensor_detected():
    engine = SkyGuardAnomalyEngine()
    readings = []
    for idx in range(6):
        readings.append({
            'timestamp': f'2026-09-09T00:{idx:02d}:00Z',
            'station_id': 'AWS-009',
            'temperature': 25.0,
            'pressure': 1000.0,
            'humidity': 55.0,
        })
    results = engine.run(readings)
    assert any(item.anomaly_type == 'Stuck Sensor' for item in results)

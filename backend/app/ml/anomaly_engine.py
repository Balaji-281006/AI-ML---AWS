from __future__ import annotations

import math
from dataclasses import dataclass
from typing import List, Dict, Any

import numpy as np
import pandas as pd


@dataclass
class AnomalyResult:
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


class SkyGuardAnomalyEngine:
    def __init__(self) -> None:
        self.thresholds = {
            'temperature': {'low': -10, 'high': 55, 'zscore': 3.5},
            'pressure': {'low': 900, 'high': 1100, 'zscore': 3.5},
            'humidity': {'low': 0, 'high': 100, 'zscore': 3.0},
        }

    def preprocess(self, df: pd.DataFrame) -> pd.DataFrame:
        cleaned = df.copy()
        cleaned['timestamp'] = pd.to_datetime(cleaned['timestamp'], errors='coerce')
        cleaned = cleaned.dropna(subset=['timestamp', 'station_id'])
        for col in ['temperature', 'pressure', 'humidity']:
            cleaned[col] = pd.to_numeric(cleaned[col], errors='coerce')
        cleaned = cleaned.drop_duplicates(subset=['station_id', 'timestamp'], keep='last')
        return cleaned

    def detect_missing(self, df: pd.DataFrame) -> List[AnomalyResult]:
        anomalies: List[AnomalyResult] = []
        for _, row in df.iterrows():
            for sensor in ['temperature', 'pressure', 'humidity']:
                if pd.isna(row[sensor]):
                    anomalies.append(
                        AnomalyResult(
                            station_id=str(row['station_id']),
                            sensor_type=sensor,
                            timestamp=row['timestamp'].isoformat() if pd.notna(row['timestamp']) else '',
                            current_value=float('nan'),
                            expected_value=0.0,
                            anomaly_score=0.95,
                            severity='HIGH',
                            anomaly_type='Missing Data',
                            confidence=0.98,
                            explanation=f'{sensor.title()} reading is missing for station {row["station_id"]}.',
                            recommended_action='Recheck sensor communication and resync the station.',
                        )
                    )
        return anomalies

    def detect_stuck_sensor(self, df: pd.DataFrame) -> List[AnomalyResult]:
        anomalies: List[AnomalyResult] = []
        for station_id, station_df in df.sort_values('timestamp').groupby('station_id'):
            if station_df.empty:
                continue
            for sensor in ['temperature', 'pressure', 'humidity']:
                values = station_df[sensor].dropna().tolist()
                if len(values) < 4:
                    continue
                recent_values = values[-4:]
                if len({round(float(v), 3) for v in recent_values}) <= 1:
                    anomalies.append(
                        AnomalyResult(
                            station_id=str(station_id),
                            sensor_type=sensor,
                            timestamp=station_df.iloc[-1]['timestamp'].isoformat(),
                            current_value=float(recent_values[-1]),
                            expected_value=float(np.median(recent_values)),
                            anomaly_score=0.83,
                            severity='HIGH',
                            anomaly_type='Stuck Sensor',
                            confidence=0.85,
                            explanation=f'{sensor.title()} has remained constant for multiple recent readings and may be stuck.',
                            recommended_action='Inspect the sensor and verify calibration before relying on the reading.',
                        )
                    )
        return anomalies

    def detect_zscore(self, df: pd.DataFrame) -> List[AnomalyResult]:
        anomalies: List[AnomalyResult] = []
        for sensor in ['temperature', 'pressure', 'humidity']:
            values = df[sensor].dropna()
            if len(values) < 3:
                continue
            mean = float(values.mean())
            std = float(values.std(ddof=0))
            if std == 0:
                continue
            for _, row in df.iterrows():
                value = row[sensor]
                if pd.isna(value):
                    continue
                z = abs((value - mean) / std)
                if z > self.thresholds[sensor]['zscore']:
                    anomalies.append(
                        AnomalyResult(
                            station_id=str(row['station_id']),
                            sensor_type=sensor,
                            timestamp=row['timestamp'].isoformat(),
                            current_value=float(value),
                            expected_value=float(mean),
                            anomaly_score=float(min(0.99, z / 6)),
                            severity='HIGH' if z > 4 else 'MEDIUM',
                            anomaly_type='Sudden Spike' if value > mean else 'Sudden Drop',
                            confidence=0.8,
                            explanation=f'{sensor.title()} reading deviates from the station baseline by {z:.2f} standard deviations.',
                            recommended_action='Compare against neighboring stations and validate the field sensor.',
                        )
                    )
        return anomalies

    def detect_rate_of_change(self, df: pd.DataFrame) -> List[AnomalyResult]:
        anomalies: List[AnomalyResult] = []
        for sensor in ['temperature', 'pressure', 'humidity']:
            sensor_data = df[['station_id', 'timestamp', sensor]].dropna().sort_values('timestamp')
            if sensor_data.empty:
                continue
            for i in range(1, len(sensor_data)):
                prev = float(sensor_data.iloc[i - 1][sensor])
                curr = float(sensor_data.iloc[i][sensor])
                delta = abs(curr - prev)
                if sensor == 'temperature' and delta > 12:
                    anomalies.append(
                        AnomalyResult(
                            station_id=str(sensor_data.iloc[i]['station_id']),
                            sensor_type=sensor,
                            timestamp=sensor_data.iloc[i]['timestamp'].isoformat(),
                            current_value=float(curr),
                            expected_value=float(prev),
                            anomaly_score=min(0.99, delta / 20),
                            severity='CRITICAL',
                            anomaly_type='Sudden Spike',
                            confidence=0.92,
                            explanation=f'{sensor.title()} changed by {delta:.1f} units within a short interval.',
                            recommended_action='Investigate the sensor and confirm whether the weather event is real.',
                        )
                    )
                elif sensor == 'pressure' and delta > 15:
                    anomalies.append(
                        AnomalyResult(
                            station_id=str(sensor_data.iloc[i]['station_id']),
                            sensor_type=sensor,
                            timestamp=sensor_data.iloc[i]['timestamp'].isoformat(),
                            current_value=float(curr),
                            expected_value=float(prev),
                            anomaly_score=min(0.99, delta / 30),
                            severity='HIGH',
                            anomaly_type='Sudden Drop',
                            confidence=0.9,
                            explanation=f'{sensor.title()} moves too sharply and may indicate a faulty reading.',
                            recommended_action='Inspect pressure sensor calibration and station power integrity.',
                        )
                    )
        return anomalies

    def detect_cross_sensor_consistency(self, df: pd.DataFrame) -> List[AnomalyResult]:
        anomalies: List[AnomalyResult] = []
        data = df.dropna(subset=['temperature', 'pressure', 'humidity']).copy()
        for _, row in data.iterrows():
            temp = float(row['temperature'])
            humidity = float(row['humidity'])
            if temp > 45 and humidity < 18:
                anomalies.append(
                    AnomalyResult(
                        station_id=str(row['station_id']),
                        sensor_type='temperature',
                        timestamp=row['timestamp'].isoformat(),
                        current_value=temp,
                        expected_value=35.0,
                        anomaly_score=0.78,
                        severity='HIGH',
                        anomaly_type='Suspicious Weather Pattern',
                        confidence=0.74,
                        explanation='Temperature and humidity combination is unusually inconsistent for a stable meteorological pattern.',
                        recommended_action='Review local weather context and sensor calibration before escalating.',
                    )
                )
        return anomalies

    def run(self, readings: List[Dict[str, Any]]) -> List[AnomalyResult]:
        if not readings:
            return []
        df = pd.DataFrame(readings)
        cleaned = self.preprocess(df)
        if cleaned.empty:
            return []

        results: List[AnomalyResult] = []
        results.extend(self.detect_missing(cleaned))
        results.extend(self.detect_zscore(cleaned))
        results.extend(self.detect_rate_of_change(cleaned))
        results.extend(self.detect_cross_sensor_consistency(cleaned))
        results.extend(self.detect_stuck_sensor(cleaned))
        return results

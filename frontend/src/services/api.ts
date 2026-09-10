import type { AlertItem, AnomalyRecord, HistoricalReading, Station, UserAccount } from './demoData';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('skyguard_token');
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers },
  });
  if (!response.ok) {
    throw new Error(`SkyGuard API ${response.status}: ${await response.text()}`);
  }
  return response.json() as Promise<T>;
}

export interface BackendHealth {
  backend_status: string;
  database_status: string;
  ml_engine_status: string;
  websocket_status: string;
  data_ingestion_status: string;
  connected_stations: number;
  last_processing_time: string;
}

export interface BackendInsights {
  totalStations: number;
  normalStations: number;
  attentionStations: number;
  criticalStations: number;
  anomalyCount: number;
  criticalAlertCount: number;
  healthScore: number;
  onlineStations: number;
  summary: string;
}

export const api = {
  login: (email: string, password: string) => request<{ access_token: string; user: UserAccount }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  stations: (query = '') => request<Station[]>(`/stations${query}`),
  station: (stationId: string) => request<Station & { readings: HistoricalReading[]; anomalies: AnomalyRecord[] }>(`/stations/${stationId}`),
  readings: (stationId = 'AWS-001') => request<HistoricalReading[]>(`/readings?station_id=${stationId}&limit=200`),
  historical: (stationId = '') => request<HistoricalReading[]>(`/historical${stationId ? `?station_id=${stationId}` : ''}`),
  anomalies: (query = '') => request<AnomalyRecord[]>(`/anomalies${query}`),
  alerts: (query = '') => request<AlertItem[]>(`/alerts${query}`),
  acknowledgeAlert: (alertId: string) => request<AlertItem>(`/alerts/${alertId}/acknowledge`, { method: 'POST' }),
  trends: () => request<Array<{ time: string; anom: number; temp: number; hum: number; pressure: number }>>('/analytics/trends'),
  insights: () => request<BackendInsights>('/insights'),
  users: () => request<UserAccount[]>('/users'),
  sensorHealth: () => request<Array<{ stationId: string; stationName: string; sensor: string; health: number; status: string; recentAnomalies: number; reliability: number; trend: string }>>('/sensors/health'),
  maintenance: () => request<Array<{ stationId: string; stationName: string; sensor: string; health: number; risk: number; status: string; reason: string; recommendedAction: string }>>('/maintenance'),
  notifications: () => request<Array<{ id: string; title: string; message: string; priority: string; time: string; route: string }>>('/notifications'),
  simulationStart: () => request<{ status: string; active: boolean }>('/simulation/start', { method: 'POST' }),
  simulationStop: () => request<{ status: string; active: boolean }>('/simulation/stop', { method: 'POST' }),
  simulationStatus: () => request<{ active: boolean; intervalSeconds: number; stations: number }>('/simulation/status'),
  injectAnomaly: (stationId: string, parameter: string, anomalyType: string, severity: string) => request('/simulation/inject-anomaly', { method: 'POST', body: JSON.stringify({ station_id: stationId, parameter, anomaly_type: anomalyType, severity }) }),
  health: () => request<BackendHealth>('/system/health'),
  validateUpload: (file: File) => {
    const body = new FormData();
    body.append('file', file);
    return request<{ filename: string; records: number; schemaConfidence: number; warnings: number; status: string }>('/data-upload/validate', { method: 'POST', body });
  },
  runAnomalyPipeline: () => request<{ status: string; processedRecords: number; detectedAnomalies: number }>('/anomalies/run', { method: 'POST' }),
};

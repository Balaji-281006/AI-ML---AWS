export type StationStatus = 'Healthy' | 'Warning' | 'Critical' | 'Offline';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Station {
  id: string;
  name: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  temperature: number;
  pressure: number;
  humidity: number;
  status: StationStatus;
  health: number;
  online: boolean;
  lastUpdated: string;
  installationDate: string;
  connectivity: 'Stable' | 'Variable' | 'Offline';
}

export interface AnomalyRecord {
  id: string;
  stationId: string;
  sensorType: 'temperature' | 'pressure' | 'humidity';
  anomalyType: string;
  severity: AlertSeverity;
  timestamp: string;
  currentValue: number;
  expectedValue: number;
  anomalyScore: number;
  confidence: number;
  explanation: string;
  recommendedAction: string;
}

export interface AlertItem {
  id: string;
  station: string;
  sensor: string;
  type: string;
  severity: AlertSeverity;
  time: string;
  status: 'New' | 'Open' | 'Acknowledged' | 'Investigating' | 'Resolved';
  explanation: string;
  assignedTo: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Meteorologist' | 'Operator' | 'Viewer';
  status: 'Active' | 'Inactive';
}

export interface HistoricalReading {
  timestamp: string;
  stationId: string;
  temperature: number;
  pressure: number;
  humidity: number;
}

type StationConfig = {
  id: string;
  name: string;
  state: string;
  district: string;
  lat: number;
  lng: number;
  status: StationStatus;
  health: number;
  online: boolean;
};

const stationConfigs: StationConfig[] = [
  { id: 'AWS-001', name: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', lat: 13.0827, lng: 80.2707, status: 'Critical', health: 78, online: true },
  { id: 'AWS-002', name: 'Coimbatore', state: 'Tamil Nadu', district: 'Coimbatore', lat: 11.0168, lng: 76.9558, status: 'Healthy', health: 92, online: true },
  { id: 'AWS-003', name: 'Madurai', state: 'Tamil Nadu', district: 'Madurai', lat: 9.9252, lng: 78.1198, status: 'Warning', health: 84, online: true },
  { id: 'AWS-004', name: 'Tiruchirappalli', state: 'Tamil Nadu', district: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047, status: 'Healthy', health: 94, online: true },
  { id: 'AWS-005', name: 'Salem', state: 'Tamil Nadu', district: 'Salem', lat: 11.6643, lng: 78.146, status: 'Warning', health: 86, online: true },
  { id: 'AWS-006', name: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', lat: 12.9716, lng: 77.5946, status: 'Warning', health: 83, online: true },
  { id: 'AWS-007', name: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', lat: 17.385, lng: 78.4867, status: 'Healthy', health: 93, online: true },
  { id: 'AWS-008', name: 'Mumbai', state: 'Maharashtra', district: 'Mumbai', lat: 19.076, lng: 72.8777, status: 'Healthy', health: 96, online: true },
  { id: 'AWS-009', name: 'Pune', state: 'Maharashtra', district: 'Pune', lat: 18.5204, lng: 73.8567, status: 'Healthy', health: 95, online: true },
  { id: 'AWS-010', name: 'Delhi', state: 'Delhi', district: 'New Delhi', lat: 28.6139, lng: 77.209, status: 'Warning', health: 87, online: true },
  { id: 'AWS-011', name: 'Kolkata', state: 'West Bengal', district: 'Kolkata', lat: 22.5726, lng: 88.3639, status: 'Healthy', health: 91, online: true },
  { id: 'AWS-012', name: 'Bhubaneswar', state: 'Odisha', district: 'Khordha', lat: 20.2961, lng: 85.8245, status: 'Healthy', health: 90, online: true },
  { id: 'AWS-013', name: 'Guwahati', state: 'Assam', district: 'Kamrup Metropolitan', lat: 26.1445, lng: 91.7362, status: 'Critical', health: 72, online: true },
  { id: 'AWS-014', name: 'Jaipur', state: 'Rajasthan', district: 'Jaipur', lat: 26.9124, lng: 75.7873, status: 'Warning', health: 82, online: true },
  { id: 'AWS-015', name: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad', lat: 23.0225, lng: 72.5714, status: 'Healthy', health: 93, online: true },
  { id: 'AWS-016', name: 'Bhopal', state: 'Madhya Pradesh', district: 'Bhopal', lat: 23.2599, lng: 77.4126, status: 'Healthy', health: 94, online: true },
  { id: 'AWS-017', name: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow', lat: 26.8467, lng: 80.9462, status: 'Healthy', health: 92, online: true },
  { id: 'AWS-018', name: 'Patna', state: 'Bihar', district: 'Patna', lat: 25.5941, lng: 85.1376, status: 'Warning', health: 84, online: true },
  { id: 'AWS-019', name: 'Kochi', state: 'Kerala', district: 'Ernakulam', lat: 9.9312, lng: 76.2673, status: 'Healthy', health: 96, online: true },
  { id: 'AWS-020', name: 'Thiruvananthapuram', state: 'Kerala', district: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366, status: 'Healthy', health: 90, online: true },
  { id: 'AWS-021', name: 'Srinagar', state: 'Jammu and Kashmir', district: 'Srinagar', lat: 34.0837, lng: 74.7973, status: 'Warning', health: 81, online: true },
  { id: 'AWS-022', name: 'Dehradun', state: 'Uttarakhand', district: 'Dehradun', lat: 30.3165, lng: 78.0322, status: 'Healthy', health: 91, online: true },
  { id: 'AWS-023', name: 'Visakhapatnam', state: 'Andhra Pradesh', district: 'Visakhapatnam', lat: 17.6868, lng: 83.2185, status: 'Healthy', health: 90, online: true },
  { id: 'AWS-024', name: 'Vijayawada', state: 'Andhra Pradesh', district: 'Vijayawada', lat: 16.5062, lng: 80.648, status: 'Healthy', health: 95, online: true },
  { id: 'AWS-025', name: 'Mysuru', state: 'Karnataka', district: 'Mysuru', lat: 12.2958, lng: 76.6394, status: 'Healthy', health: 96, online: true },
  { id: 'AWS-026', name: 'Mangaluru', state: 'Karnataka', district: 'Dakshina Kannada', lat: 12.9141, lng: 74.856, status: 'Healthy', health: 92, online: true },
  { id: 'AWS-027', name: 'Nagpur', state: 'Maharashtra', district: 'Nagpur', lat: 21.1458, lng: 79.0882, status: 'Warning', health: 85, online: true },
  { id: 'AWS-028', name: 'Ranchi', state: 'Jharkhand', district: 'Ranchi', lat: 23.3441, lng: 85.3096, status: 'Healthy', health: 93, online: true },
  { id: 'AWS-029', name: 'Chandigarh', state: 'Chandigarh', district: 'Chandigarh', lat: 30.7333, lng: 76.7794, status: 'Offline', health: 58, online: false },
  { id: 'AWS-030', name: 'Thane', state: 'Maharashtra', district: 'Thane', lat: 19.2183, lng: 72.9781, status: 'Offline', health: 60, online: false },
];

type AnomalyTemplate = Omit<AnomalyRecord, 'id' | 'timestamp'>;

const anomalyTemplates: AnomalyTemplate[] = [
  { stationId: 'AWS-001', sensorType: 'temperature', anomalyType: 'Temperature Spike', severity: 'CRITICAL', currentValue: 44.8, expectedValue: 33.4, anomalyScore: 0.93, confidence: 0.94, explanation: 'Temperature is significantly above the station recent expected range.', recommendedAction: 'Dispatch field operator to verify the thermistor and surrounding environment.' },
  { stationId: 'AWS-013', sensorType: 'humidity', anomalyType: 'Humidity Anomaly', severity: 'HIGH', currentValue: 92, expectedValue: 64, anomalyScore: 0.88, confidence: 0.9, explanation: 'Humidity has exceeded the local expected band by 28 percentage points.', recommendedAction: 'Check sensor housing and verify calibration against nearby reference stations.' },
  { stationId: 'AWS-010', sensorType: 'pressure', anomalyType: 'Pressure Drift', severity: 'HIGH', currentValue: 960, expectedValue: 1007, anomalyScore: 0.81, confidence: 0.86, explanation: 'Pressure drift suggests an offset in the sensor baseline.', recommendedAction: 'Inspect the station enclosure and perform pressure calibration.' },
  { stationId: 'AWS-021', sensorType: 'temperature', anomalyType: 'Sudden Drop', severity: 'MEDIUM', currentValue: 12.8, expectedValue: 21.6, anomalyScore: 0.72, confidence: 0.8, explanation: 'Rapid cooling is inconsistent with the local seasonal baseline.', recommendedAction: 'Review sensor health and compare with adjacent AWS stations.' },
  { stationId: 'AWS-006', sensorType: 'temperature', anomalyType: 'Sensor Drift', severity: 'MEDIUM', currentValue: 39.1, expectedValue: 31.5, anomalyScore: 0.7, confidence: 0.76, explanation: 'The temperature trend shows a sustained upward bias over the last 4 hours.', recommendedAction: 'Schedule maintenance and validate the sensor bias correction.' },
  { stationId: 'AWS-029', sensorType: 'temperature', anomalyType: 'Communication Failure', severity: 'CRITICAL', currentValue: 0, expectedValue: 29.8, anomalyScore: 0.95, confidence: 0.97, explanation: 'Station has missed multiple heartbeat signals and telemetry is intermittent.', recommendedAction: 'Verify communications link and on-site power before restoring station operations.' },
  { stationId: 'AWS-030', sensorType: 'pressure', anomalyType: 'Missing Data', severity: 'HIGH', currentValue: 0, expectedValue: 1008, anomalyScore: 0.9, confidence: 0.91, explanation: 'Pressure readings are absent from the last reporting cycle.', recommendedAction: 'Re-establish telemetry and inspect the sensor power module.' },
  { stationId: 'AWS-003', sensorType: 'humidity', anomalyType: 'Stuck Sensor', severity: 'MEDIUM', currentValue: 54, expectedValue: 64, anomalyScore: 0.75, confidence: 0.82, explanation: 'Humidity value has remained constant for several consecutive intervals.', recommendedAction: 'Inspect the humidity sensor for a stuck probe or blocked ventilation.' },
  { stationId: 'AWS-018', sensorType: 'temperature', anomalyType: 'Sudden Spike', severity: 'HIGH', currentValue: 41.5, expectedValue: 30.7, anomalyScore: 0.84, confidence: 0.88, explanation: 'Short interval temperature increase exceeds the operational threshold.', recommendedAction: 'Validate sensor float and compare with local station ensemble.' },
  { stationId: 'AWS-011', sensorType: 'humidity', anomalyType: 'Unusual Weather Pattern', severity: 'MEDIUM', currentValue: 72, expectedValue: 58, anomalyScore: 0.69, confidence: 0.74, explanation: 'Humidity pattern is unusually elevated relative to the regional pattern.', recommendedAction: 'Review meteorological context and confirm the sensor remains in a ventilated enclosure.' },
  { stationId: 'AWS-027', sensorType: 'pressure', anomalyType: 'Pressure Anomaly', severity: 'HIGH', currentValue: 948, expectedValue: 1004, anomalyScore: 0.8, confidence: 0.85, explanation: 'Pressure is sharply lower than the recent station baseline and adjacent station set.', recommendedAction: 'Inspect the sensor diaphragm and recalibrate the device.' },
  { stationId: 'AWS-005', sensorType: 'temperature', anomalyType: 'Temperature Spike', severity: 'CRITICAL', currentValue: 43.6, expectedValue: 31.9, anomalyScore: 0.9, confidence: 0.92, explanation: 'Temperature anomaly exceeds the station operational alert threshold.', recommendedAction: 'Send immediate field intervention and review sensor drift history.' },
];

type AlertTemplate = Omit<AlertItem, 'id' | 'time'>;

const alertTemplates: AlertTemplate[] = [
  { station: 'AWS-001', sensor: 'temperature', type: 'Temperature Spike', severity: 'CRITICAL', status: 'Open', explanation: 'Temperature is 11.4°C above the expected operating range.', assignedTo: 'Field Team North' },
  { station: 'AWS-013', sensor: 'humidity', type: 'Humidity Anomaly', severity: 'HIGH', status: 'Acknowledged', explanation: 'Humidity concentration is trending above the local seasonal baseline.', assignedTo: 'Analyst Desk' },
  { station: 'AWS-010', sensor: 'pressure', type: 'Pressure Drift', severity: 'HIGH', status: 'Open', explanation: 'Pressure drift indicates sensor offset or station calibration issue.', assignedTo: 'Maintenance Crew' },
  { station: 'AWS-029', sensor: 'temperature', type: 'Communication Failure', severity: 'CRITICAL', status: 'Open', explanation: 'Station missed two heartbeat intervals and telemetry was lost.', assignedTo: 'Network Support' },
  { station: 'AWS-030', sensor: 'pressure', type: 'Missing Data', severity: 'HIGH', status: 'Resolved', explanation: 'Telemetry restored after power cycle on the station module.', assignedTo: 'Field Operator' },
  { station: 'AWS-018', sensor: 'temperature', type: 'Sudden Spike', severity: 'HIGH', status: 'Open', explanation: 'Short interval rise after 14:30 exceeds the alert threshold.', assignedTo: 'Meteorologist' },
];

type NotificationTemplate = Omit<NotificationItem, 'id'> & { time: string };

const notificationTemplates: NotificationTemplate[] = [
  { title: 'Critical anomaly at Chennai', message: 'AWS-001 temperature sensor exceeded threshold by 11.4°C.', time: '5 minutes ago', priority: 'CRITICAL' },
  { title: 'Communication gap', message: 'Chandigarh AWS-029 has not reported telemetry for 38 minutes.', time: '12 minutes ago', priority: 'HIGH' },
  { title: 'Humidity drift', message: 'Guwahati AWS-013 humidity remains elevated beyond seasonal pattern.', time: '22 minutes ago', priority: 'HIGH' },
  { title: 'Station restored', message: 'Thane AWS-030 telemetry restored after maintenance cycle.', time: '1 hour ago', priority: 'MEDIUM' },
  { title: 'Sensor health review', message: 'Bengaluru AWS-006 requires calibration review in next shift.', time: '1 hour ago', priority: 'MEDIUM' },
  { title: 'Pressure anomaly', message: 'Nagpur AWS-027 pressure reading deviated from surrounding cluster.', time: '2 hours ago', priority: 'MEDIUM' },
  { title: 'Stations online', message: '26 of 30 AWS stations are reporting healthy telemetry.', time: '3 hours ago', priority: 'LOW' },
  { title: 'Field dispatch required', message: 'Patna AWS-018 operator assigned to inspect the station.', time: '5 hours ago', priority: 'HIGH' },
  { title: 'Data quality alert', message: 'One ingestion batch exceeded validation thresholds and was flagged.', time: '6 hours ago', priority: 'MEDIUM' },
  { title: 'Monthly review', message: 'Anomaly frequency is below the rolling monthly profile by 6%.', time: '8 hours ago', priority: 'LOW' },
];

const userAccounts: UserAccount[] = [
  { id: 'USR-101', name: 'Balaji R', email: 'admin@skyguard.ai', role: 'Admin', status: 'Active' },
  { id: 'USR-102', name: 'Dr. Priya', email: 'meteorologist@skyguard.ai', role: 'Meteorologist', status: 'Active' },
  { id: 'USR-103', name: 'Vishnuvarthini', email: 'operator@skyguard.ai', role: 'Operator', status: 'Active' },
  { id: 'USR-104', name: 'Surendar', email: 'viewer@skyguard.ai', role: 'Viewer', status: 'Active' },
  { id: 'USR-105', name: 'Nikhil Rao', email: 'nikhil@skyguard.ai', role: 'Operator', status: 'Active' },
  { id: 'USR-106', name: 'Balaji', email: 'ananya@skyguard.ai', role: 'Meteorologist', status: 'Inactive' },
  { id: 'USR-107', name: 'Sandeep Kumar', email: 'sandeep@skyguard.ai', role: 'Viewer', status: 'Active' },
  { id: 'USR-108', name: 'Mina Joseph', email: 'mina@skyguard.ai', role: 'Admin', status: 'Active' },
  { id: 'USR-109', name: 'Harish Singh', email: 'harish@skyguard.ai', role: 'Operator', status: 'Active' },
  { id: 'USR-110', name: 'Sonia Patel', email: 'sonia@skyguard.ai', role: 'Viewer', status: 'Active' },
];

export const stationData: Station[] = stationConfigs.map((station, index) => ({
  ...station,
  latitude: station.lat,
  longitude: station.lng,
  temperature: 24 + ((index * 7) % 19) + (station.name.length % 6) * 0.5,
  pressure: 1010 + ((index * 13) % 25) - 10,
  humidity: 44 + (index % 7) * 5,
  lastUpdated: new Date(Date.now() - index * 900000).toISOString(),
  installationDate: '2021-04-12',
  connectivity: station.online ? (index % 4 === 0 ? 'Variable' : 'Stable') : 'Offline',
}));

export const anomalyData: AnomalyRecord[] = anomalyTemplates.map((item, index) => ({
  ...item,
  id: `AN-${1000 + index}`,
  timestamp: new Date(Date.now() - index * 3600000).toISOString(),
}));

export const alertsData: AlertItem[] = alertTemplates.map((item, index) => ({
  ...item,
  id: `AL-${2000 + index}`,
  time: new Date(Date.now() - index * 1800000).toISOString(),
}));

export const notificationData: NotificationItem[] = notificationTemplates.map((item, index) => ({
  ...item,
  id: `NT-${900 + index}`,
  time: new Date(Date.now() - index * 1800000).toISOString(),
}));

export const usersData: UserAccount[] = userAccounts;

export const trendData = Array.from({ length: 24 }, (_, i) => {
  const time = new Date(Date.now() - (23 - i) * 60 * 60 * 1000);
  const value = 9 + ((i * 3) % 6) + Math.sin(i / 2.3) * 2.5;
  return {
    time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    anom: Math.round(value),
    temp: 28 + Math.sin(i / 3) * 8,
    hum: 54 + Math.cos(i / 4) * 15,
    pressure: 1008 + Math.sin(i / 5) * 9,
  };
});

export const systemHealth = {
  backendStatus: 'Healthy',
  databaseStatus: 'Healthy',
  mlEngineStatus: 'Ready',
  websocketStatus: 'Active',
  ingestionStatus: 'Normal',
  connectedStations: 26,
  lastProcessingTime: '2026-09-09T05:45:00Z',
};

export const aiSummary = {
  totalStations: stationData.length,
  normalStations: stationData.filter((station) => station.status === 'Healthy').length,
  attentionStations: stationData.filter((station) => station.status === 'Warning').length,
  criticalStations: stationData.filter((station) => station.status === 'Critical').length,
  anomalyCount: anomalyData.length,
  criticalAlertCount: alertsData.filter((alert) => alert.severity === 'CRITICAL').length,
  healthScore: Math.round(stationData.reduce((sum, station) => sum + station.health, 0) / stationData.length),
};

export const generateHistoricalReadings = (): HistoricalReading[] => {
  const points: HistoricalReading[] = [];
  const start = new Date();
  start.setHours(start.getHours() - 24);

  for (const station of stationData) {
    for (let i = 0; i < 48; i += 1) {
      const timestamp = new Date(start.getTime() + i * 30 * 60 * 1000);
      const wave = Math.sin((i + station.latitude) / 4) * 4;
      const temp = Number((28 + (station.latitude / 2) + wave + (i % 7) * 0.2).toFixed(1));
      const pressure = Number((1008 + Math.cos((i + station.longitude) / 5) * 8 + (station.health / 100) * 2).toFixed(1));
      const humidity = Number((54 + Math.sin((i + station.longitude) / 6) * 22 + (station.health % 20)).toFixed(0));
      points.push({
        timestamp: timestamp.toISOString(),
        stationId: station.id,
        temperature: temp,
        pressure: pressure,
        humidity: humidity,
      });
    }
  }

  return points;
};

export const historicalReadings = generateHistoricalReadings();

export const liveSnapshot = {
  temperature: 31.6,
  pressure: 1010.4,
  humidity: 62,
};

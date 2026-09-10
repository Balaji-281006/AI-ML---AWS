import { Activity, AlertTriangle, CloudSun, Gauge, Signal, ThermometerSun } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MetricCard } from '../components/MetricCard';
import { aiSummary, alertsData, anomalyData, liveSnapshot, stationData, trendData } from '../services/demoData';
import { api } from '../services/api';
import { useBackendData } from '../services/useBackendData';

const metrics = [
  { title: 'Total AWS Stations', value: String(stationData.length), change: '+2 this week', icon: CloudSun, tone: 'cyan' },
  { title: 'Online Stations', value: String(stationData.filter((s) => s.online).length), change: '86.7% uptime', icon: Signal, tone: 'emerald' },
  { title: 'Offline Stations', value: String(stationData.filter((s) => !s.online).length), change: '1 under review', icon: Gauge, tone: 'amber' },
  { title: 'Active Anomalies', value: String(anomalyData.length), change: '12 during last 24h', icon: AlertTriangle, tone: 'rose' },
  { title: 'Critical Alerts', value: String(alertsData.filter((a) => a.severity === 'CRITICAL').length), change: '2 escalated', icon: ThermometerSun, tone: 'rose' },
  { title: 'Sensors Under Observation', value: String(Math.round(stationData.length * 0.7)), change: '12 stable', icon: Activity, tone: 'violet' },
] as const;

const severityColors: Record<string, string> = {
  CRITICAL: 'bg-rose-500/15 text-rose-300',
  HIGH: 'bg-amber-500/15 text-amber-300',
  MEDIUM: 'bg-yellow-500/15 text-yellow-300',
  LOW: 'bg-emerald-500/15 text-emerald-300',
};

export function DashboardPage() {
  const stations = useBackendData(() => api.stations(), stationData);
  const anomalies = useBackendData(() => api.anomalies(), anomalyData);
  const alerts = useBackendData(() => api.alerts(), alertsData);
  const insights = useBackendData(() => api.insights(), aiSummary);
  const trends = useBackendData(() => api.trends(), trendData);
  const topStations = [...stations.data]
    .sort((a, b) => b.health - a.health)
    .slice(0, 4);
  const metricsData = [
    { title: 'Total AWS Stations', value: String(stations.data.length), change: 'Seeded backend network', icon: CloudSun, tone: 'cyan' },
    { title: 'Online Stations', value: String(stations.data.filter((s) => s.online).length), change: 'Live telemetry', icon: Signal, tone: 'emerald' },
    { title: 'Offline Stations', value: String(stations.data.filter((s) => !s.online).length), change: 'Needs field review', icon: Gauge, tone: 'amber' },
    { title: 'Active Anomalies', value: String(anomalies.data.length), change: 'ML pipeline output', icon: AlertTriangle, tone: 'rose' },
    { title: 'Critical Alerts', value: String(alerts.data.filter((a) => a.severity === 'CRITICAL').length), change: 'Operator action', icon: ThermometerSun, tone: 'rose' },
    { title: 'Sensors Under Observation', value: String(Math.round(stations.data.length * 0.7)), change: 'Telemetry coverage', icon: Activity, tone: 'violet' },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Overview</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Command Center Dashboard</h1>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
          Demo mode active
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metricsData.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Live weather overview</h3>
            <span className="text-sm text-slate-400">Last 24 hours</span>
          </div>

          <div className="mb-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Temperature</p>
              <p className="mt-2 text-2xl font-semibold text-white">{liveSnapshot.temperature.toFixed(1)}°C</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Pressure</p>
              <p className="mt-2 text-2xl font-semibold text-white">{liveSnapshot.pressure.toFixed(1)} hPa</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Humidity</p>
              <p className="mt-2 text-2xl font-semibold text-white">{liveSnapshot.humidity}%</p>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends.data}>
                <defs>
                  <linearGradient id="tempFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.06} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(148,163,184,0.2)' }} />
                <Area type="monotone" dataKey="temp" stroke="#22d3ee" strokeWidth={2} fill="url(#tempFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <h3 className="text-lg font-semibold text-white">Recent alerts</h3>
            <div className="mt-4 space-y-3">
              {alerts.data.slice(0, 5).map((alert) => (
                <div key={alert.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-100">{alert.type}</span>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${severityColors[alert.severity]}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{alert.station} • {alert.sensor}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <h3 className="text-lg font-semibold text-white">Top problematic stations</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {topStations.map((station) => (
                <div key={station.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <span>{station.name}</span>
                  <span className="text-cyan-300">{station.health}% health</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <h3 className="text-lg font-semibold text-white">Station health</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Healthy', value: stations.data.filter((s) => s.status === 'Healthy').length, tone: 'emerald' },
              { label: 'Warning', value: stations.data.filter((s) => s.status === 'Warning').length, tone: 'amber' },
              { label: 'Critical', value: stations.data.filter((s) => s.status === 'Critical').length + stations.data.filter((s) => !s.online).length, tone: 'rose' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-center">
                <div className={`mx-auto mb-3 h-3 w-3 rounded-full ${item.tone === 'emerald' ? 'bg-emerald-400' : item.tone === 'amber' ? 'bg-amber-400' : 'bg-rose-400'}`} />
                <p className="text-2xl font-semibold text-white">{item.value}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <h3 className="text-lg font-semibold text-white">AI summary</h3>
          <div className="mt-4 space-y-4 text-sm text-slate-300">
            <p>
              {insights.data.totalStations} AWS stations are being monitored. {insights.data.normalStations} stations are operating normally,
              {` ${insights.data.attentionStations}`} stations require attention, {insights.data.anomalyCount} anomalies were detected today,
              and {insights.data.criticalAlertCount} critical alerts require operator review.
            </p>
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-cyan-200">
              Sensor health score: <strong>{insights.data.healthScore}%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

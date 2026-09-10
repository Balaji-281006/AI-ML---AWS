import { alertsData } from '../services/demoData';
import { api } from '../services/api';
import { useBackendData } from '../services/useBackendData';
import { useState } from 'react';

const severityStyles: Record<string, string> = {
  CRITICAL: 'bg-rose-500/15 text-rose-300',
  HIGH: 'bg-amber-500/15 text-amber-300',
  MEDIUM: 'bg-yellow-500/15 text-yellow-300',
  LOW: 'bg-emerald-500/15 text-emerald-300',
};

const statusStyles: Record<string, string> = {
  Open: 'bg-sky-500/15 text-sky-300',
  Acknowledged: 'bg-violet-500/15 text-violet-300',
  Resolved: 'bg-emerald-500/15 text-emerald-300',
};

export function AlertsPage() {
  const { data: alerts, loading, error } = useBackendData(() => api.alerts(), alertsData);
  const [acknowledged, setAcknowledged] = useState<string[]>([]);
  const displayAlerts = alerts.map((alert) => acknowledged.includes(alert.id) ? { ...alert, status: 'Acknowledged' as const } : alert);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Alerts</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Operational Alert Queue</h1>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300">
          {displayAlerts.filter((alert) => alert.status === 'Open').length} open cases
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {displayAlerts.map((alert) => (
          <div key={alert.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">{alert.id}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{alert.type}</h3>
              </div>
              <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${severityStyles[alert.severity]}`}>
                {alert.severity}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <div className="flex justify-between"><span>Station</span><span className="text-slate-100">{alert.station}</span></div>
              <div className="flex justify-between"><span>Sensor</span><span>{alert.sensor}</span></div>
              <div className="flex justify-between"><span>Owner</span><span>{alert.assignedTo}</span></div>
              <div className="flex justify-between"><span>Time</span><span>{new Date(alert.time).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span></div>
            </div>

            <p className="mt-4 text-sm text-slate-300">{alert.explanation}</p>

            <div className="mt-4 flex items-center justify-between">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusStyles[alert.status]}`}>
                {alert.status}
              </span>
              <button onClick={() => { setAcknowledged((current) => [...new Set([...current, alert.id])]); void api.acknowledgeAlert(alert.id).catch(() => undefined); }} className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-200">
                Acknowledge
              </button>
            </div>
          </div>
        ))}
      </div>
      {loading && <p className="text-sm text-cyan-300">Loading alert queue...</p>}
      {error && <p className="text-sm text-amber-300">Backend alert sync warning: {error}</p>}
    </div>
  );
}

import { systemHealth } from '../services/demoData';
import { api } from '../services/api';
import { useBackendData } from '../services/useBackendData';

const healthColors: Record<string, string> = {
  Healthy: 'bg-emerald-500/15 text-emerald-300',
  Ready: 'bg-cyan-500/15 text-cyan-300',
  Active: 'bg-violet-500/15 text-violet-300',
  Normal: 'bg-amber-500/15 text-amber-300',
};

export function SystemHealthPage() {
  const { data: health, loading, error } = useBackendData(() => api.health(), {
    backend_status: systemHealth.backendStatus,
    database_status: systemHealth.databaseStatus,
    ml_engine_status: systemHealth.mlEngineStatus,
    websocket_status: systemHealth.websocketStatus,
    data_ingestion_status: systemHealth.ingestionStatus,
    connected_stations: systemHealth.connectedStations,
    last_processing_time: systemHealth.lastProcessingTime,
  });
  const components = [
    ['Backend API', health.backend_status],
    ['Database', health.database_status],
    ['ML engine', health.ml_engine_status],
    ['WebSocket', health.websocket_status],
    ['Ingestion', health.data_ingestion_status],
  ];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">System health</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Platform service health</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {components.map(([name, status]) => (
          <div key={name} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">{name}</h3>
              <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${healthColors[status]}`}>
                {status}
              </span>
            </div>
            <div className="mt-5 h-2.5 rounded-full bg-slate-800">
              <div className="h-full w-4/5 rounded-full bg-emerald-400" />
            </div>
            <p className="mt-3 text-sm text-slate-400">Uptime stable • last check 2 minutes ago</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
        <h3 className="text-lg font-semibold text-white">Operational summary</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Connected stations</p>
            <p className="mt-2 text-3xl font-semibold text-white">{health.connected_stations}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Processing latency</p>
            <p className="mt-2 text-3xl font-semibold text-white">1.2s</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Last cycle</p>
            <p className="mt-2 text-sm font-medium text-white">{new Date(health.last_processing_time).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</p>
          </div>
        </div>
      </div>
      {loading && <p className="text-sm text-cyan-300">Checking backend services...</p>}
      {error && <p className="text-sm text-amber-300">Backend health warning: {error}</p>}
    </div>
  );
}

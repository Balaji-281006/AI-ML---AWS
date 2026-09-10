import { Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useEffect } from 'react';
import { stationData } from '../services/demoData';
import { api } from '../services/api';
import { useBackendData } from '../services/useBackendData';

const statusColors: Record<string, string> = {
  Healthy: 'bg-emerald-500/15 text-emerald-300',
  Warning: 'bg-amber-500/15 text-amber-300',
  Critical: 'bg-rose-500/15 text-rose-300',
  Offline: 'bg-slate-500/15 text-slate-300',
};

export function LiveMonitoringPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const { data, loading, error } = useBackendData(() => api.stations(), stationData);
  const [liveRows, setLiveRows] = useState(data);
  const [socketState, setSocketState] = useState('Connecting');
  const [simulation, setSimulation] = useState(false);
  useEffect(() => {
    setLiveRows(data);
  }, [data]);
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_WS_URL || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/live`;
    const socket = new WebSocket(socketUrl);
    socket.onopen = () => setSocketState('Live');
    socket.onclose = () => setSocketState('Fallback');
    socket.onerror = () => setSocketState('Fallback');
    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data) as { station: typeof data[number] };
      setLiveRows((current) => current.map((station) => station.id === payload.station.id ? { ...station, ...payload.station } : station));
    };
    return () => socket.close();
  }, []);
  const rows = liveRows.filter((station) => {
    const matchesQuery = `${station.id} ${station.name} ${station.state}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (status === 'All' || station.status === status);
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Live Monitoring</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">AWS Station Feed</h1>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300">
            <Search size={14} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="bg-transparent outline-none placeholder:text-slate-500" placeholder="Search station" />
          </div>
          <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{socketState}</span>
          <button onClick={() => { setSimulation(true); void api.simulationStart(); }} className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">Start</button>
          <button onClick={() => { setSimulation(false); void api.simulationStop(); }} className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">Stop</button>
          <button onClick={() => void api.injectAnomaly('AWS-001', 'temperature', 'spike', 'CRITICAL')} className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">Inject anomaly</button>
          <button onClick={() => setStatus(status === 'All' ? 'Warning' : 'All')} className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300">
            <SlidersHorizontal size={14} />
            {status === 'All' ? 'All stations' : `${status} only`}
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-cyan-300">Syncing live station telemetry...</p>}
      {error && <p className="text-sm text-amber-300">Backend sync warning: {error}</p>}
      <p className="text-xs text-slate-500">Simulation: {simulation ? 'running with controlled telemetry changes' : 'stopped; historical fallback remains visible'}</p>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-950/80 text-slate-400">
              <tr>
                <th className="px-4 py-3">Station ID</th>
                <th className="px-4 py-3">Station</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Temp</th>
                <th className="px-4 py-3">Pressure</th>
                <th className="px-4 py-3">Humidity</th>
                <th className="px-4 py-3">Health</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Updated</th>
                <th className="px-4 py-3">Anomaly</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((station) => (
                <tr key={station.id} className="border-t border-slate-800 text-slate-200">
                  <td className="px-4 py-3 font-medium text-cyan-300">{station.id}</td>
                  <td className="px-4 py-3">{station.name}</td>
                  <td className="px-4 py-3">{station.district}, {station.state}</td>
                  <td className="px-4 py-3">{station.temperature.toFixed(1)}°C</td>
                  <td className="px-4 py-3">{station.pressure.toFixed(0)} hPa</td>
                  <td className="px-4 py-3">{station.humidity}%</td>
                  <td className="px-4 py-3">{station.health}%</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusColors[station.status]}`}>
                      {station.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{new Date(station.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-3 text-rose-300">{station.status === 'Healthy' ? 'None' : 'Detected'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

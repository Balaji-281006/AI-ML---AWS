import { stationData } from '../services/demoData';
import { api } from '../services/api';
import { useBackendData } from '../services/useBackendData';

export function SensorHealthPage() {
  const { data: fallback } = { data: stationData };
  const { data: health, loading, error } = useBackendData(() => api.sensorHealth(), fallback.flatMap((station) => ['temperature', 'pressure', 'humidity'].map((sensor) => ({ stationId: station.id, stationName: station.name, sensor, health: station.health, status: station.health >= 88 ? 'Healthy' : 'At Risk', recentAnomalies: 0, reliability: station.health / 100, trend: 'Stable' }))));

  return (
    <div className="space-y-5">
      <div><p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Sensor Health</p><h1 className="mt-2 text-3xl font-semibold text-white">Fleet sensor reliability</h1></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {health.map((item) => (
          <div key={`${item.stationId}-${item.sensor}`} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.18em] text-cyan-300">{item.stationId}</p><h3 className="mt-2 text-lg font-semibold text-white">{item.stationName}</h3></div><span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${item.health >= 88 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>{item.status}</span></div>
            <p className="mt-4 text-sm capitalize text-slate-300">{item.sensor} sensor</p>
            <div className="mt-3 h-2 rounded-full bg-slate-800"><div className={`h-full rounded-full ${item.health >= 88 ? 'bg-emerald-400' : 'bg-amber-400'}`} style={{ width: `${item.health}%` }} /></div>
            <div className="mt-3 flex justify-between text-sm text-slate-300"><span>{item.health}% health</span><span>{Math.round(item.reliability * 100)}% reliable</span></div>
            <p className="mt-2 text-xs text-slate-400">{item.recentAnomalies} recent anomalies • {item.trend} trend</p>
          </div>
        ))}
      </div>
      {loading && <p className="text-sm text-cyan-300">Calculating sensor health...</p>}
      {error && <p className="text-sm text-amber-300">Backend sensor health warning: {error}</p>}
    </div>
  );
}

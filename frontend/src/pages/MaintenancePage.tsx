import { stationData } from '../services/demoData';
import { api } from '../services/api';
import { useBackendData } from '../services/useBackendData';

export function MaintenancePage() {
  const fallback = stationData.map((station) => ({ stationId: station.id, stationName: station.name, sensor: 'Network + sensors', health: station.health, risk: 100 - station.health, status: station.health < 70 ? 'Maintenance Required' : station.health < 85 ? 'Maintenance Soon' : 'Healthy', reason: 'Seeded maintenance assessment.', recommendedAction: 'Continue monitoring.' }));
  const { data: predictions, loading, error } = useBackendData(() => api.maintenance(), fallback);

  return (
    <div className="space-y-5">
      <div><p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Maintenance</p><h1 className="mt-2 text-3xl font-semibold text-white">Predictive maintenance queue</h1></div>
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-950/80 text-slate-400"><tr><th className="px-4 py-3">Station</th><th className="px-4 py-3">Sensor</th><th className="px-4 py-3">Health</th><th className="px-4 py-3">Risk</th><th className="px-4 py-3">Prediction</th><th className="px-4 py-3">Reason</th><th className="px-4 py-3">Action</th></tr></thead><tbody>{predictions.map((item) => <tr key={`${item.stationId}-${item.sensor}`} className="border-t border-slate-800 text-slate-200"><td className="px-4 py-3"><p className="font-medium text-white">{item.stationName}</p><p className="text-xs text-cyan-300">{item.stationId}</p></td><td className="px-4 py-3">{item.sensor}</td><td className="px-4 py-3">{item.health}%</td><td className="px-4 py-3 text-amber-300">{item.risk}%</td><td className="px-4 py-3">{item.status}</td><td className="max-w-xs px-4 py-3 text-slate-400">{item.reason}</td><td className="max-w-xs px-4 py-3 text-cyan-200">{item.recommendedAction}</td></tr>)}</tbody></table></div></div>
      {loading && <p className="text-sm text-cyan-300">Calculating maintenance risk...</p>}
      {error && <p className="text-sm text-amber-300">Backend maintenance warning: {error}</p>}
    </div>
  );
}

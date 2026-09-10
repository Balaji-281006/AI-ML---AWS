import { anomalyData } from '../services/demoData';
import { api } from '../services/api';
import { useBackendData } from '../services/useBackendData';

const severityStyles: Record<string, string> = {
  CRITICAL: 'bg-rose-500/15 text-rose-300',
  HIGH: 'bg-amber-500/15 text-amber-300',
  MEDIUM: 'bg-yellow-500/15 text-yellow-300',
  LOW: 'bg-emerald-500/15 text-emerald-300',
};

export function AnomaliesPage() {
  const { data: anomalies, loading, error } = useBackendData(() => api.anomalies(), anomalyData);
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Anomalies</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">AI anomaly review queue</h1>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-950/85 text-slate-400">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Station</th>
                <th className="px-4 py-3">Sensor</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Current</th>
                <th className="px-4 py-3">Expected</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.map((item) => (
                <tr key={item.id} className="border-t border-slate-800 text-slate-200">
                  <td className="px-4 py-3 font-medium text-cyan-300">{item.id}</td>
                  <td className="px-4 py-3">{item.stationId}</td>
                  <td className="px-4 py-3 capitalize">{item.sensorType}</td>
                  <td className="px-4 py-3">{item.anomalyType}</td>
                  <td className="px-4 py-3">{item.currentValue}</td>
                  <td className="px-4 py-3">{item.expectedValue}</td>
                  <td className="px-4 py-3">{item.anomalyScore.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${severityStyles[item.severity]}`}>
                      {item.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{item.recommendedAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {loading && <p className="text-sm text-cyan-300">Running anomaly queue sync...</p>}
      {error && <p className="text-sm text-amber-300">Backend anomaly sync warning: {error}</p>}
    </div>
  );
}

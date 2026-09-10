import { aiSummary, alertsData, stationData } from '../services/demoData';
import { api } from '../services/api';
import { useBackendData } from '../services/useBackendData';

export function AIInsightsPage() {
  const { data: insights, loading, error } = useBackendData(() => api.insights(), aiSummary);
  const { data: alerts } = useBackendData(() => api.alerts(), alertsData);
  const { data: stations } = useBackendData(() => api.stations(), stationData);
  const topRisk = [...stations]
    .sort((a, b) => a.health - b.health)
    .slice(0, 3);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">AI insights</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Forecast and operational intelligence</h1>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">System health</p>
          <p className="mt-3 text-4xl font-semibold text-white">{insights.healthScore}%</p>
          <p className="mt-2 text-sm text-slate-300">Composite AWS network health index</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Anomaly volume</p>
          <p className="mt-3 text-4xl font-semibold text-white">{insights.anomalyCount}</p>
          <p className="mt-2 text-sm text-slate-300">Detected in last 24 hours</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Critical alerts</p>
          <p className="mt-3 text-4xl font-semibold text-white">{insights.criticalAlertCount}</p>
          <p className="mt-2 text-sm text-slate-300">High-impact incidents needing action</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <h3 className="text-lg font-semibold text-white">Recommended actions</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {[
              'Deploy a maintenance crew to Chennai and Guwahati to inspect rising heat and humidity drift.',
              'Recalibrate Delhi pressure sensors to correct the regional shift seen in the last four hours.',
              'Prioritize offline sites in Chandigarh and Thane for network and power restoration before the next cycle.',
            ].map((recommendation) => (
              <div key={recommendation} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                {recommendation}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <h3 className="text-lg font-semibold text-white">Top risk stations</h3>
          <div className="mt-4 space-y-3">
            {topRisk.map((station) => (
              <div key={station.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <div>
                  <p className="font-medium text-white">{station.name}</p>
                  <p className="text-xs text-slate-400">{station.id}</p>
                </div>
                <span className="text-rose-300">{station.health}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
        <h3 className="text-lg font-semibold text-white">High-impact alert summary</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {alerts.slice(0, 3).map((alert) => (
            <div key={alert.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">{alert.station}</p>
              <h4 className="mt-2 text-base font-semibold text-white">{alert.type}</h4>
              <p className="mt-2 text-sm text-slate-300">{alert.explanation}</p>
            </div>
          ))}
        </div>
      </div>
      {loading && <p className="text-sm text-cyan-300">Generating AI operational summary...</p>}
      {error && <p className="text-sm text-amber-300">Backend insight sync warning: {error}</p>}
    </div>
  );
}

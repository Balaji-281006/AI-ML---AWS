import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { trendData } from '../services/demoData';
import { api } from '../services/api';
import { useBackendData } from '../services/useBackendData';

export function AnalyticsPage() {
  const { data: trends, loading, error } = useBackendData(() => api.trends(), trendData);
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Analytics</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Regional trend analytics</h1>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <h3 className="text-lg font-semibold text-white">Anomaly frequency</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="analyticsFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.06} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(148,163,184,0.2)' }} />
                <Area type="monotone" dataKey="anom" stroke="#38bdf8" strokeWidth={2} fill="url(#analyticsFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <h3 className="text-lg font-semibold text-white">Environmental conditions</h3>
          <div className="mt-4 space-y-4 text-sm text-slate-300">
            {[
              { label: 'Temperature delta', value: '+2.6°C vs baseline', tone: 'text-cyan-300' },
              { label: 'Pressure variance', value: '−7 hPa regionally', tone: 'text-amber-300' },
              { label: 'Humidity spread', value: '12% wider than seasonal average', tone: 'text-violet-300' },
              { label: 'Station drift', value: '3 stations above calibration threshold', tone: 'text-rose-300' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <span>{item.label}</span>
                <span className={item.tone}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {loading && <p className="text-sm text-cyan-300">Loading analytics series...</p>}
      {error && <p className="text-sm text-amber-300">Backend analytics sync warning: {error}</p>}
    </div>
  );
}

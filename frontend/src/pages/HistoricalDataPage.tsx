import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { historicalReadings, stationData } from '../services/demoData';
import { api } from '../services/api';
import { useBackendData } from '../services/useBackendData';

const chartData = historicalReadings
  .filter((reading) => reading.stationId === 'AWS-001')
  .slice(0, 24)
  .map((reading) => ({
    time: new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temp: reading.temperature,
    hum: reading.humidity,
    pressure: reading.pressure,
  }));

export function HistoricalDataPage() {
  const { data: readings, loading, error } = useBackendData(() => api.readings(), historicalReadings.filter((reading) => reading.stationId === 'AWS-001'));
  const chart = readings.map((reading) => ({
    time: new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temp: reading.temperature,
    hum: reading.humidity,
    pressure: reading.pressure,
  }));
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Historical data</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">30-day station record</h1>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300">
          {stationData.length} stations tracked
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Chennai station history</h3>
          <button onClick={() => { const csv = ['timestamp,station_id,temperature,pressure,humidity', ...readings.map((reading) => `${reading.timestamp},${reading.stationId},${reading.temperature},${reading.pressure},${reading.humidity}`)].join('\n'); const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'skyguard-historical-readings.csv'; anchor.click(); URL.revokeObjectURL(url); }} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-200">
            Export CSV
          </button>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart}>
              <defs>
                <linearGradient id="historicTemp" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.06} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(148,163,184,0.2)' }} />
              <Area type="monotone" dataKey="temp" stroke="#22d3ee" strokeWidth={2} fill="url(#historicTemp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      {loading && <p className="text-sm text-cyan-300">Loading historical readings...</p>}
      {error && <p className="text-sm text-amber-300">Backend history sync warning: {error}</p>}
    </div>
  );
}

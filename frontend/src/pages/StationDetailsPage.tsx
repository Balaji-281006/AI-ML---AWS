import { Link, useParams } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { stationData } from '../services/demoData';
import { api } from '../services/api';
import { useBackendData } from '../services/useBackendData';

export function StationDetailsPage() {
  const { stationId = 'AWS-001' } = useParams();
  const fallback = stationData.find((station) => station.id === stationId) ?? stationData[0];
  const { data, loading, error } = useBackendData(() => api.station(stationId), { ...fallback, readings: [], anomalies: [] });
  const chart = data.readings.map((reading) => ({
    time: new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: reading.temperature,
    humidity: reading.humidity,
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link to="/stations" className="text-sm text-cyan-300 hover:text-cyan-200">← Back to stations</Link>
          <p className="mt-3 text-xs uppercase tracking-[0.28em] text-cyan-300">Station Details</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{data.name} <span className="text-slate-500">{data.id}</span></h1>
        </div>
        <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">{data.status}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Temperature', `${data.temperature.toFixed(1)}°C`],
          ['Pressure', `${data.pressure.toFixed(0)} hPa`],
          ['Humidity', `${data.humidity}%`],
          ['Health score', `${data.health}%`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <h3 className="text-lg font-semibold text-white">24-hour telemetry</h3>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(148,163,184,0.2)' }} />
                <Area type="monotone" dataKey="temperature" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.12} />
                <Area type="monotone" dataKey="humidity" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.08} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <h3 className="text-lg font-semibold text-white">Station metadata</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="flex justify-between"><span>Location</span><span>{data.district}, {data.state}</span></div>
            <div className="flex justify-between"><span>Coordinates</span><span>{data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}</span></div>
            <div className="flex justify-between"><span>Connectivity</span><span>{data.connectivity}</span></div>
            <div className="flex justify-between"><span>Installed</span><span>{data.installationDate}</span></div>
            <div className="flex justify-between"><span>Station anomalies</span><span>{data.anomalies.length}</span></div>
          </div>
        </div>
      </div>

      {loading && <p className="text-sm text-cyan-300">Loading station telemetry...</p>}
      {error && <p className="text-sm text-amber-300">Backend station detail warning: {error}</p>}
    </div>
  );
}

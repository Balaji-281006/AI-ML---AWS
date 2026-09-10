import { stationData } from '../services/demoData';
import { api } from '../services/api';
import { useBackendData } from '../services/useBackendData';
import { Link } from 'react-router-dom';

export function StationsPage() {
  const { data: stations, loading, error } = useBackendData(() => api.stations(), stationData);
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Stations</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">AWS inventory</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stations.map((station) => (
          <div key={station.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">{station.id}</p>
                <Link to={`/stations/${station.id}`} className="mt-2 block text-xl font-semibold text-white hover:text-cyan-200">{station.name}</Link>
              </div>
              <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                station.status === 'Healthy' ? 'bg-emerald-500/15 text-emerald-300' :
                station.status === 'Warning' ? 'bg-amber-500/15 text-amber-300' :
                station.status === 'Critical' ? 'bg-rose-500/15 text-rose-300' : 'bg-slate-500/15 text-slate-300'
              }`}>
                {station.status}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <div className="flex justify-between"><span>Location</span><span>{station.district}, {station.state}</span></div>
              <div className="flex justify-between"><span>Health</span><span>{station.health}%</span></div>
              <div className="flex justify-between"><span>Last update</span><span>{new Date(station.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
              <div className="flex justify-between"><span>Connectivity</span><span>{station.connectivity}</span></div>
            </div>
          </div>
        ))}
      </div>
      {loading && <p className="text-sm text-cyan-300">Loading station inventory...</p>}
      {error && <p className="text-sm text-amber-300">Backend station sync warning: {error}</p>}
    </div>
  );
}

import { stationData } from '../services/demoData';
import { api } from '../services/api';
import { useBackendData } from '../services/useBackendData';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const statusColors: Record<string, string> = {
  Healthy: '#34d399',
  Warning: '#fbbf24',
  Critical: '#f87171',
  Offline: '#94a3b8',
};

export function MapPage() {
  const { data: stations, loading, error } = useBackendData(() => api.stations(), stationData);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Map View</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">India AWS Network</h1>
        </div>
        <div className="flex gap-2 text-xs uppercase tracking-[0.2em] text-slate-300">
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-300">Healthy</span>
          <span className="rounded-full bg-amber-500/15 px-3 py-1 text-amber-300">Warning</span>
          <span className="rounded-full bg-rose-500/15 px-3 py-1 text-rose-300">Critical</span>
          <span className="rounded-full bg-slate-500/15 px-3 py-1 text-slate-300">Offline</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
        <MapContainer center={[22.5, 79]} zoom={5} scrollWheelZoom className="h-[600px] rounded-2xl">
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {stations.map((station) => (
            <CircleMarker key={station.id} center={[station.latitude, station.longitude]} radius={8} pathOptions={{ color: '#0f172a', fillColor: statusColors[station.status], fillOpacity: 0.95, weight: 2 }}>
              <Popup>
                <strong>{station.name} ({station.id})</strong><br />
                {station.state}<br />
                {station.temperature.toFixed(1)}°C • {station.pressure.toFixed(0)} hPa • {station.humidity}% humidity<br />
                Health {station.health}% • {station.status}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      {loading && <p className="text-sm text-cyan-300">Loading station coordinates...</p>}
      {error && <p className="text-sm text-amber-300">Backend map sync warning: {error}</p>}
    </div>
  );
}

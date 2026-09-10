import { usersData } from '../services/demoData';
import { api } from '../services/api';
import { useBackendData } from '../services/useBackendData';

export function AdminPage() {
  const { data: users, loading, error } = useBackendData(() => api.users(), usersData);
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Platform administration</h1>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <h3 className="text-lg font-semibold text-white">User roster</h3>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-950/80 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-slate-800 text-slate-200">
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3">{user.role}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                        user.status === 'Active' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-500/15 text-slate-300'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <h3 className="text-lg font-semibold text-white">Access directory</h3>
          <div className="mt-4 space-y-3">
            {[
              ['Chezhiyan S', 'ADMIN'],
              ['Dr. Priya', 'METEOROLOGIST'],
              ['Vishnuvarthini', 'FIELD OPERATOR'],
              ['Surendar', 'VIEWER'],
            ].map(([name, role]) => <div key={role} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3"><span className="font-medium text-slate-200">{name}</span><span className="rounded-full bg-cyan-500/15 px-2 py-1 text-[10px] font-semibold tracking-[0.16em] text-cyan-300">{role}</span></div>)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <h3 className="text-lg font-semibold text-white">Threshold settings</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {[
              ['Temperature alert', '42°C'],
              ['Pressure drift threshold', '±8 hPa'],
              ['Humidity anomaly window', '15 mins'],
              ['Heartbeat timeout', '25 mins'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <span>{label}</span>
                <span className="text-cyan-300">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {loading && <p className="text-sm text-cyan-300">Loading user directory...</p>}
      {error && <p className="text-sm text-amber-300">Backend admin sync warning: {error}</p>}
    </div>
  );
}

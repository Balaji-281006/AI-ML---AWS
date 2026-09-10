import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const DEMO_USERS: Record<string, { id: string; name: string; email: string; role: 'Admin' | 'Meteorologist' | 'Operator' | 'Viewer'; status: 'Active' }> = {
  'admin@skyguard.ai': { id: 'DEMO-ADMIN', name: 'Balaji R', email: 'admin@skyguard.ai', role: 'Admin', status: 'Active' },
  'meteorologist@skyguard.ai': { id: 'DEMO-METEOROLOGIST', name: 'Dr. Priya', email: 'meteorologist@skyguard.ai', role: 'Meteorologist', status: 'Active' },
  'operator@skyguard.ai': { id: 'DEMO-OPERATOR', name: 'Vishnuvarthini', email: 'operator@skyguard.ai', role: 'Operator', status: 'Active' },
  'viewer@skyguard.ai': { id: 'DEMO-VIEWER', name: 'Surendar', email: 'viewer@skyguard.ai', role: 'Viewer', status: 'Active' },
};

function isBackendUnavailable(reason: unknown) {
  return reason instanceof Error && /SkyGuard API 5\d\d|Failed to fetch|NetworkError|ECONNREFUSED|fetch failed/i.test(reason.message);
}

export function LoginPage({ onLogin }: { onLogin: () => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@skyguard.ai');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await api.login(email, password);
      localStorage.setItem('skyguard_token', result.access_token);
      localStorage.setItem('skyguard_user', JSON.stringify(result.user));
      onLogin();
      navigate('/dashboard', { replace: true });
    } catch (reason) {
      const demoUser = DEMO_USERS[email.trim().toLowerCase()];
      if (isBackendUnavailable(reason) && demoUser && password === 'password123') {
        localStorage.setItem('skyguard_token', 'demo-session');
        localStorage.setItem('skyguard_user', JSON.stringify(demoUser));
        onLogin();
        navigate('/dashboard', { replace: true });
      } else {
        setError(reason instanceof Error ? 'Invalid credentials or backend unavailable.' : 'Sign in failed.');
      }
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="login-page relative flex min-h-screen items-center justify-center px-4 py-8">
      <button onClick={toggleTheme} className="absolute right-4 top-4 rounded-xl border border-slate-700 bg-slate-900 p-2 text-slate-200" aria-label="Toggle theme" title="Toggle theme">{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button>
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
        <div className="grid lg:grid-cols-2">
          <div className="p-8 sm:p-10">
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 text-xl font-bold text-cyan-300">S</div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-300">SkyGuard AI</p>
                <h1 className="text-2xl font-semibold text-white">Meteorological Command</h1>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Secure Access</p>
                <h2 className="mt-3 text-4xl font-semibold text-white">Real-time AWS monitoring</h2>
              </div>
              <p className="max-w-md text-slate-300">
                Detect faulty sensors, anomalies, and communication issues before they escalate into operational risk.
              </p>

              <div className="grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">Admin access enabled</div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">Live anomaly engine</div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 bg-slate-900/70 p-8 sm:p-10 lg:border-l lg:border-t-0">
            <h3 className="text-2xl font-semibold text-white">Sign in</h3>
            <p className="mt-2 text-sm text-slate-400">Use your role-based credentials to access the command center.</p>

            <form onSubmit={submit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm text-slate-300">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none ring-0 transition focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none transition focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between text-sm text-slate-300">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-700 bg-slate-900" />
                  Remember session
                </label>
                <a className="text-cyan-300 hover:text-cyan-200">Forgot password?</a>
              </div>

              {error && <p className="text-sm text-rose-300">{error}</p>}
              <button disabled={busy} className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-wait disabled:opacity-60">
                {busy ? 'Authenticating...' : 'Sign in to dashboard'}
              </button>
            </form>

            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-300">
              <p className="font-medium text-slate-200">Demo credentials</p>
              <ul className="mt-2 space-y-1">
                <li>Admin: admin@skyguard.ai / password123</li>
                <li>Meteorologist: meteorologist@skyguard.ai / password123</li>
                <li>Operator: operator@skyguard.ai / password123</li>
                <li>Viewer: viewer@skyguard.ai / password123</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

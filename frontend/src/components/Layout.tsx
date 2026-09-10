import { Bell, LayoutDashboard, MapPinned, ShieldCheck, Activity, AlertTriangle, ChartColumn, Database, Upload, BrainCircuit, MonitorCog, UserCog, LogOut, Menu, HeartPulse, Wrench, BookOpen, Moon, Sun, ChevronDown } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import type { UserAccount } from '../services/demoData';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/live-monitoring', label: 'Live Monitoring', icon: Activity },
  { to: '/map', label: 'AWS Map', icon: MapPinned },
  { to: '/stations', label: 'Stations', icon: MonitorCog },
  { to: '/anomalies', label: 'Anomalies', icon: AlertTriangle },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/analytics', label: 'Analytics', icon: ChartColumn },
  { to: '/historical-data', label: 'Historical Data', icon: Database },
  { to: '/data-upload', label: 'Data Upload', icon: Upload },
  { to: '/ai-insights', label: 'AI Insights', icon: BrainCircuit },
  { to: '/sensor-health', label: 'Sensor Health', icon: HeartPulse },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/system-health', label: 'System Health', icon: ShieldCheck },
  { to: '/documentation', label: 'Documentation', icon: BookOpen },
  { to: '/admin', label: 'Admin', icon: UserCog },
];

export function Layout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('skyguard_user') ?? 'null') as UserAccount | null; } catch { return null; }
  })();
  const profile = user ?? { name: 'Balaji R', email: 'admin@skyguard.ai', role: 'Admin' as const };
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-800 bg-slate-950/90 p-5 lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300">S</div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">SkyGuard AI</p>
              <h1 className="text-lg font-semibold">Command Center</h1>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-500/30'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Demo Mode</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-slate-200">Simulation Active</span>
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <header className="border-b border-slate-800 bg-slate-950/80 px-4 py-4 backdrop-blur-sm sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileOpen((open) => !open)} className="lg:hidden" aria-label="Toggle navigation">
                  <Menu className="h-5 w-5 text-slate-200" />
                </button>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Monitoring</p>
                  <h2 className="text-lg font-semibold text-white">SkyGuard AI</h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={toggleTheme} className="rounded-xl border border-slate-700 bg-slate-900 p-2 text-slate-200 hover:border-cyan-500/40" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <Link to="/alerts" className="relative rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-200 hover:border-cyan-500/40" aria-label="Open alerts">
                  <Bell size={16} />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">7</span>
                </Link>
                <div className="relative">
                  <button onClick={() => setProfileOpen((open) => !open)} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-left text-sm text-slate-200 hover:border-cyan-500/40" aria-expanded={profileOpen}>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/15 font-semibold text-cyan-300">{profile.name.charAt(0)}</span>
                    <span className="hidden sm:block"><span className="block font-medium">{profile.name}</span><span className="block text-xs text-slate-400">{profile.role === 'Admin' ? 'Administrator' : profile.role}</span></span>
                    <ChevronDown size={14} />
                  </button>
                  {profileOpen && <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-xl">
                    <p className="font-semibold text-white">{profile.name}</p>
                    <p className="mt-1 text-sm text-slate-400">{profile.email}</p>
                    <p className="mt-3 inline-flex rounded-full bg-cyan-500/15 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">{profile.role === 'Admin' ? 'Administrator' : profile.role}</p>
                    <Link to="/login" onClick={() => { localStorage.removeItem('skyguard_token'); localStorage.removeItem('skyguard_user'); }} className="mt-4 flex items-center gap-2 border-t border-slate-700 pt-3 text-sm text-slate-300 hover:text-cyan-300"><LogOut size={16} /> Logout</Link>
                  </div>}
                </div>
              </div>
            </div>
            {mobileOpen && (
              <nav className="mt-4 grid gap-2 border-t border-slate-800 pt-4 lg:hidden">
                {navItems.map(({ to, label, icon: Icon }) => (
                  <NavLink key={to} to={to} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white">
                    <Icon size={16} />
                    {label}
                  </NavLink>
                ))}
              </nav>
            )}
          </header>

          <main className="p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

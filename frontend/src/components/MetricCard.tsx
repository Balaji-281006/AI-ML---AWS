import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  tone?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'violet';
}

const tones = {
  cyan: 'bg-cyan-500/10 text-cyan-300 ring-cyan-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-300 ring-amber-500/20',
  rose: 'bg-rose-500/10 text-rose-300 ring-rose-500/20',
  violet: 'bg-violet-500/10 text-violet-300 ring-violet-500/20',
};

export function MetricCard({ title, value, change, icon: Icon, tone = 'cyan' }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <h3 className="mt-2 text-3xl font-semibold text-white">{value}</h3>
        </div>
        <div className={`rounded-xl p-3 ring-1 ${tones[tone]}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-emerald-400">{change}</span>
        <span className="text-slate-500">vs yesterday</span>
      </div>
    </div>
  );
}


export default function MetricCard({ title, value, icon, trend }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm hover:border-slate-700/60 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/80">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-white tracking-tight font-mono">{value}</div>
      {trend && <div className="text-[11px] text-slate-500 mt-1 font-mono">{trend}</div>}
    </div>
  );
}
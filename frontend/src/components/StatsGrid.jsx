import React from 'react';

const stats = [
  { id: 1, label: 'Active Nodes', value: '1,284', status: '+12% optimal', color: 'text-emerald-400' },
  { id: 2, label: 'Telemetry Stream', value: '48.2 MB/s', status: 'Live feed', color: 'text-indigo-400' },
  { id: 3, label: 'Threat Level', value: '0 Flagged', status: '100% secure', color: 'text-emerald-400' },
  { id: 4, label: 'System Uptime', value: '99.99%', status: 'Stable', color: 'text-emerald-400' },
];

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-7xl px-6 my-6">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="bg-[#0f1d2e] border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              {stat.label}
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              {stat.value}
            </div>
            <div className={`text-xs mt-1 font-medium ${stat.color}`}>
              {stat.status}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
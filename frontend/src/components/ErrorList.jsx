import React from 'react';
import { Search } from 'lucide-react';

export default function ErrorList({ errors, selectedError, onSelectError, searchQuery, setSearchQuery }) {
  return (
    <div className="lg:col-span-5 h-fit self-start bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-100">Live Incident Stream</h2>
        <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
          {errors.length} events
        </span>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Filter by title or service..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="space-y-2.5 overflow-y-auto pr-1">
        {errors.map((error) => {
          const isSelected = selectedError?.id === error.id;
          return (
            <div
              key={error.id}
              onClick={() => onSelectError(error)}
              className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-mono font-semibold text-slate-300">{error.id}</span>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                    error.status === 'resolved'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : error.severity === 'critical'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  {error.status === 'resolved' ? 'Resolved' : error.severity}
                </span>
              </div>
              <h3 className="text-xs font-medium text-slate-100 line-clamp-1 mb-1">{error.title}</h3>

              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mb-2">
                <span>
                  <strong className="text-slate-200">{error.events || 0}</strong> events
                </span>
                <span>
                  <strong className="text-slate-200">{error.users || 0}</strong> users
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-mono">{error.service}</span>
                <span>{error.timestamp}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
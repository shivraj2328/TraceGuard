import React from 'react';

export default function ThroughputChart() {
  const trafficData = [35, 48, 28, 62, 50, 78, 60, 85, 92, 70, 88, 95];

  return (
    <div className="w-full max-w-7xl px-6 mb-6">
      <div className="bg-[#0f1d2e] border border-slate-800/80 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-slate-300">
              Network Throughput & Traffic Volume
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Bandwidth consumption measured in Gbps over time
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="flex items-center text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 mr-2 animate-pulse" /> Inbound
            </span>
            <span className="flex items-center text-indigo-400">
              <span className="h-2 w-2 rounded-full bg-indigo-400 mr-2" /> Outbound
            </span>
          </div>
        </div>

        {/* Custom Telemetry Chart Grid */}
        <div className="h-44 w-full flex items-end gap-2 pt-4 border-b border-slate-800/80 pb-2">
          {trafficData.map((val, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-[10px] font-mono py-1 px-2 rounded border border-slate-700 text-emerald-400 z-10">
                {val} Gbps
              </div>
              <div 
                style={{ height: `${val}%` }} 
                className="w-full bg-gradient-to-t from-indigo-900/40 via-indigo-500/50 to-[#00E89C] rounded-t transition-all duration-300 group-hover:brightness-125"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-between text-xs font-mono text-slate-500 mt-3">
          <span>00:00</span>
          <span>04:00</span>
          <span>08:00</span>
          <span>12:00</span>
          <span>16:00</span>
          <span>20:00</span>
          <span>Live</span>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import TraceGuardLogo from './TraceGuardLogo';

export default function Header() {
  return (
    <header className="bg-[#0f1d2e] border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TraceGuardLogo size="sm" />
          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            v1.0
          </span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-slate-300 font-medium">
          <a href="#dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</a>
          <a href="#telemetry" className="hover:text-emerald-400 transition-colors">Telemetry</a>
          <a href="#settings" className="hover:text-emerald-400 transition-colors">Settings</a>
        </nav>
      </div>
    </header>
  );
}
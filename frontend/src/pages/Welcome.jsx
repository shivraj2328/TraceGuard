import React from 'react';
import { ArrowRight, Play, Terminal, Zap, ShieldAlert, Cpu } from 'lucide-react';
import TraceGuardLogo from '../components/TraceGuardLogo';

export default function Welcome({ onGetStarted, onGetDemo }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 relative overflow-hidden font-sans">
      {/* Background Accent Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between py-4 relative z-10">
        <TraceGuardLogo size="md" showTagline={false} />
        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Telemetry Core Active
        </span>
      </header>

      {/* Hero Content */}
      <main className="max-w-4xl mx-auto w-full text-center py-12 relative z-10 flex flex-col items-center my-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono mb-6">
          <Zap className="w-3.5 h-3.5" /> Next-Gen AI Diagnostic Engine
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Trace the break. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
            Guard the build.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mb-10 leading-relaxed">
          Real-time telemetry stream monitoring, automated stack trace analysis, and instant AI-generated patch execution for high-performance applications.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={onGetStarted}
            className="w-full cursor-pointer sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 group"
          >
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onGetDemo}
            className="w-full cursor-pointer sm:w-auto px-7 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-slate-200" />
            Watch Live Demo
          </button>
        </div>

        {/* Micro Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 w-full text-left">
          <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-start gap-3">
            <Terminal className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-slate-200">Live Stack Traces</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Instant incident streaming across services.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-start gap-3">
            <Cpu className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-slate-200">AI Auto-Fix</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Automated patch diagnostics in seconds.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-slate-200">Zero Blindspots</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Full visibility into cluster health and uptime.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full text-center py-4 border-t border-slate-900 text-xs text-slate-600 font-mono relative z-10">
        TraceGuard Telemetry Systems v1.0 • Built for Modern Engineering Teams
      </footer>
    </div>
  );
}
import React from 'react';
import { Terminal, Cpu, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function ErrorDetails({ selectedError, onApplyFix, isApplyingFix, fixApplied }) {
  if (!selectedError) return null;

  return (
    <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-xs font-mono font-bold text-indigo-400">{selectedError.id}</span>
            <span className="text-xs text-slate-500 font-mono">• {selectedError.service}</span>
          </div>
          <h2 className="text-lg font-bold text-white">{selectedError.title}</h2>
        </div>

        <button
          onClick={onApplyFix}
          disabled={isApplyingFix || fixApplied}
          className={`px-4 py-2 cursor-pointer rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
            fixApplied
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg'
          } disabled:opacity-75`}
        >
          {fixApplied ? <CheckCircle2 className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
          {isApplyingFix ? 'Executing AI Patch...' : fixApplied ? 'Patch Applied' : 'Auto-Fix Issue'}
        </button>
      </div>

      <div className="mb-6">
        <label className="text-xs font-semibold text-slate-400 flex items-center gap-2 mb-2">
          <Terminal className="w-4 h-4 text-slate-400" /> Stack Trace Diagnostic
        </label>
        <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-red-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {selectedError.stackTrace}
        </pre>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-400 flex items-center gap-2 mb-2">
          <ShieldAlert className="w-4 h-4 text-indigo-400" /> AI Diagnostic Recommendation
        </label>
        <div className="p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-lg text-xs text-slate-200 leading-relaxed font-sans">
          {selectedError.aiRecommendation}
        </div>
      </div>
    </div>
  );
}
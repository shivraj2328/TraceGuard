import React, { useState } from 'react';
import { Cpu, Clock } from 'lucide-react';

export default function ErrorDetails({ selectedError }) {
  const [prGenerated, setPrGenerated] = useState(false);

  if (!selectedError) return null;

  return (
    <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
      {/* Top Header Section */}
      <div>
        <div className="inline-block px-2.5 py-0.5 bg-rose-950/80 border border-rose-800/50 text-rose-400 text-xs font-mono font-bold rounded mb-2">
          {selectedError.id}
        </div>
        <h1 className="text-xl font-bold text-white mb-1 leading-snug">
          {selectedError.title}
        </h1>
        <p className="text-xs font-mono text-slate-400">
          Environment: <span className="text-slate-200">{selectedError.environment || 'production'}</span>
        </p>
      </div>

      {/* AI Incident Analysis Container */}
      <div className="bg-[#121124] border border-purple-900/40 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-purple-400 text-sm font-bold font-mono">
          <Cpu className="w-4 h-4" />
          <span>TraceGuard AI Incident Analysis</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {selectedError.aiAnalysis}
        </p>

        {/* Recommended Code Patch Box */}
        {selectedError.codePatch && (
          <div className="bg-[#090d16] border border-slate-800/90 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 font-semibold flex items-center gap-1.5">
                <span className="text-purple-400">&lt;/&gt;</span> Recommended Code Patch
              </span>
              <button
                onClick={() => setPrGenerated(true)}
                className={`px-3.5 cursor-pointer py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
                  prGenerated
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20'
                }`}
              >
                {prGenerated ? 'PR #142 Created' : 'Auto-Generate PR'}
              </button>
            </div>

            <pre className="p-3 bg-[#05080e] border border-slate-800/80 rounded text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
              <div className="text-slate-500">// Replace original code at line {selectedError.codePatch.line}:</div>
              <div className="text-slate-500">// {selectedError.codePatch.original}</div>
              <br />
              <div className="text-slate-500">// Proposed Fix:</div>
              <div className="text-emerald-400">{selectedError.codePatch.fix}</div>
            </pre>
          </div>
        )}
      </div>

      {/* Stack Trace Section */}
      <div className="space-y-2">
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <span>&gt;_</span> STACK TRACE
        </div>
        <div className="bg-[#090d16] border border-slate-800/80 rounded-xl p-4 font-mono text-xs overflow-x-auto space-y-1">
          {Array.isArray(selectedError.stackTrace) ? (
            selectedError.stackTrace.map((line, idx) => (
              <div key={idx} className={idx === 0 ? 'text-rose-400 font-semibold mb-1' : 'text-slate-400 pl-4'}>
                {line}
              </div>
            ))
          ) : (
            <div className="text-rose-400">{selectedError.stackTrace}</div>
          )}
        </div>
      </div>

      {/* Crash Breadcrumbs Section */}
      {selectedError.breadcrumbs && (
        <div className="space-y-2">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>CRASH BREADCRUMBS</span>
          </div>
          <div className="space-y-1.5 font-mono text-xs">
            {selectedError.breadcrumbs.map((item, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border flex items-center gap-3 ${
                  item.isError
                    ? 'bg-rose-950/30 border-rose-900/50 text-rose-300'
                    : 'bg-[#090d16] border-slate-800/80 text-slate-300'
                }`}
              >
                <span className="text-slate-500 text-[11px]">{item.time}</span>
                <span className="text-slate-600">&gt;</span>
                <span className={item.isError ? 'font-semibold text-rose-400' : 'text-slate-300'}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
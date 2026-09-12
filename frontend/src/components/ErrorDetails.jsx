import React, { useState } from 'react';
import { 
  Terminal, 
  FileCode, 
  Layers, 
  Code, 
  Database, 
  Copy, 
  Check, 
  Bug,
  ChevronDown,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function ErrorDetails({ selectedError }) {
  const [copiedStack, setCopiedStack] = useState(false);
  const [copiedGeminiPrompt, setCopiedGeminiPrompt] = useState(false);
  const [activeTab, setActiveTab] = useState('breadcrumbs');
  const [expandedCrumbs, setExpandedCrumbs] = useState({});

  if (!selectedError) return null;

  const getNormalizedStack = () => {
    if (typeof selectedError.rawStack === 'string') return selectedError.rawStack;
    if (typeof selectedError.stack === 'string') return selectedError.stack;
    if (Array.isArray(selectedError.stackTrace) && selectedError.stackTrace.length > 0) {
      return selectedError.stackTrace.join('\n');
    }
    return null;
  };

  const stackString = getNormalizedStack();

  const handleCopyStack = () => {
    if (stackString) {
      navigator.clipboard.writeText(stackString);
      setCopiedStack(true);
      setTimeout(() => setCopiedStack(false), 2000);
    }
  };

  const handleAskGemini = async () => {
    if (!stackString) return;

    const promptText = `Help me debug and fix this server error:

Error Message: ${selectedError.title || selectedError.message}
Error Type: ${selectedError.errorType || 'N/A'}
HTTP Status: ${selectedError.statusCode || 500}
Endpoint: ${selectedError.origin?.endpoint || 'N/A'}
File Path: ${selectedError.origin?.filePath || 'N/A'}

Stack Trace:
${stackString}`;

    // Copy to clipboard first so it's ready to paste
    await navigator.clipboard.writeText(promptText);
    
    setCopiedGeminiPrompt(true);
    setTimeout(() => setCopiedGeminiPrompt(false), 3000);

    // Open Gemini app tab
    window.open('https://gemini.google.com/app', '_blank', 'noopener,noreferrer');
  };

  const toggleCrumbExpand = (idx) => {
    setExpandedCrumbs(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const getStatusColor = (code) => {
    if (code >= 500) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (code >= 400) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  };

  const getLevelBadge = (level, isError) => {
    if (level === 'error' || isError) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (level === 'warn') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
  };

  return (
    <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-6 text-slate-100 overflow-hidden">
      
      {/* Incident Header */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`px-2 py-0.5 rounded text-xs font-mono border font-semibold ${getStatusColor(selectedError.statusCode)}`}>
              HTTP {selectedError.statusCode || 500}
            </span>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">
              {selectedError.event || 'EVENT'}
            </span>
            <span className="text-xs text-slate-600">•</span>
            <span className="text-xs font-mono text-indigo-400 font-medium">
              {selectedError.errorType || 'Error'}
            </span>
          </div>
          <h2 className="text-base font-semibold text-slate-100 break-all">
            {selectedError.title || selectedError.message}
          </h2>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[11px] font-mono text-slate-500 block">
            ID: {selectedError.id?.slice(-8)}
          </span>
        </div>
      </div>

      {/* Target Route & Source File Diagnostics */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 space-y-2 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-300">
          <Terminal className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-slate-500">Endpoint:</span>
          <span className="text-indigo-300 font-semibold">{selectedError.origin?.endpoint || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-slate-500">File Path:</span>
          <span className="text-slate-300 truncate">{selectedError.origin?.filePath || 'N/A'}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('breadcrumbs')}
          className={`px-4 py-2 text-xs font-medium cursor-pointer border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'breadcrumbs'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Detailed Breadcrumbs ({selectedError.breadcrumbs?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stack')}
          className={`px-4 py-2 text-xs font-medium cursor-pointer border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'stack'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          Stack Trace {stackString ? '' : '(Unavailable)'}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('metadata')}
          className={`px-4 py-2 text-xs font-medium cursor-pointer border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'metadata'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          Metadata & Payload
        </button>
      </div>

      {/* Tab 1: Detailed Breadcrumbs Timeline */}
      {activeTab === 'breadcrumbs' && (
        <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin">
          {selectedError.breadcrumbs && selectedError.breadcrumbs.length > 0 ? (
            selectedError.breadcrumbs.map((crumb, idx) => {
              const hasPayload = crumb.data && Object.keys(crumb.data).length > 0;
              const isExpanded = expandedCrumbs[idx];

              return (
                <div 
                  key={idx}
                  className="relative pl-6 pb-3 border-l-2 border-slate-800 last:border-l-0 last:pb-0"
                >
                  <span className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                    crumb.level === 'error' || crumb.isError ? 'bg-red-500' : 'bg-indigo-500'
                  }`} />

                  <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border uppercase font-medium ${getLevelBadge(crumb.level, crumb.isError)}`}>
                            {crumb.level || (crumb.isError ? 'error' : 'info')}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                            {crumb.category || 'custom'}
                          </span>
                          <span className="text-xs font-semibold text-slate-200">
                            {crumb.message || crumb.text}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {crumb.time || crumb.timestamp}
                      </span>
                    </div>

                    {hasPayload && (
                      <div className="pt-1 border-t border-slate-800/60">
                        <button
                          type="button"
                          onClick={() => toggleCrumbExpand(idx)}
                          className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer font-mono"
                        >
                          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          <span>Payload Context ({Object.keys(crumb.data).length} keys)</span>
                        </button>

                        {isExpanded && (
                          <pre className="mt-2 p-2 bg-slate-900 border border-slate-800 rounded text-[11px] font-mono text-indigo-300 overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(crumb.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-xs font-mono text-slate-500 text-center py-8 bg-slate-950/50 border border-slate-800 rounded-lg">
              No execution breadcrumbs recorded for this telemetry event.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Stack Trace */}
      {activeTab === 'stack' && (
        <div className="relative group">
          {stackString ? (
            <>
              <div className="absolute right-3 top-3 flex items-center gap-2 z-10">
                <button
                  type="button"
                  onClick={handleAskGemini}
                  className="px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded border border-purple-400/30 transition-all text-xs flex items-center gap-1.5 shadow-md cursor-pointer font-medium"
                >
                  {copiedGeminiPrompt ? (
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-purple-200 animate-pulse" />
                  )}
                  <span>{copiedGeminiPrompt ? 'Copied & Opening Gemini...' : 'Ask Gemini'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyStack}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                >
                  {copiedStack ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedStack ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="bg-slate-950 p-4 pt-12 rounded-lg border border-slate-800 text-[11px] font-mono text-red-300/90 overflow-x-auto whitespace-pre-wrap max-h-[380px] leading-relaxed scrollbar-thin">
                {stackString}
              </pre>
            </>
          ) : (
            <div className="text-xs font-mono text-slate-500 text-center py-8 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <Bug className="w-6 h-6 mx-auto text-slate-600" />
              <p>No raw stack trace captured for this event.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Metadata & Raw JSON Payloads */}
      {activeTab === 'metadata' && (
        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
          <div>
            <span className="text-xs font-medium text-slate-400 mb-1.5 block">Metadata Context</span>
            <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-indigo-300 overflow-x-auto whitespace-pre-wrap">
              {selectedError.metadata ? JSON.stringify(selectedError.metadata, null, 2) : 'null'}
            </pre>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-400 mb-1.5 block">Raw Error Payload</span>
            <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-amber-300/90 overflow-x-auto whitespace-pre-wrap">
              {selectedError.errorRaw ? JSON.stringify(selectedError.errorRaw, null, 2) : 'null'}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
}
import React from 'react';
import Header from './components/Header';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0b1724] text-white">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold tracking-wide mb-2">
          System Telemetry Dashboard
        </h1>
        <p className="text-slate-400 max-w-md">
          Monitoring active nodes, network scan waves, and real-time security events.
        </p>
      </main>
    </div>
  );
}
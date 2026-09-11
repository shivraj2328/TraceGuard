import React from 'react';
import Header from './components/Header';
import StatsGrid from './components/StatsGrid';
import ThroughputChart from './components/ThroughputChart';
import EventLog from './components/EventLog';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0b1724] text-white flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center">
        <StatsGrid />
        <ThroughputChart />
        <EventLog />
      </main>
    </div>
  );
}
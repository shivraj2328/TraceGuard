import React from 'react';
import Header from './components/Header';
import StatsGrid from './components/StatsGrid';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0b1724] text-white flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center py-6">
        <StatsGrid />
      </main>
    </div>
  );
}
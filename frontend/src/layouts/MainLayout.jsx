import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';

export default function MainLayout({ user, onLogout }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      <Header user={user} onLogout={onLogout} />
      <main className="max-w-7xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
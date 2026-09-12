import React from 'react';
import { LogOut, User } from 'lucide-react';
import TraceGuardLogo from './TraceGuardLogo';

export default function Header({ user, onLogout }) {
  const getRoleBadgeStyle = (role) => {
    switch (role?.toLowerCase()) {
      case 'devops engineer':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'security analyst':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'system admin':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TraceGuardLogo size="sm" showTagline={false} />
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
            v1.0
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 px-3.5 py-1.5 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-semibold text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-100">{user?.name || 'Developer'}</span>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${getRoleBadgeStyle(user?.role)}`}>
                  {user?.role || 'Developer'}
                </span>
              </div>
              <span className="text-xs text-slate-400">{user?.email}</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-3 py-2 text-slate-400 hover:text-red-400 bg-slate-950/40 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 rounded-lg transition-all flex items-center gap-1.5 text-xs font-medium"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline cursor-pointer">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
import React from 'react';
import { Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800/80 glass-panel sticky top-0 z-20 px-8 flex items-center justify-between">
      {/* Live System Status */}
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Model Active: CICIDS2017 RF Pipeline
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Zap className="w-3 h-3 text-cyan-400" /> 99.46% Model Accuracy
        </span>
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs text-slate-400">Security Operator</p>
          <p className="text-sm font-semibold text-slate-200">{user?.username}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold">
          {user?.username?.[0]?.toUpperCase()}
        </div>
      </div>
    </header>
  );
};

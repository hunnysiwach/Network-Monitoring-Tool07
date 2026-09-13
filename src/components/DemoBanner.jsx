import React from 'react';
import { AlertTriangle, PlayCircle, ShieldCheck } from 'lucide-react';

export default function DemoBanner({ isDemoMode, onToggle }) {
  if (!isDemoMode) return null;

  return (
    <div className="bg-amber-950/40 border-y border-amber-500/40 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 text-amber-200">
      <div className="flex items-center gap-2 font-mono">
        <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
        <span className="font-bold tracking-wide">DEMO MODE — SYNTHETIC DATA ACTIVE:</span>
        <span className="text-slate-300">
          Showing generated network telemetry for educational demonstration & non-root presentation environments.
        </span>
      </div>
      {onToggle && (
        <button
          onClick={onToggle}
          className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded font-mono text-xs font-semibold transition-all"
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Switch to Live Mode
        </button>
      )}
    </div>
  );
}

import React from 'react';

export default function StatusBadge({ status, label, size = 'sm' }) {
  const norm = (status || '').toUpperCase();
  
  let bg = 'bg-slate-800 text-slate-300 border-slate-700';
  let dot = 'bg-slate-400';

  if (['ONLINE', 'RUNNING', 'VALID', 'HEALTHY', 'PASS', 'ACTIVE', 'UP'].includes(norm)) {
    bg = 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 glow-emerald';
    dot = 'bg-emerald-400 animate-pulse';
  } else if (['WARN', 'WARNING', 'INITIALIZING', 'INITIALIZED', 'OPERATIONAL_WITH_WARNINGS', 'LOW', 'MEDIUM', 'DELETED'].includes(norm)) {
    bg = 'bg-amber-950/60 text-amber-300 border-amber-500/40';
    dot = 'bg-amber-400';
  } else if (['FAIL', 'FAILED', 'STOPPED', 'INVALID', 'CRITICAL', 'HIGH', 'ERROR', 'DOWN', 'CORRUPTED'].includes(norm)) {
    bg = 'bg-red-950/60 text-red-300 border-red-500/40 glow-red';
    dot = 'bg-red-400';
  } else if (['INFO', 'MODIFIED', 'CREATED'].includes(norm)) {
    bg = 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40 glow-cyan';
    dot = 'bg-cyan-400';
  }

  const sizeClasses = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-full border ${bg} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      <span>{label || status}</span>
    </span>
  );
}

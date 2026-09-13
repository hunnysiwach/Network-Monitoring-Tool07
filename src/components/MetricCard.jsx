import React from 'react';

export default function MetricCard({ title, value, subtext, icon: Icon, trend, color = 'cyan' }) {
  const colorMap = {
    cyan: 'border-cyan-500/30 text-cyan-400 bg-cyan-950/20',
    emerald: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20',
    amber: 'border-amber-500/30 text-amber-400 bg-amber-950/20',
    red: 'border-red-500/30 text-red-400 bg-red-950/20',
    purple: 'border-purple-500/30 text-purple-400 bg-purple-950/20'
  };

  const accent = colorMap[color] || colorMap.cyan;

  return (
    <div className="bg-[#111827] border border-[#1f293d] hover:border-slate-700 transition-all rounded-xl p-5 shadow-lg relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold font-mono text-white tracking-tight">{value}</h3>
          {subtext && <p className="text-xs text-slate-400">{subtext}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg border ${accent}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span className={trend.isPositive ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
            {trend.label}
          </span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  );
}

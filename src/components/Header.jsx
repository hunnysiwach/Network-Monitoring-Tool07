import React, { useState, useEffect } from 'react';
import { RefreshCw, Radio, Server, Database, ShieldCheck, Activity } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function Header({ telemetry, serviceStatus, jsonStatus, onRefresh, isRefreshing, isDemoMode, onToggleDemo }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const monStatus = telemetry?.status || 'ONLINE';
  const srvStatus = serviceStatus?.status || 'RUNNING';
  const dataStatus = jsonStatus?.isValid ? 'VALID' : 'INVALID';

  return (
    <header className="bg-[#0d1322]/80 backdrop-blur border-b border-[#1f293d] sticky top-0 z-20 px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Title & Tagline */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-black text-white font-mono tracking-wide">
            NETWATCH
          </h2>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            DEFENSIVE TELEMETRY
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Lightweight Linux Network Traffic Monitor & System Activity Dashboard
        </p>
      </div>

      {/* Status Badges Group */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Monitoring Indicator */}
        <div className="flex items-center gap-1.5 bg-[#111827] px-3 py-1.5 rounded-lg border border-[#1f293d]">
          <Radio className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Monitoring:</span>
          <StatusBadge status={monStatus} />
        </div>

        {/* Service Indicator */}
        <div className="flex items-center gap-1.5 bg-[#111827] px-3 py-1.5 rounded-lg border border-[#1f293d]">
          <Server className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Service:</span>
          <StatusBadge status={srvStatus} />
        </div>

        {/* JSON Data Integrity */}
        <div className="flex items-center gap-1.5 bg-[#111827] px-3 py-1.5 rounded-lg border border-[#1f293d]">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Data:</span>
          <StatusBadge status={dataStatus} />
        </div>

        {/* System Health */}
        <div className="flex items-center gap-1.5 bg-[#111827] px-3 py-1.5 rounded-lg border border-[#1f293d]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] text-slate-400 font-semibold uppercase">System:</span>
          <StatusBadge status="HEALTHY" />
        </div>

        {/* Clock & Refresh */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#1f293d]">
          <span className="font-mono text-xs text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-500/20">
            {time}
          </span>
          <button
            onClick={onRefresh}
            title="Refresh Telemetry"
            className="p-1.5 bg-[#111827] hover:bg-slate-800 border border-[#1f293d] rounded-lg text-slate-300 hover:text-cyan-400 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}

import React, { useState, useEffect } from 'react';
import {
  Server,
  Play,
  Square,
  RotateCw,
  Terminal,
  Activity,
  Cpu,
  Clock,
  HardDrive
} from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import MetricCard from '../components/MetricCard';

export default function ServicePage() {
  const [serviceInfo, setServiceInfo] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadServiceData = async () => {
    try {
      const [status, logData] = await Promise.all([
        api.getServiceStatus(),
        api.getLogs(60)
      ]);
      setServiceInfo(status);
      setLogs(logData.logs || []);
    } catch (err) {
      console.error('Failed to load service data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServiceData();
    const interval = setInterval(loadServiceData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    setActionLoading(true);
    try {
      await api.startService();
      loadServiceData();
    } finally {
      setActionLoading(false);
    }
  };

  const handleStop = async () => {
    setActionLoading(true);
    try {
      await api.stopService();
      loadServiceData();
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestart = async () => {
    setActionLoading(true);
    try {
      await api.restartService();
      loadServiceData();
    } finally {
      setActionLoading(false);
    }
  };

  const isRunning = serviceInfo?.status === 'RUNNING';
  const memMb = serviceInfo?.memoryUsage ? Math.round(serviceInfo.memoryUsage.rss / (1024 * 1024)) : 45;
  const uptimeMin = serviceInfo?.uptimeSeconds ? Math.floor(serviceInfo.uptimeSeconds / 60) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner & Controls */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-400" />
            Service Lifecycle & Daemon Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Control the background <code className="text-cyan-300">netwatch.service</code> daemon and stream process telemetry.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {!isRunning ? (
            <button
              onClick={handleStart}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs rounded-lg transition-colors"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Service</span>
            </button>
          ) : (
            <button
              onClick={handleStop}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs rounded-lg transition-colors"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop Service</span>
            </button>
          )}

          <button
            onClick={handleRestart}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1f293d] hover:bg-slate-700 text-slate-200 font-mono font-medium text-xs rounded-lg border border-slate-700 transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
            <span>Restart</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Service State"
          value={serviceInfo?.status || 'UNKNOWN'}
          subtext="Unit: netwatch.service"
          icon={Server}
          color={isRunning ? 'emerald' : 'red'}
        />
        <MetricCard
          title="Process PID"
          value={serviceInfo?.pid || 'N/A'}
          subtext="Node daemon process ID"
          icon={Activity}
          color="cyan"
        />
        <MetricCard
          title="Daemon Uptime"
          value={`${uptimeMin} mins`}
          subtext="Continuous active runtime"
          icon={Clock}
          color="purple"
        />
        <MetricCard
          title="Memory Consumption"
          value={`${memMb} MB`}
          subtext="Resident Set Size (RSS)"
          icon={HardDrive}
          color="cyan"
        />
      </div>

      {/* Real-Time Daemon Service Logs */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            Live Daemon Log Stream (netwatch.log)
          </h3>
          <span className="text-[11px] font-mono text-slate-500">Auto-refreshing</span>
        </div>

        <div className="bg-[#0a0f1d] border border-[#1f293d] rounded-lg p-4 font-mono text-xs text-slate-300 h-80 overflow-y-auto space-y-1">
          {logs.length === 0 ? (
            <p className="text-slate-600 italic">No log entries recorded yet.</p>
          ) : (
            logs.map((l) => (
              <div
                key={l.id}
                className={`py-0.5 ${
                  l.level === 'ERROR'
                    ? 'text-red-400 font-semibold'
                    : l.level === 'WARN'
                    ? 'text-amber-400'
                    : 'text-slate-300'
                }`}
              >
                <span className="text-slate-500 mr-2">[{l.timestamp}]</span>
                <span className={`mr-2 font-bold ${
                  l.level === 'ERROR' ? 'text-red-400' : l.level === 'WARN' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {l.level}
                </span>
                <span className="text-cyan-400 mr-2">[{l.component}]</span>
                <span>{l.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

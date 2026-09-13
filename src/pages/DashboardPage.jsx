import React from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Activity,
  Cpu,
  Users,
  ShieldAlert,
  FolderSync,
  HardDrive
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import TrafficChart from '../components/TrafficChart';
import StatusBadge from '../components/StatusBadge';

export default function DashboardPage({
  dashboardData,
  timeRange,
  onRangeChange,
  onNavigate,
  config
}) {
  const telemetry = dashboardData?.telemetry || {};
  const totals = telemetry.totals || {};
  const alertCounts = dashboardData?.alertCounts || { active: 0, high: 0 };
  const fileEvents = dashboardData?.fileEvents || [];
  const recentAlerts = dashboardData?.recentAlerts || [];
  const processes = (telemetry.processes || []).slice(0, 6);
  const sysMetrics = dashboardData?.system || {};

  return (
    <div className="space-y-6">
      {/* Top 8 Quick SOC Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Current Download"
          value={`${totals.download_mbps || 0} Mbps`}
          subtext={`Formatted: ${totals.download_formatted || '0 KB/s'}`}
          icon={ArrowDownCircle}
          color="cyan"
          trend={{ label: `Threshold: ${config?.DOWNLOAD_THRESHOLD_MBPS || 50} MB/s`, isPositive: true }}
        />
        <MetricCard
          title="Current Upload"
          value={`${totals.upload_mbps || 0} Mbps`}
          subtext={`Formatted: ${totals.upload_formatted || '0 KB/s'}`}
          icon={ArrowUpCircle}
          color="emerald"
          trend={{ label: `Threshold: ${config?.UPLOAD_THRESHOLD_MBPS || 20} MB/s`, isPositive: true }}
        />
        <MetricCard
          title="Total Download"
          value={totals.total_download_formatted || '0 B'}
          subtext="Session cumulative RX"
          icon={Activity}
          color="purple"
        />
        <MetricCard
          title="Total Upload"
          value={totals.total_upload_formatted || '0 B'}
          subtext="Session cumulative TX"
          icon={Activity}
          color="purple"
        />
        <MetricCard
          title="Active Processes"
          value={telemetry.processes?.length || 0}
          subtext="Network-active binaries"
          icon={Cpu}
          color="cyan"
        />
        <MetricCard
          title="Active Linux Users"
          value={telemetry.users?.length || 0}
          subtext="Generating socket telemetry"
          icon={Users}
          color="emerald"
        />
        <MetricCard
          title="Security Alerts"
          value={alertCounts.active || 0}
          subtext={`${alertCounts.high || 0} high severity alerts`}
          icon={ShieldAlert}
          color={alertCounts.high > 0 ? 'red' : alertCounts.active > 0 ? 'amber' : 'emerald'}
        />
        <MetricCard
          title="File Integrity Events"
          value={fileEvents.length || 0}
          subtext="Monitored SHA-256 changes"
          icon={FolderSync}
          color="cyan"
        />
      </div>

      {/* Main Real-Time Traffic Graph */}
      <TrafficChart
        data={dashboardData?.trafficHistory || []}
        range={timeRange}
        onRangeChange={onRangeChange}
        dlThreshold={config?.DOWNLOAD_THRESHOLD_MBPS || 50}
        ulThreshold={config?.UPLOAD_THRESHOLD_MBPS || 20}
      />

      {/* Two Column Layout: Active Process Bandwidth & Recent Security Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Active Network Processes */}
        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Live Process Bandwidth
              </h3>
              <p className="text-xs text-slate-400">Process-level telemetry via nethogs / OS stats</p>
            </div>
            <button
              onClick={() => onNavigate('processes')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium hover:underline"
            >
              View All ({telemetry.processes?.length || 0}) →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1f293d] text-slate-400 uppercase text-[10px]">
                  <th className="pb-2">Process</th>
                  <th className="pb-2">PID</th>
                  <th className="pb-2">User</th>
                  <th className="pb-2">Download</th>
                  <th className="pb-2">Upload</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f293d]/50">
                {processes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-slate-500 font-sans">
                      Waiting for process telemetry...
                    </td>
                  </tr>
                ) : (
                  processes.map((p, idx) => (
                    <tr key={idx} className="hover:bg-[#162032] transition-colors">
                      <td className="py-2.5 font-medium text-white truncate max-w-[140px]" title={p.name}>
                        {p.name}
                      </td>
                      <td className="py-2.5 text-slate-400">{p.pid}</td>
                      <td className="py-2.5 text-cyan-300">{p.user}</td>
                      <td className="py-2.5 text-emerald-400 font-semibold">{p.download_formatted}</td>
                      <td className="py-2.5 text-cyan-400">{p.upload_formatted}</td>
                      <td className="py-2.5 text-right">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security & System Alerts Stream */}
        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Recent Defensive Alerts
              </h3>
              <p className="text-xs text-slate-400">Threshold violations, network spikes & integrity events</p>
            </div>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium hover:underline"
            >
              Alert Console →
            </button>
          </div>

          <div className="space-y-2.5">
            {recentAlerts.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs font-sans">
                No active threshold or security alerts. System is operating normally.
              </div>
            ) : (
              recentAlerts.map((alt) => (
                <div
                  key={alt.id}
                  className="p-3 bg-[#0d1322] border border-[#1f293d] rounded-lg flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={alt.severity} />
                      <span className="font-mono font-bold text-slate-200">{alt.type}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(alt.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{alt.description}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Source: {alt.source} • Observed: <span className="text-cyan-300">{alt.observedValue}</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {alt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* System Telemetry Bar */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-cyan-400" />
          <span>Host: <strong className="text-white">{sysMetrics.hostname || 'Linux-Node'}</strong> ({sysMetrics.platform || 'linux'} {sysMetrics.arch || 'x64'})</span>
        </div>
        <div>
          Memory: <strong className="text-white">{sysMetrics.memory?.usedFormatted || '1.2 GB'}</strong> / {sysMetrics.memory?.totalFormatted || '8 GB'} ({sysMetrics.memory?.percentage || 15}%)
        </div>
        <div>
          CPU Cores: <strong className="text-white">{sysMetrics.cpu?.cores || 4}</strong> • Load 1m: <strong className="text-cyan-300">{sysMetrics.cpu?.load1m || '0.25'}</strong>
        </div>
        <div>
          Disk Free: <strong className="text-emerald-400">{sysMetrics.disk?.freeFormatted || '45 GB'}</strong>
        </div>
      </div>
    </div>
  );
}

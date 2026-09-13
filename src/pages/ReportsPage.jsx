import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Printer,
  ShieldCheck,
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  Cpu,
  Users,
  ShieldAlert,
  FolderSync
} from 'lucide-react';
import { api } from '../services/api';
import MetricCard from '../components/MetricCard';

export default function ReportsPage() {
  const [period, setPeriod] = useState('daily'); // 'daily', 'weekly'
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReport = async (p = period) => {
    setLoading(true);
    try {
      const data = await api.getReportSummary(p);
      setReport(data);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(period);
  }, [period]);

  const stats = report?.monitoringStats || {};
  const alerts = report?.alertsSummary || {};
  const files = report?.fileEventsSummary || {};

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `netwatch-report-${period}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Executive Defensive Network & Security Reports
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Section 26: Automated summary report generator for SOC compliance and system telemetry review.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Toggle */}
          <div className="flex items-center gap-1 bg-[#0a0f1d] border border-[#1f293d] p-1 rounded-lg">
            <button
              onClick={() => setPeriod('daily')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded transition-all ${
                period === 'daily'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Daily Report
            </button>
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded transition-all ${
                period === 'weekly'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Weekly Report
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f293d] hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium rounded-lg border border-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f293d] hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium rounded-lg border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Report Container */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-6 shadow-xl space-y-6">
        {/* Report Header */}
        <div className="border-b border-[#1f293d] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30 uppercase">
              DEFENSIVE AUDIT DOCUMENT
            </span>
            <h1 className="text-xl font-black text-white font-mono mt-2">
              {report?.reportTitle || 'NETWATCH EXECUTIVE SUMMARY'}
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Generated: {new Date(report?.generatedAt || Date.now()).toLocaleString()}
            </p>
          </div>
          <div className="text-right font-mono text-xs text-slate-400">
            <div>Engine: <strong className="text-white">NETWATCH v1.0</strong></div>
            <div>Classification: <strong className="text-emerald-400">DEFENSIVE METADATA</strong></div>
          </div>
        </div>

        {/* Executive Overview KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-[#0d1322] border border-[#1f293d] rounded-xl">
            <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">Total Bandwidth (RX/TX)</p>
            <p className="text-lg font-bold font-mono text-white mt-1">
              {stats.total_download_formatted || '0 B'} / {stats.total_upload_formatted || '0 B'}
            </p>
          </div>
          <div className="p-4 bg-[#0d1322] border border-[#1f293d] rounded-xl">
            <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">Peak Observed DL/UL</p>
            <p className="text-lg font-bold font-mono text-cyan-400 mt-1">
              {stats.peak_download_mbps || 0} Mbps / {stats.peak_upload_mbps || 0} Mbps
            </p>
          </div>
          <div className="p-4 bg-[#0d1322] border border-[#1f293d] rounded-xl">
            <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">Security Alerts</p>
            <p className="text-lg font-bold font-mono text-amber-400 mt-1">
              {alerts.total || 0} recorded ({alerts.high || 0} high severity)
            </p>
          </div>
          <div className="p-4 bg-[#0d1322] border border-[#1f293d] rounded-xl">
            <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">File Integrity Events</p>
            <p className="text-lg font-bold font-mono text-emerald-400 mt-1">
              {files.total || 0} ({files.modified || 0} modified, {files.created || 0} created)
            </p>
          </div>
        </div>

        {/* Top Consumers Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Top Processes */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Top Network Processes
            </h3>
            <div className="bg-[#0d1322] border border-[#1f293d] rounded-xl p-4 divide-y divide-[#1f293d]">
              {(report?.topProcesses || []).map((p, idx) => (
                <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-200">{p.name}</span>
                  <span className="text-cyan-400 font-bold">{p.formatted}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Users */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Bandwidth by Linux User
            </h3>
            <div className="bg-[#0d1322] border border-[#1f293d] rounded-xl p-4 divide-y divide-[#1f293d]">
              {(report?.topUsers || []).map((u, idx) => (
                <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-200">{u.username}</span>
                  <span className="text-emerald-400 font-bold">{u.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

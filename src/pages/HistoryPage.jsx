import React, { useState, useEffect } from 'react';
import {
  LineChart as ChartIcon,
  Download,
  Calendar,
  FileSpreadsheet,
  FileCode,
  ArrowDownCircle,
  ArrowUpCircle,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { api } from '../services/api';
import MetricCard from '../components/MetricCard';

export default function HistoryPage() {
  const [period, setPeriod] = useState('7d');
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadHistory = async (p = period) => {
    setLoading(true);
    try {
      const data = await api.getHistory(p);
      setHistoryData(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(period);
  }, [period]);

  const periods = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' }
  ];

  const days = historyData?.days || [];
  const summary = historyData?.summary || {};
  const topProcesses = historyData?.top_processes || [];
  const topUsers = historyData?.top_users || [];

  const chartData = days.map((d) => ({
    date: d.date.split('-').slice(1).join('/'),
    Download_GB: parseFloat((d.total_download_bytes / (1024 * 1024 * 1024)).toFixed(2)),
    Upload_GB: parseFloat((d.total_upload_bytes / (1024 * 1024 * 1024)).toFixed(2)),
    Peak_DL_Mbps: d.peak_download_mbps,
    Peak_UL_Mbps: d.peak_upload_mbps,
    Alerts: d.alerts_count
  }));

  const handleExport = (format) => {
    window.open(api.getHistoryExportUrl(period, format), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & Range Selector */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <ChartIcon className="w-5 h-5 text-cyan-400" />
            Historical Bandwidth & Telemetry Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated time-series trend analysis, daily volumes, peak bandwidths, and report exports.
          </p>
        </div>

        {/* Period Selector & Export Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-[#0a0f1d] border border-[#1f293d] p-1 rounded-lg">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 text-xs font-mono font-medium rounded transition-all ${
                  period === p.value
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f293d] hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium rounded-lg border border-slate-700 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => handleExport('json')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f293d] hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium rounded-lg border border-slate-700 transition-colors"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Period Download Total"
          value={summary.total_download_formatted || '0 B'}
          subtext={`Across selected ${period}`}
          icon={ArrowDownCircle}
          color="cyan"
        />
        <MetricCard
          title="Period Upload Total"
          value={summary.total_upload_formatted || '0 B'}
          subtext={`Across selected ${period}`}
          icon={ArrowUpCircle}
          color="emerald"
        />
        <MetricCard
          title="Peak Observed Download"
          value={`${summary.peak_download_mbps || 0} Mbps`}
          subtext="Highest recorded rate"
          icon={Activity}
          color="purple"
        />
        <MetricCard
          title="Peak Observed Upload"
          value={`${summary.peak_upload_mbps || 0} Mbps`}
          subtext="Highest recorded rate"
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Historical Bar Chart: Download vs Upload in GB */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white font-mono mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          Daily Bandwidth Volume (Gigabytes)
        </h3>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} unit=" GB" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0d1322', borderColor: '#1f293d', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }} />
              <Bar dataKey="Download_GB" name="Download (GB)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Upload_GB" name="Upload (GB)" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Processes and Users breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Historical Processes */}
        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-white font-mono mb-4">
            Top Network Consumers (By Process)
          </h3>
          <div className="space-y-3">
            {topProcesses.map((p, idx) => (
              <div key={idx} className="p-3 bg-[#0d1322] border border-[#1f293d] rounded-lg">
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="font-semibold text-white truncate max-w-[200px]">{p.name}</span>
                  <span className="text-cyan-400 font-bold">{p.formatted}</span>
                </div>
                <div className="w-full bg-[#0a0f1d] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full"
                    style={{ width: `${Math.max(15, 100 - idx * 25)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Historical Users */}
        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-white font-mono mb-4">
            Top Network Consumers (By Linux User)
          </h3>
          <div className="space-y-3">
            {topUsers.map((u, idx) => (
              <div key={idx} className="p-3 bg-[#0d1322] border border-[#1f293d] rounded-lg">
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="font-semibold text-emerald-300">{u.username}</span>
                  <span className="text-slate-400">{u.percentage}% of traffic</span>
                </div>
                <div className="w-full bg-[#0a0f1d] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full"
                    style={{ width: `${u.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

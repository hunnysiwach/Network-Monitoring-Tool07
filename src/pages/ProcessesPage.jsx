import React, { useState, useEffect } from 'react';
import { Cpu, Search, ArrowUpDown, Filter, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function ProcessesPage() {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('traffic'); // 'traffic', 'download', 'upload', 'name'
  const [userFilter, setUserFilter] = useState('ALL');

  const loadProcesses = async () => {
    try {
      const data = await api.getProcesses();
      setProcesses(data.processes || []);
    } catch (err) {
      console.error('Failed to load processes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProcesses();
    const interval = setInterval(loadProcesses, 2000);
    return () => clearInterval(interval);
  }, []);

  const usersList = ['ALL', ...new Set(processes.map(p => p.user).filter(Boolean))];

  const filteredProcesses = processes
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          String(p.pid).includes(search) ||
                          p.user.toLowerCase().includes(search.toLowerCase());
      const matchUser = userFilter === 'ALL' || p.user === userFilter;
      return matchSearch && matchUser;
    })
    .sort((a, b) => {
      if (sortBy === 'download') return (b.download_kbps || 0) - (a.download_kbps || 0);
      if (sortBy === 'upload') return (b.upload_kbps || 0) - (a.upload_kbps || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return ((b.download_kbps || 0) + (b.upload_kbps || 0)) - ((a.download_kbps || 0) + (a.upload_kbps || 0));
    });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Process-Level Bandwidth Telemetry
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time per-binary socket bandwidth aggregation via Linux kernel nethogs telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-cyan-950/40 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-cyan-300">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Defensive Scope: Metadata Only (No Payload Inspection)</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by process name, PID, or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0a0f1d] border border-[#1f293d] focus:border-cyan-500 rounded-lg text-xs font-mono text-white focus:outline-none transition-colors"
          />
        </div>

        {/* User Filter & Sorting */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>User:</span>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="bg-[#0a0f1d] border border-[#1f293d] text-white px-2.5 py-1.5 rounded-lg text-xs font-mono focus:outline-none focus:border-cyan-500"
            >
              {usersList.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#0a0f1d] border border-[#1f293d] text-white px-2.5 py-1.5 rounded-lg text-xs font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="traffic">Total Traffic (Bandwidth)</option>
              <option value="download">Download Speed</option>
              <option value="upload">Upload Speed</option>
              <option value="name">Process Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Processes Table */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1f293d] text-slate-400 uppercase text-[10px]">
                <th className="pb-3">Process Name</th>
                <th className="pb-3">PID</th>
                <th className="pb-3">Linux User</th>
                <th className="pb-3">Download (RX)</th>
                <th className="pb-3">Upload (TX)</th>
                <th className="pb-3">Total Traffic</th>
                <th className="pb-3">Last Seen</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f293d]/50">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500 font-sans">
                    Loading process telemetry...
                  </td>
                </tr>
              ) : filteredProcesses.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500 font-sans">
                    No matching processes found.
                  </td>
                </tr>
              ) : (
                filteredProcesses.map((p, idx) => (
                  <tr key={idx} className="hover:bg-[#162032] transition-colors">
                    <td className="py-3 font-semibold text-white truncate max-w-[220px]" title={p.name}>
                      {p.name}
                    </td>
                    <td className="py-3 text-slate-400">{p.pid}</td>
                    <td className="py-3 text-cyan-300 font-medium">{p.user}</td>
                    <td className="py-3 text-emerald-400 font-bold">{p.download_formatted}</td>
                    <td className="py-3 text-cyan-400 font-bold">{p.upload_formatted}</td>
                    <td className="py-3 text-purple-300">{p.total_formatted || '0 B'}</td>
                    <td className="py-3 text-slate-500 text-[10px]">
                      {p.lastSeen ? new Date(p.lastSeen).toLocaleTimeString() : 'Active'}
                    </td>
                    <td className="py-3 text-right">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

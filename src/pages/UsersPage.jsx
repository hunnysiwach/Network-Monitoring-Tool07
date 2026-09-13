import React, { useState, useEffect } from 'react';
import { Users, Shield, ArrowDownCircle, ArrowUpCircle, HardDrive } from 'lucide-react';
import { api } from '../services/api';
import MetricCard from '../components/MetricCard';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    const interval = setInterval(loadUsers, 2000);
    return () => clearInterval(interval);
  }, []);

  const totalUserTraffic = users.reduce((acc, u) => acc + (u.total_bytes || 0), 0);
  const topUser = users[0]?.username || 'N/A';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            User-Level Network Traffic Aggregation
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated network bandwidth consumption grouped by Linux UID / system account.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-cyan-950/40 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-cyan-300">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>Authorized System Telemetry Only</span>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Monitored Users"
          value={users.length}
          subtext="Active system identities"
          icon={Users}
          color="cyan"
        />
        <MetricCard
          title="Top Consumer"
          value={topUser}
          subtext={`${users[0]?.percentage || 0}% of total socket bandwidth`}
          icon={HardDrive}
          color="emerald"
        />
        <MetricCard
          title="Cumulative Traffic"
          value={users[0]?.total_formatted ? `${users.reduce((acc, u) => acc + u.total_bytes, 0) > 1024*1024*1024 ? (users.reduce((acc, u) => acc + u.total_bytes, 0) / (1024*1024*1024)).toFixed(2) + ' GB' : (users.reduce((acc, u) => acc + u.total_bytes, 0) / (1024*1024)).toFixed(2) + ' MB'}` : '0 B'}
          subtext="Across all system accounts"
          icon={ArrowDownCircle}
          color="purple"
        />
      </div>

      {/* Users Table */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white font-mono mb-4">
          Linux User Telemetry Breakdown
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1f293d] text-slate-400 uppercase text-[10px]">
                <th className="pb-3">Username</th>
                <th className="pb-3">Active Binaries</th>
                <th className="pb-3">Download (RX)</th>
                <th className="pb-3">Upload (TX)</th>
                <th className="pb-3">Total Traffic</th>
                <th className="pb-3 w-48">Bandwidth Share (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f293d]/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 font-sans">
                    Loading user traffic telemetry...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 font-sans">
                    No active user traffic telemetry recorded yet.
                  </td>
                </tr>
              ) : (
                users.map((u, idx) => (
                  <tr key={idx} className="hover:bg-[#162032] transition-colors">
                    <td className="py-3.5 font-bold text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-cyan-400">
                        {u.username.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-cyan-300">{u.username}</span>
                    </td>
                    <td className="py-3.5 text-slate-400">{u.processCount} processes</td>
                    <td className="py-3.5 text-emerald-400 font-semibold">{u.download_formatted}</td>
                    <td className="py-3.5 text-cyan-400 font-semibold">{u.upload_formatted}</td>
                    <td className="py-3.5 text-purple-300 font-bold">{u.total_formatted}</td>
                    <td className="py-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>{u.percentage}%</span>
                        </div>
                        <div className="w-full bg-[#0a0f1d] rounded-full h-2 overflow-hidden border border-[#1f293d]">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${u.percentage}%` }}
                          ></div>
                        </div>
                      </div>
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

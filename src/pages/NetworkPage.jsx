import React, { useState, useEffect } from 'react';
import { Network, Activity, ArrowDownCircle, ArrowUpCircle, Wifi, Globe } from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import MetricCard from '../components/MetricCard';

export default function NetworkPage() {
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await api.getNetwork();
      setNetworkData(data);
    } catch (err) {
      console.error('Failed to load network data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const interfaces = networkData?.interfaces || [];
  const totals = networkData?.totals || {};

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <Network className="w-5 h-5 text-cyan-400" />
            Network Interfaces & Socket Telemetry
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time interface state, hardware addressing, and packet counters from authorized OS telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-[#0d1322] px-3 py-1.5 rounded-lg border border-[#1f293d]">
          <span className="text-slate-400">Total Interfaces:</span>
          <span className="text-cyan-400 font-bold">{interfaces.length}</span>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total RX Bandwidth"
          value={totals.download_formatted || '0 KB/s'}
          subtext={`Rate: ${totals.download_mbps || 0} Mbps`}
          icon={ArrowDownCircle}
          color="cyan"
        />
        <MetricCard
          title="Total TX Bandwidth"
          value={totals.upload_formatted || '0 KB/s'}
          subtext={`Rate: ${totals.upload_mbps || 0} Mbps`}
          icon={ArrowUpCircle}
          color="emerald"
        />
        <MetricCard
          title="Active Adapters"
          value={interfaces.filter(i => i.status === 'UP').length}
          subtext={`${interfaces.filter(i => !i.isInternal).length} external physical/virtual`}
          icon={Wifi}
          color="cyan"
        />
        <MetricCard
          title="Loopback Telemetry"
          value={interfaces.find(i => i.isInternal)?.name || 'lo'}
          subtext="Internal inter-process IPC"
          icon={Globe}
          color="purple"
        />
      </div>

      {/* Interfaces Table */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white font-mono mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          Network Interface Table
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1f293d] text-slate-400 uppercase text-[10px]">
                <th className="pb-3">Interface</th>
                <th className="pb-3">IP Address (IPv4)</th>
                <th className="pb-3">MAC Address</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">RX Total (Speed)</th>
                <th className="pb-3">TX Total (Speed)</th>
                <th className="pb-3">Packets (RX / TX)</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f293d]/50">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500 font-sans">
                    Loading network interface telemetry...
                  </td>
                </tr>
              ) : interfaces.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500 font-sans">
                    No active network interfaces detected.
                  </td>
                </tr>
              ) : (
                interfaces.map((iface, idx) => (
                  <tr key={idx} className="hover:bg-[#162032] transition-colors">
                    <td className="py-3 font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      {iface.name}
                    </td>
                    <td className="py-3 text-cyan-300 font-semibold">{iface.ip || 'Unassigned'}</td>
                    <td className="py-3 text-slate-400">{iface.mac || '00:00:00:00:00:00'}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        iface.isInternal ? 'bg-slate-800 text-slate-400' : 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {iface.isInternal ? 'Loopback' : 'Physical/WAN'}
                      </span>
                    </td>
                    <td className="py-3 text-emerald-400">
                      {iface.rxFormatted} <span className="text-slate-500 text-[10px]">({iface.rxSpeedFormatted})</span>
                    </td>
                    <td className="py-3 text-cyan-400">
                      {iface.txFormatted} <span className="text-slate-500 text-[10px]">({iface.txSpeedFormatted})</span>
                    </td>
                    <td className="py-3 text-slate-300">
                      {iface.rxPackets.toLocaleString()} / {iface.txPackets.toLocaleString()}
                    </td>
                    <td className="py-3 text-right">
                      <StatusBadge status={iface.status} />
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

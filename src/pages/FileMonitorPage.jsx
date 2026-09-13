import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  FolderPlus,
  Trash2,
  ShieldCheck,
  RefreshCw,
  Folder,
  Hash,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import MetricCard from '../components/MetricCard';

export default function FileMonitorPage() {
  const [fimData, setFimData] = useState({ directories: [], events: [] });
  const [newDir, setNewDir] = useState('');
  const [loading, setLoading] = useState(true);

  const loadFim = async () => {
    try {
      const data = await api.getFileEvents(50);
      setFimData(data);
    } catch (err) {
      console.error('Failed to load FIM data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFim();
    const interval = setInterval(loadFim, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAddDir = async (e) => {
    e.preventDefault();
    if (!newDir.trim()) return;
    try {
      await api.addDirectory(newDir.trim());
      setNewDir('');
      loadFim();
    } catch (err) {
      alert(`Error adding directory: ${err.message}`);
    }
  };

  const handleRemoveDir = async (path) => {
    try {
      await api.removeDirectory(path);
      loadFim();
    } catch (err) {
      alert(`Error removing directory: ${err.message}`);
    }
  };

  const directories = fimData?.directories || [];
  const events = fimData?.events || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-cyan-400" />
            Authorized File Integrity Monitoring (FIM)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tracks cryptographic SHA-256 checksums and detects file modification, creation, or deletion in authorized folders.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Strict Authorization Guardrail Active</span>
        </div>
      </div>

      {/* Defensive Boundary Alert */}
      <div className="bg-[#0d1322] border-l-4 border-cyan-500 rounded-r-xl p-4 text-xs font-mono text-slate-300 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-white mb-0.5">Defensive Boundary & Privacy Notice:</p>
          <p className="text-slate-400 font-sans">
            NETWATCH only inspects local directories explicitly registered by the administrator (e.g. <code className="text-cyan-300">test_monitor_dir</code>). It never performs stealth surveillance or scans arbitrary personal files.
          </p>
        </div>
      </div>

      {/* Directory Management & Add Directory */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white font-mono mb-4 flex items-center gap-2">
          <Folder className="w-4 h-4 text-cyan-400" />
          Monitored Local Directories
        </h3>

        <form onSubmit={handleAddDir} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter authorized folder path (e.g., test_monitor_dir or /opt/netwatch/secure)..."
            value={newDir}
            onChange={(e) => setNewDir(e.target.value)}
            className="flex-1 bg-[#0a0f1d] border border-[#1f293d] focus:border-cyan-500 px-4 py-2 rounded-lg text-xs font-mono text-white focus:outline-none"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs rounded-lg transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Add Directory</span>
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {directories.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono py-2">No directories currently registered.</p>
          ) : (
            directories.map((dir, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#0a0f1d] border border-[#1f293d] rounded-lg flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Folder className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-slate-200 truncate" title={dir.path}>{dir.path}</span>
                  <span className="text-slate-500 text-[10px]">({dir.fileCount} files)</span>
                </div>
                <button
                  onClick={() => handleRemoveDir(dir.path)}
                  title="Stop monitoring this directory"
                  className="p-1 hover:text-red-400 text-slate-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* File Integrity Event Log Table */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white font-mono mb-4 flex items-center gap-2">
          <Hash className="w-4 h-4 text-cyan-400" />
          Cryptographic Integrity Audit Stream (SHA-256)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1f293d] text-slate-400 uppercase text-[10px]">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Filename</th>
                <th className="pb-3">Event Type</th>
                <th className="pb-3">Current SHA-256 Hash</th>
                <th className="pb-3">Previous SHA-256 Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f293d]/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 font-sans">
                    Loading integrity audit logs...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 font-sans">
                    No file integrity events recorded yet. Create or modify files in test_monitor_dir to test.
                  </td>
                </tr>
              ) : (
                events.map((ev, idx) => (
                  <tr key={idx} className="hover:bg-[#162032] transition-colors">
                    <td className="py-3 text-slate-400 text-[11px]">
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 font-semibold text-white truncate max-w-[180px]" title={ev.path}>
                      {ev.filename}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={ev.event} />
                    </td>
                    <td className="py-3 text-cyan-300 font-mono text-[11px] truncate max-w-[220px]" title={ev.sha256}>
                      {ev.sha256 ? `${ev.sha256.substring(0, 16)}...` : 'N/A'}
                    </td>
                    <td className="py-3 text-slate-500 font-mono text-[11px] truncate max-w-[220px]" title={ev.previousHash}>
                      {ev.previousHash ? `${ev.previousHash.substring(0, 16)}...` : 'N/A (Initial)'}
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

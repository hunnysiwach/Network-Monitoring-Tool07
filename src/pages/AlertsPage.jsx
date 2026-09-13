import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Info,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [counts, setCounts] = useState({ total: 0, active: 0, high: 0, medium: 0, low: 0, info: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');

  const loadAlerts = async () => {
    try {
      const data = await api.getAlerts({
        severity: severityFilter,
        status: statusFilter,
        search
      });
      setAlerts(data.alerts || []);
      setCounts(data.counts || counts);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 2500);
    return () => clearInterval(interval);
  }, [severityFilter, statusFilter, search]);

  const handleResolve = async (id) => {
    try {
      await api.resolveAlert(id);
      loadAlerts();
    } catch (err) {
      alert(`Error resolving alert: ${err.message}`);
    }
  };

  const handleDismiss = async (id) => {
    try {
      await api.dismissAlert(id);
      loadAlerts();
    } catch (err) {
      alert(`Error dismissing alert: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            Defensive Security & Threshold Alert Console
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time threshold violation detector, network spike alerts, and integrity events.
          </p>
        </div>

        {/* Severity Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-red-950/60 border border-red-500/40 text-red-300 font-bold">
            HIGH: {counts.high}
          </span>
          <span className="px-2.5 py-1 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300">
            MED: {counts.medium}
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
            ACTIVE: {counts.active}
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search alerts by description, type, or source..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0a0f1d] border border-[#1f293d] focus:border-cyan-500 rounded-lg text-xs font-mono text-white focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-[#0a0f1d] border border-[#1f293d] text-white px-2.5 py-1.5 rounded-lg text-xs font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Severities</option>
              <option value="HIGH">High Severity</option>
              <option value="MEDIUM">Medium Severity</option>
              <option value="LOW">Low Severity</option>
              <option value="INFO">Info</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0a0f1d] border border-[#1f293d] text-white px-2.5 py-1.5 rounded-lg text-xs font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Stream List */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 shadow-lg">
        <div className="space-y-3">
          {loading ? (
            <div className="py-8 text-center text-slate-500 text-xs font-sans">
              Loading security alerts...
            </div>
          ) : alerts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-sans flex flex-col items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-emerald-500/40" />
              <span>No alerts matching current filters. All systems normal.</span>
            </div>
          ) : (
            alerts.map((alt) => (
              <div
                key={alt.id}
                className="p-4 bg-[#0d1322] border border-[#1f293d] hover:border-slate-700 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                {/* Alert Details */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <StatusBadge status={alt.severity} />
                    <span className="font-mono font-bold text-white text-xs">{alt.type}</span>
                    <span className="text-[11px] font-mono text-slate-500">{alt.id}</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      • {new Date(alt.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-slate-200 text-xs font-sans">{alt.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
                    <span>Source: <strong className="text-cyan-300">{alt.source}</strong></span>
                    <span>Observed: <strong className="text-amber-400">{alt.observedValue}</strong></span>
                    <span>Threshold: <strong className="text-slate-300">{alt.threshold}</strong></span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {alt.status === 'ACTIVE' ? (
                    <button
                      onClick={() => handleResolve(alt.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-mono font-medium transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-400">
                      Resolved
                    </span>
                  )}

                  <button
                    onClick={() => handleDismiss(alt.id)}
                    title="Dismiss / Delete Alert"
                    className="p-1.5 bg-[#111827] hover:bg-red-950/40 border border-[#1f293d] hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ShieldCheck,
  Cpu,
  Database,
  HardDrive,
  Server
} from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function DoctorPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const runDoctor = async () => {
    setLoading(true);
    try {
      const data = await api.getDoctorReport();
      setReport(data);
    } catch (err) {
      console.error('Failed to run doctor:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDoctor();
  }, []);

  const summary = report?.summary || { total: 0, passed: 0, warnings: 0, failures: 0 };
  const recommendations = report?.recommendations || [];

  const renderSection = (title, icon, items) => {
    const Icon = icon;
    return (
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2 border-b border-[#1f293d] pb-3">
          <Icon className="w-4 h-4 text-cyan-400" />
          {title}
        </h3>

        <div className="space-y-2.5">
          {(!items || items.length === 0) ? (
            <p className="text-xs text-slate-500 font-mono">No checks available.</p>
          ) : (
            items.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#0d1322] border border-[#1f293d] rounded-lg flex items-center justify-between gap-4 text-xs font-mono"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-white">{item.name}</div>
                  <div className="text-[11px] text-slate-400">{item.details}</div>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-cyan-400" />
            NETWATCH DOCTOR — Automated System Diagnostics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Objective 4: Automated environment verification, dependency validation, and integrity checks.
          </p>
        </div>

        <button
          onClick={runDoctor}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs rounded-lg transition-colors shadow-sm"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Rerun Diagnostics</span>
        </button>
      </div>

      {/* Health Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">Overall Health</p>
            <p className="text-lg font-bold font-mono text-white mt-1">
              {report?.overallHealth || 'CHECKING...'}
            </p>
          </div>
          <StatusBadge status={report?.overallHealth || 'INFO'} size="lg" />
        </div>

        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">Checks Passed</p>
            <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{summary.passed}</p>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-500/40" />
        </div>

        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">Warnings</p>
            <p className="text-2xl font-bold font-mono text-amber-400 mt-1">{summary.warnings}</p>
          </div>
          <AlertTriangle className="w-6 h-6 text-amber-500/40" />
        </div>

        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">Failures</p>
            <p className="text-2xl font-bold font-mono text-red-400 mt-1">{summary.failures}</p>
          </div>
          <XCircle className="w-6 h-6 text-red-500/40" />
        </div>
      </div>

      {/* Recommendations if any */}
      {recommendations.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-amber-300 font-mono flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            Remediation & Optimization Recommendations
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Diagnostics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderSection('1. Core Binary Dependencies', Cpu, report?.dependencies)}
        {renderSection('2. Configuration & JSON Integrity', Database, report?.integrity)}
        {renderSection('3. Storage & Permissions', HardDrive, report?.storage)}
        {renderSection('4. Service & Monitoring Status', Server, report?.service)}
      </div>
    </div>
  );
}

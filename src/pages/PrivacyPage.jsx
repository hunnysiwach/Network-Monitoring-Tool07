import React from 'react';
import { Lock, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-6 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <Lock className="w-5 h-5 text-cyan-400" />
            Defensive Scope & Privacy Boundary Policy
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Section 30: Explicit ethical cybersecurity guarantees and non-intrusive metadata boundary commitments.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-emerald-950/50 border border-emerald-500/40 px-3 py-1.5 rounded-lg text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Strict Educational Defensive Compliance</span>
        </div>
      </div>

      {/* Two Column Guardrails Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strictly Prohibited Actions */}
        <div className="bg-[#111827] border border-red-500/30 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-red-400 font-mono border-b border-red-500/20 pb-3">
            <XCircle className="w-4 h-4" />
            <span>Strictly Prohibited & NEVER Implemented</span>
          </div>

          <ul className="space-y-2 text-xs font-mono text-slate-300">
            {[
              'NO packet payload capture or packet inspection',
              'NO HTTPS traffic decryption or TLS stripping',
              'NO man-in-the-middle (MITM) attacks or interception',
              'NO password capturing or credential theft mechanisms',
              'NO keylogging or input tracking',
              'NO private message or email interception',
              'NO stealth surveillance or concealed rootkits',
              'NO covert persistence designed to hide from root',
              'NO unauthorized monitoring of other users machines'
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✗</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Authorized Defensive Telemetry */}
        <div className="bg-[#111827] border border-emerald-500/30 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-400 font-mono border-b border-emerald-500/20 pb-3">
            <CheckCircle2 className="w-4 h-4" />
            <span>Authorized Defensive Telemetry Monitored</span>
          </div>

          <ul className="space-y-2 text-xs font-mono text-slate-300">
            {[
              'Per-process bandwidth throughput (KB/s, MB/s via nethogs)',
              'Process identifier (PID) and executable binary name',
              'Aggregated bandwidth grouped by local Linux username',
              'Interface traffic statistics (RX/TX bytes and packet totals)',
              'Network connection metadata from authorized kernel counters',
              'Threshold-based spike detection for bandwidth quotas',
              'Defensive File Integrity Monitoring on explicitly added test folders',
              'Cryptographic SHA-256 hash tracking for authorized files only',
              'Transparent logging and open-source validation'
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Ethical Statement */}
      <div className="bg-[#0d1322] border border-[#1f293d] rounded-xl p-6 shadow-lg space-y-3">
        <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          Ethical Cybersecurity Principles
        </h3>
        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          NETWATCH is designed solely for defensive system observability on computers and servers that the operator owns or has received explicit, authorized consent to monitor. The architecture strictly respects user privacy by restricting all collection to operating-system-level telemetry metadata.
        </p>
      </div>
    </div>
  );
}

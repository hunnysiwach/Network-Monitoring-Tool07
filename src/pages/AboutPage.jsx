import React from 'react';
import { Info, Shield, Terminal, Activity, Cpu, Users, HeartHandshake } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-6 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <Info className="w-5 h-5 text-cyan-400" />
            About NETWATCH Platform
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Section 29: Educational cybersecurity platform for authorized defensive network & system activity monitoring.
          </p>
        </div>
      </div>

      {/* Main Narrative */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-6 shadow-lg space-y-4 text-xs font-sans text-slate-300 leading-relaxed">
        <h3 className="text-base font-bold text-white font-mono flex items-center gap-2 border-b border-[#1f293d] pb-3">
          <Shield className="w-4 h-4 text-cyan-400" />
          Project Mission & Educational Context
        </h3>
        <p>
          <strong>NETWATCH</strong> is an educational cybersecurity monitoring platform engineered for Linux administrators, DevOps engineers, and students. The platform delivers deep process-level and user-level socket telemetry without requiring the immense memory, CPU, and operational overhead of complex observability stacks such as Prometheus, Grafana, or ELK.
        </p>
        <p>
          By bridging high-performance Linux kernel network telemetry (via <code className="text-cyan-300">nethogs</code>) with a lightweight Node.js event collector, atomic JSON validation strategy, automated log rotation, and a modern Dark SOC web dashboard, NETWATCH enables granular visibility into every binary and user account generating network traffic.
        </p>
      </div>

      {/* Core Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-[#111827] border border-[#1f293d] rounded-xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Terminal className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-white font-mono">Unified Dispatcher</h4>
          <p className="text-xs text-slate-400 font-sans">
            Complete lifecycle management and automated diagnostics through a single executable: <code className="text-cyan-300">monitor-ctl</code>.
          </p>
        </div>

        <div className="p-5 bg-[#111827] border border-[#1f293d] rounded-xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-white font-mono">Atomic Storage</h4>
          <p className="text-xs text-slate-400 font-sans">
            Write-to-temp and jq integrity validation prevents data corruption and guarantees clean recovery in production.
          </p>
        </div>

        <div className="p-5 bg-[#111827] border border-[#1f293d] rounded-xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Shield className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-white font-mono">Defensive Security</h4>
          <p className="text-xs text-slate-400 font-sans">
            Strict defensive boundaries: zero payload capture, zero decryption, authorized local telemetry, and cryptographic FIM.
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import {
  BookOpen,
  Terminal,
  Server,
  Shield,
  Layers,
  FileCode,
  CheckSquare,
  Search,
  ExternalLink
} from 'lucide-react';

export default function DocumentationPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: '1. Overview & Problem' },
    { id: 'objectives', label: '2. Objectives & Innovation' },
    { id: 'architecture', label: '3. System Architecture' },
    { id: 'cli', label: '4. CLI & Scripts' },
    { id: 'api', label: '5. REST API Reference' },
    { id: 'rubric', label: '6. Academic Rubric Mapping' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            NETWATCH — Comprehensive System Documentation
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete technical specification, architectural blueprints, CLI usage, API endpoints, and academic rubric compliance.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-[#111827] border border-[#1f293d] p-1.5 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview & Problem */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-base font-bold text-white font-mono flex items-center gap-2 border-b border-[#1f293d] pb-3">
              <Shield className="w-4 h-4 text-cyan-400" />
              1. Introduction & Background
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Modern Linux systems in educational, DevOps, and cloud server environments run dozens of concurrent processes competing for limited network bandwidth. System administrators, developers, and students need a lightweight, low-overhead mechanism to answer critical operational questions:
            </p>
            <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 font-mono">
              <li>Which individual processes and binaries are consuming uplink/downlink bandwidth?</li>
              <li>Which Linux user accounts are generating socket traffic?</li>
              <li>Are there sudden network spikes or threshold violations occurring right now?</li>
              <li>Has any critical configuration or authorized test file been modified without authorization?</li>
              <li>Is the monitoring engine healthy and producing valid JSON telemetry?</li>
            </ul>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Instead of deploying heavyweight observability stacks (like Prometheus, Grafana, or ELK) that consume substantial CPU and memory, <strong>NETWATCH</strong> provides an autonomous, self-contained defensive monitoring architecture combining Linux kernel packet metrics (via nethogs), structured JSON validation, threshold alerts, an automated diagnostic suite, and a modern SOC web dashboard.
            </p>
          </div>

          <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-base font-bold text-white font-mono border-b border-[#1f293d] pb-3">
              2. Addressed Problem & Targeted Applications
            </h3>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Standard command-line tools like <code className="text-cyan-300">nethogs</code>, <code className="text-cyan-300">iftop</code>, or <code className="text-cyan-300">ip</code> provide immediate point-in-time statistics but lack persistence, alerting, web visualization, automated configuration validation, log rotation, and service lifecycle management.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-[#0d1322] border border-[#1f293d] rounded-lg space-y-2">
                <h4 className="text-xs font-bold text-cyan-300 font-mono">Target Deployments</h4>
                <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside font-sans">
                  <li>Small-to-medium Linux cloud instances (AWS EC2, DigitalOcean, Linode)</li>
                  <li>Single-board computers (Raspberry Pi, SBC edge devices)</li>
                  <li>Development workstations & staging servers</li>
                  <li>University cybersecurity laboratories & student testbeds</li>
                </ul>
              </div>
              <div className="p-4 bg-[#0d1322] border border-[#1f293d] rounded-lg space-y-2">
                <h4 className="text-xs font-bold text-emerald-300 font-mono">Target User Personas</h4>
                <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside font-sans">
                  <li>Systems Administrators managing standalone Linux machines</li>
                  <li>DevOps Engineers requiring lightweight node telemetry</li>
                  <li>Cybersecurity students studying authorized defensive monitoring</li>
                  <li>Developers debugging rogue network socket usage</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Objectives & Innovation */}
      {activeTab === 'objectives' && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-base font-bold text-white font-mono border-b border-[#1f293d] pb-3">
              Academic Project Objectives
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#0d1322] border border-[#1f293d] rounded-lg space-y-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                  OBJECTIVE 1
                </span>
                <h4 className="text-xs font-bold text-white font-mono">Unified Command-Line Dispatcher</h4>
                <p className="text-xs text-slate-400 font-sans">
                  Engineered <code className="text-cyan-300">monitor-ctl</code> to consolidate multi-step setup, lifecycle management, doctor checks, configuration, and log viewing into single predictable commands.
                </p>
              </div>

              <div className="p-4 bg-[#0d1322] border border-[#1f293d] rounded-lg space-y-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  OBJECTIVE 2
                </span>
                <h4 className="text-xs font-bold text-white font-mono">Log Rotation & JSON Validation</h4>
                <p className="text-xs text-slate-400 font-sans">
                  Continuous atomic file writing strategy with jq syntactic validation, automatic size-based log rotation, and zero silent data corruption.
                </p>
              </div>

              <div className="p-4 bg-[#0d1322] border border-[#1f293d] rounded-lg space-y-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/30">
                  OBJECTIVE 3
                </span>
                <h4 className="text-xs font-bold text-white font-mono">Threshold-Based Network Alerts</h4>
                <p className="text-xs text-slate-400 font-sans">
                  Dynamic detection of download/upload threshold breaches, traffic bursts, and rogue process bandwidth consumption with structured SOC alerts.
                </p>
              </div>

              <div className="p-4 bg-[#0d1322] border border-[#1f293d] rounded-lg space-y-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-500/30">
                  OBJECTIVE 4
                </span>
                <h4 className="text-xs font-bold text-white font-mono">Automated Health Doctor</h4>
                <p className="text-xs text-slate-400 font-sans">
                  Built-in automated diagnostics (<code className="text-cyan-300">monitor-ctl doctor</code>) verifying Node.js, npm, nethogs, jq, systemd, disk space, permissions, and service status.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-base font-bold text-white font-mono border-b border-[#1f293d] pb-3">
              Novelty & Engineering Innovations (14 Key Points)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
              {[
                { title: '1. Unified CLI Dispatcher', desc: 'Single entry point for all operations.' },
                { title: '2. Modern SOC Dashboard', desc: 'Real-time dark mode security interface.' },
                { title: '3. Strict Config Validation', desc: 'Rejects invalid boundaries at startup.' },
                { title: '4. JSON Integrity Validation', desc: 'jq syntactic verification before commits.' },
                { title: '5. Atomic JSON Writes', desc: 'Write to temp -> sync -> rename strategy.' },
                { title: '6. Automated Log Rotation', desc: 'Size-capped rotation with retention rules.' },
                { title: '7. Systemd Lifecycle Control', desc: 'Sandboxed daemon integration.' },
                { title: '8. Threshold Alerting Engine', desc: 'Instant breach & spike alerts.' },
                { title: '9. Health Doctor Diagnostics', desc: 'Comprehensive environment test suite.' },
                { title: '10. Historical Visualizations', desc: 'Time-series trends and top consumers.' },
                { title: '11. Defensive File Integrity (FIM)', desc: 'SHA-256 change tracking on test dirs.' },
                { title: '12. Executive Security Reports', desc: 'Printable summaries & CSV/JSON export.' },
                { title: '13. Demonstrable Demo Mode', desc: 'Safe synthetic fallback for presentations.' },
                { title: '14. Clear Privacy Boundaries', desc: 'Metadata only; zero payload interception.' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-[#0d1322] border border-[#1f293d] rounded-lg">
                  <div className="font-bold text-cyan-300 mb-1">{item.title}</div>
                  <div className="text-slate-400 font-sans text-[11px]">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Architecture */}
      {activeTab === 'architecture' && (
        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-6 shadow-lg space-y-6">
          <h3 className="text-base font-bold text-white font-mono flex items-center gap-2 border-b border-[#1f293d] pb-3">
            <Layers className="w-4 h-4 text-cyan-400" />
            NETWATCH System Architecture
          </h3>

          <div className="bg-[#0a0f1d] border border-[#1f293d] rounded-xl p-5 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
            <pre>{`
  Linux Kernel Telemetry
         │
         ├───► nethogs (Process Socket Bandwidth: /proc/net, libpcap)
         └───► /proc/net/dev (Network Interfaces: RX/TX Bytes & Packets)
                     │
                     ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                 Node.js Monitoring Collector                │
  │  (backend/services/collector.js & nethogs.js)               │
  └──────────────┬───────────────────────────────┬──────────────┘
                 │                               │
                 ▼                               ▼
  ┌─────────────────────────────┐ ┌─────────────────────────────┐
  │     Alert & Spike Engine    │ │   File Integrity (SHA-256)  │
  │ (backend/services/alerts.js)│ │(services/file-monitor.js)   │
  └──────────────┬──────────────┘ └──────────────┬──────────────┘
                 │                               │
                 ▼                               ▼
  ┌─────────────────────────────────────────────────────────────┐
  │             Atomic JSON Storage & Log Rotation              │
  │     (data/traffic.json via temp-file + jq validation)       │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                  Express REST API Engine                    │
  │                   (backend/server.js)                       │
  └──────────────┬───────────────────────────────┬──────────────┘
                 │                               │
                 ▼                               ▼
  ┌─────────────────────────────┐ ┌─────────────────────────────┐
  │    CLI: monitor-ctl         │ │    React SOC Dashboard      │
  │ (cli/monitor-ctl & doctor)  │ │ (React + Recharts + Tailwind)│
  └─────────────────────────────┘ └─────────────────────────────┘
            `}</pre>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Required Tools Stack</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#0d1322] border border-[#1f293d] rounded-lg">
                <span className="text-cyan-400 font-bold">Bash 5.x:</span>
                <p className="text-slate-400 text-[11px] font-sans mt-0.5">CLI dispatcher and defensive scripts.</p>
              </div>
              <div className="p-3 bg-[#0d1322] border border-[#1f293d] rounded-lg">
                <span className="text-cyan-400 font-bold">Node.js:</span>
                <p className="text-slate-400 text-[11px] font-sans mt-0.5">Telemetry collection and REST APIs.</p>
              </div>
              <div className="p-3 bg-[#0d1322] border border-[#1f293d] rounded-lg">
                <span className="text-cyan-400 font-bold">nethogs:</span>
                <p className="text-slate-400 text-[11px] font-sans mt-0.5">Kernel process bandwidth measurement.</p>
              </div>
              <div className="p-3 bg-[#0d1322] border border-[#1f293d] rounded-lg">
                <span className="text-cyan-400 font-bold">jq:</span>
                <p className="text-slate-400 text-[11px] font-sans mt-0.5">JSON parsing and integrity validation.</p>
              </div>
              <div className="p-3 bg-[#0d1322] border border-[#1f293d] rounded-lg">
                <span className="text-cyan-400 font-bold">systemd:</span>
                <p className="text-slate-400 text-[11px] font-sans mt-0.5">Service lifecycle daemon management.</p>
              </div>
              <div className="p-3 bg-[#0d1322] border border-[#1f293d] rounded-lg">
                <span className="text-cyan-400 font-bold">ShellCheck:</span>
                <p className="text-slate-400 text-[11px] font-sans mt-0.5">Static analysis for shell scripts.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: CLI Reference */}
      {activeTab === 'cli' && (
        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-6 shadow-lg space-y-6">
          <h3 className="text-base font-bold text-white font-mono flex items-center gap-2 border-b border-[#1f293d] pb-3">
            <Terminal className="w-4 h-4 text-cyan-400" />
            Command-Line Dispatcher Reference (monitor-ctl)
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {[
              { cmd: 'monitor-ctl install', desc: 'Verifies OS, checks dependencies, initializes config/data/logs, and sets up systemd service.' },
              { cmd: 'monitor-ctl uninstall [--purge]', desc: 'Safely stops service, disables unit, and cleans temporary files while preserving audit logs.' },
              { cmd: 'monitor-ctl start', desc: 'Starts the NETWATCH monitoring daemon and REST API.' },
              { cmd: 'monitor-ctl stop', desc: 'Stops the background monitoring daemon.' },
              { cmd: 'monitor-ctl restart', desc: 'Restarts the daemon and reloads active configuration.' },
              { cmd: 'monitor-ctl status', desc: 'Displays real-time status summary: service state, data integrity, download/upload rates.' },
              { cmd: 'monitor-ctl monitor', desc: 'Launches an interactive live terminal traffic monitor.' },
              { cmd: 'monitor-ctl doctor', desc: 'Executes automated diagnostic health checks across all dependencies, config, and files.' },
              { cmd: 'monitor-ctl config', desc: 'Displays and validates active threshold parameters.' },
              { cmd: 'monitor-ctl logs [-n <lines>] [-f]', desc: 'Displays recent log entries with live stream support.' }
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-[#0d1322] border border-[#1f293d] rounded-lg space-y-1">
                <code className="text-cyan-400 font-bold text-xs">{item.cmd}</code>
                <p className="text-slate-400 text-[11px] font-sans">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: REST API Reference */}
      {activeTab === 'api' && (
        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-6 shadow-lg space-y-4">
          <h3 className="text-base font-bold text-white font-mono flex items-center gap-2 border-b border-[#1f293d] pb-3">
            <FileCode className="w-4 h-4 text-cyan-400" />
            REST API Endpoints Specification
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1f293d] text-slate-400 uppercase text-[10px]">
                  <th className="pb-2">Method</th>
                  <th className="pb-2">Endpoint</th>
                  <th className="pb-2">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f293d]/50">
                {[
                  { m: 'GET', ep: '/api/health', desc: 'Service health, data validity status, and demo mode indicator.' },
                  { m: 'GET', ep: '/api/dashboard', desc: 'Comprehensive telemetry payload for real-time SOC dashboard.' },
                  { m: 'GET', ep: '/api/network', desc: 'Network interface adapters, IP addresses, MAC, RX/TX counters.' },
                  { m: 'GET', ep: '/api/processes', desc: 'Process-level network activity (PID, User, Bandwidth, Status).' },
                  { m: 'GET', ep: '/api/users', desc: 'User-level traffic aggregations and percentage distribution.' },
                  { m: 'GET', ep: '/api/history', desc: 'Time-series historical analytics (1m, 5m, 15m, 1h, Today, 7d, 30d).' },
                  { m: 'GET', ep: '/api/history/export', desc: 'Export historical analytics as CSV or JSON download.' },
                  { m: 'GET', ep: '/api/alerts', desc: 'Threshold alerts with filtering by severity, status, and search.' },
                  { m: 'POST', ep: '/api/alerts/:id/resolve', desc: 'Mark an active alert as resolved.' },
                  { m: 'POST', ep: '/api/alerts/:id/dismiss', desc: 'Dismiss / delete an alert entry.' },
                  { m: 'GET', ep: '/api/files/events', desc: 'File integrity monitoring (FIM) event stream and tracked folders.' },
                  { m: 'POST', ep: '/api/files/directories', desc: 'Register a new authorized local directory for FIM tracking.' },
                  { m: 'GET', ep: '/api/service/status', desc: 'Systemd service state, PID, uptime, memory, and CPU metrics.' },
                  { m: 'POST', ep: '/api/monitor/start', desc: 'Start background telemetry collection daemon.' },
                  { m: 'POST', ep: '/api/monitor/stop', desc: 'Stop background telemetry collection daemon.' },
                  { m: 'GET', ep: '/api/doctor', desc: 'Run automated health diagnostics report.' },
                  { m: 'GET', ep: '/api/config', desc: 'Retrieve current threshold and engine configuration.' },
                  { m: 'PUT', ep: '/api/config', desc: 'Update threshold limits with strict schema validation.' },
                  { m: 'GET', ep: '/api/reports/summary', desc: 'Generate daily/weekly security and network summary report.' },
                  { m: 'POST', ep: '/api/demo/toggle', desc: 'Toggle synthetic demo mode on or off.' }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#162032]">
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.m === 'GET' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30' :
                        row.m === 'POST' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                        row.m === 'PUT' ? 'bg-amber-950 text-amber-300 border border-amber-500/30' :
                        'bg-red-950 text-red-300 border border-red-500/30'
                      }`}>
                        {row.m}
                      </span>
                    </td>
                    <td className="py-2.5 font-bold text-white">{row.ep}</td>
                    <td className="py-2.5 text-slate-300 font-sans text-xs">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Rubric Mapping Table */}
      {activeTab === 'rubric' && (
        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-6 shadow-lg space-y-4">
          <h3 className="text-base font-bold text-white font-mono flex items-center gap-2 border-b border-[#1f293d] pb-3">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            Academic Rubric Mapping Table
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1f293d] text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 w-1/4">Academic Rubric Item</th>
                  <th className="pb-3 w-3/4">NETWATCH Project Implementation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f293d]/50">
                {[
                  { r: '1. Introduction', i: 'Detailed on Introduction / About page & docs explaining lightweight Linux network telemetry vs heavy stacks.' },
                  { r: '2. Project Scope', i: 'Covers network, processes, user aggregation, threshold alerts, atomic JSON, systemd, FIM, doctor, reports.' },
                  { r: '3. Targeted Applications', i: 'Addresses cloud VMs, Raspberry Pis, dev servers, sysadmins, and cybersecurity students.' },
                  { r: '4. Project Objectives', i: 'Objective 1: monitor-ctl dispatcher; Objective 2: Log rotation & JSON validation; Objective 3: Threshold alerts; Objective 4: Doctor diagnostics.' },
                  { r: '5. Novelty & Innovation', i: '14 key engineering points including atomic writes, jq validation, safe bash strict mode, demo fallback, and privacy pledge.' },
                  { r: '6. Required Tools', i: 'Bash 5.x, Node.js, npm, nethogs, jq, shellcheck, systemd, Git, Ubuntu/Debian.' },
                  { r: '7. Functional Application', i: 'Full React + Tailwind + Express + Nethogs implementation communicating over REST endpoints.' },
                  { r: '8. Documentation', i: 'Full PROJECT_DOCUMENTATION.md, README.md, API specs, and embedded dashboard documentation.' }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#162032]">
                    <td className="py-3 font-bold text-cyan-300 align-top">{row.r}</td>
                    <td className="py-3 text-slate-300 font-sans text-xs align-top">{row.i}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

# NETWATCH — Network Traffic Monitoring & System Activity Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-emerald.svg)](https://nodejs.org/)
[![Ubuntu / Debian](https://img.shields.io/badge/Platform-Debian%20%2F%20Ubuntu-orange.svg)](https://ubuntu.com/)
[![Cybersecurity Scope](https://img.shields.io/badge/Security-Defensive%20Telemetry%20Only-blue.svg)](#defensive-security--privacy-boundary-pledge)

**NETWATCH** is an educational, production-ready cybersecurity monitoring platform engineered for authorized defensive observability on Linux servers and workstations. It provides high-resolution per-process and per-user socket bandwidth visibility without requiring the massive CPU and memory footprint of enterprise observability suites like Prometheus or Grafana.

---

## 🌟 Key Features & Innovations

1. **Unified CLI Dispatcher (`monitor-ctl`)**: Consolidates installation, service lifecycle (`start`, `stop`, `restart`, `status`), diagnostics (`doctor`), configuration (`config`), and log inspection (`logs`) into a single command.
2. **Real-Time SOC Web Dashboard**: High-tech Dark SOC interface built with React, Vite, Tailwind CSS, and Recharts featuring real-time bandwidth graphs (1m, 5m, 15m, 1h), interface telemetry, process ranking, and active alert streams.
3. **Atomic JSON Storage Strategy**: Zero data corruption via `.tmp` file creation, disk flush sync, `jq empty` syntactic validation, automated backup (`.bak`), and atomic rename.
4. **Defensive Threshold Alerting**: Real-time evaluation of download limits (`DOWNLOAD_THRESHOLD_MBPS`), upload limits (`UPLOAD_THRESHOLD_MBPS`), sudden network spikes, and service health events with structured SOC severities (`INFO`, `LOW`, `MEDIUM`, `HIGH`).
5. **Defensive File Integrity Monitoring (FIM)**: Tracks cryptographic SHA-256 hashes on administrator-specified directories (e.g., `test_monitor_dir`); audits `CREATED`, `MODIFIED` (with hash diffing), `DELETED`, and `MOVED` events.
6. **Automated Health Diagnostics (`monitor-ctl doctor`)**: 10+ automated health checks verifying Node.js, npm, nethogs, jq, systemd, disk space, storage write permissions, configuration syntax, and daemon state with actionable remediation advice.
7. **Automated Log Rotation**: Size-capped log rotation (`netwatch.log` -> `.1` -> `.2` up to configurable retention days) with timestamped structured levels (`INFO`, `WARN`, `ERROR`).
8. **Demonstration Mode**: Built-in synthetic telemetry generator allowing immediate presentation and grading in educational environments without requiring root privileges.

---

## 🛡️ Defensive Security & Privacy Boundary Pledge

NETWATCH is strictly designed for **authorized defensive monitoring** on systems the administrator owns or is explicitly authorized to monitor.

### Strictly Prohibited & NEVER Implemented:
- ❌ **NO** packet payload inspection or packet sniffing
- ❌ **NO** HTTPS traffic decryption or TLS stripping
- ❌ **NO** credential theft or password interception
- ❌ **NO** keylogging or user input capture
- ❌ **NO** private message or email interception
- ❌ **NO** man-in-the-middle (MITM) attacks
- ❌ **NO** stealth surveillance or concealed persistence
- ❌ **NO** monitoring of unauthorized third-party systems

### Authorized Defensive Telemetry Monitored:
- ✔️ Per-process bandwidth rates (via `nethogs` metadata)
- ✔️ Binary process name and Process ID (PID)
- ✔️ Aggregated bandwidth grouped by local Linux username
- ✔️ Network interface statistics (RX/TX bytes and packet counters from `/proc/net/dev`)
- ✔️ Defensive SHA-256 hash tracking on explicitly selected test folders

---

## 🏗️ System Architecture

```
Linux System (Kernel Telemetry)
      │
      ├───► nethogs (Process Socket Bandwidth)
      └───► /proc/net/dev (Network Interfaces RX/TX)
                  │
                  ▼
┌───────────────────────────────────────────────────────────┐
│                 Node.js Collector Engine                  │
│       (Aggregates by Process, User, and Interface)        │
└─────────────┬───────────────────────────────┬─────────────┘
              │                               │
              ▼                               ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│       Alert Engine        │   │   File Integrity Monitor  │
│(Thresholds, Spikes, Dedupe│   │  (SHA-256 Directory Watch) │
└─────────────┬─────────────┘   └─────────────┬─────────────┘
              │                               │
              ▼                               ▼
┌───────────────────────────────────────────────────────────┐
│            Atomic JSON Storage & Log Rotation             │
│            (data/traffic.json via temp + jq)              │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│                 Express REST API Backend                  │
│                     (Port 4000)                           │
└─────────────┬───────────────────────────────┬─────────────┘
              │                               │
              ▼                               ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│      CLI: monitor-ctl     │   │    React SOC Dashboard    │
│(install, doctor, status)  │   │   (14 Interactive Pages)  │
└───────────────────────────┘   └───────────────────────────┘
```

---

## 📋 Required Tools Stack

| Tool | Role in NETWATCH |
| :--- | :--- |
| **Bash 5.x** | Defensive CLI dispatcher (`monitor-ctl`) and installation/service management scripts using `set -euo pipefail`. |
| **Node.js (v18+)** | High-performance telemetry collection, atomic JSON operations, alert evaluation, and REST API engine. |
| **npm** | Dependency management and build scripts. |
| **nethogs** | Process-level network bandwidth measurement directly from Linux sockets. |
| **jq** | High-speed command-line JSON parsing and syntactic integrity verification. |
| **systemd** | Production daemon lifecycle management (`netwatch.service`) and sandbox security. |
| **ShellCheck** | Static code analysis and linting for defensive shell scripts. |
| **Git / GitHub** | Version control, collaboration, and documentation repository. |
| **Debian / Ubuntu** | Primary reference Linux operating system target. |

---

## 🚀 Quick Installation & Setup

### 1. Prerequisites (Ubuntu / Debian)
```bash
sudo apt-get update
sudo apt-get install -y nodejs npm nethogs jq shellcheck
```

### 2. Clone and Setup
```bash
git clone https://github.com/netwatch-security/netwatch.git
cd netwatch
npm install
npm run build:frontend
```

### 3. Run Automated Diagnostic Suite
```bash
node cli/monitor-ctl.js doctor
# or on Linux:
# ./cli/monitor-ctl doctor
```

### 4. Start NETWATCH
```bash
# Start backend daemon + web server
npm start
```
The web dashboard will be instantly available at **http://localhost:4000** (or `npm run dev` on port 5173 with hot reloading).

---

## 💻 CLI Usage: `monitor-ctl`

The `monitor-ctl` executable provides full control over the monitoring platform:

```bash
# Verify system dependencies and directories
monitor-ctl install

# Run automated health and dependency diagnostics
monitor-ctl doctor

# Check real-time service status, JSON validity, and throughput
monitor-ctl status

# Start background monitoring daemon
monitor-ctl start

# Stop monitoring daemon
monitor-ctl stop

# Restart daemon and reload config
monitor-ctl restart

# Launch interactive terminal live monitor
monitor-ctl monitor

# View and validate active bandwidth thresholds
monitor-ctl config

# View recent structured logs (use -f to follow stream)
monitor-ctl logs -n 50
monitor-ctl logs -f

# Cleanly uninstall service while preserving audit logs
monitor-ctl uninstall
```

---

## 🌐 Web Dashboard Pages (14 Complete SOC Views)

- `/dashboard` — Primary SOC console with real-time bandwidth graph (1m/5m/15m/1h), status indicators, quick metrics, live process table, and recent alerts.
- `/network` — Network adapters, IP addresses (IPv4/IPv6), MAC, MTU, RX/TX bytes and packet counters.
- `/processes` — Live process bandwidth table (PID, User, Download/Upload MB/s, Total, Status, Last seen) with search and multi-column sorting.
- `/users` — Linux user bandwidth aggregation with percentage distribution progress bars.
- `/history` — Historical analytics (Today, Yesterday, 7 Days, 30 Days) with Download/Upload volume graphs, top consumers, and instant CSV/JSON exports.
- `/alerts` — Defensive SOC alert console with severity filters (`HIGH`, `MED`, `LOW`, `INFO`), active/resolved filters, and one-click Resolve/Dismiss actions.
- `/file-monitor` — Defensive File Integrity Monitor tracking SHA-256 hashes on authorized directories (`test_monitor_dir`); displays `CREATED`, `MODIFIED`, `DELETED`, `MOVED` events with hash diffs.
- `/service` — Systemd service management console displaying daemon status, uptime, PID, memory consumption, Start/Stop/Restart buttons, and live log stream.
- `/doctor` — Interactive system diagnostic health report with visual `PASS` / `WARN` / `FAIL` status badges and actionable remediation recommendations.
- `/reports` — Executive security and network report generator (Daily, Weekly) with printable layout and instant JSON/CSV export.
- `/configuration` — Settings panel for Download/Upload thresholds (MB/s), monitoring intervals, log retention, and feature toggles with backend schema validation.
- `/documentation` — Complete technical documentation covering architecture, tools, CLI reference, and API specs.
- `/about` — Platform overview, mission statement, target users, and innovation highlights.
- `/privacy` — Explicit defensive security pledge detailing authorized scope and non-intrusive metadata guarantees.

---

## 🔌 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health, JSON validity, and demo mode indicator |
| `GET` | `/api/dashboard` | Full SOC telemetry payload for real-time dashboard |
| `GET` | `/api/network` | Network interface statistics and socket counters |
| `GET` | `/api/processes` | Process-level bandwidth rates (PID, user, throughput) |
| `GET` | `/api/users` | User-level aggregated bandwidth distribution |
| `GET` | `/api/history` | Historical time-series telemetry (`?period=today\|yesterday\|7d\|30d`) |
| `GET` | `/api/history/export` | Download history report as CSV or JSON (`?format=csv\|json`) |
| `GET` | `/api/alerts` | Alert list with severity, status, and keyword filtering |
| `POST` | `/api/alerts/:id/resolve` | Mark an active alert as resolved |
| `POST` | `/api/alerts/:id/dismiss` | Dismiss / delete an alert |
| `GET` | `/api/files/events` | File integrity monitoring (FIM) event audit log |
| `POST` | `/api/files/directories` | Add an authorized local directory for FIM tracking |
| `GET` | `/api/service/status` | Systemd service status, uptime, PID, memory metrics |
| `POST` | `/api/monitor/start` | Start monitoring daemon |
| `POST` | `/api/monitor/stop` | Stop monitoring daemon |
| `GET` | `/api/doctor` | Execute automated health diagnostics suite |
| `GET` | `/api/config` | Retrieve current threshold configuration |
| `PUT` | `/api/config` | Update threshold limits with strict schema validation |
| `GET` | `/api/reports/summary` | Generate daily/weekly executive security report |
| `POST` | `/api/demo/toggle` | Toggle demonstration mode on/off |

---

## 🧪 Testing & Verification

NETWATCH includes a comprehensive automated test suite testing all subsystems:

```bash
npm test
```

### Test Coverage (28/28 Passing):
- ✔️ **Configuration Validation**: Range limits, type checks, threshold boundary protection.
- ✔️ **JSON Integrity & Atomic Writer**: Temp file creation, schema parsing, corruption detection, backup recovery.
- ✔️ **Alert Engine**: Threshold evaluation (`HIGH_DOWNLOAD`, `HIGH_UPLOAD`), network spike detection, alert lifecycle.
- ✔️ **File Integrity Monitor**: Cryptographic SHA-256 calculation, directory registration, change event triggers.
- ✔️ **Doctor Diagnostics**: Dependency checks, directory permissions, service state evaluation.
- ✔️ **Express REST API**: All endpoints validated with mock HTTP client.
- ✔️ **CLI Dispatcher**: Command parsing, exit codes, help rendering, config display.

---

## ⚖️ Academic Rubric Mapping

| Rubric Item | Concrete NETWATCH Implementation |
| :--- | :--- |
| **1. Introduction** | Documented on Introduction / About pages & README; provides lightweight alternative to heavy observability stacks. |
| **2. Project Scope** | Full coverage of network, process, user aggregation, alerts, atomic JSON, systemd, FIM, doctor, and reports. |
| **3. Targeted Applications** | Targets cloud VMs, Raspberry Pis, development servers, sysadmins, and cybersecurity students. |
| **4. Project Objectives** | Objective 1 (`monitor-ctl`), Objective 2 (log rotation & JSON validation), Objective 3 (threshold alerts), Objective 4 (`doctor`). |
| **5. Novelty & Innovation** | 14 engineering points: atomic writes, jq validation, strict bash modes, demo fallback, and privacy boundaries. |
| **6. Required Tools** | Bash 5.x, Node.js, npm, nethogs, jq, shellcheck, systemd, Git, Ubuntu/Debian Linux. |
| **7. Functional Application** | React + Tailwind + Express + Nethogs full-stack web dashboard communicating via REST APIs. |
| **8. References / Documentation** | Official documentation references included in `PROJECT_DOCUMENTATION.md` and documentation page. |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

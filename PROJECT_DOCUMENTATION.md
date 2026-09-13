# ACADEMIC PROJECT DOCUMENTATION

## PROJECT TITLE:
# NETWATCH — Network Traffic Monitoring & System Activity Dashboard

**Course / Subject:** Defensive Cybersecurity & System Administration  
**Platform Target:** Debian / Ubuntu Linux (Cross-platform demonstrable)  
**System CLI:** `monitor-ctl`  
**Web Dashboard:** React + Vite + Tailwind CSS + Recharts + Express  

---

## 1. INTRODUCTION

Modern Linux environments—ranging from cloud virtual machines (AWS, Azure, GCP) to local development workstations and edge computing single-board computers (Raspberry Pi)—run dozens of concurrent daemon and user processes that compete for finite network bandwidth.

In enterprise data centers, monitoring is typically handled by large observability stacks like Prometheus, Grafana, OpenTelemetry, or Elasticsearch. However, on small-to-medium Linux servers, single-board devices, or in educational lab environments, deploying these heavy observability stacks introduces prohibitive resource consumption:
- High continuous CPU utilization for metrics scraping
- Multi-gigabyte memory consumption for time-series databases
- Multi-step manual configuration, alerting setup, and daemon management

**NETWATCH** is an autonomous, lightweight defensive monitoring solution that solves this problem. It couples low-overhead Linux kernel packet telemetry (via `nethogs`) with a resilient Node.js background collector, atomic JSON validation strategy, automated log rotation, and a modern Dark SOC web dashboard.

The system empowers administrators, DevOps engineers, and students to:
- Instantly pinpoint which processes and PIDs are consuming uplink or downlink bandwidth.
- Track bandwidth consumption aggregated by Linux user accounts (`ubuntu`, `www-data`, `system`).
- Receive real-time threshold alerts when bandwidth limits are exceeded.
- Detect sudden traffic bursts and potential exfiltration spikes.
- Monitor cryptographic file integrity (SHA-256) on authorized directories.
- Run automated diagnostics (`monitor-ctl doctor`) to maintain 100% operational health.

---

## 2. PROJECT SCOPE

The NETWATCH platform provides end-to-end defensive coverage:

1. **Network Interface Monitoring**: Gathers real-time telemetry on all physical, virtual, and loopback adapters (`eth0`, `wlan0`, `lo`), displaying hardware addresses (MAC), MTU, IP addresses (IPv4/IPv6), and packet counters.
2. **Process-Level Traffic Telemetry**: Measures instantaneous and cumulative download/upload rates per binary process using socket metadata from `nethogs`.
3. **User-Level Traffic Aggregation**: Aggregates socket bandwidth across system users and computes real-time percentage distributions.
4. **Historical Analytics**: Retains time-series history across 1m, 5m, 15m, 1h, Today, Yesterday, 7 Days, and 30 Days, with instant CSV and JSON export capabilities.
5. **Threshold-Based Alerting**: Detects breaches of configured download and upload limits (`DOWNLOAD_THRESHOLD_MBPS`, `UPLOAD_THRESHOLD_MBPS`), process anomalies, and network spikes.
6. **Atomic JSON Persistence**: Employs write-to-temp, sync, and rename semantics to eliminate partial writes or race conditions.
7. **JSON Integrity Validation**: Automatically validates data files using `jq` syntax checks and schema enforcement with automated fallback recovery from backups.
8. **Service Lifecycle Management**: Integrates natively with `systemd` (`netwatch.service`) for production deployments, with process daemon fallback.
9. **Automated Doctor Diagnostics**: Comprehensive health checks covering binary dependencies, configuration validity, directory permissions, disk space, and daemon status.
10. **Defensive File Integrity Monitoring (FIM)**: Calculates and tracks SHA-256 checksums across explicitly authorized local test directories, recording `CREATED`, `MODIFIED` (with hash diffs), `DELETED`, and `MOVED` events.
11. **Executive Reporting**: Generates daily and weekly security reports with summary metrics, printable layouts, and JSON export.
12. **Interactive SOC Web Dashboard**: Provides a dark-themed, 14-page responsive web console built with React and Tailwind CSS.

---

## 3. ADDRESSED PROBLEM & TARGETED APPLICATIONS

### The Problem
Standard Linux utilities (`nethogs`, `iftop`, `iptraf`, `ip`, `netstat`) provide instantaneous command-line outputs but suffer from several key limitations:
- They require manual command invocation and lack long-term persistent storage.
- They lack automated threshold alerting and spike detection.
- They provide no graphical web dashboard for remote visualization.
- They offer no automated diagnostics or log rotation out-of-the-box.
- They require manual configuration across multiple disjointed shell scripts.

### Targeted Applications & Environments
- **Cloud Virtual Machines (AWS EC2, DigitalOcean Droplets, Linode)**: Lightweight node monitoring without burdening small instance sizes (e.g. 1 vCPU / 1GB RAM).
- **Single-Board Linux Computers (Raspberry Pi, Orange Pi)**: Minimal memory and CPU overhead ideal for IoT gateways.
- **Development & Staging Servers**: Immediate visibility into rogue API calls, database socket leaks, or runaway build processes.
- **DevOps Environments**: Fast diagnostic checks during deployment rollouts.
- **Cybersecurity & Linux Administration Students**: Educational tool for learning authorized defensive telemetry, shell scripting standards, and service lifecycle management.

---

## 4. PROJECT OBJECTIVES

### Objective 1: Unified Command-Line Dispatcher (`monitor-ctl`)
Consolidate complex, multi-step system administration tasks into a single executable command dispatcher supporting:
- `monitor-ctl install`: Pre-flight environment check, directory setup, configuration seeding, and systemd unit installation.
- `monitor-ctl uninstall`: Safe service decommissioning and cleanup while preserving audit logs.
- `monitor-ctl start | stop | restart`: Full daemon lifecycle management.
- `monitor-ctl status`: Real-time summary of service state, data integrity, download/upload rates, and active alerts.
- `monitor-ctl monitor`: Interactive live terminal dashboard.
- `monitor-ctl doctor`: Automated health verification suite.
- `monitor-ctl config`: Configuration display and validation.
- `monitor-ctl logs`: Structured log inspection with streaming.

### Objective 2: Automated Log Rotation & JSON Integrity Validation
- Implement continuous atomic JSON data generation using `.tmp` writes, flush syncs, and `fs.renameSync`.
- Validate data files using `jq empty` and structural schema checks.
- Automatically recover corrupted files from `.bak` snapshots without silent failures.
- Implement size-capped log rotation (`LOG_MAX_SIZE_MB`, `LOG_RETENTION_DAYS`) with structured log levels (`INFO`, `WARN`, `ERROR`).

### Objective 3: Threshold-Based Network Alerting
- Implement dynamic alert triggering based on configurable limits:
  - `DOWNLOAD_THRESHOLD_MBPS` (e.g. 50 MB/s)
  - `UPLOAD_THRESHOLD_MBPS` (e.g. 20 MB/s)
  - `ALERT_SPIKE_PERCENTAGE` (e.g. +150% traffic bursts)
- Assign SOC-standard severity ratings (`INFO`, `LOW`, `MEDIUM`, `HIGH`).
- Provide deduplication throttling, stateful tracking, and resolution workflows.

### Objective 4: Automated System Doctor (`monitor-ctl doctor`)
- Perform 10+ automated health checks:
  1. Node.js binary availability and version
  2. npm package manager availability
  3. nethogs process monitor availability
  4. jq JSON processor availability
  5. ShellCheck static analyzer availability
  6. systemd init system availability
  7. Configuration file existence and parameter validation
  8. JSON data file integrity and schema conformity
  9. Data directory write permissions
  10. Logs directory write permissions
  11. Disk space availability (>100MB free)
  12. NETWATCH monitoring daemon runtime state
- Provide formatted diagnostic reports with `PASS`, `WARN`, and `FAIL` indicators and actionable remediation steps.

---

## 5. NOVELTY & INNOVATION IN EXISTING WORK

Rather than attempting to invent a proprietary low-level network protocol, the novelty of NETWATCH lies in **engineering a resilient, production-grade, and self-contained management and visualization layer** around existing lightweight Linux telemetry engines:

1. **Unified CLI Architecture**: A single dispatcher replacing fragmented bash scripts.
2. **Modern SOC Dark Web Dashboard**: High-tech responsive React interface with real-time Recharts visualization.
3. **Strict Configuration Validation**: Type, range, and boundary checking preventing invalid runtime startups.
4. **JSON Integrity Validation**: Automatic `jq empty` syntactic checks preventing corrupt data ingestion.
5. **Atomic File Write Strategy**: `.tmp` creation, sync, and atomic rename preventing partial writes and race conditions.
6. **Automated Log Rotation**: Size-capped rotation with configurable day retention.
7. **Production Systemd Sandboxing**: Integrated unit file with `ProtectSystem=full` and `PrivateTmp=true`.
8. **Threshold & Spike Alerting**: Real-time evaluation of bandwidth bursts with SOC severity classification.
9. **Automated Health Diagnostics (`doctor`)**: Comprehensive automated pre-flight and runtime health checks.
10. **Historical Trend Analytics**: Multi-period historical aggregations with CSV/JSON exports.
11. **Defensive File Integrity Monitoring**: SHA-256 change tracking on administrator-authorized directories.
12. **Local Executive Reports**: One-click printable daily/weekly security summaries.
13. **Educational Demo Mode**: Synthetic fallback engine ensuring reliable demonstration without requiring root.
14. **Defensive Scripting Standards**: Strict Bash 5.x scripts with `set -euo pipefail`, trap handlers, and ShellCheck compliance.

---

## 6. REQUIRED TOOLS & SYSTEM STACK

| Tool / Technology | Role in Architecture |
| :--- | :--- |
| **Bash 5.x** | Implementation of the `monitor-ctl` dispatcher and installation scripts with strict error handling (`set -euo pipefail`). |
| **Node.js (v18+)** | Core event loop, telemetry collection, atomic JSON management, and REST API engine. |
| **npm** | Package management and lifecycle build script execution. |
| **nethogs** | Process-level socket bandwidth measurement directly from Linux network devices. |
| **jq** | Fast command-line JSON parsing and integrity validation (`jq empty`). |
| **systemd** | Service lifecycle management (`netwatch.service`) and security sandboxing. |
| **ShellCheck** | Static analysis and linting for bash scripts. |
| **React 18 + Vite** | High-performance frontend UI rendering. |
| **Tailwind CSS** | Dark-mode SOC security interface styling. |
| **Recharts** | Interactive real-time time-series bandwidth graphs. |
| **Lucide Icons** | Visual SOC iconography. |
| **Ubuntu / Debian Linux** | Primary deployment and testing operating system. |

---

## 7. SYSTEM ARCHITECTURE & MODULE BREAKDOWN

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           REACT SOC WEB DASHBOARD                         │
│   (14 Views: Dashboard, Network, Processes, Users, Alerts, FIM, etc.)     │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ REST API (JSON / HTTP)
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                            EXPRESS REST API                               │
│                         (backend/routes/api.js)                           │
└───────┬─────────────────────────────┬─────────────────────────────┬───────┘
        │                             │                             │
        ▼                             ▼                             ▼
┌──────────────────┐        ┌──────────────────┐        ┌───────────────────┐
│ MONITOR COLLECTOR│        │   ALERT ENGINE   │        │   FILE INTEGRITY  │
│(collector.js &   │───────►│ (Thresholds &    │        │   MONITOR (SHA256)│
│ nethogs.js)      │        │  Spikes)         │        │ (file-monitor.js) │
└───────┬──────────┘        └─────────┬────────┘        └─────────┬─────────┘
        │                             │                           │
        ▼                             ▼                           ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    ATOMIC JSON STORAGE & LOG ROTATION                     │
│              (temp-file -> write -> validate with jq -> rename)           │
│                         (data/traffic.json)                               │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
┌─────────────────────────────────────┴─────────────────────────────────────┐
│                       CLI DISPATCHER: monitor-ctl                         │
│          systemd Service: /etc/systemd/system/netwatch.service            │
└───────────────────────────────────────────────────────────────────────────┘
```

### Module Descriptions:
- **`backend/server.js`**: Express server bootstrap, middleware, and graceful shutdown signal handlers (`SIGINT`, `SIGTERM`, `SIGHUP`).
- **`backend/config.js`**: Strict configuration loader and validator with boundary enforcement.
- **`backend/services/collector.js`**: Primary collection loop aggregating process bandwidth, user groupings, and totals.
- **`backend/services/nethogs.js`**: Spawns and parses `nethogs -t -d 1` line streaming with realistic synthetic demo fallback.
- **`backend/services/alerts.js`**: Threshold detector, spike calculator, deduplication engine, and alert state tracker.
- **`backend/services/json-validator.js`**: Atomic file writer with `jq empty` verification and backup recovery.
- **`backend/services/log-manager.js`**: Structured logging with size-capped rotation and retention cleanup.
- **`backend/services/file-monitor.js`**: Defensive FIM calculating SHA-256 checksums on authorized directories.
- **`backend/services/history-store.js`**: In-memory ring buffer and historical time-series analytics engine.
- **`backend/services/doctor-service.js`**: Reusable automated diagnostic checks for CLI and API.
- **`cli/monitor-ctl` & `cli/monitor-ctl.js`**: Unified CLI dispatcher executables.
- **`scripts/*.sh`**: Defensive bash scripts with `set -euo pipefail` and trap cleanup.

---

## 8. SECURITY & PRIVACY CONSIDERATIONS

### Strict Defensive Security Guardrails:
NETWATCH operates strictly on **network metadata and authorized local system telemetry**. It is engineered with clear ethical guardrails:

1. **Zero Payload Inspection**: NETWATCH does not inspect, parse, or capture network packet payloads.
2. **Zero Cryptographic Interception**: No HTTPS decryption, SSL stripping, or certificate spoofing is performed.
3. **Zero Credential Capture**: No password theft, keylogging, or session token interception.
4. **No Stealth Persistence**: Operates as a standard, transparent, visible systemd daemon (`netwatch.service`).
5. **Explicit FIM Authorization**: File integrity monitoring strictly requires explicit administrator directory registration.

---

## 9. TESTING & VERIFICATION SUMMARY

NETWATCH includes a comprehensive automated test suite executed via `node --test tests/*.test.js`:

```
▶ Alert Engine Tests
  ✔ Creates alert with proper severity and metadata
  ✔ Resolves active alert correctly
  ✔ Filters alerts by severity and status
  ✔ Dismisses alert and removes it from list
✔ Alert Engine Tests (16ms)

▶ Express REST API Tests
  ✔ GET /api/health returns valid health and status payload
  ✔ GET /api/dashboard returns complete SOC telemetry
  ✔ GET /api/network returns interface list
  ✔ GET /api/processes returns process list
  ✔ GET /api/users returns aggregated user traffic
  ✔ GET /api/alerts returns alerts and counts
  ✔ GET /api/config returns active configuration
✔ Express REST API Tests (153ms)

▶ CLI Dispatcher Tests
  ✔ CLI help command returns 0 and displays usage
  ✔ CLI config command displays and validates configuration
  ✔ CLI doctor command executes diagnostic checks
✔ CLI Dispatcher Tests (940ms)

▶ Configuration Validation Tests
  ✔ Valid default configuration passes validation
  ✔ Rejects negative or zero download threshold
  ✔ Rejects non-numeric upload threshold
  ✔ Rejects invalid port number out of range
  ✔ Rejects invalid monitoring interval (< 1s or > 300s)
✔ Configuration Validation Tests (5ms)

▶ Automated Doctor Diagnostics Tests
  ✔ Doctor suite executes and returns comprehensive diagnostic report
  ✔ Doctor verifies Node.js runtime availability
  ✔ Doctor validates directory write permissions
✔ Automated Doctor Diagnostics Tests (1646ms)

▶ File Integrity Monitor (FIM) Tests
  ✔ Computes valid SHA-256 hash for local files
  ✔ Tracks monitored directories and reports status
  ✔ Records CREATED and MODIFIED events when file content changes
✔ File Integrity Monitor (FIM) Tests (19ms)

▶ JSON Integrity & Atomic Writer Tests
  ✔ Atomic write creates valid JSON on disk
  ✔ Rejects and alerts on corrupted JSON content
  ✔ Safe recovery restores corrupted files cleanly
✔ JSON Integrity & Atomic Writer Tests (26ms)

Test Summary: 28 Passed, 0 Failed across 7 Test Suites (100% Pass Rate).
```

---

## 10. LIMITATIONS & FUTURE SCOPE

### Current Limitations:
- Network telemetry is gathered per-node (standalone deployment model).
- Kernel-level packet capture with `nethogs` requires root/`CAP_NET_RAW` privileges (gracefully handled via demo fallback).

### Future Scope:
- **Distributed Agent Mesh**: Multi-node agent communication reporting to a centralized master SOC.
- **Database Scalability**: Optional PostgreSQL / TimescaleDB storage for multi-year telemetry retention.
- **Webhook & SIEM Integration**: Direct alert forwarding to Discord, Slack, PagerDuty, or Splunk.
- **Container Telemetry**: Native Docker and Kubernetes pod bandwidth attribution.

---

## 11. REFERENCES

1. **Node.js Documentation**: https://nodejs.org/docs/latest-v20.x/api/
2. **Express.js API Reference**: https://expressjs.com/en/4x/api.html
3. **Nethogs Documentation & Source**: https://github.com/raboof/nethogs
4. **GNU Bash Reference Manual**: https://www.gnu.org/software/bash/manual/
5. **jq Manual (Development Version)**: https://jqlang.github.io/jq/manual/
6. **systemd.service Documentation**: https://www.freedesktop.org/software/systemd/man/systemd.service.html
7. **ShellCheck Static Analysis Tool**: https://www.shellcheck.net/
8. **React Documentation**: https://react.dev/
9. **Tailwind CSS Documentation**: https://tailwindcss.com/docs
10. **Recharts Documentation**: https://recharts.org/en-US/api

---

## 12. ACADEMIC RUBRIC MAPPING TABLE

| Academic Rubric Item | Concrete NETWATCH Implementation |
| :--- | :--- |
| **1. Introduction** | Documented on Introduction, About page, and README. Explains why heavy observability stacks (Prometheus/Grafana) are unsuitable for lightweight Linux nodes and how NETWATCH delivers a self-contained solution. |
| **2. Project Scope** | Fully covers network interfaces, process-level traffic, user aggregation, historical trends, threshold alerts, atomic JSON writes, JSON integrity validation, systemd lifecycle, health diagnostics, FIM, web dashboard, and reports. |
| **3. Targeted Applications** | Dedicated "Problem & Target Users" documentation and page covering cloud VMs, Raspberry Pis, dev servers, DevOps workflows, and cybersecurity students. |
| **4. Project Objectives** | Objective 1 (`monitor-ctl` unified CLI), Objective 2 (log rotation & JSON validation), Objective 3 (threshold-based alerts), Objective 4 (`monitor-ctl doctor` automated health checks). |
| **5. Novelty & Innovation** | 14 engineering points detailed: atomic writes, jq integrity verification, strict bash mode (`set -euo pipefail`), trap handlers, demo mode fallback, and privacy boundary pledge. |
| **6. Required Tools** | Bash 5.x, Node.js, npm, nethogs, jq, shellcheck, systemd, Git, GitHub, Ubuntu/Debian Linux documented with specific roles. |
| **7. Functional Application** | Full-stack operational application: React + Tailwind + Express + Nethogs communicating via REST APIs with 14 interactive pages. |
| **8. Documentation / References** | Complete academic document, comprehensive README.md, API specs, CLI guide, and official documentation references. |

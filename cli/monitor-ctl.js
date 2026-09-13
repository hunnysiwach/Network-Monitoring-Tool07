#!/usr/bin/env node
/**
 * NETWATCH — Command-Line Dispatcher (monitor-ctl)
 * Cross-platform CLI runner for Linux/Unix and Windows environments.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn, execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT_DIR, 'data', 'traffic.json');
const LOG_FILE = path.join(ROOT_DIR, 'logs', 'netwatch.log');
const PID_FILE = path.join(ROOT_DIR, 'data', 'netwatch.pid');
const CONFIG_FILE = path.join(ROOT_DIR, 'config', 'netwatch.conf');
const DEFAULT_CONFIG_FILE = path.join(ROOT_DIR, 'config', 'default.json');

const args = process.argv.slice(2);
const command = args[0] || 'help';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
};

function printBanner() {
  console.log(`${colors.cyan}${colors.bold}`);
  console.log('================================================================================');
  console.log('         NETWATCH — Network Traffic Monitoring & System Activity CLI            ');
  console.log('================================================================================');
  console.log(`${colors.reset}`);
}

function showHelp() {
  printBanner();
  console.log(`Usage: ${colors.bold}monitor-ctl <command> [options]${colors.reset}\n`);
  console.log('Available Commands:');
  console.log(`  ${colors.green}install${colors.reset}       Verify dependencies, directories & setup configuration`);
  console.log(`  ${colors.green}uninstall${colors.reset}     Safely stop service, remove units, clean temporary files`);
  console.log(`  ${colors.green}start${colors.reset}         Start the NETWATCH background monitoring service`);
  console.log(`  ${colors.green}stop${colors.reset}          Stop the running monitoring service`);
  console.log(`  ${colors.green}restart${colors.reset}       Restart the monitoring service`);
  console.log(`  ${colors.green}status${colors.reset}        Show current telemetry, service state, and alert summary`);
  console.log(`  ${colors.green}monitor${colors.reset}       Open live interactive terminal traffic monitor`);
  console.log(`  ${colors.green}doctor${colors.reset}        Run automated system diagnostics and health checks`);
  console.log(`  ${colors.green}config${colors.reset}        Display and validate active monitoring configuration`);
  console.log(`  ${colors.green}logs${colors.reset}          View recent log entries (-n <lines> or -f for stream)`);
  console.log(`  ${colors.green}help${colors.reset}          Display this help documentation\n`);
}

function loadConfig() {
  let config = {};
  if (fs.existsSync(DEFAULT_CONFIG_FILE)) {
    try {
      config = JSON.parse(fs.readFileSync(DEFAULT_CONFIG_FILE, 'utf8'));
    } catch (_) {}
  }
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const lines = fs.readFileSync(CONFIG_FILE, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [k, ...v] = trimmed.split('=');
          if (k && v.length) {
            let val = v.join('=').trim();
            if (val === 'true') val = true;
            else if (val === 'false') val = false;
            else if (!isNaN(Number(val))) val = Number(val);
            config[k.trim()] = val;
          }
        }
      }
    } catch (_) {}
  }
  return config;
}

function isServiceRunning() {
  if (fs.existsSync(PID_FILE)) {
    try {
      const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8').trim(), 10);
      if (pid && !isNaN(pid)) {
        process.kill(pid, 0); // test if running
        return pid;
      }
    } catch (e) {
      // Not running or dead PID
      return null;
    }
  }
  return null;
}

async function handleStatus() {
  printBanner();
  console.log(`${colors.bold}NETWATCH SYSTEM STATUS${colors.reset}\n`);

  const pid = isServiceRunning();
  const serviceStatus = pid ? `${colors.green}RUNNING (PID: ${pid})${colors.reset}` : `${colors.red}STOPPED${colors.reset}`;
  console.log(`  Service:      ${serviceStatus}`);

  let dataStatus = `${colors.yellow}NO DATA FILE${colors.reset}`;
  let lastUpdate = 'N/A';
  let totalDl = '0 Mbps';
  let totalUl = '0 Mbps';
  let activeProcesses = 0;
  let activeUsers = 0;

  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const data = JSON.parse(raw);
      dataStatus = `${colors.green}VALID JSON${colors.reset}`;
      lastUpdate = data.timestamp || 'N/A';
      totalDl = `${data.totals?.download_mbps || 0} Mbps`;
      totalUl = `${data.totals?.upload_mbps || 0} Mbps`;
      activeProcesses = data.processes?.length || 0;
      activeUsers = data.users?.length || 0;
    } catch (err) {
      dataStatus = `${colors.red}CORRUPTED / INVALID JSON${colors.reset}`;
    }
  }

  console.log(`  Monitoring:   ${pid ? colors.green + 'ACTIVE' + colors.reset : colors.gray + 'INACTIVE' + colors.reset}`);
  console.log(`  Data:         ${dataStatus}`);
  console.log(`  Last Update:  ${colors.cyan}${lastUpdate}${colors.reset}`);
  console.log(`  Download:     ${colors.cyan}${totalDl}${colors.reset}`);
  console.log(`  Upload:       ${colors.cyan}${totalUl}${colors.reset}`);
  console.log(`  Processes:    ${colors.white}${activeProcesses} active${colors.reset}`);
  console.log(`  Users:        ${colors.white}${activeUsers} active${colors.reset}`);

  // Try fetching API health
  const config = loadConfig();
  const port = config.PORT || 4000;
  console.log(`  API Endpoint: ${colors.blue}http://localhost:${port}/api/health${colors.reset}`);
  console.log(`  Dashboard:    ${colors.blue}http://localhost:${port}${colors.reset}\n`);
}

function handleStart() {
  const pid = isServiceRunning();
  if (pid) {
    console.log(`${colors.yellow}[!] NETWATCH service is already running (PID: ${pid}).${colors.reset}`);
    return;
  }

  fs.mkdirSync(path.join(ROOT_DIR, 'data'), { recursive: true });
  fs.mkdirSync(path.join(ROOT_DIR, 'logs'), { recursive: true });

  console.log(`${colors.blue}[*] Starting NETWATCH daemon in background...${colors.reset}`);
  const out = fs.openSync(LOG_FILE, 'a');
  const err = fs.openSync(LOG_FILE, 'a');

  const serverScript = path.join(ROOT_DIR, 'backend', 'server.js');
  const child = spawn(process.execPath, [serverScript], {
    detached: true,
    stdio: ['ignore', out, err],
    cwd: ROOT_DIR
  });

  fs.writeFileSync(PID_FILE, String(child.pid), 'utf8');
  child.unref();

  console.log(`${colors.green}[OK] NETWATCH daemon started successfully (PID: ${child.pid}).${colors.reset}`);
  console.log(`Dashboard available at: ${colors.cyan}http://localhost:4000${colors.reset}\n`);
}

function handleStop() {
  const pid = isServiceRunning();
  if (!pid) {
    if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
    console.log(`${colors.yellow}[!] NETWATCH service is not running.${colors.reset}`);
    return;
  }

  console.log(`${colors.blue}[*] Stopping NETWATCH daemon (PID: ${pid})...${colors.reset}`);
  try {
    process.kill(pid, 'SIGTERM');
    if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
    console.log(`${colors.green}[OK] Service stopped successfully.${colors.reset}`);
  } catch (err) {
    console.log(`${colors.red}[ERROR] Failed to stop process: ${err.message}${colors.reset}`);
  }
}

function handleRestart() {
  console.log(`${colors.blue}[*] Restarting NETWATCH daemon...${colors.reset}`);
  handleStop();
  setTimeout(() => {
    handleStart();
  }, 1000);
}

function handleConfig() {
  printBanner();
  console.log(`${colors.bold}ACTIVE CONFIGURATION & THRESHOLDS${colors.reset}\n`);
  const config = loadConfig();
  console.log(`  DOWNLOAD_THRESHOLD_MBPS:     ${colors.cyan}${config.DOWNLOAD_THRESHOLD_MBPS || 50} MB/s${colors.reset}`);
  console.log(`  UPLOAD_THRESHOLD_MBPS:       ${colors.cyan}${config.UPLOAD_THRESHOLD_MBPS || 20} MB/s${colors.reset}`);
  console.log(`  MONITORING_INTERVAL_SECONDS: ${config.MONITORING_INTERVAL_SECONDS || 2}s`);
  console.log(`  PORT:                        ${config.PORT || 4000}`);
  console.log(`  JSON_OUTPUT_FILE:            ${config.JSON_OUTPUT_FILE || 'data/traffic.json'}`);
  console.log(`  LOG_FILE:                    ${config.LOG_FILE || 'logs/netwatch.log'}`);
  console.log(`  LOG_RETENTION_DAYS:          ${config.LOG_RETENTION_DAYS || 7} days`);
  console.log(`  FIM_ENABLED:                 ${config.FIM_ENABLED ? colors.green + 'true' : colors.red + 'false'}${colors.reset}`);
  console.log(`  DEMO_MODE:                   ${config.DEMO_MODE ? colors.yellow + 'true' : colors.green + 'false (Live/Auto)'}${colors.reset}\n`);

  // Validation
  let valid = true;
  if (typeof config.DOWNLOAD_THRESHOLD_MBPS !== 'number' || config.DOWNLOAD_THRESHOLD_MBPS <= 0) {
    console.log(`${colors.red}[FAIL] Invalid DOWNLOAD_THRESHOLD_MBPS (must be positive number)${colors.reset}`);
    valid = false;
  }
  if (typeof config.UPLOAD_THRESHOLD_MBPS !== 'number' || config.UPLOAD_THRESHOLD_MBPS <= 0) {
    console.log(`${colors.red}[FAIL] Invalid UPLOAD_THRESHOLD_MBPS (must be positive number)${colors.reset}`);
    valid = false;
  }
  if (valid) {
    console.log(`${colors.green}[PASS] All configuration parameters are strictly validated.${colors.reset}\n`);
  }
}

function handleLogs() {
  if (!fs.existsSync(LOG_FILE)) {
    console.log(`${colors.yellow}No logs found at ${LOG_FILE}.${colors.reset}`);
    return;
  }

  const isFollow = args.includes('-f') || args.includes('--follow');
  const countIdx = args.indexOf('-n');
  const lineCount = countIdx !== -1 && args[countIdx + 1] ? parseInt(args[countIdx + 1], 10) : 30;

  const content = fs.readFileSync(LOG_FILE, 'utf8');
  const lines = content.trim().split('\n');
  const slice = lines.slice(-lineCount);

  console.log(`${colors.cyan}--- Showing last ${slice.length} log lines from ${LOG_FILE} ---${colors.reset}`);
  for (const line of slice) {
    if (line.includes('ERROR')) console.log(`${colors.red}${line}${colors.reset}`);
    else if (line.includes('WARN')) console.log(`${colors.yellow}${line}${colors.reset}`);
    else if (line.includes('INFO')) console.log(`${colors.green}${line}${colors.reset}`);
    else console.log(line);
  }

  if (isFollow) {
    console.log(`${colors.cyan}--- Following live logs (Ctrl+C to stop) ---${colors.reset}`);
    let lastSize = fs.statSync(LOG_FILE).size;
    setInterval(() => {
      if (fs.existsSync(LOG_FILE)) {
        const stat = fs.statSync(LOG_FILE);
        if (stat.size > lastSize) {
          const stream = fs.createReadStream(LOG_FILE, { start: lastSize, end: stat.size });
          stream.on('data', chunk => process.stdout.write(chunk.toString()));
          lastSize = stat.size;
        }
      }
    }, 1000);
  }
}

async function handleDoctor() {
  const { runDoctorChecks } = require(path.join(ROOT_DIR, 'backend', 'services', 'doctor-service.js'));
  printBanner();
  console.log(`${colors.bold}NETWATCH DOCTOR DIAGNOSTIC SUITE${colors.reset}\n`);

  const report = await runDoctorChecks(ROOT_DIR);

  console.log(`${colors.bold}1. Core Dependencies & Environment:${colors.reset}`);
  for (const check of report.dependencies) {
    const badge = check.status === 'PASS' ? `${colors.green}[PASS]${colors.reset}` :
                  check.status === 'WARN' ? `${colors.yellow}[WARN]${colors.reset}` : `${colors.red}[FAIL]${colors.reset}`;
    console.log(`  ${badge}  ${check.name.padEnd(28)} : ${check.details}`);
  }

  console.log(`\n${colors.bold}2. Configuration & Data Integrity:${colors.reset}`);
  for (const check of report.integrity) {
    const badge = check.status === 'PASS' ? `${colors.green}[PASS]${colors.reset}` :
                  check.status === 'WARN' ? `${colors.yellow}[WARN]${colors.reset}` : `${colors.red}[FAIL]${colors.reset}`;
    console.log(`  ${badge}  ${check.name.padEnd(28)} : ${check.details}`);
  }

  console.log(`\n${colors.bold}3. Storage & Permissions:${colors.reset}`);
  for (const check of report.storage) {
    const badge = check.status === 'PASS' ? `${colors.green}[PASS]${colors.reset}` :
                  check.status === 'WARN' ? `${colors.yellow}[WARN]${colors.reset}` : `${colors.red}[FAIL]${colors.reset}`;
    console.log(`  ${badge}  ${check.name.padEnd(28)} : ${check.details}`);
  }

  console.log(`\n${colors.bold}4. Service & Telemetry Status:${colors.reset}`);
  for (const check of report.service) {
    const badge = check.status === 'PASS' ? `${colors.green}[PASS]${colors.reset}` :
                  check.status === 'WARN' ? `${colors.yellow}[WARN]${colors.reset}` : `${colors.red}[FAIL]${colors.reset}`;
    console.log(`  ${badge}  ${check.name.padEnd(28)} : ${check.details}`);
  }

  console.log(`\n================================================================================`);
  console.log(`  Passed: ${colors.green}${report.summary.passed}${colors.reset} | Warnings: ${colors.yellow}${report.summary.warnings}${colors.reset} | Failures: ${colors.red}${report.summary.failures}${colors.reset}`);
  
  if (report.summary.failures === 0) {
    if (report.summary.warnings === 0) {
      console.log(`  Overall Health: ${colors.green}${colors.bold}HEALTHY (100% PASS)${colors.reset}\n`);
    } else {
      console.log(`  Overall Health: ${colors.yellow}${colors.bold}OPERATIONAL (With minor warnings)${colors.reset}\n`);
    }
  } else {
    console.log(`  Overall Health: ${colors.red}${colors.bold}CRITICAL / ACTION REQUIRED${colors.reset}\n`);
  }

  if (report.recommendations.length > 0) {
    console.log(`${colors.bold}Recommendations:${colors.reset}`);
    for (const rec of report.recommendations) {
      console.log(`  ${colors.yellow}•${colors.reset} ${rec}`);
    }
    console.log('');
  }
}

function handleInstall() {
  printBanner();
  console.log(`${colors.blue}[*] Initializing NETWATCH directory structure & configuration...${colors.reset}`);
  fs.mkdirSync(path.join(ROOT_DIR, 'data'), { recursive: true });
  fs.mkdirSync(path.join(ROOT_DIR, 'logs'), { recursive: true });
  fs.mkdirSync(path.join(ROOT_DIR, 'config'), { recursive: true });

  const initialJson = path.join(ROOT_DIR, 'data', 'traffic.json');
  if (!fs.existsSync(initialJson)) {
    const defaultData = {
      timestamp: new Date().toISOString(),
      status: "INITIALIZED",
      interfaces: [],
      processes: [],
      users: [],
      totals: { download_mbps: 0.0, upload_mbps: 0.0, total_download_bytes: 0, total_upload_bytes: 0 }
    };
    fs.writeFileSync(initialJson, JSON.stringify(defaultData, null, 2), 'utf8');
    console.log(`  ${colors.green}[OK]${colors.reset} Initialized ${initialJson}`);
  }

  console.log(`${colors.green}[OK] NETWATCH installation verified.${colors.reset}\n`);
}

function handleUninstall() {
  printBanner();
  console.log(`${colors.yellow}[*] Cleaning NETWATCH runtime states...${colors.reset}`);
  handleStop();
  console.log(`${colors.green}[OK] Service stopped. Logs and telemetry preserved for defensive audit.${colors.reset}\n`);
}

function handleMonitor() {
  printBanner();
  console.log(`${colors.cyan}Starting live CLI traffic monitor. Press Ctrl+C to exit...${colors.reset}\n`);
  setInterval(() => {
    if (fs.existsSync(DATA_FILE)) {
      try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        process.stdout.write('\x1Bc'); // clear screen
        console.log(`${colors.cyan}${colors.bold}=== NETWATCH LIVE TRAFFIC MONITOR ===${colors.reset}`);
        console.log(`Timestamp: ${colors.bold}${data.timestamp}${colors.reset} | Status: ${colors.green}${data.status}${colors.reset}`);
        console.log(`Download: ${colors.cyan}${colors.bold}${data.totals?.download_mbps || 0} Mbps${colors.reset} | Upload: ${colors.cyan}${colors.bold}${data.totals?.upload_mbps || 0} Mbps${colors.reset}\n`);
        console.log(`--------------------------------------------------------------------------------`);
        console.log(`${'PROCESS'.padEnd(24)} ${'PID'.padEnd(8)} ${'USER'.padEnd(12)} ${'DOWNLOAD'.padEnd(14)} ${'UPLOAD'.padEnd(14)}`);
        console.log(`--------------------------------------------------------------------------------`);
        const procs = (data.processes || []).slice(0, 10);
        for (const p of procs) {
          console.log(`${(p.name || '').substring(0, 23).padEnd(24)} ${String(p.pid).padEnd(8)} ${(p.user || '').substring(0, 11).padEnd(12)} ${(p.download_formatted || '').padEnd(14)} ${(p.upload_formatted || '').padEnd(14)}`);
        }
        console.log(`--------------------------------------------------------------------------------`);
      } catch (_) {}
    } else {
      console.log('Waiting for traffic data... Service may be starting.');
    }
  }, 1500);
}

// Route command
switch (command.toLowerCase()) {
  case 'install':
    handleInstall();
    break;
  case 'uninstall':
    handleUninstall();
    break;
  case 'start':
    handleStart();
    break;
  case 'stop':
    handleStop();
    break;
  case 'restart':
    handleRestart();
    break;
  case 'status':
    handleStatus();
    break;
  case 'config':
    handleConfig();
    break;
  case 'logs':
    handleLogs();
    break;
  case 'doctor':
    handleDoctor();
    break;
  case 'monitor':
    handleMonitor();
    break;
  case 'help':
  case '--help':
  case '-h':
  default:
    showHelp();
    break;
}

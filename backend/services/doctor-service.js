/**
 * NETWATCH — Automated Doctor Diagnostic Service
 * Objective 4 & Section 23: Complete automated health check suite and remediation suggestions.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { getConfig } = require('../config');
const jsonValidator = require('./json-validator');
const { getSystemMetrics } = require('../utils/system-info');

function checkCommand(cmd) {
  try {
    const out = execSync(`${cmd} --version`, { stdio: 'pipe', encoding: 'utf8' });
    return { available: true, version: out.split('\n')[0].trim() };
  } catch (_) {
    return { available: false, version: null };
  }
}

async function runDoctorChecks(rootDir = path.resolve(__dirname, '../..')) {
  const config = getConfig();
  const dataDir = path.resolve(rootDir, config.DATA_DIR || 'data');
  const logDir = path.resolve(rootDir, config.LOG_DIR || 'logs');
  const dataFile = path.resolve(rootDir, config.JSON_OUTPUT_FILE || 'data/traffic.json');
  const pidFile = path.resolve(rootDir, 'data', 'netwatch.pid');

  const dependencies = [];
  const integrity = [];
  const storage = [];
  const service = [];
  const recommendations = [];

  // 1. Dependencies
  // Node.js
  const nodeCheck = checkCommand('node');
  if (nodeCheck.available) {
    dependencies.push({ name: 'Node.js Runtime', status: 'PASS', details: `Version: ${process.version}` });
  } else {
    dependencies.push({ name: 'Node.js Runtime', status: 'FAIL', details: 'Node.js binary not found' });
    recommendations.push('Install Node.js (v18+) from https://nodejs.org or system package manager.');
  }

  // npm
  const npmCheck = checkCommand('npm');
  if (npmCheck.available || checkCommand('npm.cmd').available) {
    dependencies.push({ name: 'npm Package Manager', status: 'PASS', details: 'Package manager active' });
  } else {
    dependencies.push({ name: 'npm Package Manager', status: 'FAIL', details: 'npm binary not found' });
    recommendations.push('Install npm to manage required dependencies.');
  }

  // nethogs
  let nethogsAvailable = false;
  try {
    execSync('which nethogs', { stdio: 'ignore' });
    nethogsAvailable = true;
  } catch (_) {}

  if (nethogsAvailable) {
    dependencies.push({ name: 'nethogs Utility', status: 'PASS', details: 'Process network monitor available' });
  } else {
    dependencies.push({ name: 'nethogs Utility', status: 'WARN', details: 'Not installed (fallback/demo mode enabled)' });
    recommendations.push('Install nethogs on Linux via "sudo apt-get install -y nethogs" for live kernel packet telemetry.');
  }

  // jq
  const jqCheck = checkCommand('jq');
  if (jqCheck.available) {
    dependencies.push({ name: 'jq JSON Processor', status: 'PASS', details: `Version: ${jqCheck.version}` });
  } else {
    dependencies.push({ name: 'jq JSON Processor', status: 'WARN', details: 'Not installed (using high-performance JS validator)' });
    recommendations.push('Install jq for instant CLI JSON validation: "sudo apt-get install -y jq".');
  }

  // shellcheck
  const scCheck = checkCommand('shellcheck');
  if (scCheck.available) {
    dependencies.push({ name: 'ShellCheck Linter', status: 'PASS', details: `Version: ${scCheck.version}` });
  } else {
    dependencies.push({ name: 'ShellCheck Linter', status: 'WARN', details: 'Not installed' });
    recommendations.push('Install shellcheck to ensure compliance for bash scripts: "sudo apt-get install -y shellcheck".');
  }

  // systemd
  let hasSystemd = false;
  try {
    execSync('systemctl --version', { stdio: 'ignore' });
    hasSystemd = true;
  } catch (_) {}

  if (hasSystemd) {
    dependencies.push({ name: 'systemd Init System', status: 'PASS', details: 'systemctl available' });
  } else {
    dependencies.push({ name: 'systemd Init System', status: 'WARN', details: 'systemd not detected (standalone process mode active)' });
  }

  // 2. Configuration & Integrity
  // Config
  const confFile = path.resolve(rootDir, 'config', 'netwatch.conf');
  const defaultConfFile = path.resolve(rootDir, 'config', 'default.json');
  if (fs.existsSync(confFile) || fs.existsSync(defaultConfFile)) {
    integrity.push({
      name: 'Configuration Integrity',
      status: 'PASS',
      details: `Thresholds: DL=${config.DOWNLOAD_THRESHOLD_MBPS} MB/s, UL=${config.UPLOAD_THRESHOLD_MBPS} MB/s`
    });
  } else {
    integrity.push({ name: 'Configuration Integrity', status: 'FAIL', details: 'No config file found' });
    recommendations.push('Run "monitor-ctl install" to generate standard configuration.');
  }

  // JSON Data Integrity
  if (fs.existsSync(dataFile)) {
    const val = jsonValidator.validateFile(dataFile);
    if (val.isValid) {
      integrity.push({ name: 'JSON Data Integrity', status: 'PASS', details: `Validated (${val.method})` });
    } else {
      integrity.push({ name: 'JSON Data Integrity', status: 'FAIL', details: val.error || 'Corrupted format' });
      recommendations.push('JSON data file is corrupted. Restore from data/traffic.json.bak or restart monitoring.');
    }
  } else {
    integrity.push({ name: 'JSON Data Integrity', status: 'WARN', details: 'Data file not yet initialized' });
    recommendations.push('Start the monitoring daemon with "monitor-ctl start" to begin collecting telemetry.');
  }

  // 3. Storage & Permissions
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    fs.accessSync(dataDir, fs.constants.W_OK);
    storage.push({ name: 'Data Storage Directory', status: 'PASS', details: `${dataDir} (Writable)` });
  } catch (err) {
    storage.push({ name: 'Data Storage Directory', status: 'FAIL', details: `Permission denied: ${dataDir}` });
    recommendations.push(`Grant write permissions: chmod -R 755 ${dataDir}`);
  }

  try {
    fs.mkdirSync(logDir, { recursive: true });
    fs.accessSync(logDir, fs.constants.W_OK);
    storage.push({ name: 'Logs Directory', status: 'PASS', details: `${logDir} (Writable)` });
  } catch (err) {
    storage.push({ name: 'Logs Directory', status: 'FAIL', details: `Permission denied: ${logDir}` });
    recommendations.push(`Grant write permissions: chmod -R 755 ${logDir}`);
  }

  // Disk Space
  const sysMetrics = getSystemMetrics();
  const freeMb = Math.round(sysMetrics.disk.free / (1024 * 1024));
  if (freeMb > 100) {
    storage.push({ name: 'Disk Space', status: 'PASS', details: `${freeMb} MB free disk space available` });
  } else {
    storage.push({ name: 'Disk Space', status: 'WARN', details: `Low storage: ${freeMb} MB available` });
    recommendations.push('Free up disk space to ensure uninterrupted log rotation and telemetry persistence.');
  }

  // 4. Service & Telemetry Status
  let isRunning = false;
  if (fs.existsSync(pidFile)) {
    try {
      const pid = parseInt(fs.readFileSync(pidFile, 'utf8').trim(), 10);
      if (pid) {
        process.kill(pid, 0);
        isRunning = true;
      }
    } catch (_) {}
  }

  if (isRunning) {
    service.push({ name: 'NETWATCH Monitoring Service', status: 'PASS', details: 'Daemon active and collecting' });
  } else {
    service.push({ name: 'NETWATCH Monitoring Service', status: 'WARN', details: 'Daemon currently stopped' });
    recommendations.push('Start the monitoring service with "monitor-ctl start" or "npm start".');
  }

  // Aggregate summary
  const allChecks = [...dependencies, ...integrity, ...storage, ...service];
  const passed = allChecks.filter(c => c.status === 'PASS').length;
  const warnings = allChecks.filter(c => c.status === 'WARN').length;
  const failures = allChecks.filter(c => c.status === 'FAIL').length;

  let overallHealth = 'HEALTHY';
  if (failures > 0) {
    overallHealth = 'CRITICAL';
  } else if (warnings > 0) {
    overallHealth = 'OPERATIONAL_WITH_WARNINGS';
  }

  return {
    timestamp: new Date().toISOString(),
    overallHealth,
    summary: {
      total: allChecks.length,
      passed,
      warnings,
      failures
    },
    dependencies,
    integrity,
    storage,
    service,
    recommendations
  };
}

module.exports = {
  runDoctorChecks
};

/**
 * NETWATCH — Full REST API Router
 * Section 34: Exposes standard REST endpoints for dashboard, CLI, and defensive telemetry queries.
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const { getConfig, updateConfig } = require('../config');
const collector = require('../services/collector');
const alertEngine = require('../services/alerts');
const fileMonitor = require('../services/file-monitor');
const historyStore = require('../services/history-store');
const jsonValidator = require('../services/json-validator');
const logger = require('../services/log-manager');
const nethogsService = require('../services/nethogs');
const { runDoctorChecks } = require('../services/doctor-service');
const { getNetworkInterfaces, getSystemMetrics } = require('../utils/system-info');

// 1. Health Endpoint
router.get('/health', (req, res) => {
  const jsonStatus = jsonValidator.getStatus();
  res.json({
    status: 'HEALTHY',
    service: collector.isRunning ? 'RUNNING' : 'STOPPED',
    timestamp: new Date().toISOString(),
    jsonValidation: jsonStatus.isValid ? 'VALID' : 'INVALID',
    demoMode: nethogsService.isDemoMode
  });
});

// 2. Comprehensive Dashboard Telemetry
router.get('/dashboard', (req, res) => {
  const telemetry = collector.getLatestTelemetry() || {
    timestamp: new Date().toISOString(),
    status: 'INITIALIZING',
    demoMode: true,
    interfaces: [],
    processes: [],
    users: [],
    totals: { download_mbps: 0, upload_mbps: 0, total_download_formatted: '0 B', total_upload_formatted: '0 B' }
  };

  const alertCounts = alertEngine.getCounts();
  const jsonStatus = jsonValidator.getStatus();
  const fileEvents = fileMonitor.getEvents(5);
  const recentAlerts = alertEngine.getAlerts().slice(0, 5);
  const sysMetrics = getSystemMetrics();
  const timeSeries = historyStore.getRecentTimeRange(req.query.range || '15m');

  res.json({
    telemetry,
    alertCounts,
    jsonStatus,
    fileEvents,
    recentAlerts,
    system: sysMetrics,
    trafficHistory: timeSeries
  });
});

// 3. Network Interfaces & Traffic
router.get('/network', (req, res) => {
  const interfaces = getNetworkInterfaces();
  const telemetry = collector.getLatestTelemetry();
  res.json({
    interfaces,
    totals: telemetry?.totals || {},
    timestamp: new Date().toISOString()
  });
});

router.get('/network/interfaces', (req, res) => {
  res.json(getNetworkInterfaces());
});

router.get('/network/traffic', (req, res) => {
  const range = req.query.range || '15m';
  res.json({
    range,
    data: historyStore.getRecentTimeRange(range)
  });
});

// 4. Process-Level Telemetry
router.get('/processes', (req, res) => {
  const telemetry = collector.getLatestTelemetry();
  const processes = telemetry?.processes || nethogsService.getProcesses();
  res.json({
    count: processes.length,
    processes,
    timestamp: new Date().toISOString()
  });
});

// 5. User-Level Telemetry
router.get('/users', (req, res) => {
  const telemetry = collector.getLatestTelemetry();
  res.json({
    users: telemetry?.users || [],
    timestamp: new Date().toISOString()
  });
});

// 6. Historical Analytics
router.get('/history', (req, res) => {
  const period = req.query.period || '7d';
  res.json(historyStore.getHistoricalData(period));
});

router.get('/history/export', (req, res) => {
  const period = req.query.period || '7d';
  const format = req.query.format || 'json';

  if (format === 'csv') {
    const csv = historyStore.exportCsv(period);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="netwatch-history-${period}.csv"`);
    return res.send(csv);
  }

  const json = historyStore.getHistoricalData(period);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="netwatch-history-${period}.json"`);
  res.json(json);
});

// 7. Alert Management
router.get('/alerts', (req, res) => {
  const { severity, status, type, search } = req.query;
  const alerts = alertEngine.getAlerts({ severity, status, type, search });
  const counts = alertEngine.getCounts();
  res.json({ counts, alerts });
});

router.post('/alerts/:id/resolve', (req, res) => {
  const resolved = alertEngine.resolveAlert(req.params.id);
  if (resolved) {
    res.json({ success: true, alert: resolved });
  } else {
    res.status(404).json({ success: false, error: 'Alert not found' });
  }
});

router.post('/alerts/:id/dismiss', (req, res) => {
  const dismissed = alertEngine.dismissAlert(req.params.id);
  if (dismissed) {
    res.json({ success: true, alert: dismissed });
  } else {
    res.status(404).json({ success: false, error: 'Alert not found' });
  }
});

// 8. File Integrity Monitoring (FIM)
router.get('/files/events', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;
  res.json({
    directories: fileMonitor.getMonitoredDirectories(),
    events: fileMonitor.getEvents(limit)
  });
});

router.post('/files/directories', (req, res) => {
  const { path: dirPath } = req.body;
  if (!dirPath) {
    return res.status(400).json({ success: false, error: 'Directory path is required' });
  }
  fileMonitor.addDirectory(dirPath);
  res.json({ success: true, directories: fileMonitor.getMonitoredDirectories() });
});

router.delete('/files/directories', (req, res) => {
  const { path: dirPath } = req.body;
  if (!dirPath) {
    return res.status(400).json({ success: false, error: 'Directory path is required' });
  }
  fileMonitor.removeDirectory(dirPath);
  res.json({ success: true, directories: fileMonitor.getMonitoredDirectories() });
});

// 9. Service Management & Lifecycle
router.get('/service/status', (req, res) => {
  const sysMetrics = getSystemMetrics();
  res.json({
    service: 'netwatch.service',
    status: collector.isRunning ? 'RUNNING' : 'STOPPED',
    uptimeSeconds: process.uptime(),
    pid: process.pid,
    memoryUsage: process.memoryUsage(),
    system: sysMetrics
  });
});

router.post('/monitor/start', (req, res) => {
  collector.start();
  res.json({ success: true, status: 'RUNNING' });
});

router.post('/monitor/stop', (req, res) => {
  collector.stop();
  res.json({ success: true, status: 'STOPPED' });
});

router.post('/monitor/restart', (req, res) => {
  collector.stop();
  setTimeout(() => {
    collector.start();
  }, 500);
  res.json({ success: true, status: 'RESTARTED' });
});

// 10. Automated Doctor Diagnostics
router.get('/doctor', async (req, res) => {
  try {
    const report = await runDoctorChecks();
    res.json(report);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Configuration Settings
router.get('/config', (req, res) => {
  res.json(getConfig());
});

router.put('/config', (req, res) => {
  const result = updateConfig(req.body);
  if (result.success) {
    logger.info('API', 'Monitoring configuration updated via REST API');
    res.json({ success: true, config: result.config });
  } else {
    res.status(400).json({ success: false, errors: result.errors });
  }
});

// 12. Structured Logs Query
router.get('/logs', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 100;
  const level = req.query.level || 'ALL';
  res.json({
    logs: logger.getRecentLogs(limit, level)
  });
});

// 13. Reports Generation & Export
router.get('/reports/summary', (req, res) => {
  const period = req.query.period || 'daily';
  const hist = historyStore.getHistoricalData(period === 'daily' ? 'today' : '7d');
  const alertCounts = alertEngine.getCounts();
  const fileEvents = fileMonitor.getEvents(100);
  const sysMetrics = getSystemMetrics();

  res.json({
    reportTitle: `NETWATCH ${period.toUpperCase()} SECURITY & NETWORK SUMMARY`,
    generatedAt: new Date().toISOString(),
    period,
    monitoringStats: hist.summary,
    topProcesses: hist.top_processes,
    topUsers: hist.top_users,
    alertsSummary: alertCounts,
    fileEventsSummary: {
      total: fileEvents.length,
      created: fileEvents.filter(e => e.event === 'CREATED').length,
      modified: fileEvents.filter(e => e.event === 'MODIFIED').length,
      deleted: fileEvents.filter(e => e.event === 'DELETED').length
    },
    systemHealth: sysMetrics
  });
});

// 14. Demo Mode Toggle
router.post('/demo/toggle', (req, res) => {
  const config = getConfig();
  const newDemo = !nethogsService.isDemoMode;
  updateConfig({ DEMO_MODE: newDemo });
  nethogsService.isDemoMode = newDemo;
  logger.info('API', `DEMO_MODE manually toggled to ${newDemo}`);
  res.json({ success: true, demoMode: newDemo });
});

module.exports = router;

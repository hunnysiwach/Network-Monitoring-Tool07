/**
 * NETWATCH — Primary Telemetry Collector Engine
 * Sections 1, 2, 9, 10, 11, 12, 16: Collects, aggregates, validates, and persists network metadata.
 */

const path = require('path');
const { getConfig } = require('../config');
const { getNetworkInterfaces, formatBytes, formatSpeed } = require('../utils/system-info');
const nethogsService = require('./nethogs');
const alertEngine = require('./alerts');
const jsonValidator = require('./json-validator');
const historyStore = require('./history-store');
const logger = require('./log-manager');

class TelemetryCollector {
  constructor() {
    this.intervalHandle = null;
    this.isRunning = false;
    this.previousTotals = null;
    this.latestTelemetry = null;
  }

  start(rootDir = path.resolve(__dirname, '../..')) {
    if (this.isRunning) return;
    const config = getConfig();

    logger.info('Collector', `Starting telemetry collection engine (Interval: ${config.MONITORING_INTERVAL_SECONDS || 2}s)`);
    nethogsService.start();

    const dataFile = path.resolve(rootDir, config.JSON_OUTPUT_FILE || 'data/traffic.json');

    // Run initial collection immediately
    this.collectOnce(dataFile);

    // Continuous collection loop
    const intervalMs = (config.MONITORING_INTERVAL_SECONDS || 2) * 1000;
    this.intervalHandle = setInterval(() => {
      this.collectOnce(dataFile);
    }, intervalMs);

    this.isRunning = true;
  }

  collectOnce(dataFile) {
    try {
      const now = new Date().toISOString();
      const interfaces = getNetworkInterfaces();
      const processes = nethogsService.getProcesses();

      // Aggregate process speeds
      let totalDlKbps = 0;
      let totalUlKbps = 0;
      let totalDlBytes = 0;
      let totalUlBytes = 0;

      // Group and aggregate by Linux User
      const userMap = new Map();

      for (const p of processes) {
        totalDlKbps += (p.download_kbps || 0);
        totalUlKbps += (p.upload_kbps || 0);
        totalDlBytes += (p.totalBytesRecv || 0);
        totalUlBytes += (p.totalBytesSent || 0);

        const username = p.user || 'system';
        const existingUser = userMap.get(username) || {
          username,
          download_kbps: 0,
          upload_kbps: 0,
          total_download_bytes: 0,
          total_upload_bytes: 0,
          processCount: 0
        };

        existingUser.download_kbps += (p.download_kbps || 0);
        existingUser.upload_kbps += (p.upload_kbps || 0);
        existingUser.total_download_bytes += (p.totalBytesRecv || 0);
        existingUser.total_upload_bytes += (p.totalBytesSent || 0);
        existingUser.processCount++;
        userMap.set(username, existingUser);
      }

      // Convert speeds to Mbps (1 KB/s = 0.008 Mbps)
      const downloadMbps = parseFloat((totalDlKbps * 8 / 1000).toFixed(2));
      const uploadMbps = parseFloat((totalUlKbps * 8 / 1000).toFixed(2));

      // Calculate user totals and percentages
      const grandTotalBytes = totalDlBytes + totalUlBytes || 1;
      const users = Array.from(userMap.values()).map(u => {
        const uTotal = u.total_download_bytes + u.total_upload_bytes;
        const percentage = Math.round((uTotal / grandTotalBytes) * 100);
        return {
          username: u.username,
          download_kbps: u.download_kbps,
          upload_kbps: u.upload_kbps,
          download_formatted: formatBytes(u.total_download_bytes),
          upload_formatted: formatBytes(u.total_upload_bytes),
          total_formatted: formatBytes(uTotal),
          total_bytes: uTotal,
          percentage: Math.min(100, Math.max(1, percentage)),
          processCount: u.processCount
        };
      }).sort((a, b) => b.total_bytes - a.total_bytes);

      const telemetry = {
        timestamp: now,
        status: 'ONLINE',
        demoMode: nethogsService.isDemoMode,
        interfaces,
        processes,
        users,
        totals: {
          download_kbps: Math.round(totalDlKbps),
          upload_kbps: Math.round(totalUlKbps),
          download_mbps: downloadMbps,
          upload_mbps: uploadMbps,
          download_formatted: formatSpeed(totalDlKbps),
          upload_formatted: formatSpeed(totalUlKbps),
          total_download_bytes: totalDlBytes,
          total_upload_bytes: totalUlBytes,
          total_download_formatted: formatBytes(totalDlBytes),
          total_upload_formatted: formatBytes(totalUlBytes)
        }
      };

      // Threshold & Alert Evaluation
      alertEngine.evaluateThresholds({
        downloadMbps,
        uploadMbps,
        processes,
        previousTotals: this.previousTotals
      });

      // Atomic Safe JSON Write with validation
      jsonValidator.safeWrite(dataFile, telemetry, alertEngine);

      // Record to history store
      historyStore.addSample({
        timestamp: now,
        downloadMbps,
        uploadMbps,
        processes,
        users
      });

      this.previousTotals = telemetry.totals;
      this.latestTelemetry = telemetry;
    } catch (err) {
      logger.error('Collector', `Telemetry collection iteration error: ${err.message}`);
    }
  }

  getLatestTelemetry() {
    return this.latestTelemetry;
  }

  stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
    nethogsService.stop();
    this.isRunning = false;
    logger.info('Collector', 'Telemetry collection stopped.');
  }
}

const collector = new TelemetryCollector();
module.exports = collector;

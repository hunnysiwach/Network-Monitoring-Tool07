/**
 * NETWATCH — Alert Engine & Threshold Evaluation
 * Objective 3 & Section 14: Threshold breach alerts, severity ratings, deduplication, resolution.
 */

const { getConfig } = require('../config');
const logger = require('./log-manager');

class AlertEngine {
  constructor() {
    this.alerts = [];
    this.maxAlerts = 200;
    this.lastTriggered = new Map(); // For rate-limiting identical alerts
  }

  createAlert({
    type,
    severity = 'MEDIUM',
    description,
    source = 'System',
    observedValue = 'N/A',
    threshold = 'N/A'
  }) {
    const config = getConfig();
    if (config.ALERTS_ENABLED === false) return null;

    const dedupeKey = `${type}-${source}-${observedValue}`;
    const now = Date.now();
    const lastTime = this.lastTriggered.get(dedupeKey) || 0;

    // Throttle identical alerts within 15 seconds
    if (now - lastTime < 15000) {
      return null;
    }
    this.lastTriggered.set(dedupeKey, now);

    const alert = {
      id: `ALT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      type,
      severity,
      description,
      source,
      observedValue: String(observedValue),
      threshold: String(threshold),
      status: 'ACTIVE',
      resolvedAt: null
    };

    this.alerts.unshift(alert);
    if (this.alerts.length > this.maxAlerts) {
      this.alerts.pop();
    }

    logger.warn('AlertEngine', `[${severity}] ${type}: ${description} (Observed: ${observedValue}, Threshold: ${threshold})`);
    return alert;
  }

  evaluateThresholds({ downloadMbps, uploadMbps, processes = [], previousTotals = null }) {
    const config = getConfig();
    const dlLimit = config.DOWNLOAD_THRESHOLD_MBPS || 50;
    const ulLimit = config.UPLOAD_THRESHOLD_MBPS || 20;
    const spikePct = config.ALERT_SPIKE_PERCENTAGE || 150;

    // 1. Download Threshold Exceeded
    if (downloadMbps > dlLimit) {
      const topDlProc = processes.slice().sort((a, b) => (b.download_kbps || 0) - (a.download_kbps || 0))[0];
      const source = topDlProc ? `${topDlProc.name} (PID: ${topDlProc.pid})` : 'System Interface';
      this.createAlert({
        type: 'HIGH_DOWNLOAD',
        severity: downloadMbps > dlLimit * 2 ? 'HIGH' : 'MEDIUM',
        description: `Total download rate of ${downloadMbps.toFixed(2)} MB/s exceeded threshold (${dlLimit} MB/s).`,
        source,
        observedValue: `${downloadMbps.toFixed(2)} MB/s`,
        threshold: `${dlLimit} MB/s`
      });
    }

    // 2. Upload Threshold Exceeded
    if (uploadMbps > ulLimit) {
      const topUlProc = processes.slice().sort((a, b) => (b.upload_kbps || 0) - (a.upload_kbps || 0))[0];
      const source = topUlProc ? `${topUlProc.name} (PID: ${topUlProc.pid})` : 'System Interface';
      this.createAlert({
        type: 'HIGH_UPLOAD',
        severity: uploadMbps > ulLimit * 2 ? 'HIGH' : 'MEDIUM',
        description: `Total upload rate of ${uploadMbps.toFixed(2)} MB/s exceeded threshold (${ulLimit} MB/s).`,
        source,
        observedValue: `${uploadMbps.toFixed(2)} MB/s`,
        threshold: `${ulLimit} MB/s`
      });
    }

    // 3. Network Spike Detection
    if (previousTotals && previousTotals.download_mbps > 1) {
      const deltaRatio = (downloadMbps - previousTotals.download_mbps) / previousTotals.download_mbps;
      if (deltaRatio > (spikePct / 100) && downloadMbps > 15) {
        this.createAlert({
          type: 'NETWORK_SPIKE',
          severity: 'HIGH',
          description: `Sudden traffic burst detected: +${(deltaRatio * 100).toFixed(0)}% jump in download bandwidth.`,
          source: 'Traffic Analyzer',
          observedValue: `${downloadMbps.toFixed(2)} MB/s`,
          threshold: `+${spikePct}% change`
        });
      }
    }
  }

  resolveAlert(id) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.status = 'RESOLVED';
      alert.resolvedAt = new Date().toISOString();
      logger.info('AlertEngine', `Alert ${id} marked as RESOLVED`);
      return alert;
    }
    return null;
  }

  dismissAlert(id) {
    const idx = this.alerts.findIndex(a => a.id === id);
    if (idx !== -1) {
      const [removed] = this.alerts.splice(idx, 1);
      logger.info('AlertEngine', `Alert ${id} DISMISSED`);
      return removed;
    }
    return null;
  }

  getAlerts(filters = {}) {
    let result = [...this.alerts];

    if (filters.severity && filters.severity !== 'ALL') {
      result = result.filter(a => a.severity.toUpperCase() === filters.severity.toUpperCase());
    }

    if (filters.status && filters.status !== 'ALL') {
      result = result.filter(a => a.status.toUpperCase() === filters.status.toUpperCase());
    }

    if (filters.type && filters.type !== 'ALL') {
      result = result.filter(a => a.type.toUpperCase() === filters.type.toUpperCase());
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(a =>
        a.description.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q)
      );
    }

    return result;
  }

  getCounts() {
    const active = this.alerts.filter(a => a.status === 'ACTIVE');
    return {
      total: this.alerts.length,
      active: active.length,
      high: active.filter(a => a.severity === 'HIGH').length,
      medium: active.filter(a => a.severity === 'MEDIUM').length,
      low: active.filter(a => a.severity === 'LOW').length,
      info: active.filter(a => a.severity === 'INFO').length
    };
  }
}

const alertEngine = new AlertEngine();
module.exports = alertEngine;

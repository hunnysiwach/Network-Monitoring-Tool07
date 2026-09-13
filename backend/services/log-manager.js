/**
 * NETWATCH — Structured Log Manager & Automated Log Rotation
 * Objective 2 & Section 18: Log rotation, structured formatting, size capping & retention cleanup.
 */

const fs = require('fs');
const path = require('path');
const { getConfig } = require('../config');

class LogManager {
  constructor() {
    this.inMemoryLogs = [];
    this.maxMemoryLogs = 500;
  }

  formatDate(date = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    const YYYY = date.getFullYear();
    const MM = pad(date.getMonth() + 1);
    const DD = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    return `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
  }

  log(level, component, message) {
    const config = getConfig();
    const timestamp = this.formatDate();
    const logLine = `${timestamp} ${level.padEnd(5)} [${component}] ${message}`;

    // Memory buffer for dashboard API
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp,
      level,
      component,
      message,
      raw: logLine
    };

    this.inMemoryLogs.push(entry);
    if (this.inMemoryLogs.length > this.maxMemoryLogs) {
      this.inMemoryLogs.shift();
    }

    // Console output
    if (process.env.NODE_ENV !== 'test') {
      if (level === 'ERROR') console.error(logLine);
      else if (level === 'WARN') console.warn(logLine);
      else console.log(logLine);
    }

    // Write to disk
    this.writeToFile(config, logLine);
  }

  writeToFile(config, line) {
    const logDir = path.resolve(__dirname, '..', '..', config.LOG_DIR || 'logs');
    const logFile = path.resolve(__dirname, '..', '..', config.LOG_FILE || 'logs/netwatch.log');

    try {
      fs.mkdirSync(logDir, { recursive: true });

      // Check size rotation
      if (fs.existsSync(logFile)) {
        const stats = fs.statSync(logFile);
        const maxBytes = (config.LOG_MAX_SIZE_MB || 10) * 1024 * 1024;
        if (stats.size >= maxBytes) {
          this.rotateLogs(logFile, config.LOG_RETENTION_DAYS || 7);
        }
      }

      fs.appendFileSync(logFile, line + '\n', 'utf8');
    } catch (err) {
      console.error(`[CRITICAL] LogManager file write failure: ${err.message}`);
    }
  }

  rotateLogs(logFile, maxRotations) {
    try {
      // Shift existing rotations: .3 -> .4, .2 -> .3, .1 -> .2
      for (let i = maxRotations - 1; i >= 1; i--) {
        const src = `${logFile}.${i}`;
        const dst = `${logFile}.${i + 1}`;
        if (fs.existsSync(src)) {
          if (i + 1 > maxRotations) {
            fs.unlinkSync(src);
          } else {
            fs.renameSync(src, dst);
          }
        }
      }

      // Rename current to .1
      if (fs.existsSync(logFile)) {
        fs.renameSync(logFile, `${logFile}.1`);
      }
    } catch (e) {
      console.error(`[ERROR] Log rotation error: ${e.message}`);
    }
  }

  info(component, message) {
    this.log('INFO', component, message);
  }

  warn(component, message) {
    this.log('WARN', component, message);
  }

  error(component, message) {
    this.log('ERROR', component, message);
  }

  debug(component, message) {
    const config = getConfig();
    if (config.LOG_LEVEL === 'DEBUG') {
      this.log('DEBUG', component, message);
    }
  }

  getRecentLogs(limit = 100, levelFilter = null) {
    let logs = [...this.inMemoryLogs];
    if (levelFilter && levelFilter !== 'ALL') {
      logs = logs.filter(l => l.level === levelFilter);
    }
    return logs.slice(-limit).reverse();
  }
}

const logger = new LogManager();

module.exports = logger;

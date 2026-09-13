/**
 * NETWATCH — Defensive File Integrity Monitoring (FIM) Module
 * Section 25: Monitors explicitly authorized local directories, tracks SHA-256 hashes & file events.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getConfig } = require('../config');
const logger = require('./log-manager');
const alertEngine = require('./alerts');

class FileIntegrityMonitor {
  constructor() {
    this.monitoredDirectories = new Set();
    this.fileHashMap = new Map(); // filepath -> { hash, size, mtime }
    this.events = [];
    this.maxEvents = 200;
    this.watchers = new Map();
    this.isInitialized = false;
  }

  computeHash(filePath) {
    try {
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return null;
      const buffer = fs.readFileSync(filePath);
      return crypto.createHash('sha256').update(buffer).digest('hex');
    } catch (_) {
      return null;
    }
  }

  init(rootDir) {
    if (this.isInitialized) return;
    const config = getConfig();
    if (!config.FIM_ENABLED) {
      logger.info('FileMonitor', 'FIM is disabled in configuration.');
      return;
    }

    const testDir = path.resolve(rootDir, 'test_monitor_dir');
    fs.mkdirSync(testDir, { recursive: true });

    // Seed test files for educational demonstration
    const sample1 = path.join(testDir, 'authorized_service.conf');
    const sample2 = path.join(testDir, 'security_policy.txt');
    if (!fs.existsSync(sample1)) {
      fs.writeFileSync(sample1, '# NETWATCH Sample Monitored File\nALLOW_MONITORING=TRUE\n', 'utf8');
    }
    if (!fs.existsSync(sample2)) {
      fs.writeFileSync(sample2, 'Defensive Security Policy: Authorized Telemetry Only.\n', 'utf8');
    }

    const dirs = Array.isArray(config.FIM_DIRECTORIES) ? config.FIM_DIRECTORIES : [config.FIM_DIRECTORIES];
    for (const dir of dirs) {
      if (dir) {
        const resolved = path.isAbsolute(dir) ? dir : path.resolve(rootDir, dir);
        this.addDirectory(resolved);
      }
    }

    this.isInitialized = true;
    logger.info('FileMonitor', `FIM initialized with ${this.monitoredDirectories.size} monitored directory(ies).`);
  }

  addDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    this.monitoredDirectories.add(dirPath);
    this.scanDirectory(dirPath, false); // initial index without alerting

    // Setup native watcher
    try {
      if (this.watchers.has(dirPath)) {
        this.watchers.get(dirPath).close();
      }
      const watcher = fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
        if (!filename) return;
        const fullPath = path.join(dirPath, filename);
        this.handleFileChange(eventType, fullPath, filename);
      });
      this.watchers.set(dirPath, watcher);
    } catch (err) {
      logger.warn('FileMonitor', `Native filesystem watcher fallback for ${dirPath}: ${err.message}`);
    }
  }

  removeDirectory(dirPath) {
    this.monitoredDirectories.delete(dirPath);
    if (this.watchers.has(dirPath)) {
      this.watchers.get(dirPath).close();
      this.watchers.delete(dirPath);
    }
  }

  scanDirectory(dirPath, triggerAlerts = true) {
    if (!fs.existsSync(dirPath)) return;
    try {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        if (item.isDirectory()) {
          this.scanDirectory(fullPath, triggerAlerts);
        } else if (item.isFile()) {
          const hash = this.computeHash(fullPath);
          const stat = fs.statSync(fullPath);
          const prev = this.fileHashMap.get(fullPath);

          if (!prev) {
            this.fileHashMap.set(fullPath, { hash, size: stat.size, mtime: stat.mtimeMs });
            if (triggerAlerts) {
              this.recordEvent({
                filename: item.name,
                path: fullPath,
                event: 'CREATED',
                sha256: hash,
                previousHash: null
              });
            }
          } else if (prev.hash !== hash) {
            const oldHash = prev.hash;
            this.fileHashMap.set(fullPath, { hash, size: stat.size, mtime: stat.mtimeMs });
            if (triggerAlerts) {
              this.recordEvent({
                filename: item.name,
                path: fullPath,
                event: 'MODIFIED',
                sha256: hash,
                previousHash: oldHash
              });
            }
          }
        }
      }
    } catch (e) {
      logger.error('FileMonitor', `Error scanning directory ${dirPath}: ${e.message}`);
    }
  }

  handleFileChange(fsEventType, fullPath, filename) {
    setTimeout(() => {
      const exists = fs.existsSync(fullPath);
      const prev = this.fileHashMap.get(fullPath);

      if (!exists && prev) {
        // File Deleted
        this.fileHashMap.delete(fullPath);
        this.recordEvent({
          filename,
          path: fullPath,
          event: 'DELETED',
          sha256: prev.hash,
          previousHash: prev.hash
        });
      } else if (exists && fs.statSync(fullPath).isFile()) {
        const hash = this.computeHash(fullPath);
        const stat = fs.statSync(fullPath);

        if (!prev) {
          // File Created
          this.fileHashMap.set(fullPath, { hash, size: stat.size, mtime: stat.mtimeMs });
          this.recordEvent({
            filename,
            path: fullPath,
            event: 'CREATED',
            sha256: hash,
            previousHash: null
          });
        } else if (prev.hash !== hash) {
          // File Modified
          const oldHash = prev.hash;
          this.fileHashMap.set(fullPath, { hash, size: stat.size, mtime: stat.mtimeMs });
          this.recordEvent({
            filename,
            path: fullPath,
            event: 'MODIFIED',
            sha256: hash,
            previousHash: oldHash
          });
        }
      }
    }, 200);
  }

  recordEvent({ filename, path: fpath, event, sha256, previousHash = null }) {
    const eventObj = {
      id: `FIM-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      filename,
      path: fpath,
      event,
      sha256: sha256 || 'N/A',
      previousHash: previousHash || 'N/A'
    };

    this.events.unshift(eventObj);
    if (this.events.length > this.maxEvents) {
      this.events.pop();
    }

    logger.info('FileMonitor', `FIM Event [${event}]: ${filename} (Hash: ${sha256 ? sha256.substring(0, 12) + '...' : 'N/A'})`);

    // Emit alert for critical file modification or deletion
    alertEngine.createAlert({
      type: `FILE_${event}`,
      severity: event === 'DELETED' ? 'MEDIUM' : event === 'MODIFIED' ? 'LOW' : 'INFO',
      source: `FIM: ${filename}`,
      description: `Defensive file integrity event '${event}' detected in authorized directory.`,
      observedValue: sha256 ? `${sha256.substring(0, 16)}...` : event,
      threshold: 'FILE_UNCHANGED'
    });
  }

  getEvents(limit = 100) {
    return this.events.slice(0, limit);
  }

  getMonitoredDirectories() {
    return Array.from(this.monitoredDirectories).map(dir => ({
      path: dir,
      fileCount: Array.from(this.fileHashMap.keys()).filter(k => k.startsWith(dir)).length,
      status: fs.existsSync(dir) ? 'ACTIVE' : 'PATH_NOT_FOUND'
    }));
  }
}

const fileMonitor = new FileIntegrityMonitor();
module.exports = fileMonitor;

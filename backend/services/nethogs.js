/**
 * NETWATCH — Nethogs Stream Parser & Synthetic Demo Streamer
 * Section 10 & 31: Extracts process-level network bandwidth from nethogs or synthetic demo stream.
 */

const { spawn, execSync } = require('child_process');
const { getConfig } = require('../config');
const { formatBytes, formatSpeed } = require('../utils/system-info');
const logger = require('./log-manager');

class NethogsService {
  constructor() {
    this.nethogsProcess = null;
    this.isLive = false;
    this.isDemoMode = false;
    this.currentProcesses = new Map(); // key -> process data
    this.demoTicker = 0;
  }

  checkNethogsAvailable() {
    try {
      execSync('which nethogs', { stdio: 'ignore' });
      return true;
    } catch (_) {
      return false;
    }
  }

  start() {
    const config = getConfig();
    const isRoot = process.getuid ? process.getuid() === 0 : false;
    const hasNethogs = this.checkNethogsAvailable();

    if (config.DEMO_MODE || !hasNethogs || !isRoot) {
      this.isDemoMode = true;
      this.isLive = false;
      const reason = config.DEMO_MODE ? 'Explicit DEMO_MODE enabled' :
                     !hasNethogs ? 'nethogs not installed' : 'Root permissions required for nethogs packet capture';
      logger.info('NethogsService', `Using synthetic demo engine (${reason}).`);
      return;
    }

    try {
      logger.info('NethogsService', 'Spawning live nethogs process: nethogs -t -d 1');
      // nethogs trace mode: -t -d 1 (tab-separated per-second updates)
      this.nethogsProcess = spawn('nethogs', ['-t', '-d', '1'], {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      this.isLive = true;
      this.isDemoMode = false;

      let buffer = '';
      this.nethogsProcess.stdout.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep last incomplete line

        for (const line of lines) {
          this.parseNethogsLine(line);
        }
      });

      this.nethogsProcess.stderr.on('data', (data) => {
        logger.debug('NethogsStderr', data.toString().trim());
      });

      this.nethogsProcess.on('close', (code) => {
        logger.warn('NethogsService', `Live nethogs exited with code ${code}. Falling back to demo mode.`);
        this.isLive = false;
        this.isDemoMode = true;
      });

      this.nethogsProcess.on('error', (err) => {
        logger.error('NethogsService', `Nethogs spawn error: ${err.message}. Switching to demo mode.`);
        this.isLive = false;
        this.isDemoMode = true;
      });
    } catch (err) {
      logger.error('NethogsService', `Failed to start nethogs: ${err.message}`);
      this.isDemoMode = true;
    }
  }

  parseNethogsLine(line) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('Refreshing:')) return;

    // Expected format: /path/to/proc/PID/UID    sent_KB/s    recv_KB/s
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 3) {
      const procPart = parts[0];
      const sentKbps = parseFloat(parts[1]) || 0;
      const recvKbps = parseFloat(parts[2]) || 0;

      // Extract process name, PID, and User
      const subParts = procPart.split('/');
      let procName = subParts[subParts.length - 1] || 'unknown';
      let pid = 0;
      let user = 'system';

      if (procPart.includes(':')) {
        const tokens = procPart.split(':');
        procName = tokens[0];
      }

      const key = `${procName}-${pid}`;
      const existing = this.currentProcesses.get(key) || {
        name: procName,
        pid,
        user,
        totalBytesSent: 0,
        totalBytesRecv: 0,
        firstSeen: new Date().toISOString()
      };

      existing.download_kbps = recvKbps;
      existing.upload_kbps = sentKbps;
      existing.download_formatted = formatSpeed(recvKbps);
      existing.upload_formatted = formatSpeed(sentKbps);
      existing.totalBytesRecv += recvKbps * 1024;
      existing.totalBytesSent += sentKbps * 1024;
      existing.total_formatted = formatBytes(existing.totalBytesRecv + existing.totalBytesSent);
      existing.lastSeen = new Date().toISOString();
      existing.status = (recvKbps > 0 || sentKbps > 0) ? 'ACTIVE' : 'IDLE';

      this.currentProcesses.set(key, existing);
    }
  }

  getDemoProcesses() {
    this.demoTicker++;
    const t = this.demoTicker;

    // Realistic baseline processes in a Linux SOC / Server environment
    const demoCatalog = [
      { name: 'node (backend/server.js)', pid: 3821, user: 'ubuntu', baseDl: 4200, baseUl: 1100, var: 1500 },
      { name: 'nginx: worker process', pid: 1420, user: 'www-data', baseDl: 2800, baseUl: 3400, var: 800 },
      { name: 'sshd: ubuntu@pts/0', pid: 2104, user: 'ubuntu', baseDl: 120, baseUl: 350, var: 80 },
      { name: 'apt-get update', pid: 4892, user: 'root', baseDl: (t % 20 < 8 ? 8500 : 0), baseUl: 150, var: 500 },
      { name: 'postgres: walwriter', pid: 1102, user: 'postgres', baseDl: 450, baseUl: 820, var: 200 },
      { name: 'curl -s https://api', pid: 5120, user: 'devops', baseDl: (t % 12 < 4 ? 6200 : 0), baseUl: 80, var: 400 },
      { name: 'rsync -avz backup', pid: 6310, user: 'backup-user', baseDl: (t % 30 < 10 ? 12400 : 50), baseUl: 4200, var: 1200 },
      { name: 'systemd-resolved', pid: 645, user: 'systemd-resolve', baseDl: 85, baseUl: 42, var: 20 },
      { name: 'git fetch origin', pid: 7215, user: 'ubuntu', baseDl: (t % 15 < 3 ? 3100 : 0), baseUl: 45, var: 100 }
    ];

    const results = [];
    for (const item of demoCatalog) {
      const wobble = Math.sin(t * 0.4 + item.pid) * item.var;
      const dlKbps = Math.max(0, item.baseDl + wobble);
      const ulKbps = Math.max(0, item.baseUl + (wobble * 0.5));

      const key = `${item.name}-${item.pid}`;
      const existing = this.currentProcesses.get(key) || {
        name: item.name,
        pid: item.pid,
        user: item.user,
        totalBytesSent: 1024 * 1024 * 5,
        totalBytesRecv: 1024 * 1024 * 18,
        firstSeen: new Date(Date.now() - 3600000).toISOString()
      };

      existing.download_kbps = Math.round(dlKbps);
      existing.upload_kbps = Math.round(ulKbps);
      existing.download_formatted = formatSpeed(dlKbps);
      existing.upload_formatted = formatSpeed(ulKbps);
      existing.totalBytesRecv += dlKbps * 1024 * 2;
      existing.totalBytesSent += ulKbps * 1024 * 2;
      existing.total_formatted = formatBytes(existing.totalBytesRecv + existing.totalBytesSent);
      existing.lastSeen = new Date().toISOString();
      existing.status = (dlKbps > 10 || ulKbps > 10) ? 'ACTIVE' : 'IDLE';

      this.currentProcesses.set(key, existing);
      results.push({ ...existing });
    }

    return results.sort((a, b) => (b.download_kbps + b.upload_kbps) - (a.download_kbps + a.upload_kbps));
  }

  getProcesses() {
    if (this.isDemoMode || this.currentProcesses.size === 0) {
      return this.getDemoProcesses();
    }
    return Array.from(this.currentProcesses.values())
      .sort((a, b) => (b.download_kbps + b.upload_kbps) - (a.download_kbps + a.upload_kbps));
  }

  stop() {
    if (this.nethogsProcess) {
      try {
        this.nethogsProcess.kill('SIGTERM');
      } catch (_) {}
      this.nethogsProcess = null;
    }
    this.isLive = false;
  }
}

const nethogsService = new NethogsService();
module.exports = nethogsService;

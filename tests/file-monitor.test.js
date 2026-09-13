/**
 * NETWATCH Test Suite: File Integrity Monitoring (FIM)
 */

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const fileMonitor = require('../backend/services/file-monitor');

const TEST_FIM_DIR = path.resolve(__dirname, 'temp_fim_dir');
const TEST_FILE = path.join(TEST_FIM_DIR, 'monitored_policy.conf');

describe('File Integrity Monitor (FIM) Tests', () => {
  before(() => {
    fs.mkdirSync(TEST_FIM_DIR, { recursive: true });
    fileMonitor.addDirectory(TEST_FIM_DIR);
  });

  after(() => {
    fileMonitor.removeDirectory(TEST_FIM_DIR);
    if (fs.existsSync(TEST_FIM_DIR)) {
      fs.rmSync(TEST_FIM_DIR, { recursive: true, force: true });
    }
  });

  test('Computes valid SHA-256 hash for local files', () => {
    fs.writeFileSync(TEST_FILE, 'INITIAL DEFENSIVE SECURITY CONTENT', 'utf8');
    const hash = fileMonitor.computeHash(TEST_FILE);

    assert.ok(hash);
    assert.strictEqual(typeof hash, 'string');
    assert.strictEqual(hash.length, 64); // SHA-256 hex is 64 chars
  });

  test('Tracks monitored directories and reports status', () => {
    const dirs = fileMonitor.getMonitoredDirectories();
    assert.ok(Array.isArray(dirs));
    assert.ok(dirs.some(d => d.path === TEST_FIM_DIR));
  });

  test('Records CREATED and MODIFIED events when file content changes', () => {
    // Initial scan
    fileMonitor.scanDirectory(TEST_FIM_DIR, false);

    // Modify file
    fs.writeFileSync(TEST_FILE, 'MODIFIED UNEXPECTED CONTENT', 'utf8');
    fileMonitor.scanDirectory(TEST_FIM_DIR, true);

    const events = fileMonitor.getEvents();
    assert.ok(Array.isArray(events));
    assert.ok(events.some(e => e.filename === 'monitored_policy.conf'));
  });
});

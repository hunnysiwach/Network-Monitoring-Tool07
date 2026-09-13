/**
 * NETWATCH Test Suite: CLI Dispatcher
 */

const { test, describe } = require('node:test');
const assert = require('node:assert');
const { execSync } = require('child_process');
const path = require('path');

const CLI_SCRIPT = path.resolve(__dirname, '..', 'cli', 'monitor-ctl.js');

describe('CLI Dispatcher Tests', () => {
  test('CLI help command returns 0 and displays usage', () => {
    const out = execSync(`node "${CLI_SCRIPT}" help`, { encoding: 'utf8' });
    assert.ok(out.includes('NETWATCH'));
    assert.ok(out.includes('monitor-ctl <command>'));
    assert.ok(out.includes('doctor'));
    assert.ok(out.includes('status'));
  });

  test('CLI config command displays and validates configuration', () => {
    const out = execSync(`node "${CLI_SCRIPT}" config`, { encoding: 'utf8' });
    assert.ok(out.includes('ACTIVE CONFIGURATION'));
    assert.ok(out.includes('DOWNLOAD_THRESHOLD_MBPS'));
  });

  test('CLI doctor command executes diagnostic checks', () => {
    const out = execSync(`node "${CLI_SCRIPT}" doctor`, { encoding: 'utf8' });
    assert.ok(out.includes('NETWATCH DOCTOR'));
    assert.ok(out.includes('Node.js Runtime'));
  });
});

/**
 * NETWATCH Test Suite: Configuration Validation
 */

const { test, describe } = require('node:test');
const assert = require('node:assert');
const { validateConfig, DEFAULT_CONFIG } = require('../backend/config');

describe('Configuration Validation Tests', () => {
  test('Valid default configuration passes validation', () => {
    const res = validateConfig(DEFAULT_CONFIG);
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.errors.length, 0);
  });

  test('Rejects negative or zero download threshold', () => {
    const invalidConfig = { ...DEFAULT_CONFIG, DOWNLOAD_THRESHOLD_MBPS: -10 };
    const res = validateConfig(invalidConfig);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.errors.some(e => e.includes('DOWNLOAD_THRESHOLD_MBPS')));
  });

  test('Rejects non-numeric upload threshold', () => {
    const invalidConfig = { ...DEFAULT_CONFIG, UPLOAD_THRESHOLD_MBPS: 'invalid' };
    const res = validateConfig(invalidConfig);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.errors.some(e => e.includes('UPLOAD_THRESHOLD_MBPS')));
  });

  test('Rejects invalid port number out of range', () => {
    const invalidConfig = { ...DEFAULT_CONFIG, PORT: 80 }; // < 1024 unprivileged
    const res = validateConfig(invalidConfig);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.errors.some(e => e.includes('PORT')));
  });

  test('Rejects invalid monitoring interval (< 1s or > 300s)', () => {
    const invalidConfig = { ...DEFAULT_CONFIG, MONITORING_INTERVAL_SECONDS: 0 };
    const res = validateConfig(invalidConfig);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.errors.some(e => e.includes('MONITORING_INTERVAL_SECONDS')));
  });
});

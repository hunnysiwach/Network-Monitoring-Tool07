/**
 * NETWATCH Test Suite: Alert Engine & Threshold Evaluation
 */

const { test, describe } = require('node:test');
const assert = require('node:assert');
const alertEngine = require('../backend/services/alerts');

describe('Alert Engine Tests', () => {
  test('Creates alert with proper severity and metadata', () => {
    const alert = alertEngine.createAlert({
      type: 'HIGH_DOWNLOAD',
      severity: 'HIGH',
      description: 'Test high download alert',
      source: 'node (PID: 3821)',
      observedValue: '75.2 MB/s',
      threshold: '50 MB/s'
    });

    assert.ok(alert);
    assert.strictEqual(alert.type, 'HIGH_DOWNLOAD');
    assert.strictEqual(alert.severity, 'HIGH');
    assert.strictEqual(alert.status, 'ACTIVE');
  });

  test('Resolves active alert correctly', () => {
    const alert = alertEngine.createAlert({
      type: 'HIGH_UPLOAD',
      severity: 'MEDIUM',
      description: 'Test high upload alert',
      source: 'nginx',
      observedValue: '25 MB/s',
      threshold: '20 MB/s'
    });

    if (alert) {
      const resolved = alertEngine.resolveAlert(alert.id);
      assert.strictEqual(resolved.status, 'RESOLVED');
      assert.ok(resolved.resolvedAt);
    }
  });

  test('Filters alerts by severity and status', () => {
    const highAlerts = alertEngine.getAlerts({ severity: 'HIGH' });
    assert.ok(Array.isArray(highAlerts));
    assert.ok(highAlerts.every(a => a.severity === 'HIGH'));
  });

  test('Dismisses alert and removes it from list', () => {
    const alert = alertEngine.createAlert({
      type: 'NETWORK_SPIKE',
      severity: 'LOW',
      description: 'Test spike alert'
    });

    if (alert) {
      const dismissed = alertEngine.dismissAlert(alert.id);
      assert.ok(dismissed);
      const remaining = alertEngine.getAlerts().find(a => a.id === alert.id);
      assert.strictEqual(remaining, undefined);
    }
  });
});

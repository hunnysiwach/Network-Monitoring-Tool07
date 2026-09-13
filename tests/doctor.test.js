/**
 * NETWATCH Test Suite: Automated Doctor Diagnostics
 */

const { test, describe } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { runDoctorChecks } = require('../backend/services/doctor-service');

describe('Automated Doctor Diagnostics Tests', () => {
  test('Doctor suite executes and returns comprehensive diagnostic report', async () => {
    const rootDir = path.resolve(__dirname, '..');
    const report = await runDoctorChecks(rootDir);

    assert.ok(report);
    assert.ok(report.timestamp);
    assert.ok(['HEALTHY', 'OPERATIONAL_WITH_WARNINGS', 'CRITICAL'].includes(report.overallHealth));
    assert.ok(report.summary.total > 0);
    assert.ok(Array.isArray(report.dependencies));
    assert.ok(Array.isArray(report.integrity));
    assert.ok(Array.isArray(report.storage));
    assert.ok(Array.isArray(report.service));
    assert.ok(Array.isArray(report.recommendations));
  });

  test('Doctor verifies Node.js runtime availability', async () => {
    const rootDir = path.resolve(__dirname, '..');
    const report = await runDoctorChecks(rootDir);
    const nodeCheck = report.dependencies.find(d => d.name === 'Node.js Runtime');

    assert.ok(nodeCheck);
    assert.strictEqual(nodeCheck.status, 'PASS');
  });

  test('Doctor validates directory write permissions', async () => {
    const rootDir = path.resolve(__dirname, '..');
    const report = await runDoctorChecks(rootDir);
    const dataDirCheck = report.storage.find(s => s.name.includes('Data'));

    assert.ok(dataDirCheck);
    assert.strictEqual(dataDirCheck.status, 'PASS');
  });
});

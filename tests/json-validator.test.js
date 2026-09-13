/**
 * NETWATCH Test Suite: JSON Integrity & Atomic Writer
 */

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const jsonValidator = require('../backend/services/json-validator');
const { atomicWriteJson } = require('../backend/utils/atomic-writer');

const TEST_DIR = path.resolve(__dirname, 'temp_test_data');
const TEST_JSON_FILE = path.join(TEST_DIR, 'test_traffic.json');

describe('JSON Integrity & Atomic Writer Tests', () => {
  before(() => {
    fs.mkdirSync(TEST_DIR, { recursive: true });
  });

  after(() => {
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  test('Atomic write creates valid JSON on disk', () => {
    const payload = {
      timestamp: new Date().toISOString(),
      interfaces: [],
      processes: [{ name: 'node', pid: 1234, user: 'ubuntu', download_kbps: 100, upload_kbps: 50 }],
      users: [{ username: 'ubuntu', download_kbps: 100, upload_kbps: 50 }],
      totals: { download_mbps: 0.8, upload_mbps: 0.4 }
    };

    atomicWriteJson(TEST_JSON_FILE, payload);
    assert.strictEqual(fs.existsSync(TEST_JSON_FILE), true);

    const validation = jsonValidator.validateFile(TEST_JSON_FILE);
    assert.strictEqual(validation.isValid, true);
    assert.strictEqual(validation.error, null);
  });

  test('Rejects and alerts on corrupted JSON content', () => {
    // Write corrupted non-JSON data
    fs.writeFileSync(TEST_JSON_FILE, '{ corrupted json : missing bracket ...', 'utf8');

    const validation = jsonValidator.validateFile(TEST_JSON_FILE);
    assert.strictEqual(validation.isValid, false);
    assert.ok(validation.error);
  });

  test('Safe recovery restores corrupted files cleanly', () => {
    const recovered = jsonValidator.recoverCorruptedFile(TEST_JSON_FILE);
    assert.strictEqual(recovered, true);

    const validation = jsonValidator.validateFile(TEST_JSON_FILE);
    assert.strictEqual(validation.isValid, true);
  });
});

/**
 * NETWATCH Test Suite: Express REST API Endpoints
 */

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const express = require('express');
const cors = require('cors');
const apiRoutes = require('../backend/routes/api');
const collector = require('../backend/services/collector');

let server;
const PORT = 4099;
const BASE_URL = `http://localhost:${PORT}/api`;

function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(u, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

describe('Express REST API Tests', () => {
  before(() => {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api', apiRoutes);
    collector.start();

    return new Promise((resolve) => {
      server = app.listen(PORT, 'localhost', resolve);
    });
  });

  after(() => {
    collector.stop();
    if (server) {
      server.close();
    }
  });

  test('GET /api/health returns valid health and status payload', async () => {
    const res = await fetchJson(`${BASE_URL}/health`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'HEALTHY');
    assert.ok(res.body.jsonValidation);
  });

  test('GET /api/dashboard returns complete SOC telemetry', async () => {
    const res = await fetchJson(`${BASE_URL}/dashboard`);
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.telemetry);
    assert.ok(res.body.alertCounts);
    assert.ok(res.body.jsonStatus);
    assert.ok(res.body.system);
  });

  test('GET /api/network returns interface list', async () => {
    const res = await fetchJson(`${BASE_URL}/network`);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.interfaces));
  });

  test('GET /api/processes returns process list', async () => {
    const res = await fetchJson(`${BASE_URL}/processes`);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.processes));
  });

  test('GET /api/users returns aggregated user traffic', async () => {
    const res = await fetchJson(`${BASE_URL}/users`);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.users));
  });

  test('GET /api/alerts returns alerts and counts', async () => {
    const res = await fetchJson(`${BASE_URL}/alerts`);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.alerts));
    assert.ok(res.body.counts);
  });

  test('GET /api/config returns active configuration', async () => {
    const res = await fetchJson(`${BASE_URL}/config`);
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.DOWNLOAD_THRESHOLD_MBPS);
    assert.ok(res.body.UPLOAD_THRESHOLD_MBPS);
  });
});

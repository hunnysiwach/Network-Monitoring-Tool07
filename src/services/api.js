/**
 * NETWATCH — Frontend REST API Client Service
 */

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || errBody.message || `HTTP ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Dashboard & Health
  getHealth: () => request('/health'),
  getDashboard: (range = '15m') => request(`/dashboard?range=${range}`),

  // Network & Traffic
  getNetwork: () => request('/network'),
  getNetworkInterfaces: () => request('/network/interfaces'),
  getNetworkTraffic: (range = '15m') => request(`/network/traffic?range=${range}`),

  // Processes & Users
  getProcesses: () => request('/processes'),
  getUsers: () => request('/users'),

  // History & Export
  getHistory: (period = '7d') => request(`/history?period=${period}`),
  getHistoryExportUrl: (period = '7d', format = 'json') => `${API_BASE}/history/export?period=${period}&format=${format}`,

  // Alerts
  getAlerts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/alerts${query ? `?${query}` : ''}`);
  },
  resolveAlert: (id) => request(`/alerts/${id}/resolve`, { method: 'POST' }),
  dismissAlert: (id) => request(`/alerts/${id}/dismiss`, { method: 'POST' }),

  // File Integrity Monitoring (FIM)
  getFileEvents: (limit = 50) => request(`/files/events?limit=${limit}`),
  addDirectory: (path) => request('/files/directories', { method: 'POST', body: JSON.stringify({ path }) }),
  removeDirectory: (path) => request('/files/directories', { method: 'DELETE', body: JSON.stringify({ path }) }),

  // Service Management
  getServiceStatus: () => request('/service/status'),
  startService: () => request('/monitor/start', { method: 'POST' }),
  stopService: () => request('/monitor/stop', { method: 'POST' }),
  restartService: () => request('/monitor/restart', { method: 'POST' }),

  // Doctor Diagnostics
  getDoctorReport: () => request('/doctor'),

  // Configuration
  getConfig: () => request('/config'),
  updateConfig: (configData) => request('/config', { method: 'PUT', body: JSON.stringify(configData) }),

  // Logs
  getLogs: (limit = 100, level = 'ALL') => request(`/logs?limit=${limit}&level=${level}`),

  // Reports
  getReportSummary: (period = 'daily') => request(`/reports/summary?period=${period}`),

  // Demo Mode Toggle
  toggleDemoMode: () => request('/demo/toggle', { method: 'POST' })
};

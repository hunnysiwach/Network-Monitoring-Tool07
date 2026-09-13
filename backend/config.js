/**
 * NETWATCH — Configuration Manager
 * Handles loading, strict schema validation, defaults, and persisting configuration.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CONFIG_FILE = path.join(ROOT_DIR, 'config', 'netwatch.conf');
const DEFAULT_CONFIG_FILE = path.join(ROOT_DIR, 'config', 'default.json');

const DEFAULT_CONFIG = {
  DOWNLOAD_THRESHOLD_MBPS: 50,
  UPLOAD_THRESHOLD_MBPS: 20,
  MONITORING_INTERVAL_SECONDS: 2,
  PORT: 4000,
  HOST: '0.0.0.0',
  DATA_DIR: 'data',
  JSON_OUTPUT_FILE: 'data/traffic.json',
  LOG_DIR: 'logs',
  LOG_FILE: 'logs/netwatch.log',
  LOG_RETENTION_DAYS: 7,
  LOG_MAX_SIZE_MB: 10,
  LOG_LEVEL: 'INFO',
  FIM_ENABLED: true,
  FIM_DIRECTORIES: ['test_monitor_dir'],
  ALERTS_ENABLED: true,
  ALERT_SPIKE_PERCENTAGE: 150,
  DEMO_MODE: false
};

function parseConfigFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const result = {};
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...vals] = trimmed.split('=');
      if (key && vals.length > 0) {
        let val = vals.join('=').trim();
        if (val === 'true') val = true;
        else if (val === 'false') val = false;
        else if (!isNaN(Number(val)) && val !== '') val = Number(val);
        else if (val.includes(',') && !val.startsWith('{')) {
          val = val.split(',').map(s => s.trim()).filter(Boolean);
        }
        result[key.trim()] = val;
      }
    }
  }
  return result;
}

function validateConfig(cfg) {
  const errors = [];

  if (typeof cfg.DOWNLOAD_THRESHOLD_MBPS !== 'number' || cfg.DOWNLOAD_THRESHOLD_MBPS <= 0 || cfg.DOWNLOAD_THRESHOLD_MBPS > 10000) {
    errors.push('DOWNLOAD_THRESHOLD_MBPS must be a positive number between 1 and 10000');
  }

  if (typeof cfg.UPLOAD_THRESHOLD_MBPS !== 'number' || cfg.UPLOAD_THRESHOLD_MBPS <= 0 || cfg.UPLOAD_THRESHOLD_MBPS > 10000) {
    errors.push('UPLOAD_THRESHOLD_MBPS must be a positive number between 1 and 10000');
  }

  if (typeof cfg.MONITORING_INTERVAL_SECONDS !== 'number' || cfg.MONITORING_INTERVAL_SECONDS < 1 || cfg.MONITORING_INTERVAL_SECONDS > 300) {
    errors.push('MONITORING_INTERVAL_SECONDS must be between 1 and 300 seconds');
  }

  if (typeof cfg.PORT !== 'number' || cfg.PORT < 1024 || cfg.PORT > 65535) {
    errors.push('PORT must be a valid port number between 1024 and 65535');
  }

  if (typeof cfg.LOG_RETENTION_DAYS !== 'number' || cfg.LOG_RETENTION_DAYS < 1 || cfg.LOG_RETENTION_DAYS > 365) {
    errors.push('LOG_RETENTION_DAYS must be between 1 and 365 days');
  }

  if (typeof cfg.LOG_MAX_SIZE_MB !== 'number' || cfg.LOG_MAX_SIZE_MB < 1 || cfg.LOG_MAX_SIZE_MB > 1000) {
    errors.push('LOG_MAX_SIZE_MB must be between 1 and 1000 MB');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

let activeConfig = null;

function getConfig() {
  if (activeConfig) return activeConfig;

  let defaults = { ...DEFAULT_CONFIG };
  if (fs.existsSync(DEFAULT_CONFIG_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(DEFAULT_CONFIG_FILE, 'utf8'));
      defaults = { ...defaults, ...parsed };
    } catch (_) {}
  }

  const fileConfig = parseConfigFile(CONFIG_FILE);

  // Environment variable overrides
  const envConfig = {};
  if (process.env.DOWNLOAD_THRESHOLD_MBPS) envConfig.DOWNLOAD_THRESHOLD_MBPS = Number(process.env.DOWNLOAD_THRESHOLD_MBPS);
  if (process.env.UPLOAD_THRESHOLD_MBPS) envConfig.UPLOAD_THRESHOLD_MBPS = Number(process.env.UPLOAD_THRESHOLD_MBPS);
  if (process.env.PORT) envConfig.PORT = Number(process.env.PORT);
  if (process.env.DEMO_MODE !== undefined) envConfig.DEMO_MODE = process.env.DEMO_MODE === 'true';

  activeConfig = {
    ...defaults,
    ...fileConfig,
    ...envConfig
  };

  // Ensure directories are arrays
  if (typeof activeConfig.FIM_DIRECTORIES === 'string') {
    activeConfig.FIM_DIRECTORIES = activeConfig.FIM_DIRECTORIES.split(',').map(s => s.trim()).filter(Boolean);
  }

  const validation = validateConfig(activeConfig);
  if (!validation.isValid) {
    console.error('[CRITICAL] Invalid configuration detected:', validation.errors);
  }

  return activeConfig;
}

function updateConfig(newValues) {
  const current = getConfig();
  const merged = { ...current, ...newValues };
  const validation = validateConfig(merged);

  if (!validation.isValid) {
    return { success: false, errors: validation.errors };
  }

  activeConfig = merged;

  // Persist to config/netwatch.conf
  try {
    const lines = [
      '# ==============================================================================',
      '# NETWATCH CONFIGURATION FILE (Auto-updated)',
      '# ==============================================================================',
      `DOWNLOAD_THRESHOLD_MBPS=${activeConfig.DOWNLOAD_THRESHOLD_MBPS}`,
      `UPLOAD_THRESHOLD_MBPS=${activeConfig.UPLOAD_THRESHOLD_MBPS}`,
      `MONITORING_INTERVAL_SECONDS=${activeConfig.MONITORING_INTERVAL_SECONDS}`,
      `PORT=${activeConfig.PORT}`,
      `HOST=${activeConfig.HOST || '0.0.0.0'}`,
      `DATA_DIR=${activeConfig.DATA_DIR}`,
      `JSON_OUTPUT_FILE=${activeConfig.JSON_OUTPUT_FILE}`,
      `LOG_DIR=${activeConfig.LOG_DIR}`,
      `LOG_FILE=${activeConfig.LOG_FILE}`,
      `LOG_RETENTION_DAYS=${activeConfig.LOG_RETENTION_DAYS}`,
      `LOG_MAX_SIZE_MB=${activeConfig.LOG_MAX_SIZE_MB}`,
      `LOG_LEVEL=${activeConfig.LOG_LEVEL}`,
      `FIM_ENABLED=${activeConfig.FIM_ENABLED}`,
      `FIM_DIRECTORIES=${Array.isArray(activeConfig.FIM_DIRECTORIES) ? activeConfig.FIM_DIRECTORIES.join(',') : activeConfig.FIM_DIRECTORIES}`,
      `ALERTS_ENABLED=${activeConfig.ALERTS_ENABLED}`,
      `ALERT_SPIKE_PERCENTAGE=${activeConfig.ALERT_SPIKE_PERCENTAGE}`,
      `DEMO_MODE=${activeConfig.DEMO_MODE}`
    ];
    fs.writeFileSync(CONFIG_FILE, lines.join('\n') + '\n', 'utf8');
    return { success: true, config: activeConfig };
  } catch (err) {
    return { success: false, errors: [`Failed to save config: ${err.message}`] };
  }
}

module.exports = {
  getConfig,
  updateConfig,
  validateConfig,
  DEFAULT_CONFIG
};

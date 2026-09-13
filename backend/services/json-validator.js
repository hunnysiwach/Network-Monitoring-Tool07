/**
 * NETWATCH — JSON Integrity Validator & Safe Recovery
 * Objective 2 & Section 17: Validates JSON with jq/parser, prevents silent corruption, and handles safe recovery.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { atomicWriteJson } = require('../utils/atomic-writer');
const logger = require('./log-manager');

class JsonValidator {
  constructor() {
    this.hasJq = this.detectJq();
    this.lastValidationStatus = {
      isValid: true,
      lastChecked: new Date().toISOString(),
      method: this.hasJq ? 'jq' : 'native-parser',
      error: null
    };
  }

  detectJq() {
    try {
      execSync('jq --version', { stdio: 'ignore' });
      return true;
    } catch (_) {
      return false;
    }
  }

  validateFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return {
        isValid: false,
        error: 'File does not exist',
        lastChecked: new Date().toISOString()
      };
    }

    // 1. If jq available, run 'jq empty filePath'
    if (this.hasJq) {
      try {
        execSync(`jq empty "${filePath}"`, { stdio: 'pipe' });
      } catch (jqErr) {
        const errMsg = `jq validation failed: ${jqErr.stderr ? jqErr.stderr.toString() : jqErr.message}`;
        this.lastValidationStatus = {
          isValid: false,
          lastChecked: new Date().toISOString(),
          method: 'jq',
          error: errMsg
        };
        return this.lastValidationStatus;
      }
    }

    // 2. Read and parse with JavaScript JSON parser + schema checks
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw);

      // Schema requirements: timestamp, totals, interfaces or processes
      if (!parsed.timestamp || typeof parsed.totals !== 'object') {
        throw new Error('Schema validation failed: missing timestamp or totals object');
      }

      this.lastValidationStatus = {
        isValid: true,
        lastChecked: new Date().toISOString(),
        method: this.hasJq ? 'jq + schema' : 'native + schema',
        error: null
      };
      return this.lastValidationStatus;
    } catch (parseErr) {
      const errMsg = `JSON Parse/Schema error: ${parseErr.message}`;
      this.lastValidationStatus = {
        isValid: false,
        lastChecked: new Date().toISOString(),
        method: 'native-parser',
        error: errMsg
      };
      return this.lastValidationStatus;
    }
  }

  safeWrite(filePath, data, alertEngine = null) {
    try {
      atomicWriteJson(filePath, data);
      const validation = this.validateFile(filePath);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }
      return true;
    } catch (err) {
      logger.error('JsonValidator', `Corrupted JSON write prevented: ${err.message}`);
      if (alertEngine) {
        alertEngine.createAlert({
          type: 'JSON_CORRUPTION',
          severity: 'HIGH',
          source: 'JsonValidator',
          description: `Detected potential JSON data corruption: ${err.message}`,
          observedValue: 'INVALID_JSON',
          threshold: 'VALID_JSON'
        });
      }
      this.recoverCorruptedFile(filePath);
      return false;
    }
  }

  recoverCorruptedFile(filePath) {
    const backupPath = `${filePath}.bak`;
    const corruptedDump = `${filePath}.corrupted.${Date.now()}`;

    logger.warn('JsonValidator', `Initiating safe recovery for ${filePath}...`);

    // Preserve corrupted file for forensics
    if (fs.existsSync(filePath)) {
      try {
        fs.copyFileSync(filePath, corruptedDump);
        logger.info('JsonValidator', `Preserved corrupted file to ${corruptedDump}`);
      } catch (_) {}
    }

    // Attempt backup recovery
    if (fs.existsSync(backupPath)) {
      try {
        const backupData = fs.readFileSync(backupPath, 'utf8');
        JSON.parse(backupData); // verify backup
        fs.copyFileSync(backupPath, filePath);
        logger.info('JsonValidator', `Successfully recovered ${filePath} from backup ${backupPath}`);
        return true;
      } catch (bErr) {
        logger.error('JsonValidator', `Backup was also unreadable: ${bErr.message}`);
      }
    }

    // Clean initialization fallback
    const fallbackData = {
      timestamp: new Date().toISOString(),
      status: 'RECOVERED_CLEAN_STATE',
      interfaces: [],
      processes: [],
      users: [],
      totals: { download_mbps: 0.0, upload_mbps: 0.0, total_download_bytes: 0, total_upload_bytes: 0 }
    };
    atomicWriteJson(filePath, fallbackData);
    logger.info('JsonValidator', `Initialized clean state for ${filePath}`);
    return true;
  }

  getStatus() {
    return this.lastValidationStatus;
  }
}

const jsonValidator = new JsonValidator();
module.exports = jsonValidator;

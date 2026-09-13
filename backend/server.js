/**
 * NETWATCH — Backend Application Server
 * Entry point: Bootstraps collector, FIM, log manager, and Express REST endpoints.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { getConfig } = require('./config');
const apiRoutes = require('./routes/api');
const collector = require('./services/collector');
const fileMonitor = require('./services/file-monitor');
const logger = require('./services/log-manager');

const app = express();
const config = getConfig();
const ROOT_DIR = path.resolve(__dirname, '..');
const PID_FILE = path.join(ROOT_DIR, 'data', 'netwatch.pid');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  if (!req.url.startsWith('/api/dashboard') && !req.url.startsWith('/api/health')) {
    logger.debug('HTTP', `${req.method} ${req.url}`);
  }
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Static frontend build serving (if built)
const frontendDist = path.join(ROOT_DIR, 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    if (!req.url.startsWith('/api')) {
      res.sendFile(path.join(frontendDist, 'index.html'));
    }
  });
}

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Express', `Unhandled error: ${err.message}`);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Initialize Monitoring Engine & Subsystems
const PORT = config.PORT || 4000;
const HOST = config.HOST || '0.0.0.0';

function bootstrap() {
  logger.info('Server', `Initializing NETWATCH Daemon (PID: ${process.pid})...`);

  // Ensure runtime directories
  fs.mkdirSync(path.join(ROOT_DIR, 'data'), { recursive: true });
  fs.mkdirSync(path.join(ROOT_DIR, 'logs'), { recursive: true });

  // Record PID file
  fs.writeFileSync(PID_FILE, String(process.pid), 'utf8');

  // Start FIM and Collector
  fileMonitor.init(ROOT_DIR);
  collector.start(ROOT_DIR);

  const server = app.listen(PORT, HOST, () => {
    logger.info('Server', `NETWATCH Web Dashboard & REST API active at http://localhost:${PORT}`);
    logger.info('Server', `System initialized. Authorized defensive monitoring active.`);
  });

  // Graceful Shutdown & Trap Handlers
  const handleShutdown = (signal) => {
    logger.warn('Server', `Received ${signal}. Performing clean shutdown...`);
    collector.stop();

    if (fs.existsSync(PID_FILE)) {
      try {
        fs.unlinkSync(PID_FILE);
      } catch (_) {}
    }

    server.close(() => {
      logger.info('Server', 'NETWATCH daemon stopped cleanly.');
      process.exit(0);
    });

    setTimeout(() => {
      process.exit(0);
    }, 3000);
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGHUP', () => {
    logger.info('Server', 'Received SIGHUP, reloading configuration...');
    getConfig();
  });
}

if (require.main === module) {
  bootstrap();
}

module.exports = { app, bootstrap };

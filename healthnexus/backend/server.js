const fs = require('fs');
const path = require('path');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const seedDatabase = require('./config/seedDatabase');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
const clientBuildPath = path.resolve(__dirname, '../frontend/build');
let server;

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const dbStateLabels = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.length === 0 ||
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error('Request origin is not allowed by CORS.'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'HealthNexus API is running.',
    database: dbStateLabels[mongoose.connection.readyState] || 'unknown',
  });
});

app.get('/api/ready', (req, res) => {
  const isReady = mongoose.connection.readyState === 1;

  return res.status(isReady ? 200 : 503).json({
    success: isReady,
    database: dbStateLabels[mongoose.connection.readyState] || 'unknown',
  });
});

app.use('/api/site', require('./routes/siteRoutes'));

if (process.env.NODE_ENV === 'production' && fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }

    return res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

app.use((req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  console.error('[HealthNexus API Error]', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

const startServer = async () => {
  try {
    await connectDB();
    const shouldSeedOnStart = process.env.SEED_ON_START === 'true';

    if (shouldSeedOnStart) {
      const seedResult = await seedDatabase();

      if (seedResult.seeded) {
        console.log('Database seeded with starter content.');
      }
    }

    const port = process.env.PORT || 5000;
    server = app.listen(port, () => {
      console.log(`HealthNexus server running on port ${port}`);
    });
  } catch (error) {
    console.error(`Server startup error: ${error.message}`);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down HealthNexus backend.`);

  if (server) {
    await new Promise((resolve) => {
      server.close(resolve);
    });
  }

  await mongoose.disconnect().catch(() => null);
  process.exit(0);
};

process.on('SIGINT', () => {
  shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});

startServer();

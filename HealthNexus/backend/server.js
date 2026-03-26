const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');

const authRoutes = require('./authRoutes');
const connectDB = require('./db');
const portalRoutes = require('./portalRoutes');
const { provisionAccessUsers, seedDatabase } = require('./seed/seedDatabase');
const siteRoutes = require('./siteRoutes');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const frontendUrl = process.env.FRONTEND_URL?.replace(/\/+$/, '');

if (!frontendUrl) {
  console.warn('FRONTEND_URL is not set. Allowing all origins temporarily.');
}

const frontendHostname = frontendUrl ? new URL(frontendUrl).hostname : '';
const vercelPreviewPattern = frontendHostname.endsWith('.vercel.app')
  ? new RegExp(
      `^${frontendHostname
        .replace('.vercel.app', '')
        .replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}(?:-[a-z0-9-]+)?\\.vercel\\.app$`,
      'i'
    )
  : null;

const corsOptions = {
  origin(origin, callback) {
    if (!origin || !frontendUrl) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/+$/, '');

    if (normalizedOrigin === frontendUrl) {
      return callback(null, true);
    }

    if (vercelPreviewPattern && vercelPreviewPattern.test(new URL(normalizedOrigin).hostname)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/api/ready', (req, res) => {
  res.json({
    status: 'ready',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api', siteRoutes);

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

const startServer = async () => {
  try {
    await connectDB();

    if (process.env.SEED_ON_START === 'true') {
      await seedDatabase();
    }

    const provisioning = await provisionAccessUsers();

    if (Object.values(provisioning).some((value) => value > 0)) {
      console.log(`Access users provisioned: ${JSON.stringify(provisioning)}`);
    }

    const port = process.env.PORT || 5000;

    app.listen(port, () => {
      console.log(`CareVista backend running on port ${port}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();

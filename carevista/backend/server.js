const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');

const connectDB = require('./db');
const siteRoutes = require('./siteRoutes');
const seedDatabase = require('./seed/seedDatabase');

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// --------------------
// ✅ CORS CONFIG (FIXED)
// --------------------
const FRONTEND_URL = process.env.FRONTEND_URL?.replace(/\/+$/, '');

if (!FRONTEND_URL) {
  console.warn("⚠️ FRONTEND_URL not set. Allowing all origins (temporary).");
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    // Allow exact frontend
    if (origin === FRONTEND_URL) {
      return callback(null, true);
    }

    // Allow all Vercel preview deployments
    if (origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// Handle preflight
app.options('*', cors());

// --------------------
// MIDDLEWARE
// --------------------
app.use(express.json());

// --------------------
// ROUTES
// --------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

app.get('/api/ready', (req, res) => {
  res.json({
    status: 'ready',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// API routes
app.use('/api', siteRoutes);

// --------------------
// ERROR HANDLER
// --------------------
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err.message);
  res.status(500).json({
    error: err.message || 'Internal Server Error',
  });
});

// --------------------
// START SERVER
// --------------------
const startServer = async () => {
  try {
    await connectDB();

    if (process.env.SEED_ON_START === 'true') {
      await seedDatabase();
    }

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./db');
const siteRoutes = require('./siteRoutes');
const seedDatabase = require('./seed/seedDatabase');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const frontendUrl = process.env.FRONTEND_URL;

if (!frontendUrl) {
  throw new Error('FRONTEND_URL is required to configure CORS.');
}

const corsOptions = {
  origin: frontendUrl,
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

app.use('/api', siteRoutes);

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const startServer = async () => {
  await connectDB();

  if (process.env.SEED_ON_START === 'true') {
    await seedDatabase();
  }

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`CareVista backend running on port ${port}`);
  });
};

startServer();

const mongoose = require('mongoose');
const path = require('path');
const connectDB = require('./config/db');
const seedDatabase = require('./config/seedDatabase');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const runSeed = async () => {
  try {
    await connectDB();
    const result = await seedDatabase({ force: true });
    console.log('Seed complete:', result);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`Seed error: ${error.message}`);
    await mongoose.disconnect().catch(() => null);
    process.exit(1);
  }
};

module.exports = runSeed;

if (require.main === module) {
  runSeed();
}

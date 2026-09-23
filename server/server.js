import 'dotenv/config';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';

const PORT = process.env.PORT || 5000;

// Check required environment variables
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error('JWT_SECRET is missing or too short.');
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is missing.');
  process.exit(1);
}

// Create Express app
const app = createApp();

// Start server first so Render can detect the port
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API running on port ${PORT}`);
});

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('Could not connect to MongoDB:', error.message);
    process.exit(1);
  });
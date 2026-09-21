import 'dotenv/config';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error('JWT_SECRET is missing or too short. Set a long random value in server/.env');
  process.exit(1);
}
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is missing. Copy server/.env.example to server/.env');
  process.exit(1);
}

const port = process.env.PORT || 5000;

connectDB()
  .then(() => createApp().listen(port, () => console.log(`API running on port ${port}`)))
  .catch((e) => {
    console.error('Could not connect to MongoDB:', e.message);
    process.exit(1);
  });

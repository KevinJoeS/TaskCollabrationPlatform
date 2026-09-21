import express from 'express';
import cors from 'cors';
import auth from './routes/auth.js';
import projects from './routes/projects.js';
import tasks from './routes/tasks.js';
import comments from './routes/comments.js';
import activity from './routes/activity.js';
import notifications from './routes/notifications.js';
import search from './routes/search.js';
import { notFound, errorHandler } from './utils/http.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  // CLIENT_URL may be a comma-separated list, e.g. "http://localhost:5173,https://app.example.com"
  const origins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim());
  app.use(cors({ origin: origins }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/auth', auth);
  app.use('/api/projects', projects);
  app.use('/api/tasks', tasks);
  app.use('/api/comments', comments);
  app.use('/api/activity', activity);
  app.use('/api/notifications', notifications);
  app.use('/api/search', search);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

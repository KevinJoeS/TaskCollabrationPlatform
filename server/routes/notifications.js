import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { listNotifications, markRead, markAllRead } from '../controllers/notificationController.js';
import { asyncHandler as h, validateIdParam } from '../utils/http.js';

const r = Router();
r.use(auth);
r.param('id', validateIdParam('notification'));
r.get('/', h(listNotifications));
r.post('/read-all', h(markAllRead));
r.patch('/:id/read', h(markRead));
export default r;

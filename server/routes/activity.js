import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { listActivity } from '../controllers/activityController.js';
import { asyncHandler as h } from '../utils/http.js';

const r = Router();
r.use(auth);
r.get('/', h(listActivity));
export default r;

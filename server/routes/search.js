import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { search } from '../controllers/searchController.js';
import { asyncHandler as h } from '../utils/http.js';

const r = Router();
r.use(auth);
r.get('/', h(search));
export default r;

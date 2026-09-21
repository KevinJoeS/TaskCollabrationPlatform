import { Router } from 'express';
import { register, login, me, updateProfile, changePassword } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';
import { asyncHandler as h } from '../utils/http.js';

const r = Router();
r.post('/register', h(register));
r.post('/login', h(login));
r.get('/me', auth, h(me));
r.put('/profile', auth, h(updateProfile));
r.put('/password', auth, h(changePassword));
export default r;

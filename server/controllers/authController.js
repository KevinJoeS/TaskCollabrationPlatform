import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { HttpError, str } from '../utils/http.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

export async function register(req, res) {
  const name = str(req.body.name);
  const email = str(req.body.email)?.toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!name || !email || !password) throw new HttpError(400, 'Name, email and password are required');
  if (!EMAIL_RE.test(email)) throw new HttpError(400, 'Enter a valid email address');
  if (password.length < 6) throw new HttpError(400, 'Password must be at least 6 characters');
  if (password.length > 128) throw new HttpError(400, 'Password is too long');
  if (await User.findOne({ email })) throw new HttpError(409, 'Email already registered');
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
  res.status(201).json({ token: sign(user), user });
}

export async function login(req, res) {
  const email = str(req.body.email)?.toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!email || !password) throw new HttpError(400, 'Email and password are required');
  const user = await User.findOne({ email });
  // Same message for unknown email and wrong password so accounts cannot be enumerated.
  if (!user || !(await bcrypt.compare(password, user.password))) throw new HttpError(401, 'Invalid email or password');
  res.json({ token: sign(user), user });
}

export async function me(req, res) {
  res.json({ user: req.user });
}

export async function updateProfile(req, res) {
  const patch = {};
  const name = str(req.body.name);
  if (req.body.name !== undefined) {
    if (!name) throw new HttpError(400, 'Name cannot be empty');
    patch.name = name;
  }
  if (req.body.avatar !== undefined) {
    const avatar = str(req.body.avatar) || '';
    if (avatar && !/^https:\/\//i.test(avatar)) throw new HttpError(400, 'Avatar must be an https:// image link');
    patch.avatar = avatar;
  }
  const user = await User.findByIdAndUpdate(req.user._id, patch, { new: true, runValidators: true });
  res.json({ user });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') throw new HttpError(400, 'Current and new password are required');
  if (newPassword.length < 6) throw new HttpError(400, 'New password must be at least 6 characters');
  const user = await User.findById(req.user._id);
  if (!(await bcrypt.compare(currentPassword, user.password))) throw new HttpError(401, 'Current password is incorrect');
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: 'Password changed' });
}

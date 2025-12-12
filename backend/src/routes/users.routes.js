import bcrypt from "bcrypt";
import express from "express";
import User from "../models/User.js";
import requireAuth from "../middleware/require-auth.js";
const router = express.Router();

/* Create users */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing fields' });
    } 

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: 'Email taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const u = await User.create({ username, email, password: hashedPassword, role });
    res.status(201).json({ id: u._id, username: u.username, email: u.email, role: u.role });
  } catch (e) { next(e); }
});

/* Read users */
router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const list = await User.find().select("-password");
    res.json(list);
  } catch (e) {
    next(e);
  }
});

/* Update users */
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;
    const update = {};
    if (username) update.username = username;
    if (email) update.email = email;
    if (role) update.role = role;
    if (password) {
      const bcrypt = require('bcrypt');
      update.password = await bcrypt.hash(password, 12);
    }
    const u = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    res.json(u);
  } catch (e) { next(e); }
});

/* Delete users */
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;

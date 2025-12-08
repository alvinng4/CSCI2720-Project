const router = require('express').Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const User = require('../models/User');

// 当前用户信息
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const u = await User.findById(req.user.id).select('-password').populate('favourites', 'name geo');
    res.json(u);
  } catch (e) { next(e); }
});

// Admin CRUD 用户
router.get('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const list = await User.find().select('-password');
    res.json(list);
  } catch (e) { next(e); }
});

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { username, email, password, role = 'user' } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email taken' });
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash(password, 12);
    const u = await User.create({ username, email, password: hash, role, favourites: [] });
    res.status(201).json({ id: u._id, username: u.username, email: u.email, role: u.role });
  } catch (e) { next(e); }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
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

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
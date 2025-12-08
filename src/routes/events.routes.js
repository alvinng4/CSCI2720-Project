const router = require('express').Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const Event = require('../models/Event');
const User = require('../models/User');
// 用户可读列表/单项（仅本地缓存）
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { venueId } = req.query;
    const filter = {};
    if (venueId) filter.venueId = venueId;
    const list = await Event.find(filter).sort({ startTime: 1 }).lean();
    res.json(list);
  } catch (e) { next(e); }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const ev = await Event.findById(req.params.id).lean();
    if (!ev) return res.status(404).json({ error: 'Not found' });
    res.json(ev);
  } catch (e) { next(e); }
});

// Admin CRUD
router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const ev = await Event.create(req.body);
    res.status(201).json(ev);
  } catch (e) { next(e); }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const ev = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ev) return res.status(404).json({ error: 'Not found' });
    res.json(ev);
  } catch (e) { next(e); }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
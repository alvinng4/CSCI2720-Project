const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const Location = require('../models/Location');
const Event = require('../models/Event');
const Comment = require('../models/Comment');
const User = require('../models/User');
// 列表：支持关键词、区域、距离排序/过滤
router.get('/',  async (req, res, next) => {
  /*
  try {
    const { q, area, sortBy = 'name', order = 'asc', lng, lat, withinKm, limit = 100 } = req.query;
    const filter = {};
    if (q) filter.name = { $regex: new RegExp(q, 'i') };
    if (area) filter.area = area;

    let cursor = Location.find(filter);

    if (lng && lat && withinKm) {
      cursor = Location.find({
        ...filter,
        geo: {
          $near: {
            $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
            $maxDistance: Number(withinKm) * 1000
          }
        }
      });
    }

    const docs = await cursor.limit(Number(limit)).lean();

    // 排序：name / eventCount / distance（distance需要提供lng/lat）
    let result = docs;
    if (sortBy === 'distance' && lng && lat) {
      const user = { lng: Number(lng), lat: Number(lat) };
      const { haversineKm } = require('../services/geo');
      result = docs.map(d => {
        const [dlng, dlat] = d.geo.coordinates;
        const dist = haversineKm({ lng: dlng, lat: dlat }, user);
        return { ...d, distanceKm: dist };
      }).sort((a,b) => (order==='desc'? b.distanceKm - a.distanceKm : a.distanceKm - b.distanceKm));
    } else if (sortBy === 'eventCount') {
      result = docs.sort((a,b) => (order==='desc'? b.eventCount - a.eventCount : a.eventCount - b.eventCount));
    } else {
      result = docs.sort((a,b) => (order==='desc'? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)));
    }

    res.json(result);
  } catch (e) { next(e); }*/
  try {
    const docs = await Location.find().lean();
    res.json(docs);
  } catch (e) {
    next(e);
  }
});

// 单地点详情（含活动汇总）
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const loc = await Location.findById(req.params.id).lean();
    if (!loc) return res.status(404).json({ error: 'Not found' });
    const events = await Event.find({ venueId: loc._id }).sort({ startTime: 1 }).lean();
    res.json({ location: loc, events });
  } catch (e) { next(e); }
});

// 收藏/取消收藏
router.post('/:id/favourite', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const locationId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const idx = user.favourites.findIndex(f => f.toString() === locationId);
    if (idx === -1) {
      user.favourites.push(locationId);
      await user.save();
      return res.json({ favourited: true });
    } else {
      user.favourites.splice(idx, 1);
      await user.save();
      return res.json({ favourited: false });
    }
  } catch (e) { next(e); }
});

// 获取某地点评论
router.get('/:id/comments', requireAuth, async (req, res, next) => {
  try {
    // 正确链式调用：find -> sort -> populate -> lean -> await
    const list = await Comment.find({ locationId: req.params.id })
      .sort({ createdAt: -1 })
      .populate('userId', 'username') // 关联用户，只返回username字段
      .lean(); // 转换为普通JS对象（提升性能）
    res.json(list);
  } catch (e) { 
    next(e); 
  }
});

// 添加评论
router.post('/:id/comments', requireAuth, async (req, res, next) => {
  try {
    const { text } = req.body || {};
    if (!text || !text.trim()) return res.status(400).json({ error: 'Empty comment' });
    const comment = await Comment.create({ userId: req.user.id, locationId: req.params.id, text: text.trim() });
    const populated = await comment.populate('userId', 'username');
    res.status(201).json(populated);
  } catch (e) { next(e); }
});

// 删除评论（作者或管理员）
router.delete('/comments/:commentId', requireAuth, async (req, res, next) => {
  try {
    const Comment = require('../models/Comment');
    const c = await Comment.findById(req.params.commentId);
    if (!c) return res.status(404).json({ error: 'Not found' });
    if (c.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await Comment.deleteOne({ _id: c._id });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const Comment = require('../models/Comment');
const User = require('../models/User');
// 通用评论集合路由（按需）
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { userId, locationId } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (locationId) filter.locationId = locationId;
    const list = await Comment.find(filter).sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (e) { next(e); }
});

module.exports = router;
const router = require('express').Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const Event = require('../models/Event');
const User = require('../models/User');
// 用户可读列表/单项（仅本地缓存）
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      venueId,
      startDate,
      endDate,
      ageLimit,
      title,
      // 新增地理筛选参数
      lat, // 纬度
      lng, // 经度
      distance // 距离(公里)
    } = req.query;

    const query = {};
    // ... 原有筛选条件构建 ...

    // 地理距离筛选
    let nearbyVenueIds = [];
    if (lat && lng && distance) {
      const userLocation = { lat: Number(lat), lng: Number(lng) };
      if (isFinite(userLocation.lat) && isFinite(userLocation.lng)) {
        // 查询所有场地坐标
        const locations = await Location.find({}, 'venueCode geo.coordinates');
        // 计算距离并筛选
        nearbyVenueIds = locations
          .filter(loc => {
            const venueLoc = {
              lat: loc.geo.coordinates[1],
              lng: loc.geo.coordinates[0]
            };
            return haversineKm(userLocation, venueLoc) <= Number(distance);
          })
          .map(loc => loc._id);

        if (nearbyVenueIds.length > 0) {
          query.venueId = { $in: nearbyVenueIds };
        } else {
          // 无符合条件的场地，直接返回空结果
          return res.json({
            success: true,
            count: 0,
            total: 0,
            totalPages: 0,
            currentPage: Number(page),
            data: []
          });
        }
      }
    }

    // ... 执行查询和返回结果 ...

  } catch (error) {
    console.error('获取活动列表失败:', error.message);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
});
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
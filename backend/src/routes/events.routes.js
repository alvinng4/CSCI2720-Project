const router = require('express').Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const Event = require('../models/Event');
const User = require('../models/User');
// 假设存在 haversineKm 函数用于计算距离
const { haversineKm } = require('../services/geo'); // 补充引入（如果之前未显式引入）
const Location = require('../models/Location'); // 补充引入（如果之前未显式引入）

// 用户可读列表/单项（仅本地缓存）
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      venueId,
      ageLimit, // 若不需要可删除
      title,
      // 地理筛选参数
      lat, // 纬度
      lng, // 经度
      distance // 距离(公里)
    } = req.query;

    const query = {};
    // 原有筛选条件（移除时间相关筛选）
    if (venueId) query.venueId = venueId;
    if (title) query.title = { $regex: title, $options: 'i' }; // 模糊查询标题
    // 若有ageLimit筛选可保留，否则删除
    if (ageLimit) query.ageLimit = ageLimit;

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

    // 执行查询（按time排序）
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Event.countDocuments(query);
    const data = await Event.find(query)
      .sort({ time: 1 }) // 按时间字符串排序（需保证格式统一，例如"YYYY-MM-DD HH:MM"）
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      count: data.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data
    });

  } catch (error) {
    console.error('获取活动列表失败:', error.message);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
});

// 带权限的活动列表（按time排序）
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { venueId } = req.query;
    const filter = {};
    if (venueId) filter.venueId = venueId;
    const list = await Event.find(filter).sort({ time: 1 }).lean(); // 按time排序
    res.json(list);
  } catch (e) { next(e); }
});

// 活动详情（返回time字段）
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const ev = await Event.findById(req.params.id).lean();
    if (!ev) return res.status(404).json({ error: 'Not found' });
    res.json(ev); // 包含time字段
  } catch (e) { next(e); }
});

// Admin 创建活动（接收time字段）
router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    // 确保req.body包含time字段（例如："2024-05-20 14:00 - 16:00"）
    const ev = await Event.create(req.body);
    res.status(201).json(ev);
  } catch (e) { next(e); }
});

// Admin 更新活动（处理time字段）
router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    // 允许更新time字段
    const ev = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ev) return res.status(404).json({ error: 'Not found' });
    res.json(ev);
  } catch (e) { next(e); }
});

// Admin 删除活动
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
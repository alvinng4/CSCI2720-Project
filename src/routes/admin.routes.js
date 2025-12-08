const router = require('express').Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { syncProgrammeOnce } = require('../services/lcsd');
const dayjs = require('dayjs');
const User = require('../models/User');

// 假设通过“Venues of programmes”XML建立场馆映射，这里提供示例载入（实际需要根据真实URL与字段替换）
const axios = require('axios');
const { parseXml } = require('../utils/xml');

async function loadVenuesMap() {
  // 替换为真实 URL
  const VENUES_XML_URL = 'https://www.lcsd.gov.hk/datagovhk/event/venues_en.xml';
  const { data: xml } = await axios.get(VENUES_XML_URL, { responseType: 'text' });
  const parsed = await parseXml(xml);
  const map = new Map();
  // 假设结构 parsed.Venues.Venue 为数组，包含 code, venue_en, latitude, longitude, address_en, district_en
  const list = parsed.Venues?.Venue;
  const arr = Array.isArray(list) ? list : [list];
  for (const v of arr) {
    const key = v.code || v.VenueCode || v.venue_en;
    map.set(key, {
      code: v.code || v.VenueCode,
      name: v.venue_en || v.name_en,
      lat: Number(v.latitude),
      lng: Number(v.longitude),
      address_en: v.address_en || '',
      district_en: v.district_en || ''
    });
  }
  return map;
}

let lastSyncAt = null;

router.post('/sync', requireAuth, async (req, res, next) => {
  try {
    // 若需要仅“首次登录加载页面时”同步：前端登录后调用一次；这里可做24小时频率限制
    if (lastSyncAt && dayjs().diff(dayjs(lastSyncAt), 'minute') < 10) {
      return res.json({ skipped: true, lastSyncAt });
    }
    const venuesMap = await loadVenuesMap();
    const result = await syncProgrammeOnce(venuesMap);
    lastSyncAt = result.lastSyncedAt || new Date();
    res.json({ ok: true, ...result });
  } catch (e) { next(e); }
});

router.get('/last-sync', requireAuth, async (req, res) => {
  res.json({ lastSyncAt });
});

module.exports = router;
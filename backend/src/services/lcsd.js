const fs = require('fs').promises;
const path = require('path');
const Location = require('../models/Location');
const Event = require('../models/Event');

// 本地JSON文件路径（与lcsd.js同目录）
const EVENTS_JSON_PATH = path.join(__dirname, 'events_cleaned.json'); // 活动数据
const VENUES_JSON_PATH = path.join(__dirname, 'venues_cleaned.json'); // 场地数据

/**
 * 解析场地JSON文件，生成venueCode到场地信息的映射
 */
async function parseVenuesJson() {
  try {
    const jsonContent = await fs.readFile(VENUES_JSON_PATH, 'utf8');
    const venuesList = JSON.parse(jsonContent);
    
    const venuesMap = new Map();
    for (const venue of venuesList) {
      const venueId = venue.id;
      if (!venueId) continue;

      // 处理经纬度空值
      const lng = venue.longitude || null;
      const lat = venue.latitude || null;

      venuesMap.set(venueId, {
        code: venueId,
        name: venue.venuec || venue.venuee || '未知场地',
        address_cn: venue.addressc || '',
        district_cn: venue.districtc || '',
        lng: lng,
        lat: lat
      });
    }

    return venuesMap;
  } catch (error) {
    console.error('解析场地JSON失败:', error.message);
    return new Map();
  }
}

/**
 * 将JSON中的活动项映射为Event模型数据（仅保留单个时间字符串）
 */
function mapEventItem(item) {
  // 提取字段值（处理null值）
  const getValue = (field) => {
    return field || '';
  };

  // 提取核心字段
  const id = getValue(item.id);
  const title = getValue(item.titlec);
  const venueCode = getValue(item.venueid); // 变量名统一为venueCode
  const presenter = getValue(item.presenterorgc);
  const enquiry = getValue(item.enquiry);
  const price = getValue(item.pricec);
  const ageLimit = getValue(item.agelimitc);
  const url = getValue(item.urlc);
  const rawDateStr = getValue(item.predateC); // 原始日期字符串
  const durationStr = getValue(item.progtimec);

  // 核心修改：仅保留第一个有效时间字符串（不再是数组）
  const time = rawDateStr.split(/[\n;]/)
    .map(str => str.trim())
    .filter(Boolean)
    .at(0) || '未填写'; // 无时间时兜底

  return {
    sourceId: id,
    title,
    venueCode,
    presenter,
    enquiry,
    price,
    ageLimit,
    url,
    time, // 单个时间字符串（关键修改）
    durationStr,
    raw: item
  };
} // 修复：补充mapEventItem函数闭合的}

/**
 * 同步活动和场地数据（适配单个时间字符串）
 */
async function syncProgrammeOnce() {
  // 1. 解析场地数据
  const venuesMap = await parseVenuesJson();
  if (venuesMap.size === 0) {
    console.warn('未找到有效场地数据，同步终止');
    return { count: 0, locations: 0 };
  }

  // 2. 解析活动JSON
  let eventsList;
  try {
    const jsonContent = await fs.readFile(EVENTS_JSON_PATH, 'utf8');
    eventsList = JSON.parse(jsonContent);
  } catch (error) {
    console.error('解析活动JSON失败:', error.message);
    return { count: 0, locations: 0 };
  }

  // 3. 处理活动列表（修正筛选条件：time非空）
  const items = Array.isArray(eventsList) ? eventsList : [eventsList];
  const eventsPrepared = items.map(mapEventItem).filter(e => 
    e.title && e.venueCode && e.time !== '未填写' // 筛选有效时间的活动
  );

  // 4. 统计场地活动数量，筛选至少有3个活动的场地（取前10）
  const venueEventCount = new Map();
  eventsPrepared.forEach(e => {
    const key = e.venueCode;
    venueEventCount.set(key, (venueEventCount.get(key) || 0) + 1);
  });

  const selectedVenueCodes = Array.from(venueEventCount.entries())
    .filter(([, count]) => count >= 3)
    .slice(0, 10)
    .map(([code]) => code);

  // 5. 同步场地信息到数据库
  const now = new Date();
  const venueIdMap = new Map(); // venueCode -> 数据库Location ID

  for (const code of selectedVenueCodes) {
    const venueMeta = venuesMap.get(code);
    if (!venueMeta || !venueMeta.lng || !venueMeta.lat) continue;

    // 转换经纬度为数字
    const lng = Number(venueMeta.lng);
    const lat = Number(venueMeta.lat);
    if (!isFinite(lng) || !isFinite(lat)) continue;

    // 查询或创建场地记录
    let location = await Location.findOne({ venueCode: code });
    if (!location) {
      location = await Location.create({
        name: venueMeta.name,
        geo: { type: 'Point', coordinates: [lng, lat] },
        address: venueMeta.address_cn,
        area: venueMeta.district_cn,
        venueCode: code,
        lastSyncedAt: now
      });
    } else {
      location.name = venueMeta.name;
      location.geo = { type: 'Point', coordinates: [lng, lat] };
      location.address = venueMeta.address_cn;
      location.area = venueMeta.district_cn;
      location.lastSyncedAt = now;
      await location.save();
    }

    venueIdMap.set(code, location._id);
  }

  // 6. 同步活动信息到数据库（单个时间字符串）
  let createdCount = 0;
  for (const event of eventsPrepared) {
    const venueCode = event.venueCode;
    if (!selectedVenueCodes.includes(venueCode)) continue;

    const venueId = venueIdMap.get(venueCode);
    if (!venueId) continue;

    // 生成唯一sourceId（基于原始ID+时间字符串）
    const uniqueSourceId = `${event.sourceId}_${event.time.replace(/\W/g, '_')}`;
    const existing = await Event.findOne({ sourceId: uniqueSourceId });
    if (existing) continue;

    // 创建活动记录（存储单个time字符串，移除startTime/endTime）
    await Event.create({
      title: event.title,
      venue: venuesMap.get(venueCode)?.name || venueCode,
      venueId,
      description: event.raw.descc || '',
      presenter: event.presenter,
      time: event.time, // 存储单个时间字符串
      sourceId: uniqueSourceId,
      price: event.price,
      ageLimit: event.ageLimit,
      url: event.url,
      enquiry: event.enquiry,
      raw: event.raw,
      lastSyncedAt: now
    });

    createdCount++;
  }

  // 7. 更新场地的活动计数
  const countResult = await Event.aggregate([
    { $match: { venueId: { $in: Array.from(venueIdMap.values()) } } },
    { $group: { _id: '$venueId', eventCount: { $sum: 1 } } }
  ]);

  for (const { _id, eventCount } of countResult) {
    await Location.findByIdAndUpdate(_id, { eventCount });
  }

  return {
    count: createdCount,
    locations: venueIdMap.size,
    lastSyncedAt: now
  };
}

module.exports = { syncProgrammeOnce };
const fs = require('fs').promises;
const path = require('path');
const dayjs = require('dayjs');
const Location = require('../models/Location');
const Event = require('../models/Event');

// 本地JSON文件路径（与lcsd.js同目录）
const EVENTS_JSON_PATH = path.join(__dirname, 'events_cleaned.json'); // 活动数据
const VENUES_JSON_PATH = path.join(__dirname, 'venues_cleaned.json'); // 场地数据

// 引入dayjs插件
require('dayjs/locale/zh-cn');
require('dayjs/plugin/advancedFormat');
dayjs.extend(require('dayjs/plugin/advancedFormat'));
dayjs.locale('zh-cn');

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
 * 将JSON中的活动项映射为Event模型数据
 */
function mapEventItem(item) {
  // 提取字段值（处理null值）
  const getValue = (field) => {
    return field || '';
  };

  // 提取核心字段
  const id = getValue(item.id);
  const title = getValue(item.titlec);
  const venueId = getValue(item.venueid);
  const presenter = getValue(item.presenterorgc);
  const enquiry = getValue(item.enquiry);
  const price = getValue(item.pricec);
  const ageLimit = getValue(item.agelimitc);
  const url = getValue(item.urlc);
  const rawDateStr = getValue(item.predateC);
  const durationStr = getValue(item.progtimec);

  // 解析多场次时间（分号分隔）
  const startTimes = rawDateStr.split(';')
    .map(str => str.trim())
    .filter(Boolean)
    .map(str => {
      // 覆盖JSON中出现的日期格式
      const formats = [
        'YYYY年MM月DD日 (ddd) A h:mm',   // 如：2026年01月30日 (五) 晚上 7:30
        'DD/MM/YYYY(ddd)HH:mm',          // 如：30/01/2026(五)19:30
        'MM-DD/YYYY(ddd)HH:mm',          // 如：07-08/2025(一至二)20:00
        'YYYY-MM-DD HH:mm',              // 如：2026-01-30 19:30
        'MM月-DD月 YYYY (ddd) HH:mm-HH:mm', // 如：7月-12月 2025 (逢星期一) 1200-1400
        'MM月DD日 HH:mm',                // 补充格式
        'DD/MM/YYYY HH:mm'               // 补充格式
      ];
      
      // 尝试解析日期范围（如"7月-12月 2025"）
      let parsed = dayjs(str, formats, true);
      if (!parsed.isValid()) {
        // 处理周期性日期（提取起始日期）
        const periodMatch = str.match(/(\d+)月-(\d+)月 (\d{4})/);
        if (periodMatch) {
          const [, startMonth, endMonth, year] = periodMatch;
          parsed = dayjs(`${year}-${startMonth}-01`, 'YYYY-MM-DD');
        }
      }

      if (!parsed.isValid()) {
        console.warn(`[日期解析失败] 格式不匹配: ${str} (活动ID: ${id})`);
        return null;
      }
      return parsed.toDate();
    })
    .filter(Boolean);

  return {
    sourceId: id,
    title,
    venueCode: venueId,
    presenter,
    enquiry,
    price,
    ageLimit,
    url,
    startTimes,
    durationStr,
    raw: item
  };
}

/**
 * 从时长字符串计算结束时间
 */
function calculateEndTime(startTime, durationStr) {
  if (!durationStr || durationStr === '不適用') {
    return new Date(startTime.getTime() + 3600000); // 默认1小时
  }

  const hoursMatch = durationStr.match(/(\d+)小時/);
  const minsMatch = durationStr.match(/(\d+)分鐘/);

  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const mins = minsMatch ? parseInt(minsMatch[1], 10) : 0;

  const totalMs = (hours * 3600 + mins * 60) * 1000;
  return new Date(startTime.getTime() + totalMs);
}

/**
 * 同步活动和场地数据
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

  // 3. 处理活动列表
  const items = Array.isArray(eventsList) ? eventsList : [eventsList];
  const eventsPrepared = items.map(mapEventItem).filter(e => 
    e.title && e.venueCode && e.startTimes.length > 0
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

  // 6. 同步活动信息到数据库
  let createdCount = 0;
  for (const event of eventsPrepared) {
    const venueCode = event.venueCode;
    if (!selectedVenueCodes.includes(venueCode)) continue;

    const venueId = venueIdMap.get(venueCode);
    if (!venueId) continue;

    // 为每个场次创建活动记录
    for (const startTime of event.startTimes) {
      const uniqueSourceId = `${event.sourceId}_${startTime.getTime()}`;
      const existing = await Event.findOne({ sourceId: uniqueSourceId });
      if (existing) continue;

      // 计算结束时间
      const endTime = calculateEndTime(startTime, event.durationStr);

      // 创建活动记录
      await Event.create({
        title: event.title,
        venue: venuesMap.get(venueCode)?.name || venueCode,
        venueId,
        description: event.raw.descc || '',
        presenter: event.presenter,
        startTime,
        endTime,
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
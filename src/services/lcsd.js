const fs = require('fs').promises;
const path = require('path');
const dayjs = require('dayjs');
const { parseXml } = require('../utils/xml');
const Location = require('../models/Location');
const Event = require('../models/Event');

// 本地XML文件路径（与lcsd.js同目录）
const EVENTS_XML_PATH = path.join(__dirname, 'events.xml'); // 活动数据
const VENUES_XML_PATH = path.join(__dirname, 'venues.xml'); // 场地数据

/**
 * 解析场地XML文件，生成venueCode到场地信息的映射
 */
async function parseVenuesXml() {
  try {
    const xmlContent = await fs.readFile(VENUES_XML_PATH, 'utf8');
    const parsed = await parseXml(xmlContent);
    
    // 正确获取场地列表（支持单一场地的情况）
    const venuesList = Array.isArray(parsed.venues?.venue) 
      ? parsed.venues.venue 
      : parsed.venues?.venue ? [parsed.venues.venue] : [];
      
    const venuesMap = new Map();

    for (const venue of venuesList) {
      // 从属性获取场地ID（关键修复）
      const venueId = venue.$?.id; // xml2js会将属性放在$对象中
      if (!venueId) continue;

      // 处理经纬度空值（默认null而非空字符串）
      const lng = venue.longitude?._text || venue.longitude || null;
      const lat = venue.latitude?._text || venue.latitude || null;

      venuesMap.set(venueId, {
        code: venueId,
        name: venue.venuec?._text || venue.venuec || venue.venuee || '未知场地',
        address_cn: venue.addressc?._text || venue.addressc || '',
        district_cn: venue.districtc?._text || venue.districtc || '',
        lng: lng,
        lat: lat
      });
    }

    return venuesMap;
  } catch (error) {
    console.error('解析场地XML失败:', error.message);
    return new Map();
  }
}

/**
 * 将XML中的活动项映射为Event模型数据
 */
function mapEventItem(item) {
  // 提取CDATA内容（处理<![CDATA[]]>包装）
  const getCdata = (field) => {
    return field?._text || field || '';
  };

  const id = getCdata(item.id);
  const title = getCdata(item.titlec);
  const venueId = getCdata(item.venueid);
  const presenter = getCdata(item.presenterorgc);
  const enquiry = getCdata(item.enquiry);
  const price = getCdata(item.pricec);
  const ageLimit = getCdata(item.agelimitc);
  const url = getCdata(item.urlc);
  const rawDateStr = getCdata(item.predateC);
  const durationStr = getCdata(item.progtimec);

  // 解析多场次时间（分号分隔）
  const startTimes = rawDateStr.split(';')
    .map(str => str.trim())
    .filter(Boolean)
    .map(str => {
      // 支持的中文日期格式：
      // 2026年1月30日 (五) 晚上7:30
      // 06/02/2026(五)20:00
      const formats = ['YYYY年MM月DD日 (ddd) A h:mm', 'DD/MM/YYYY(ddd)HH:mm'];
      const parsed = dayjs(str, formats, 'zh-cn', true);
      return parsed.isValid() ? parsed.toDate() : null;
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
 * @param {Date} startTime 开始时间
 * @param {string} durationStr 中文时长（如"1小時25分鐘"、"約3小時，包括中場休息15分鐘"）
 */
function calculateEndTime(startTime, durationStr) {
  if (!durationStr) return new Date(startTime.getTime() + 3600000); // 默认1小时

  // 提取数字部分（小时和分钟）
  const hoursMatch = durationStr.match(/(\d+)小時/);
  const minsMatch = durationStr.match(/(\d+)分鐘/);

  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const mins = minsMatch ? parseInt(minsMatch[1], 10) : 0;

  // 总毫秒数
  const totalMs = (hours * 3600 + mins * 60) * 1000;
  return new Date(startTime.getTime() + totalMs);
}

/**
 * 同步活动和场地数据
 */
async function syncProgrammeOnce() {
  // 1. 解析场地数据
  const venuesMap = await parseVenuesXml();
  if (venuesMap.size === 0) {
    console.warn('未找到有效场地数据，同步终止');
    return { count: 0, locations: 0 };
  }

  // 2. 解析活动XML
  let parsedEvents;
  try {
    const xmlContent = await fs.readFile(EVENTS_XML_PATH, 'utf8');
    parsedEvents = await parseXml(xmlContent);
  } catch (error) {
    console.error('解析活动XML失败:', error.message);
    return { count: 0, locations: 0 };
  }

  // 3. 处理活动列表
  const eventsList = parsedEvents.events?.event || [];
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
    // 只处理选中场地的活动
    if (!selectedVenueCodes.includes(venueCode)) continue;

    const venueId = venueIdMap.get(venueCode);
    if (!venueId) continue;

    // 为每个场次创建活动记录
    for (const startTime of event.startTimes) {
      // 生成唯一标识（避免重复）
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
        description: event.raw.descc?._text || event.raw.descc || '',
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
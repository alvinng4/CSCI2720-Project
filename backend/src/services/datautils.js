const moment = require('moment-timezone'); // 处理时区和复杂日期解析
moment.tz.setDefault('Asia/Hong_Kong'); // 统一使用香港时区

/**
 * 解析活动原始日期字符串，生成所有开始时间的Date对象数组
 * @param {string} rawDate - 原始日期字符串（如predateC或predateE）
 * @returns {Date[]} 解析后的开始时间数组
 */
function parseEventDates(rawDate) {
  if (!rawDate) return [];

  // 1. 分割多场次（换行或分号分隔）
  const dateSegments = rawDate.split(/[\n;]/).map(s => s.trim()).filter(Boolean);
  const allStartTimes = [];

  dateSegments.forEach(segment => {
    // 2. 处理重复周期（如"逢星期三"）
    const repeatMatch = segment.match(/(逢|Every)\s*([一二三四五六日天MonTueWedThuFriSatSun]+)/i);
    const isRepeat = !!repeatMatch;

    // 3. 提取日期范围（如"7月-12月 2025"或"2025年7月3日至12月18日"）
    let [startDateStr, endDateStr] = extractDateRange(segment);
    if (!startDateStr || !endDateStr) {
      // 单日期处理（如"07/12/2025(Sun)14:15"）
      const singleDate = parseSingleDate(segment);
      if (singleDate) allStartTimes.push(singleDate);
      return;
    }

    // 4. 解析开始/结束日期
    const startDate = parseDateStr(startDateStr);
    const endDate = parseDateStr(endDateStr, true); // 结束日期取当天结束时间
    if (!startDate || !endDate) return;

    // 5. 处理重复周期（生成范围内所有符合条件的日期）
    if (isRepeat) {
      const weekDay = mapWeekDay(repeatMatch[2]); // 转换为数字（0=周日，6=周六）
      if (weekDay === null) return;

      // 遍历日期范围，收集符合星期几的日期
      let currentDate = startDate.clone();
      while (currentDate.isSameOrBefore(endDate)) {
        if (currentDate.day() === weekDay) {
          // 提取时间（如"1930-2200" -> 19:30）
          const time = extractTime(segment) || '00:00';
          const [hours, minutes] = time.split(':').map(Number);
          const startTime = currentDate.clone().hour(hours).minute(minutes);
          allStartTimes.push(startTime.toDate());
        }
        currentDate.add(1, 'day');
      }
    } else {
      // 非重复日期（如多个独立日期）
      const time = extractTime(segment) || '00:00';
      const [hours, minutes] = time.split(':').map(Number);
      const startTime = startDate.clone().hour(hours).minute(minutes);
      allStartTimes.push(startTime.toDate());
    }
  });

  return allStartTimes;
}

/** 提取日期范围（如"7月-12月 2025" -> [start, end]） */
function extractDateRange(segment) {
  // 匹配"X月-X月 YYYY"格式
  const monthRangeMatch = segment.match(/(\d+)月-(\d+)月\s*(\d{4})/);
  if (monthRangeMatch) {
    const [, startMonth, endMonth, year] = monthRangeMatch;
    return [
      `${year}-${startMonth.padStart(2, '0')}-01`,
      `${year}-${endMonth.padStart(2, '0')}-${moment(`${year}-${endMonth}`, 'YYYY-MM').daysInMonth()}`
    ];
  }

  // 匹配"YYYY年X月X日至X月X日"格式
  const fullRangeMatch = segment.match(/(\d{4})年(\d+)月(\d+)日至(\d+)月(\d+)日/);
  if (fullRangeMatch) {
    const [, year, sMonth, sDay, eMonth, eDay] = fullRangeMatch;
    return [
      `${year}-${sMonth.padStart(2, '0')}-${sDay.padStart(2, '0')}`,
      `${year}-${eMonth.padStart(2, '0')}-${eDay.padStart(2, '0')}`
    ];
  }

  return [null, null];
}

/** 解析单日期（如"07/12/2025(Sun)14:15"） */
function parseSingleDate(segment) {
  // 匹配"DD/MM/YYYY"格式
  const dateMatch = segment.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!dateMatch) return null;

  const [, day, month, year] = dateMatch;
  const timeMatch = segment.match(/(\d{2}:\d{2}|\d{4})/); // 匹配14:15或1930
  const time = timeMatch ? (timeMatch[1].length === 4 
    ? `${timeMatch[1].slice(0, 2)}:${timeMatch[1].slice(2)}` 
    : timeMatch[1]) : '00:00';

  return moment(`${year}-${month}-${day} ${time}`, 'YYYY-MM-DD HH:mm').toDate();
}

/** 转换星期几为数字（0=周日，6=周六） */
function mapWeekDay(weekDayStr) {
  const cnMap = { '日': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6 };
  const enMap = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
  
  if (cnMap[weekDayStr]) return cnMap[weekDayStr];
  const enAbbr = weekDayStr.slice(0, 3).capitalize();
  return enMap[enAbbr] ?? null;
}

/** 提取时间（如"1930-2200" -> "19:30"） */
function extractTime(segment) {
  const timeMatch = segment.match(/(\d{4})-(\d{4})/);
  return timeMatch ? `${timeMatch[1].slice(0, 2)}:${timeMatch[1].slice(2)}` : null;
}

/** 解析日期字符串为moment对象 */
function parseDateStr(dateStr, isEnd = false) {
  const formats = ['YYYY-MM-DD', 'YYYY年MM月DD日', 'DD/MM/YYYY'];
  let mom = moment(dateStr, formats, true);
  if (!mom.isValid()) return null;
  
  // 结束日期默认设为当天23:59
  if (isEnd) mom.hour(23).minute(59);
  return mom;
}

module.exports = { parseEventDates };
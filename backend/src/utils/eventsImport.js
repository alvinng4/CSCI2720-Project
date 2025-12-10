// backend/src/utils/eventsImport.js
function parseShowtimes(predate) {
    if (!predate) return [];
    return predate
      .split(";")
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => {
        const cleaned = s.replace(/\([^)]+\)/g, ""); // remove (Fri)
        const m = cleaned.match(/^(\d{2})\/(\d{2})\/(\d{4})\s*(\d{2}:\d{2})$/);
        if (!m) return null;
        const [, dd, mm, yyyy, time] = m;
        const date = `${yyyy}-${mm}-${dd}`;
        return { date, time };
      })
      .filter(Boolean);
  }
  module.exports = { parseShowtimes };
  
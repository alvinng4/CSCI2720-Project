function degreesToRadians(deg) { return deg * Math.PI / 180; }
function haversineKm(a, b) {
  const R = 6371;
  const dLat = degreesToRadians(b.lat - a.lat);
  const dLon = degreesToRadians(b.lng - a.lng);
  const lat1 = degreesToRadians(a.lat);
  const lat2 = degreesToRadians(b.lat);
  const sinDLat = Math.sin(dLat/2);
  const sinDLon = Math.sin(dLon/2);
  const h = sinDLat*sinDLat + Math.cos(lat1)*Math.cos(lat2)*sinDLon*sinDLon;
  return 2 * R * Math.asin(Math.sqrt(h));
}
module.exports = { haversineKm };
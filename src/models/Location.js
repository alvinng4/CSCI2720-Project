const mongoose = require('mongoose');

// 使用 GeoJSON 存经纬度，便于按距离查询
const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true }, // English name
    // 例如: { type: "Point", coordinates: [lng, lat] }
    geo: {
      type: { type: String, enum: ['Point'], required: true, default: 'Point' },
      coordinates: { type: [Number], required: true } // [lng, lat]
    },
    address: { type: String },
    area: { type: String }, // optional 分区标签
    venueCode: { type: String, index: true }, // 便于从LCSD数据映射
    eventCount: { type: Number, default: 0 }, // 缓存该地点的活动数量
    lastSyncedAt: { type: Date } // 最近同步时间
  },
  { timestamps: true }
);

locationSchema.index({ geo: '2dsphere' });

module.exports = mongoose.models.Location || mongoose.model('Location', locationSchema);
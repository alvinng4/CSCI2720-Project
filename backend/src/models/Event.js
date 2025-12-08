const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    venue: { type: String, required: true }, 
    venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    description: { type: String },
    presenter: { type: String },
    time: { type: String, required: true }, // 活动时间字符串
    sourceId: { type: String, index: true }, // LCSD原始ID
    raw: { type: Object }, // 原始数据
    lastSyncedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Event || mongoose.model('Event', eventSchema);
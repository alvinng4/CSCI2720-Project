const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    venue: { type: String, required: true }, // 冗余存名称方便展示
    venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    description: { type: String },
    presenter: { type: String },
    startTime: { type: Date, required: true },
    endTime: { type: Date }, // 可选
    sourceId: { type: String, index: true }, // LCSD原始ID（防重复）
    raw: { type: Object }, // 原始数据备查
    lastSyncedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Event || mongoose.model('Event', eventSchema);
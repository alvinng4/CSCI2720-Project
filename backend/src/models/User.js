const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    // 收藏列表，存 location ObjectId
    favourites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
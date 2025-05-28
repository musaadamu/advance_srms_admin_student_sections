const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  type: { type: String, required: true },
  message: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);

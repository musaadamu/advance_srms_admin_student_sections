const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);

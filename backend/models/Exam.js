const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  academicYear: { type: String, required: true },
  semester: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Exam', examSchema);

const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  // Student and Course Information
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },

  // Course Assignment Reference
  courseAssignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseAssignment'
  },

  // Lecturer Information
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },

  // Academic Period
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY (e.g., 2023-2024)']
  },
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    enum: ['Fall', 'Spring', 'Summer']
  },

  // Assessment Scores
  assessments: [{
    type: {
      type: String,
      enum: ['assignment', 'quiz', 'midterm', 'final', 'project', 'presentation', 'lab', 'attendance'],
      required: true
    },
    name: {
      type: String,
      required: true
    },
    maxMarks: {
      type: Number,
      required: true,
      min: [0, 'Maximum marks cannot be negative']
    },
    obtainedMarks: {
      type: Number,
      required: true,
      min: [0, 'Obtained marks cannot be negative']
    },
    weightage: {
      type: Number,
      required: true,
      min: [0, 'Weightage cannot be negative'],
      max: [100, 'Weightage cannot exceed 100%']
    },
    date: {
      type: Date,
      default: Date.now
    },
    remarks: String
  }],

  // Final Grade Information
  totalMarks: {
    type: Number,
    min: [0, 'Total marks cannot be negative']
  },
  obtainedMarks: {
    type: Number,
    min: [0, 'Obtained marks cannot be negative']
  },
  percentage: {
    type: Number,
    min: [0, 'Percentage cannot be negative'],
    max: [100, 'Percentage cannot exceed 100']
  },
  letterGrade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'I', 'W']
  },
  gradePoints: {
    type: Number,
    min: [0, 'Grade points cannot be negative'],
    max: [4, 'Grade points cannot exceed 4.0']
  },
  credits: {
    type: Number,
    required: [true, 'Credits are required'],
    min: [0, 'Credits cannot be negative']
  },

  // Result Status
  status: {
    type: String,
    enum: ['draft', 'published', 'under-review', 'finalized'],
    default: 'draft'
  },

  // Additional Information
  attendance: {
    totalClasses: {
      type: Number,
      min: [0, 'Total classes cannot be negative']
    },
    attendedClasses: {
      type: Number,
      min: [0, 'Attended classes cannot be negative']
    },
    attendancePercentage: {
      type: Number,
      min: [0, 'Attendance percentage cannot be negative'],
      max: [100, 'Attendance percentage cannot exceed 100']
    }
  },

  // Faculty Information
  evaluatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  evaluationDate: {
    type: Date
  },

  // Remarks and Comments
  remarks: {
    instructor: String,
    admin: String,
    internal: String
  },

  // Result Publication
  publishedDate: {
    type: Date
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }
}, {
  timestamps: true
});

// Compound indexes for better performance
resultSchema.index({ student: 1, course: 1, academicYear: 1, semester: 1 }, { unique: true });
resultSchema.index({ student: 1 });
resultSchema.index({ course: 1 });
resultSchema.index({ academicYear: 1, semester: 1 });
resultSchema.index({ status: 1 });

// Calculate percentage before saving
resultSchema.pre('save', function(next) {
  if (this.totalMarks && this.obtainedMarks) {
    this.percentage = (this.obtainedMarks / this.totalMarks) * 100;
  }

  // Calculate attendance percentage
  if (this.attendance.totalClasses && this.attendance.attendedClasses) {
    this.attendance.attendancePercentage =
      (this.attendance.attendedClasses / this.attendance.totalClasses) * 100;
  }

  next();
});

// Method to calculate letter grade and grade points
resultSchema.methods.calculateGrade = function() {
  const percentage = this.percentage;

  if (percentage >= 97) {
    this.letterGrade = 'A+';
    this.gradePoints = 4.0;
  } else if (percentage >= 93) {
    this.letterGrade = 'A';
    this.gradePoints = 4.0;
  } else if (percentage >= 90) {
    this.letterGrade = 'A-';
    this.gradePoints = 3.7;
  } else if (percentage >= 87) {
    this.letterGrade = 'B+';
    this.gradePoints = 3.3;
  } else if (percentage >= 83) {
    this.letterGrade = 'B';
    this.gradePoints = 3.0;
  } else if (percentage >= 80) {
    this.letterGrade = 'B-';
    this.gradePoints = 2.7;
  } else if (percentage >= 77) {
    this.letterGrade = 'C+';
    this.gradePoints = 2.3;
  } else if (percentage >= 73) {
    this.letterGrade = 'C';
    this.gradePoints = 2.0;
  } else if (percentage >= 70) {
    this.letterGrade = 'C-';
    this.gradePoints = 1.7;
  } else if (percentage >= 67) {
    this.letterGrade = 'D+';
    this.gradePoints = 1.3;
  } else if (percentage >= 60) {
    this.letterGrade = 'D';
    this.gradePoints = 1.0;
  } else {
    this.letterGrade = 'F';
    this.gradePoints = 0.0;
  }
};

// Method to calculate total from assessments
resultSchema.methods.calculateTotalFromAssessments = function() {
  if (this.assessments && this.assessments.length > 0) {
    let totalWeightedScore = 0;
    let totalWeightage = 0;

    this.assessments.forEach(assessment => {
      const score = (assessment.obtainedMarks / assessment.maxMarks) * 100;
      totalWeightedScore += score * (assessment.weightage / 100);
      totalWeightage += assessment.weightage;
    });

    if (totalWeightage > 0) {
      this.percentage = totalWeightedScore;
      this.calculateGrade();
    }
  }
};

// Method to publish result
resultSchema.methods.publish = function(publishedBy) {
  this.status = 'published';
  this.publishedDate = new Date();
  this.publishedBy = publishedBy;
  return this.save();
};

module.exports = mongoose.model('Result', resultSchema);

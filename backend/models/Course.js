const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  // Basic Course Information
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    uppercase: true,
    match: [/^[A-Z]{2,4}\d{3,4}$/, 'Course code must be in format like CS101 or MATH1001']
  },
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Course title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [1000, 'Course description cannot exceed 1000 characters']
  },
  
  // Academic Information
  credits: {
    type: Number,
    required: [true, 'Credits are required'],
    min: [1, 'Credits must be at least 1'],
    max: [6, 'Credits cannot exceed 6']
  },
  level: {
    type: String,
    required: [true, 'Course level is required'],
    enum: ['undergraduate', 'graduate', 'postgraduate']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: [
      'Computer Science', 'Engineering', 'Business Administration',
      'Medicine', 'Arts and Humanities', 'Natural Sciences',
      'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Other'
    ]
  },
  
  // Prerequisites
  prerequisites: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    minimumGrade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D'],
      default: 'C'
    }
  }],
  
  // Course Schedule
  schedule: {
    semester: {
      type: String,
      required: [true, 'Semester is required'],
      enum: ['Fall', 'Spring', 'Summer']
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [2020, 'Year must be 2020 or later']
    },
    sessions: [{
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true
      },
      startTime: {
        type: String,
        required: true,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
      },
      endTime: {
        type: String,
        required: true,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
      },
      location: {
        building: String,
        room: String
      },
      type: {
        type: String,
        enum: ['lecture', 'lab', 'tutorial', 'seminar'],
        default: 'lecture'
      }
    }]
  },
  
  // Staff Information
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: [true, 'Instructor is required']
  },
  assistants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }],
  
  // Enrollment Information
  maxEnrollment: {
    type: Number,
    required: [true, 'Maximum enrollment is required'],
    min: [1, 'Maximum enrollment must be at least 1']
  },
  currentEnrollment: {
    type: Number,
    default: 0,
    min: [0, 'Current enrollment cannot be negative']
  },
  enrolledStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['enrolled', 'dropped', 'completed'],
      default: 'enrolled'
    }
  }],
  
  // Course Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'completed'],
    default: 'active'
  },
  
  // Assessment Information
  assessments: [{
    type: {
      type: String,
      enum: ['assignment', 'quiz', 'midterm', 'final', 'project', 'presentation'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    dueDate: Date,
    totalMarks: {
      type: Number,
      min: [0, 'Total marks cannot be negative']
    },
    weightage: {
      type: Number,
      min: [0, 'Weightage cannot be negative'],
      max: [100, 'Weightage cannot exceed 100%']
    }
  }],
  
  // Course Materials
  materials: [{
    title: String,
    type: {
      type: String,
      enum: ['textbook', 'reference', 'article', 'video', 'website', 'other']
    },
    author: String,
    url: String,
    isRequired: {
      type: Boolean,
      default: false
    }
  }],
  
  // Course Announcements
  announcements: [{
    title: String,
    content: String,
    date: {
      type: Date,
      default: Date.now
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  }]
}, {
  timestamps: true
});

// Indexes for better performance
courseSchema.index({ courseCode: 1 });
courseSchema.index({ department: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ 'schedule.semester': 1, 'schedule.year': 1 });
courseSchema.index({ status: 1 });

// Check if course is full
courseSchema.methods.isFull = function() {
  return this.currentEnrollment >= this.maxEnrollment;
};

// Get available spots
courseSchema.methods.getAvailableSpots = function() {
  return Math.max(0, this.maxEnrollment - this.currentEnrollment);
};

// Check if student can enroll
courseSchema.methods.canStudentEnroll = function(studentId) {
  const isAlreadyEnrolled = this.enrolledStudents.some(
    enrollment => enrollment.student.toString() === studentId.toString() && 
    enrollment.status === 'enrolled'
  );
  return !this.isFull() && !isAlreadyEnrolled && this.status === 'active';
};

module.exports = mongoose.model('Course', courseSchema);

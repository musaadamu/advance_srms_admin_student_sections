const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  // Reference to User model
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Staff-specific Information
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    uppercase: true
  },
  
  // Position Information
  position: {
    type: String,
    required: [true, 'Position is required'],
    enum: [
      'Professor', 'Associate Professor', 'Assistant Professor', 
      'Lecturer', 'Senior Lecturer', 'Teaching Assistant',
      'Department Head', 'Dean', 'Administrator', 'Support Staff'
    ]
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: [
      'Computer Science', 'Engineering', 'Business Administration',
      'Medicine', 'Arts and Humanities', 'Natural Sciences',
      'Mathematics', 'Physics', 'Chemistry', 'Biology',
      'Administration', 'Student Services', 'Other'
    ]
  },
  
  // Employment Information
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'visiting'],
    default: 'full-time'
  },
  hireDate: {
    type: Date,
    required: [true, 'Hire date is required']
  },
  salary: {
    type: Number,
    min: [0, 'Salary cannot be negative']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on-leave', 'terminated', 'retired'],
    default: 'active'
  },
  
  // Academic Qualifications
  qualifications: [{
    degree: {
      type: String,
      required: true,
      enum: ['Bachelor', 'Master', 'PhD', 'Diploma', 'Certificate', 'Other']
    },
    field: {
      type: String,
      required: true
    },
    institution: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    }
  }],
  
  // Teaching Information
  teachingCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  maxCourseLoad: {
    type: Number,
    default: 4,
    min: [1, 'Course load must be at least 1'],
    max: [10, 'Course load cannot exceed 10']
  },
  
  // Office Information
  officeLocation: {
    building: String,
    room: String,
    floor: String
  },
  officeHours: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: String,
    endTime: String
  }],
  
  // Research Information (for academic staff)
  researchAreas: [String],
  publications: [{
    title: String,
    journal: String,
    year: Number,
    authors: [String],
    doi: String
  }],
  
  // Administrative Roles
  administrativeRoles: [{
    role: String,
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Performance Information
  performanceReviews: [{
    reviewDate: Date,
    reviewer: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String
  }],
  
  // Leave Information
  leaveBalance: {
    annual: {
      type: Number,
      default: 30
    },
    sick: {
      type: Number,
      default: 15
    },
    personal: {
      type: Number,
      default: 5
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
staffSchema.index({ employeeId: 1 });
staffSchema.index({ user: 1 });
staffSchema.index({ department: 1 });
staffSchema.index({ position: 1 });
staffSchema.index({ status: 1 });

// Get current course load
staffSchema.methods.getCurrentCourseLoad = function() {
  return this.teachingCourses.length;
};

// Check if staff can take more courses
staffSchema.methods.canTakeMoreCourses = function() {
  return this.getCurrentCourseLoad() < this.maxCourseLoad;
};

// Get active administrative roles
staffSchema.methods.getActiveAdministrativeRoles = function() {
  return this.administrativeRoles.filter(role => role.isActive);
};

// Calculate years of service
staffSchema.methods.getYearsOfService = function() {
  const now = new Date();
  const hireDate = new Date(this.hireDate);
  return Math.floor((now - hireDate) / (365.25 * 24 * 60 * 60 * 1000));
};

module.exports = mongoose.model('Staff', staffSchema);

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // Reference to User model
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Student-specific Information
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true,
    uppercase: true
  },

  // Bio-Data Information
  middleName: String,
  nationality: {
    type: String,
    default: 'Nigerian'
  },
  stateOfOrigin: String,
  localGovernment: String,
  religion: {
    type: String,
    enum: ['christianity', 'islam', 'traditional', 'other']
  },
  maritalStatus: {
    type: String,
    enum: ['single', 'married', 'divorced', 'widowed'],
    default: 'single'
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  genotype: {
    type: String,
    enum: ['AA', 'AS', 'AC', 'SS', 'SC', 'CC']
  },

  // Academic Information
  program: {
    type: String,
    required: [true, 'Program is required'],
    enum: ['Computer Science', 'Engineering', 'Business Administration', 'Medicine', 'Arts and Humanities', 'Natural Sciences', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Other']
  },
  department: String,
  faculty: {
    type: String,
    enum: ['Science', 'Engineering', 'Arts', 'Medicine', 'Business', 'Education', 'Law']
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  admissionType: {
    type: String,
    enum: ['regular', 'transfer', 'direct_entry', 'part_time', 'distance_learning'],
    default: 'regular'
  },
  entryMode: {
    type: String,
    enum: ['utme', 'direct_entry', 'transfer', 'postgraduate'],
    default: 'utme'
  },
  year: {
    type: Number,
    required: [true, 'Academic year is required'],
    min: [1, 'Year must be at least 1'],
    max: [6, 'Year cannot exceed 6']
  },
  semester: {
    type: Number,
    required: [true, 'Semester is required'],
    min: [1, 'Semester must be at least 1'],
    max: [8, 'Semester cannot exceed 8']
  },

  // Enrollment Information
  enrollmentDate: {
    type: Date,
    required: [true, 'Enrollment date is required'],
    default: Date.now
  },
  expectedGraduation: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'graduated', 'suspended', 'transferred'],
    default: 'active'
  },

  // Academic Performance
  gpa: {
    type: Number,
    min: [0, 'GPA cannot be negative'],
    max: [4, 'GPA cannot exceed 4.0'],
    default: 0
  },
  totalCredits: {
    type: Number,
    default: 0,
    min: [0, 'Credits cannot be negative']
  },

  // Enrolled Courses
  enrolledCourses: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['enrolled', 'completed', 'dropped', 'failed'],
      default: 'enrolled'
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'I', 'W']
    },
    credits: {
      type: Number,
      min: [0, 'Credits cannot be negative']
    }
  }],

  // Address Information
  permanentAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Nigeria'
    }
  },
  contactAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Nigeria'
    }
  },

  // Next of Kin
  nextOfKin: {
    firstName: String,
    lastName: String,
    relationship: String,
    phone: String,
    email: String,
    address: String,
    occupation: String
  },

  // Sponsor Information
  sponsor: {
    firstName: String,
    lastName: String,
    relationship: String,
    phone: String,
    email: String,
    address: String,
    occupation: String,
    organization: String
  },

  // Parent/Guardian Information
  parent: {
    fatherName: String,
    fatherPhone: String,
    fatherEmail: String,
    fatherOccupation: String,
    motherName: String,
    motherPhone: String,
    motherEmail: String,
    motherOccupation: String,
    guardianName: String,
    guardianPhone: String,
    guardianEmail: String,
    guardianRelationship: String
  },

  // Medical Information
  medicalInfo: {
    allergies: String,
    medications: String,
    medicalConditions: String,
    emergencyContact: String,
    bloodType: String,
    physicianName: String,
    physicianPhone: String,
    insuranceProvider: String,
    insuranceNumber: String
  },

  // Emergency Contact (Legacy - keeping for compatibility)
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },

  // Financial Information
  tuitionStatus: {
    type: String,
    enum: ['paid', 'pending', 'overdue', 'partial'],
    default: 'pending'
  },
  scholarships: [{
    name: String,
    amount: Number,
    startDate: Date,
    endDate: Date
  }]
}, {
  timestamps: true
});

// Indexes for better performance
studentSchema.index({ studentId: 1 });
studentSchema.index({ user: 1 });
studentSchema.index({ program: 1, year: 1 });
studentSchema.index({ status: 1 });

// Calculate GPA method
studentSchema.methods.calculateGPA = function() {
  const completedCourses = this.enrolledCourses.filter(course =>
    course.status === 'completed' && course.grade && course.grade !== 'I' && course.grade !== 'W'
  );

  if (completedCourses.length === 0) return 0;

  const gradePoints = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
  };

  let totalPoints = 0;
  let totalCredits = 0;

  completedCourses.forEach(course => {
    const points = gradePoints[course.grade] || 0;
    const credits = course.credits || 0;
    totalPoints += points * credits;
    totalCredits += credits;
  });

  return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
};

// Update total credits method
studentSchema.methods.updateTotalCredits = function() {
  this.totalCredits = this.enrolledCourses
    .filter(course => course.status === 'completed')
    .reduce((total, course) => total + (course.credits || 0), 0);
};

module.exports = mongoose.model('Student', studentSchema);

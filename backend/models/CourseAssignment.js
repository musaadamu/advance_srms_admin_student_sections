const mongoose = require('mongoose');

const courseAssignmentSchema = new mongoose.Schema({
  // Course Information
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },

  // Lecturer Information
  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: [true, 'Lecturer is required']
  },

  // Assignment Details
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: [true, 'Assigning authority (HOD) is required']
  },

  // Academic Period
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    match: [/^\d{4}\/\d{4}$/, 'Academic year must be in format YYYY/YYYY (e.g., 2024/2025)']
  },
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    enum: ['First', 'Second', 'Summer']
  },

  // Assignment Status
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },

  // Assignment Date
  assignmentDate: {
    type: Date,
    default: Date.now
  },

  // Course Load Information
  expectedStudents: {
    type: Number,
    min: [0, 'Expected students cannot be negative'],
    default: 0
  },
  actualStudents: {
    type: Number,
    min: [0, 'Actual students cannot be negative'],
    default: 0
  },

  // Results Status
  resultsSubmitted: {
    type: Boolean,
    default: false
  },
  resultsSubmissionDate: {
    type: Date
  },
  resultsApproved: {
    type: Boolean,
    default: false
  },
  resultsApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  resultsApprovalDate: {
    type: Date
  },

  // Additional Notes
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },

  // Workload Information
  contactHours: {
    type: Number,
    min: [0, 'Contact hours cannot be negative'],
    default: 0
  },
  creditUnits: {
    type: Number,
    min: [0, 'Credit units cannot be negative'],
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
courseAssignmentSchema.index({ course: 1, academicYear: 1, semester: 1 });
courseAssignmentSchema.index({ lecturer: 1, academicYear: 1, semester: 1 });
courseAssignmentSchema.index({ assignedBy: 1 });
courseAssignmentSchema.index({ status: 1 });

// Ensure unique assignment per course per semester
courseAssignmentSchema.index(
  { course: 1, academicYear: 1, semester: 1 },
  { unique: true }
);

// Virtual for assignment duration
courseAssignmentSchema.virtual('assignmentDuration').get(function() {
  if (this.status === 'completed' && this.resultsSubmissionDate) {
    return Math.ceil((this.resultsSubmissionDate - this.assignmentDate) / (1000 * 60 * 60 * 24));
  }
  return Math.ceil((new Date() - this.assignmentDate) / (1000 * 60 * 60 * 24));
});

// Method to check if results can be submitted
courseAssignmentSchema.methods.canSubmitResults = function() {
  return this.status === 'active' && !this.resultsSubmitted;
};

// Method to check if assignment can be modified
courseAssignmentSchema.methods.canModify = function() {
  return this.status === 'active' && !this.resultsSubmitted;
};

// Method to get assignment summary
courseAssignmentSchema.methods.getSummary = function() {
  return {
    courseCode: this.course?.courseCode,
    courseTitle: this.course?.title,
    lecturerName: this.lecturer?.user?.fullName,
    academicPeriod: `${this.academicYear} - ${this.semester} Semester`,
    status: this.status,
    resultsStatus: this.resultsSubmitted ? 'Submitted' : 'Pending',
    studentCount: this.actualStudents || this.expectedStudents
  };
};

// Static method to get lecturer workload
courseAssignmentSchema.statics.getLecturerWorkload = async function(lecturerId, academicYear, semester) {
  // Validate lecturer ID
  if (!lecturerId || lecturerId === 'undefined' || lecturerId === undefined) {
    console.error('Invalid lecturer ID provided to getLecturerWorkload:', lecturerId);
    return {
      totalCourses: 0,
      totalCredits: 0,
      totalStudents: 0,
      assignments: []
    };
  }

  try {
    const assignments = await this.find({
      lecturer: lecturerId,
      academicYear,
      semester,
      status: 'active'
    }).populate('course', 'courseCode title credits');

    const totalCourses = assignments.length;
    const totalCredits = assignments.reduce((sum, assignment) => sum + (assignment.course?.credits || 0), 0);
    const totalStudents = assignments.reduce((sum, assignment) => sum + (assignment.actualStudents || 0), 0);

    return {
      totalCourses,
      totalCredits,
      totalStudents,
      assignments
    };
  } catch (error) {
    console.error('Error in getLecturerWorkload:', error);
    return {
      totalCourses: 0,
      totalCredits: 0,
      totalStudents: 0,
      assignments: []
    };
  }
};

// Static method to get department course assignments
courseAssignmentSchema.statics.getDepartmentAssignments = async function(department, academicYear, semester) {
  return await this.find({
    academicYear,
    semester,
    status: 'active'
  })
  .populate({
    path: 'course',
    match: { department },
    select: 'courseCode title department credits'
  })
  .populate({
    path: 'lecturer',
    populate: {
      path: 'user',
      select: 'firstName lastName email'
    }
  })
  .populate('assignedBy', 'user')
  .then(assignments => assignments.filter(assignment => assignment.course));
};

module.exports = mongoose.model('CourseAssignment', courseAssignmentSchema);

const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  // Basic Department Information
  name: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Department code is required'],
    unique: true,
    uppercase: true,
    match: [/^[A-Z]{2,8}$/, 'Department code must be 2-8 uppercase letters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Faculty Association
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: [true, 'Faculty is required']
  },
  
  // Department Leadership
  head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  assistantHeads: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }],
  
  // Contact Information
  contactInfo: {
    email: {
      type: String,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
    },
    extension: String
  },
  
  // Location Information
  location: {
    building: String,
    floor: String,
    rooms: [String]
  },
  
  // Academic Information
  programs: [{
    name: String,
    level: {
      type: String,
      enum: ['undergraduate', 'graduate', 'postgraduate', 'diploma', 'certificate']
    },
    duration: Number, // in years
    credits: Number
  }],
  
  // Department Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'under-review'],
    default: 'active'
  },
  
  // Establishment Information
  establishedDate: {
    type: Date
  },
  
  // Department Budget (optional)
  budget: {
    annual: Number,
    allocated: Number,
    spent: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  // Department Statistics (will be calculated)
  statistics: {
    totalStaff: {
      type: Number,
      default: 0
    },
    totalStudents: {
      type: Number,
      default: 0
    },
    totalCourses: {
      type: Number,
      default: 0
    },
    activePrograms: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Compound index for faculty and department code
departmentSchema.index({ faculty: 1, code: 1 });
departmentSchema.index({ name: 1 });
departmentSchema.index({ status: 1 });

// Virtual for staff members
departmentSchema.virtual('staffMembers', {
  ref: 'Staff',
  localField: '_id',
  foreignField: 'department'
});

// Virtual for courses
departmentSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'department'
});

// Method to update statistics
departmentSchema.methods.updateStatistics = async function() {
  const Staff = mongoose.model('Staff');
  const Student = mongoose.model('Student');
  const Course = mongoose.model('Course');
  
  try {
    const totalStaff = await Staff.countDocuments({ department: this._id });
    const totalStudents = await Student.countDocuments({ program: this._id });
    const totalCourses = await Course.countDocuments({ department: this._id });
    const activePrograms = this.programs.length;
    
    this.statistics = {
      totalStaff,
      totalStudents,
      totalCourses,
      activePrograms
    };
    
    await this.save();
  } catch (error) {
    console.error('Error updating department statistics:', error);
  }
};

// Method to get department hierarchy
departmentSchema.methods.getHierarchy = async function() {
  await this.populate('faculty');
  return {
    faculty: this.faculty,
    department: this
  };
};

module.exports = mongoose.model('Department', departmentSchema);

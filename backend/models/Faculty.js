const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  // Basic Faculty Information
  name: {
    type: String,
    required: [true, 'Faculty name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Faculty name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Faculty code is required'],
    unique: true,
    uppercase: true,
    match: [/^[A-Z]{2,6}$/, 'Faculty code must be 2-6 uppercase letters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Faculty Leadership
  dean: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  associateDeans: [{
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
    website: {
      type: String
    }
  },
  
  // Location Information
  location: {
    building: String,
    floor: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  
  // Faculty Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'under-review'],
    default: 'active'
  },
  
  // Establishment Information
  establishedDate: {
    type: Date
  },
  
  // Faculty Statistics (will be calculated)
  statistics: {
    totalDepartments: {
      type: Number,
      default: 0
    },
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
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
facultySchema.index({ name: 1 });
facultySchema.index({ code: 1 });
facultySchema.index({ status: 1 });

// Virtual for departments
facultySchema.virtual('departments', {
  ref: 'Department',
  localField: '_id',
  foreignField: 'faculty'
});

// Method to update statistics
facultySchema.methods.updateStatistics = async function() {
  const Department = mongoose.model('Department');
  const Staff = mongoose.model('Staff');
  const Student = mongoose.model('Student');
  const Course = mongoose.model('Course');
  
  try {
    // Get all departments in this faculty
    const departments = await Department.find({ faculty: this._id });
    const departmentIds = departments.map(dept => dept._id);
    
    // Count statistics
    const totalDepartments = departments.length;
    const totalStaff = await Staff.countDocuments({ department: { $in: departmentIds } });
    const totalStudents = await Student.countDocuments({ program: { $in: departmentIds } });
    const totalCourses = await Course.countDocuments({ department: { $in: departmentIds } });
    
    this.statistics = {
      totalDepartments,
      totalStaff,
      totalStudents,
      totalCourses
    };
    
    await this.save();
  } catch (error) {
    console.error('Error updating faculty statistics:', error);
  }
};

module.exports = mongoose.model('Faculty', facultySchema);

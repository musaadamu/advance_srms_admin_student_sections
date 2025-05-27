const Student = require('../models/Student');
const User = require('../models/User');
const Course = require('../models/Course');
const { validationResult } = require('express-validator');

// Get all students with pagination and filtering
const getStudents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      program,
      year,
      semester,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (program) filter.program = program;
    if (year) filter.year = parseInt(year);
    if (semester) filter.semester = parseInt(semester);
    if (status) filter.status = status;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build aggregation pipeline for search
    let pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $match: filter }
    ];

    // Add search filter if provided
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'user.firstName': { $regex: search, $options: 'i' } },
            { 'user.lastName': { $regex: search, $options: 'i' } },
            { 'user.email': { $regex: search, $options: 'i' } },
            { studentId: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Add sorting, skip, and limit
    pipeline.push(
      { $sort: sort },
      { $skip: skip },
      { $limit: parseInt(limit) }
    );

    const students = await Student.aggregate(pipeline);

    // Get total count for pagination
    const countPipeline = pipeline.slice(0, -3); // Remove sort, skip, limit
    countPipeline.push({ $count: 'total' });
    const countResult = await Student.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;
    const pages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching students'
    });
  }
};

// Get student by ID
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id)
      .populate('user', '-password')
      .populate('enrolledCourses.course');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Get student by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student'
    });
  }
};

// Create new student
const createStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      // Bio-Data
      firstName,
      lastName,
      middleName,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      nationality,
      stateOfOrigin,
      localGovernment,
      religion,
      maritalStatus,
      bloodGroup,
      genotype,

      // Admission
      studentId,
      program,
      department,
      faculty,
      admissionDate,
      admissionType,
      entryMode,
      year,
      semester,
      expectedGraduation,

      // Address
      permanentAddress,
      contactAddress,

      // Next of Kin
      nextOfKin,

      // Sponsor
      sponsor,

      // Parent
      parent,

      // Medical Info
      medicalInfo
    } = req.body;

    // Check if user with email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if student ID already exists
    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student ID already exists'
      });
    }

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role: 'student',
      phone,
      dateOfBirth,
      gender
    });

    await user.save();

    // Create student
    const student = new Student({
      user: user._id,

      // Bio-Data
      middleName,
      nationality,
      stateOfOrigin,
      localGovernment,
      religion,
      maritalStatus,
      bloodGroup,
      genotype,

      // Admission
      studentId,
      program,
      department,
      faculty,
      admissionDate: admissionDate || new Date(),
      admissionType,
      entryMode,
      year,
      semester,
      expectedGraduation,

      // Address
      permanentAddress,
      contactAddress,

      // Next of Kin
      nextOfKin,

      // Sponsor
      sponsor,

      // Parent
      parent,

      // Medical Info
      medicalInfo
    });

    await student.save();

    // Populate user data for response
    await student.populate('user', '-password');

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating student'
    });
  }
};

// Update student
const updateStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { userData, studentData } = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Update user data if provided
    if (userData) {
      await User.findByIdAndUpdate(
        student.user,
        userData,
        { runValidators: true }
      );
    }

    // Update student data if provided
    if (studentData) {
      Object.assign(student, studentData);
      await student.save();
    }

    // Get updated student with user data
    const updatedStudent = await Student.findById(id).populate('user', '-password');

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating student'
    });
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Deactivate user instead of deleting
    await User.findByIdAndUpdate(student.user, { isActive: false });

    res.json({
      success: true,
      message: 'Student deactivated successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting student'
    });
  }
};

// Enroll student in course
const enrollInCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { courseId } = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already enrolled
    const alreadyEnrolled = student.enrolledCourses.some(
      enrollment => enrollment.course.toString() === courseId
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'Student is already enrolled in this course'
      });
    }

    // Check if course is full
    if (course.currentEnrollment >= course.maxEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Course is full'
      });
    }

    // Enroll student
    student.enrolledCourses.push({
      course: courseId,
      enrollmentDate: new Date(),
      status: 'enrolled',
      credits: course.credits
    });

    await student.save();

    // Update course enrollment
    course.currentEnrollment += 1;
    course.enrolledStudents.push({
      student: id,
      enrollmentDate: new Date(),
      status: 'enrolled'
    });

    await course.save();

    res.json({
      success: true,
      message: 'Student enrolled in course successfully'
    });
  } catch (error) {
    console.error('Enroll in course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while enrolling student'
    });
  }
};

// Get student statistics
const getStudentStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ status: 'active' });

    // New students this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newThisMonth = await Student.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Program count
    const programResult = await Student.aggregate([
      { $group: { _id: '$program' } },
      { $count: 'programCount' }
    ]);
    const programCount = programResult[0]?.programCount || 0;

    const studentsByProgram = await Student.aggregate([
      {
        $group: {
          _id: '$program',
          count: { $sum: 1 }
        }
      }
    ]);

    const studentsByYear = await Student.aggregate([
      {
        $group: {
          _id: '$year',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        newThisMonth,
        programCount,
        studentsByProgram,
        studentsByYear
      }
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student statistics'
    });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  enrollInCourse,
  getStudentStats
};

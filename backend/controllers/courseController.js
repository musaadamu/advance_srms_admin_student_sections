const Course = require('../models/Course');
const Staff = require('../models/Staff');
const Student = require('../models/Student');
const { validationResult } = require('express-validator');

// Get all courses with pagination and filtering
const getCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      department,
      level,
      semester,
      year,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (department) filter.department = department;
    if (level) filter.level = level;
    if (semester) filter['schedule.semester'] = semester;
    if (year) filter['schedule.year'] = parseInt(year);
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { courseCode: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get courses with pagination
    const courses = await Course.find(filter)
      .populate('instructor', 'user employeeId position')
      .populate('assistants', 'user employeeId position')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Populate instructor user data
    await Course.populate(courses, {
      path: 'instructor.user',
      select: 'firstName lastName email'
    });

    // Get total count for pagination
    const total = await Course.countDocuments(filter);
    const pages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching courses'
    });
  }
};

// Get course by ID
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate('instructor', 'user employeeId position department')
      .populate('assistants', 'user employeeId position')
      .populate('enrolledStudents.student', 'user studentId program year');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Populate nested user data
    await Course.populate(course, [
      {
        path: 'instructor.user',
        select: 'firstName lastName email'
      },
      {
        path: 'assistants.user',
        select: 'firstName lastName email'
      },
      {
        path: 'enrolledStudents.student.user',
        select: 'firstName lastName email'
      }
    ]);

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Get course by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching course'
    });
  }
};

// Create new course
const createCourse = async (req, res) => {
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
      courseCode,
      title,
      description,
      credits,
      level,
      department,
      instructor,
      maxEnrollment,
      schedule
    } = req.body;

    // Check if course code already exists
    const existingCourse = await Course.findOne({ courseCode });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'Course code already exists'
      });
    }

    // Verify instructor exists
    const instructorExists = await Staff.findById(instructor);
    if (!instructorExists) {
      return res.status(400).json({
        success: false,
        message: 'Instructor not found'
      });
    }

    // Create course
    const course = new Course({
      courseCode,
      title,
      description,
      credits,
      level,
      department,
      instructor,
      maxEnrollment,
      schedule,
      currentEnrollment: 0
    });

    await course.save();

    // Add course to instructor's teaching courses
    instructorExists.teachingCourses.push(course._id);
    await instructorExists.save();

    // Populate instructor data for response
    await course.populate('instructor', 'user employeeId position');
    await Course.populate(course, {
      path: 'instructor.user',
      select: 'firstName lastName email'
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating course'
    });
  }
};

// Update course
const updateCourse = async (req, res) => {
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
    const updates = req.body;

    // If instructor is being changed, update the teaching courses
    if (updates.instructor) {
      const course = await Course.findById(id);
      if (course && course.instructor.toString() !== updates.instructor) {
        // Remove from old instructor
        await Staff.findByIdAndUpdate(
          course.instructor,
          { $pull: { teachingCourses: id } }
        );

        // Add to new instructor
        await Staff.findByIdAndUpdate(
          updates.instructor,
          { $push: { teachingCourses: id } }
        );
      }
    }

    const course = await Course.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('instructor', 'user employeeId position')
      .populate('assistants', 'user employeeId position');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Populate nested user data
    await Course.populate(course, [
      {
        path: 'instructor.user',
        select: 'firstName lastName email'
      },
      {
        path: 'assistants.user',
        select: 'firstName lastName email'
      }
    ]);

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating course'
    });
  }
};

// Delete course
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if course has enrolled students
    if (course.currentEnrollment > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete course with enrolled students'
      });
    }

    // Remove course from instructor's teaching courses
    await Staff.findByIdAndUpdate(
      course.instructor,
      { $pull: { teachingCourses: id } }
    );

    // Remove course from assistants' teaching courses
    if (course.assistants && course.assistants.length > 0) {
      await Staff.updateMany(
        { _id: { $in: course.assistants } },
        { $pull: { teachingCourses: id } }
      );
    }

    await Course.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting course'
    });
  }
};

// Get course statistics
const getCourseStats = async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments();
    const activeCourses = await Course.countDocuments({ status: 'active' });

    // Total enrollment across all courses
    const enrollmentResult = await Course.aggregate([
      { $group: { _id: null, totalEnrollment: { $sum: '$currentEnrollment' } } }
    ]);
    const totalEnrollment = enrollmentResult[0]?.totalEnrollment || 0;

    // Department count
    const departmentResult = await Course.aggregate([
      { $group: { _id: '$department' } },
      { $count: 'departmentCount' }
    ]);
    const departmentCount = departmentResult[0]?.departmentCount || 0;

    const coursesByDepartment = await Course.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    const coursesByLevel = await Course.aggregate([
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      }
    ]);

    const enrollmentStats = await Course.aggregate([
      {
        $group: {
          _id: null,
          totalEnrollment: { $sum: '$currentEnrollment' },
          totalCapacity: { $sum: '$maxEnrollment' },
          averageEnrollment: { $avg: '$currentEnrollment' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalCourses,
        activeCourses,
        totalEnrollment,
        departmentCount,
        coursesByDepartment,
        coursesByLevel,
        enrollmentStats: enrollmentStats[0] || {
          totalEnrollment: 0,
          totalCapacity: 0,
          averageEnrollment: 0
        }
      }
    });
  } catch (error) {
    console.error('Get course stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching course statistics'
    });
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStats
};

const CourseAssignment = require('../models/CourseAssignment');
const Course = require('../models/Course');
const Staff = require('../models/Staff');
const User = require('../models/User');

// Get all course assignments for a department
const getDepartmentAssignments = async (req, res) => {
  try {
    const { department, academicYear, semester } = req.query;

    if (!department || !academicYear || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Department, academic year, and semester are required'
      });
    }

    const assignments = await CourseAssignment.getDepartmentAssignments(
      department,
      academicYear,
      semester
    );

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Get department assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department assignments'
    });
  }
};

// Get lecturer's course assignments
const getLecturerAssignments = async (req, res) => {
  try {
    const { lecturerId } = req.params;
    const { academicYear, semester } = req.query;

    // Validate lecturer ID
    if (!lecturerId || lecturerId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Valid lecturer ID is required'
      });
    }

    if (!academicYear || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Academic year and semester are required'
      });
    }

    const workload = await CourseAssignment.getLecturerWorkload(
      lecturerId,
      academicYear,
      semester
    );

    res.json({
      success: true,
      data: workload
    });
  } catch (error) {
    console.error('Get lecturer assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lecturer assignments'
    });
  }
};

// Assign course to lecturer (HOD only)
const assignCourse = async (req, res) => {
  try {
    const {
      courseId,
      lecturerId,
      academicYear,
      semester,
      expectedStudents,
      notes
    } = req.body;

    // Validate required fields
    if (!courseId || !lecturerId || !academicYear || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Course, lecturer, academic year, and semester are required'
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if lecturer exists
    const lecturer = await Staff.findById(lecturerId).populate('user');
    if (!lecturer) {
      return res.status(404).json({
        success: false,
        message: 'Lecturer not found'
      });
    }

    // Check if assignment already exists
    const existingAssignment = await CourseAssignment.findOne({
      course: courseId,
      academicYear,
      semester
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'Course is already assigned for this academic period'
      });
    }

    // Get HOD staff record
    const hodUser = req.user;
    const hod = await Staff.findOne({ user: hodUser._id });
    if (!hod) {
      return res.status(403).json({
        success: false,
        message: 'Only staff members can assign courses'
      });
    }

    // Create course assignment
    const assignment = new CourseAssignment({
      course: courseId,
      lecturer: lecturerId,
      assignedBy: hod._id,
      academicYear,
      semester,
      expectedStudents: expectedStudents || 0,
      notes,
      contactHours: course.schedule?.sessions?.length * 2 || 3, // Estimate
      creditUnits: course.credits
    });

    await assignment.save();

    // Populate the assignment for response
    await assignment.populate([
      { path: 'course', select: 'courseCode title credits department' },
      { path: 'lecturer', populate: { path: 'user', select: 'firstName lastName email' } },
      { path: 'assignedBy', populate: { path: 'user', select: 'firstName lastName' } }
    ]);

    res.status(201).json({
      success: true,
      message: 'Course assigned successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Assign course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign course'
    });
  }
};

// Update course assignment
const updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const updates = req.body;

    const assignment = await CourseAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if assignment can be modified
    if (!assignment.canModify()) {
      return res.status(400).json({
        success: false,
        message: 'Assignment cannot be modified after results are submitted'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['expectedStudents', 'actualStudents', 'notes', 'contactHours'];
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        assignment[key] = updates[key];
      }
    });

    await assignment.save();

    await assignment.populate([
      { path: 'course', select: 'courseCode title credits department' },
      { path: 'lecturer', populate: { path: 'user', select: 'firstName lastName email' } }
    ]);

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update assignment'
    });
  }
};

// Cancel course assignment
const cancelAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await CourseAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if assignment can be cancelled
    if (!assignment.canModify()) {
      return res.status(400).json({
        success: false,
        message: 'Assignment cannot be cancelled after results are submitted'
      });
    }

    assignment.status = 'cancelled';
    await assignment.save();

    res.json({
      success: true,
      message: 'Assignment cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel assignment'
    });
  }
};

// Get available lecturers for assignment
const getAvailableLecturers = async (req, res) => {
  try {
    const { department, academicYear, semester } = req.query;

    if (!department) {
      return res.status(400).json({
        success: false,
        message: 'Department is required'
      });
    }

    // Get all staff in the department
    const lecturers = await Staff.find({
      department,
      status: 'active',
      position: { $in: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Senior Lecturer'] }
    }).populate('user', 'firstName lastName email');

    // If academic year and semester provided, get workload info
    if (academicYear && semester) {
      const lecturersWithWorkload = await Promise.all(
        lecturers.map(async (lecturer) => {
          // Ensure lecturer has a valid ID
          if (!lecturer._id) {
            console.warn('Lecturer without ID found:', lecturer);
            return {
              ...lecturer.toObject(),
              workload: {
                totalCourses: 0,
                totalCredits: 0,
                totalStudents: 0,
                assignments: []
              }
            };
          }

          const workload = await CourseAssignment.getLecturerWorkload(
            lecturer._id,
            academicYear,
            semester
          );
          return {
            ...lecturer.toObject(),
            workload
          };
        })
      );

      return res.json({
        success: true,
        data: lecturersWithWorkload
      });
    }

    res.json({
      success: true,
      data: lecturers
    });
  } catch (error) {
    console.error('Get available lecturers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available lecturers'
    });
  }
};

// Get courses available for assignment
const getAvailableCourses = async (req, res) => {
  try {
    const { department, academicYear, semester } = req.query;

    if (!department || !academicYear || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Department, academic year, and semester are required'
      });
    }

    // Get all courses in the department
    const allCourses = await Course.find({
      department,
      status: 'active'
    }).select('courseCode title credits level description');

    // Get already assigned courses
    const assignedCourses = await CourseAssignment.find({
      academicYear,
      semester,
      status: 'active'
    }).populate('course', 'courseCode');

    const assignedCourseIds = assignedCourses.map(assignment => assignment.course._id.toString());

    // Filter out assigned courses
    const availableCourses = allCourses.filter(course =>
      !assignedCourseIds.includes(course._id.toString())
    );

    res.json({
      success: true,
      data: availableCourses
    });
  } catch (error) {
    console.error('Get available courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available courses'
    });
  }
};

module.exports = {
  getDepartmentAssignments,
  getLecturerAssignments,
  assignCourse,
  updateAssignment,
  cancelAssignment,
  getAvailableLecturers,
  getAvailableCourses
};

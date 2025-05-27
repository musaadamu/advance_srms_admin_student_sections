const Result = require('../models/Result');
const CourseAssignment = require('../models/CourseAssignment');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const Course = require('../models/Course');

// Get results for a course assignment (Lecturer view)
const getCourseResults = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // Verify assignment exists and lecturer has access
    const assignment = await CourseAssignment.findById(assignmentId)
      .populate('course', 'courseCode title credits')
      .populate('lecturer', 'user');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Course assignment not found'
      });
    }

    // Check if current user is the assigned lecturer
    const currentStaff = await Staff.findOne({ user: req.user._id });
    if (!currentStaff || assignment.lecturer._id.toString() !== currentStaff._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view results for your assigned courses'
      });
    }

    // Get enrolled students for this course
    const enrolledStudents = await Student.find({
      'enrolledCourses.course': assignment.course._id,
      'enrolledCourses.status': 'enrolled'
    }).populate('user', 'firstName lastName email');

    // Get existing results
    const results = await Result.find({
      courseAssignment: assignmentId
    }).populate('student', 'user studentId');

    // Combine student data with results
    const studentsWithResults = enrolledStudents.map(student => {
      const result = results.find(r => r.student._id.toString() === student._id.toString());
      return {
        student: {
          _id: student._id,
          studentId: student.studentId,
          name: student.user.firstName + ' ' + student.user.lastName,
          email: student.user.email
        },
        result: result || null
      };
    });

    res.json({
      success: true,
      data: {
        assignment,
        studentsWithResults
      }
    });
  } catch (error) {
    console.error('Get course results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course results'
    });
  }
};

// Upload/Update student result
const uploadResult = async (req, res) => {
  try {
    const { assignmentId, studentId } = req.params;
    const resultData = req.body;

    // Verify assignment and lecturer access
    const assignment = await CourseAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Course assignment not found'
      });
    }

    const currentStaff = await Staff.findOne({ user: req.user._id });
    if (!currentStaff || assignment.lecturer.toString() !== currentStaff._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only upload results for your assigned courses'
      });
    }

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if result already exists
    let result = await Result.findOne({
      courseAssignment: assignmentId,
      student: studentId
    });

    if (result) {
      // Update existing result
      if (result.status !== 'draft') {
        return res.status(400).json({
          success: false,
          message: 'Cannot modify submitted results'
        });
      }

      // Update fields
      Object.assign(result, {
        assessments: resultData.assessments,
        attendance: resultData.attendance,
        remarks: resultData.remarks
      });
    } else {
      // Create new result
      result = new Result({
        student: studentId,
        course: assignment.course,
        courseAssignment: assignmentId,
        academicYear: assignment.academicYear,
        semester: assignment.semester,
        submittedBy: currentStaff._id,
        assessments: resultData.assessments,
        attendance: resultData.attendance,
        remarks: resultData.remarks
      });
    }

    await result.save();

    res.json({
      success: true,
      message: 'Result saved successfully',
      data: result
    });
  } catch (error) {
    console.error('Upload result error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload result'
    });
  }
};

// Submit all results for a course (Lecturer)
const submitCourseResults = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // Verify assignment and lecturer access
    const assignment = await CourseAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Course assignment not found'
      });
    }

    const currentStaff = await Staff.findOne({ user: req.user._id });
    if (!currentStaff || assignment.lecturer.toString() !== currentStaff._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get all results for this assignment
    const results = await Result.find({
      courseAssignment: assignmentId,
      status: 'draft'
    });

    if (results.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No draft results found to submit'
      });
    }

    // Update all results to submitted status
    await Result.updateMany(
      { courseAssignment: assignmentId, status: 'draft' },
      { 
        status: 'under-review',
        submissionDate: new Date()
      }
    );

    // Update assignment status
    assignment.resultsSubmitted = true;
    assignment.resultsSubmissionDate = new Date();
    await assignment.save();

    res.json({
      success: true,
      message: `${results.length} results submitted successfully`
    });
  } catch (error) {
    console.error('Submit course results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit results'
    });
  }
};

// Get student results (Student view)
const getStudentResults = async (req, res) => {
  try {
    const { academicYear, semester } = req.query;

    // Get student record
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    // Build query
    const query = { 
      student: student._id,
      status: 'published'
    };

    if (academicYear) query.academicYear = academicYear;
    if (semester) query.semester = semester;

    // Get results
    const results = await Result.find(query)
      .populate('course', 'courseCode title credits department')
      .populate('courseAssignment', 'academicYear semester')
      .sort({ 'course.courseCode': 1 });

    // Calculate GPA if specific semester requested
    let gpaInfo = null;
    if (academicYear && semester) {
      gpaInfo = await Result.calculateGPA(student._id, academicYear, semester);
    }

    res.json({
      success: true,
      data: {
        results,
        gpaInfo
      }
    });
  } catch (error) {
    console.error('Get student results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student results'
    });
  }
};

// Approve results (HOD/Admin)
const approveResults = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // Verify assignment exists
    const assignment = await CourseAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Course assignment not found'
      });
    }

    // Get current staff
    const currentStaff = await Staff.findOne({ user: req.user._id });
    if (!currentStaff) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update results to approved status
    const updateResult = await Result.updateMany(
      { courseAssignment: assignmentId, status: 'under-review' },
      { 
        status: 'finalized',
        approvedBy: currentStaff._id,
        approvalDate: new Date()
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'No results found to approve'
      });
    }

    // Update assignment
    assignment.resultsApproved = true;
    assignment.resultsApprovedBy = currentStaff._id;
    assignment.resultsApprovalDate = new Date();
    assignment.status = 'completed';
    await assignment.save();

    res.json({
      success: true,
      message: `${updateResult.modifiedCount} results approved successfully`
    });
  } catch (error) {
    console.error('Approve results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve results'
    });
  }
};

// Publish results (Make visible to students)
const publishResults = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // Update results to published status
    const updateResult = await Result.updateMany(
      { courseAssignment: assignmentId, status: 'finalized' },
      { 
        status: 'published',
        publishedDate: new Date()
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'No approved results found to publish'
      });
    }

    res.json({
      success: true,
      message: `${updateResult.modifiedCount} results published successfully`
    });
  } catch (error) {
    console.error('Publish results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish results'
    });
  }
};

module.exports = {
  getCourseResults,
  uploadResult,
  submitCourseResults,
  getStudentResults,
  approveResults,
  publishResults
};

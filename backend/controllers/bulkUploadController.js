const User = require('../models/User');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const Course = require('../models/Course');
const bcrypt = require('bcryptjs');

// Helper functions for data conversion
const getYearFromString = (yearString) => {
  const yearMap = {
    'freshman': 1,
    'sophomore': 2,
    'junior': 3,
    'senior': 4,
    'graduate': 5
  };
  return yearMap[yearString.toLowerCase()] || 1;
};

const getSemesterFromString = (semesterString) => {
  // Extract semester number from string like "Fall 2024" or "Spring 2024"
  if (semesterString.toLowerCase().includes('fall')) return 1;
  if (semesterString.toLowerCase().includes('spring')) return 2;
  if (semesterString.toLowerCase().includes('summer')) return 3;
  return 1; // Default to fall semester
};

const getStatusFromString = (statusString) => {
  const statusMap = {
    'good standing': 'active',
    'probation': 'active',
    'suspension': 'suspended'
  };
  return statusMap[statusString.toLowerCase()] || 'active';
};

// Bulk upload users
const bulkUploadUsers = async (req, res) => {
  try {
    const users = req.body;
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < users.length; i++) {
      const userData = users[i];
      const rowNumber = i + 1;

      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            field: 'email',
            message: 'User with this email already exists',
            data: userData
          });
          continue;
        }

        // Hash password (use email as default password)
        const defaultPassword = userData.email.split('@')[0] + '123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);

        // Create user
        const user = new User({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          phone: userData.phone,
          dateOfBirth: userData.dateOfBirth,
          gender: userData.gender,
          address: userData.address,
          isActive: userData.isActive !== false,
          department: userData.department,
          position: userData.position
        });

        await user.save();
        results.success++;

      } catch (error) {
        results.failed++;
        results.errors.push({
          row: rowNumber,
          field: 'general',
          message: error.message,
          data: userData
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk upload completed. ${results.success} users created, ${results.failed} failed.`,
      data: results
    });

  } catch (error) {
    console.error('Bulk upload users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bulk upload',
      error: error.message
    });
  }
};

// Bulk upload students
const bulkUploadStudents = async (req, res) => {
  try {
    const students = req.body;
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < students.length; i++) {
      const studentData = students[i];
      const rowNumber = i + 1;

      try {
        // Find the user by email
        const user = await User.findOne({ email: studentData.userEmail });
        if (!user) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            field: 'userEmail',
            message: 'User with this email not found',
            data: studentData
          });
          continue;
        }

        // Check if student record already exists
        const existingStudent = await Student.findOne({
          $or: [
            { user: user._id },
            { studentId: studentData.studentId }
          ]
        });

        if (existingStudent) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            field: 'studentId',
            message: 'Student record already exists',
            data: studentData
          });
          continue;
        }

        // Create student record
        const student = new Student({
          user: user._id,
          studentId: studentData.studentId,
          program: studentData.academicInfo.program,
          department: studentData.academicInfo.major,
          faculty: studentData.academicInfo.faculty || 'Science',
          enrollmentDate: studentData.academicInfo.enrollmentDate,
          expectedGraduation: studentData.academicInfo.expectedGraduation,
          year: getYearFromString(studentData.academicInfo.currentYear),
          semester: getSemesterFromString(studentData.academicInfo.currentSemester),
          status: getStatusFromString(studentData.academicInfo.academicStatus),
          gpa: studentData.academicInfo.gpa || 0,
          totalCredits: studentData.academicInfo.totalCredits || 0,
          emergencyContact: studentData.emergencyContact,
          medicalInfo: {
            allergies: studentData.medicalInfo.allergies,
            medications: studentData.medicalInfo.medications,
            medicalConditions: studentData.medicalInfo.conditions
          }
        });

        await student.save();
        results.success++;

      } catch (error) {
        results.failed++;
        results.errors.push({
          row: rowNumber,
          field: 'general',
          message: error.message,
          data: studentData
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk upload completed. ${results.success} students created, ${results.failed} failed.`,
      data: results
    });

  } catch (error) {
    console.error('Bulk upload students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bulk upload',
      error: error.message
    });
  }
};

// Bulk upload courses
const bulkUploadCourses = async (req, res) => {
  try {
    const courses = req.body;
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < courses.length; i++) {
      const courseData = courses[i];
      const rowNumber = i + 1;

      try {
        // Check if course already exists
        const existingCourse = await Course.findOne({ courseCode: courseData.courseCode });
        if (existingCourse) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            field: 'courseCode',
            message: 'Course with this code already exists',
            data: courseData
          });
          continue;
        }

        // Find instructor user first, then staff record
        const instructorUser = await User.findOne({ email: courseData.instructorEmail });
        if (!instructorUser) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            field: 'instructorEmail',
            message: 'Instructor user with this email not found',
            data: courseData
          });
          continue;
        }

        // Find staff record for the instructor
        const instructor = await Staff.findOne({ user: instructorUser._id });
        if (!instructor) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            field: 'instructorEmail',
            message: 'Staff record not found for this instructor',
            data: courseData
          });
          continue;
        }

        // Create course
        const course = new Course({
          courseCode: courseData.courseCode,
          title: courseData.title,
          description: courseData.description,
          credits: courseData.credits,
          level: courseData.level,
          department: courseData.department,
          instructor: instructor._id,
          maxEnrollment: courseData.maxEnrollment,
          currentEnrollment: 0,
          schedule: {
            semester: courseData.semester,
            year: courseData.year,
            sessions: courseData.schedule.sessions.map(session => ({
              day: session.days[0], // Take first day for now
              startTime: session.startTime,
              endTime: session.endTime,
              location: session.location,
              type: 'lecture'
            }))
          },
          prerequisites: courseData.prerequisites.map(prereq => ({
            course: null, // Will need to be resolved later
            minimumGrade: prereq.minimumGrade
          })),
          materials: courseData.materials.required.map(material => ({
            title: material,
            type: 'textbook',
            isRequired: true
          })).concat(courseData.materials.optional.map(material => ({
            title: material,
            type: 'reference',
            isRequired: false
          }))),
          status: courseData.status === 'active' ? 'active' : 'inactive'
        });

        await course.save();
        results.success++;

      } catch (error) {
        results.failed++;
        results.errors.push({
          row: rowNumber,
          field: 'general',
          message: error.message,
          data: courseData
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk upload completed. ${results.success} courses created, ${results.failed} failed.`,
      data: results
    });

  } catch (error) {
    console.error('Bulk upload courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bulk upload',
      error: error.message
    });
  }
};

// Get bulk upload template
const getBulkUploadTemplate = async (req, res) => {
  try {
    const { type } = req.params;

    const templates = {
      users: {
        name: 'Users_Template',
        description: 'Template for bulk uploading users',
        fields: [
          'firstName', 'lastName', 'email', 'role', 'phone', 'dateOfBirth',
          'gender', 'address_street', 'address_city', 'address_state',
          'address_zipCode', 'address_country', 'isActive', 'department', 'position'
        ]
      },
      students: {
        name: 'Students_Template',
        description: 'Template for bulk uploading students',
        fields: [
          'user_email', 'studentId', 'program', 'major', 'minor', 'enrollmentDate',
          'expectedGraduation', 'currentYear', 'currentSemester', 'academicStatus',
          'gpa', 'totalCredits', 'emergencyContact_name', 'emergencyContact_phone',
          'emergencyContact_relationship', 'medicalInfo_allergies', 'medicalInfo_medications',
          'medicalInfo_conditions', 'financialAid_type', 'financialAid_amount', 'advisor_email'
        ]
      },
      courses: {
        name: 'Courses_Template',
        description: 'Template for bulk uploading courses',
        fields: [
          'courseCode', 'title', 'description', 'credits', 'level', 'department',
          'faculty', 'maxEnrollment', 'instructor_email', 'schedule_days',
          'schedule_startTime', 'schedule_endTime', 'schedule_building', 'schedule_room',
          'prerequisites', 'materials_required', 'materials_optional', 'status', 'semester', 'year'
        ]
      }
    };

    const template = templates[type];
    if (!template) {
      return res.status(400).json({
        success: false,
        message: 'Invalid template type'
      });
    }

    res.status(200).json({
      success: true,
      data: template
    });

  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get template',
      error: error.message
    });
  }
};

module.exports = {
  bulkUploadUsers,
  bulkUploadStudents,
  bulkUploadCourses,
  getBulkUploadTemplate
};

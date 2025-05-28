const User = require('../models/User');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const Course = require('../models/Course');
const CourseAssignment = require('../models/CourseAssignment');
const Payment = require('../models/Payment');
const Result = require('../models/Result');
const Department = require('../models/Department');
const Faculty = require('../models/Faculty');
const Exam = require('../models/Exam');
const Program = require('../models/Program');
const CalendarEvent = require('../models/CalendarEvent');
const ActivityLog = require('../models/ActivityLog');

// Get comprehensive dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const { user } = req;
    
    // Get current academic year and semester (you can make this dynamic)
    const currentAcademicYear = '2024/2025';
    const currentSemester = 'First';

    // Base statistics available to all roles
    const baseStats = {
      timestamp: new Date(),
      academicYear: currentAcademicYear,
      semester: currentSemester
    };

    // Role-based statistics
    let stats = { ...baseStats };

    // Admin - Full statistics
    if (user.role === 'admin') {
      const [
        totalUsers,
        totalStudents,
        activeStudents,
        totalStaff,
        totalCourses,
        activeCourses,
        totalDepartments,
        totalFaculties,
        totalPayments,
        pendingPayments,
        totalResults,
        pendingResults,
        totalAssignments,
        upcomingExamsCount,
        activeProgramsCount,
        calendarEventsCount,
        recentActivities
      ] = await Promise.all([
        User.countDocuments(),
        Student.countDocuments(),
        Student.countDocuments({ status: 'active' }),
        Staff.countDocuments(),
        Course.countDocuments(),
        Course.countDocuments({ status: 'active' }),
        Department.countDocuments(),
        Faculty.countDocuments(),
        Payment.countDocuments(),
        Payment.countDocuments({ status: 'pending' }),
        Result.countDocuments(),
        Result.countDocuments({ status: 'pending' }),
        CourseAssignment.countDocuments({ academicYear: currentAcademicYear, semester: currentSemester }),
        Exam.countDocuments({ date: { $gte: new Date() } }),
        Program.countDocuments({ isActive: true }),
        CalendarEvent.countDocuments({ date: { $gte: new Date() } }),
        ActivityLog.find().sort({ createdAt: -1 }).limit(10)
      ]);

      // Calculate financial summary
      const paymentSummary = await Payment.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            paidAmount: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] } },
            pendingAmount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } }
          }
        }
      ]);

      stats = {
        ...stats,
        users: {
          total: totalUsers,
          staff: totalStaff,
          students: totalStudents,
          activeStudents
        },
        academic: {
          courses: {
            total: totalCourses,
            active: activeCourses
          },
          departments: totalDepartments,
          faculties: totalFaculties,
          assignments: totalAssignments
        },
        financial: {
          totalPayments,
          pendingPayments,
          summary: paymentSummary[0] || { totalAmount: 0, paidAmount: 0, pendingAmount: 0 }
        },
        results: {
          total: totalResults,
          pending: pendingResults
        },
        exams: {
          upcoming: upcomingExamsCount
        },
        programs: {
          active: activeProgramsCount
        },
        calendar: {
          events: calendarEventsCount
        },
        recentActivity: recentActivities
      };
    }

    // HOD - Department specific statistics
    else if (user.role === 'hod') {
      // Get HOD's department
      const staffRecord = await Staff.findOne({ user: user._id }).populate('department');
      if (!staffRecord || !staffRecord.department) {
        return res.status(400).json({
          success: false,
          message: 'Department not found for HOD'
        });
      }

      const departmentId = staffRecord.department._id;

      const [
        departmentStaff,
        departmentCourses,
        departmentStudents,
        departmentAssignments
      ] = await Promise.all([
        Staff.countDocuments({ department: departmentId }),
        Course.countDocuments({ department: departmentId }),
        Student.countDocuments({ program: { $regex: staffRecord.department.name, $options: 'i' } }),
        CourseAssignment.countDocuments({ 
          academicYear: currentAcademicYear, 
          semester: currentSemester 
        }).populate({
          path: 'course',
          match: { department: departmentId }
        })
      ]);

      stats = {
        ...stats,
        department: {
          name: staffRecord.department.name,
          staff: departmentStaff,
          courses: departmentCourses,
          students: departmentStudents,
          assignments: departmentAssignments
        }
      };
    }

    // Lecturer - Personal statistics
    else if (user.role === 'lecturer') {
      const staffRecord = await Staff.findOne({ user: user._id });
      if (!staffRecord) {
        return res.status(400).json({
          success: false,
          message: 'Staff record not found'
        });
      }

      const [
        myCourses,
        myStudents,
        pendingResults
      ] = await Promise.all([
        CourseAssignment.countDocuments({ 
          lecturer: staffRecord._id,
          academicYear: currentAcademicYear,
          semester: currentSemester
        }),
        CourseAssignment.aggregate([
          {
            $match: {
              lecturer: staffRecord._id,
              academicYear: currentAcademicYear,
              semester: currentSemester
            }
          },
          {
            $group: {
              _id: null,
              totalStudents: { $sum: '$actualStudents' }
            }
          }
        ]),
        Result.countDocuments({ 
          lecturer: staffRecord._id,
          status: 'pending'
        })
      ]);

      stats = {
        ...stats,
        lecturer: {
          courses: myCourses,
          students: myStudents[0]?.totalStudents || 0,
          pendingResults
        }
      };
    }

    // Registrar - Student focused statistics
    else if (user.role === 'registrar') {
      const [
        totalStudents,
        activeStudents,
        newAdmissions,
        graduatingStudents,
        totalResults,
        pendingResults
      ] = await Promise.all([
        Student.countDocuments(),
        Student.countDocuments({ status: 'active' }),
        Student.countDocuments({ 
          createdAt: { 
            $gte: new Date(new Date().getFullYear(), 0, 1) // This year
          }
        }),
        Student.countDocuments({ status: 'graduating' }),
        Result.countDocuments(),
        Result.countDocuments({ status: 'pending' })
      ]);

      stats = {
        ...stats,
        students: {
          total: totalStudents,
          active: activeStudents,
          newAdmissions,
          graduating: graduatingStudents
        },
        results: {
          total: totalResults,
          pending: pendingResults
        }
      };
    }

    // Finance Officer - Financial statistics
    else if (user.role === 'finance_officer') {
      const [
        totalPayments,
        completedPayments,
        pendingPayments,
        paymentSummary,
        monthlyPayments
      ] = await Promise.all([
        Payment.countDocuments(),
        Payment.countDocuments({ status: 'completed' }),
        Payment.countDocuments({ status: 'pending' }),
        Payment.aggregate([
          {
            $group: {
              _id: null,
              totalAmount: { $sum: '$amount' },
              paidAmount: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] } },
              pendingAmount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } }
            }
          }
        ]),
        Payment.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              }
            }
          },
          {
            $group: {
              _id: null,
              monthlyTotal: { $sum: '$amount' },
              monthlyCount: { $sum: 1 }
            }
          }
        ])
      ]);

      stats = {
        ...stats,
        financial: {
          payments: {
            total: totalPayments,
            completed: completedPayments,
            pending: pendingPayments
          },
          summary: paymentSummary[0] || { totalAmount: 0, paidAmount: 0, pendingAmount: 0 },
          monthly: monthlyPayments[0] || { monthlyTotal: 0, monthlyCount: 0 }
        }
      };
    }

    // Default statistics for other roles
    else {
      const [
        totalStudents,
        totalCourses,
        totalStaff
      ] = await Promise.all([
        Student.countDocuments(),
        Course.countDocuments(),
        Staff.countDocuments()
      ]);

      stats = {
        ...stats,
        overview: {
          students: totalStudents,
          courses: totalCourses,
          staff: totalStaff
        }
      };
    }

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

module.exports = {
  getDashboardStats
};

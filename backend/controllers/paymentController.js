const Payment = require('../models/Payment');
const Student = require('../models/Student');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Get all payments with filtering and pagination
const getPayments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      student,
      semester,
      academicYear,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (student) filter.student = student;
    if (semester) filter.semester = semester;
    if (academicYear) filter.academicYear = academicYear;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build aggregation pipeline for search
    let pipeline = [
      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'studentData'
        }
      },
      { $unwind: '$studentData' },
      {
        $lookup: {
          from: 'users',
          localField: 'studentData.user',
          foreignField: '_id',
          as: 'userData'
        }
      },
      { $unwind: '$userData' },
      { $match: filter }
    ];

    // Add search filter if provided
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'userData.firstName': { $regex: search, $options: 'i' } },
            { 'userData.lastName': { $regex: search, $options: 'i' } },
            { 'userData.email': { $regex: search, $options: 'i' } },
            { 'studentData.studentId': { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { transactionId: { $regex: search, $options: 'i' } }
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

    const payments = await Payment.aggregate(pipeline);

    // Get total count for pagination
    const countPipeline = pipeline.slice(0, -3); // Remove sort, skip, limit
    countPipeline.push({ $count: 'total' });
    const countResult = await Payment.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;
    const pages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payments'
    });
  }
};

// Get payment by ID
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id)
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: '-password'
        }
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Get payment by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment'
    });
  }
};

// Create new payment
const createPayment = async (req, res) => {
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
      student,
      type,
      amount,
      currency = 'USD',
      description,
      dueDate,
      semester,
      academicYear
    } = req.body;

    // Verify student exists
    const studentExists = await Student.findById(student);
    if (!studentExists) {
      return res.status(400).json({
        success: false,
        message: 'Student not found'
      });
    }

    const payment = new Payment({
      student,
      type,
      amount,
      currency,
      description,
      dueDate,
      semester,
      academicYear,
      status: 'pending'
    });

    await payment.save();

    // Populate student data for response
    await payment.populate({
      path: 'student',
      populate: {
        path: 'user',
        select: '-password'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: payment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating payment'
    });
  }
};

// Update payment
const updatePayment = async (req, res) => {
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

    const payment = await Payment.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate({
      path: 'student',
      populate: {
        path: 'user',
        select: '-password'
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment updated successfully',
      data: payment
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating payment'
    });
  }
};

// Process payment (mark as paid)
const processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, transactionId, notes } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment is already processed'
      });
    }

    payment.status = 'paid';
    payment.paidDate = new Date();
    payment.paymentMethod = paymentMethod;
    payment.transactionId = transactionId;
    if (notes) payment.notes = notes;

    await payment.save();

    await payment.populate({
      path: 'student',
      populate: {
        path: 'user',
        select: '-password'
      }
    });

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: payment
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing payment'
    });
  }
};

// Refund payment
const refundPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { refundAmount, reason } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Can only refund paid payments'
      });
    }

    // Create refund record
    const refund = new Payment({
      student: payment.student,
      type: 'refund',
      amount: -Math.abs(refundAmount || payment.amount),
      currency: payment.currency,
      description: `Refund for: ${payment.description}`,
      dueDate: new Date(),
      semester: payment.semester,
      academicYear: payment.academicYear,
      status: 'paid',
      paidDate: new Date(),
      paymentMethod: payment.paymentMethod,
      originalPayment: payment._id,
      refundReason: reason
    });

    await refund.save();

    await refund.populate({
      path: 'student',
      populate: {
        path: 'user',
        select: '-password'
      }
    });

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: refund
    });
  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing refund'
    });
  }
};

// Get payment statistics
const getPaymentStats = async (req, res) => {
  try {
    const { semester, academicYear } = req.query;

    const filter = {};
    if (semester) filter.semester = semester;
    if (academicYear) filter.academicYear = academicYear;

    // Total payments
    const totalPayments = await Payment.countDocuments(filter);

    // Payment status breakdown
    const statusStats = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Payment type breakdown
    const typeStats = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Monthly revenue
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          ...filter,
          status: 'paid',
          paidDate: { $exists: true }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$paidDate' },
            month: { $month: '$paidDate' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Recent payments
    const recentPayments = await Payment.find(filter)
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: 'firstName lastName email'
        }
      })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        totalPayments,
        statusStats,
        typeStats,
        monthlyRevenue,
        recentPayments
      }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment statistics'
    });
  }
};

// Apply late fee
const applyLateFee = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    await payment.applyLateFee(amount, req.user.id);

    res.json({
      success: true,
      message: 'Late fee applied successfully',
      data: payment
    });
  } catch (error) {
    console.error('Apply late fee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while applying late fee'
    });
  }
};

// Waive late fee
const waiveLateFee = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    await payment.waiveLateFee(reason, req.user.id);

    res.json({
      success: true,
      message: 'Late fee waived successfully',
      data: payment
    });
  } catch (error) {
    console.error('Waive late fee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while waiving late fee'
    });
  }
};

// Apply discount
const applyDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, value, reason } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    await payment.applyDiscount(type, value, reason, req.user.id);

    res.json({
      success: true,
      message: 'Discount applied successfully',
      data: payment
    });
  } catch (error) {
    console.error('Apply discount error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while applying discount'
    });
  }
};

// Get financial reports
const getFinancialReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Total revenue (paid payments)
    const revenueResult = await Payment.aggregate([
      { $match: { ...filter, status: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Outstanding payments
    const outstandingResult = await Payment.aggregate([
      { $match: { ...filter, status: { $in: ['pending', 'overdue'] } } },
      {
        $group: {
          _id: null,
          totalOutstanding: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    const totalOutstanding = outstandingResult[0]?.totalOutstanding || 0;
    const outstandingCount = outstandingResult[0]?.count || 0;

    // Overdue payments
    const overdueResult = await Payment.aggregate([
      { $match: { ...filter, status: 'overdue' } },
      {
        $group: {
          _id: null,
          totalOverdue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    const totalOverdue = overdueResult[0]?.totalOverdue || 0;
    const overdueCount = overdueResult[0]?.count || 0;

    // Collection rate
    const totalDue = totalRevenue + totalOutstanding;
    const collectionRate = totalDue > 0 ? (totalRevenue / totalDue) * 100 : 0;

    // Payment type distribution
    const paymentTypeDistribution = await Payment.aggregate([
      { $match: { ...filter, status: 'paid' } },
      { $group: { _id: '$type', amount: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $project: { name: '$_id', amount: 1, count: 1, _id: 0 } }
    ]);

    // Status summary
    const statusSummary = await Payment.aggregate([
      { $match: filter },
      { $group: { _id: '$status', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    // Top outstanding payments
    const topOutstanding = await Payment.find({
      ...filter,
      status: { $in: ['pending', 'overdue'] }
    })
    .populate({
      path: 'student',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .sort({ amount: -1 })
    .limit(10)
    .lean();

    // Add days overdue calculation
    const topOutstandingWithDays = topOutstanding.map(payment => ({
      ...payment,
      daysOverdue: Math.max(0, Math.floor((new Date() - new Date(payment.dueDate)) / (1000 * 60 * 60 * 24)))
    }));

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOutstanding,
        outstandingCount,
        totalOverdue,
        overdueCount,
        collectionRate,
        paymentTypeDistribution,
        statusSummary,
        topOutstanding: topOutstandingWithDays
      }
    });
  } catch (error) {
    console.error('Get financial reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating financial reports'
    });
  }
};

module.exports = {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  processPayment,
  refundPayment,
  getPaymentStats,
  applyLateFee,
  waiveLateFee,
  applyDiscount,
  getFinancialReports
};

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Student Information
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student is required']
  },
  
  // Payment Details
  type: {
    type: String,
    enum: ['tuition', 'registration', 'library', 'laboratory', 'examination', 'accommodation', 'meal_plan', 'parking', 'technology', 'health', 'activity', 'graduation', 'transcript', 'late_fee', 'refund', 'other'],
    required: [true, 'Payment type is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Academic Period
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    enum: ['Fall', 'Spring', 'Summer']
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY (e.g., 2023-2024)']
  },
  
  // Payment Status and Dates
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'cancelled', 'refunded', 'partial'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  paidDate: {
    type: Date
  },
  
  // Payment Method Information
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'bank_transfer', 'cash', 'check', 'online', 'mobile_payment', 'scholarship', 'financial_aid']
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Additional Payment Information
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  // Refund Information
  originalPayment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  refundReason: {
    type: String,
    maxlength: [500, 'Refund reason cannot exceed 500 characters']
  },
  
  // Partial Payment Information
  partialPayments: [{
    amount: {
      type: Number,
      required: true
    },
    paidDate: {
      type: Date,
      required: true
    },
    paymentMethod: {
      type: String,
      required: true
    },
    transactionId: String,
    notes: String
  }],
  
  // Late Fee Information
  lateFee: {
    amount: {
      type: Number,
      default: 0
    },
    appliedDate: Date,
    waived: {
      type: Boolean,
      default: false
    },
    waivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    waivedReason: String
  },
  
  // Discount Information
  discount: {
    type: {
      type: String,
      enum: ['percentage', 'fixed']
    },
    value: Number,
    reason: String,
    appliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appliedDate: Date
  },
  
  // Administrative Information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Audit Trail
  auditLog: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'paid', 'refunded', 'cancelled', 'late_fee_applied', 'late_fee_waived', 'discount_applied']
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String,
    previousValues: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Indexes for better performance
paymentSchema.index({ student: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ type: 1 });
paymentSchema.index({ dueDate: 1 });
paymentSchema.index({ academicYear: 1, semester: 1 });
paymentSchema.index({ transactionId: 1 }, { sparse: true });

// Virtual for total amount including late fees
paymentSchema.virtual('totalAmount').get(function() {
  return this.amount + (this.lateFee?.amount || 0);
});

// Virtual for amount after discount
paymentSchema.virtual('discountedAmount').get(function() {
  if (!this.discount) return this.amount;
  
  if (this.discount.type === 'percentage') {
    return this.amount * (1 - this.discount.value / 100);
  } else {
    return Math.max(0, this.amount - this.discount.value);
  }
});

// Virtual for final amount (after discount, including late fees)
paymentSchema.virtual('finalAmount').get(function() {
  const discounted = this.discountedAmount;
  const lateFeeAmount = this.lateFee?.waived ? 0 : (this.lateFee?.amount || 0);
  return discounted + lateFeeAmount;
});

// Method to check if payment is overdue
paymentSchema.methods.isOverdue = function() {
  return this.status === 'pending' && new Date() > this.dueDate;
};

// Method to apply late fee
paymentSchema.methods.applyLateFee = function(amount, appliedBy) {
  this.lateFee = {
    amount,
    appliedDate: new Date(),
    waived: false
  };
  
  this.auditLog.push({
    action: 'late_fee_applied',
    performedBy: appliedBy,
    details: `Late fee of ${amount} applied`
  });
  
  return this.save();
};

// Method to waive late fee
paymentSchema.methods.waiveLateFee = function(reason, waivedBy) {
  if (!this.lateFee || this.lateFee.amount === 0) {
    throw new Error('No late fee to waive');
  }
  
  this.lateFee.waived = true;
  this.lateFee.waivedBy = waivedBy;
  this.lateFee.waivedReason = reason;
  
  this.auditLog.push({
    action: 'late_fee_waived',
    performedBy: waivedBy,
    details: `Late fee waived: ${reason}`
  });
  
  return this.save();
};

// Method to apply discount
paymentSchema.methods.applyDiscount = function(type, value, reason, appliedBy) {
  this.discount = {
    type,
    value,
    reason,
    appliedBy,
    appliedDate: new Date()
  };
  
  this.auditLog.push({
    action: 'discount_applied',
    performedBy: appliedBy,
    details: `${type} discount of ${value} applied: ${reason}`
  });
  
  return this.save();
};

// Method to process payment
paymentSchema.methods.processPayment = function(paymentData, processedBy) {
  const previousStatus = this.status;
  
  this.status = 'paid';
  this.paidDate = new Date();
  this.paymentMethod = paymentData.paymentMethod;
  this.transactionId = paymentData.transactionId;
  this.processedBy = processedBy;
  
  if (paymentData.notes) {
    this.notes = paymentData.notes;
  }
  
  this.auditLog.push({
    action: 'paid',
    performedBy: processedBy,
    timestamp: new Date(),
    details: `Payment processed via ${paymentData.paymentMethod}`,
    previousValues: { status: previousStatus }
  });
  
  return this.save();
};

// Pre-save middleware to update status based on due date
paymentSchema.pre('save', function(next) {
  if (this.status === 'pending' && this.isOverdue()) {
    this.status = 'overdue';
  }
  next();
});

// Pre-save middleware to add audit log entry
paymentSchema.pre('save', function(next) {
  if (this.isNew) {
    this.auditLog.push({
      action: 'created',
      performedBy: this.createdBy,
      details: 'Payment record created'
    });
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);

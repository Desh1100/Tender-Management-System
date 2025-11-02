const mongoose = require('mongoose');

const tenderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tender title is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Tender location is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Tender category is required'],
    trim: true
  },
  referenceNo: {
    type: String,
    required: [true, 'Tender reference number is required'],
    unique: true,
    trim: true
  },
  startingDate: {
    type: Date,
    required: [true, 'Starting date is required']
  },
  closingDate: {
    type: Date,
    required: [true, 'Closing date is required'],
    validate: {
      validator: function(value) {
        return value > this.startingDate;
      },
      message: 'Closing date must be after starting date'
    }
  },
  details: {
    type: String,
    required: [true, 'Tender details are required'],
    trim: true
  },
  requestId: {
    type: String,
    ref: 'Request',
    required: function() {
      return !this.demandFormId;
    }
  },
  demandFormId: {
    type: String,
    ref: 'DemandForm',
    required: function() {
      return !this.requestId;
    }
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  createdBy: {
    type: String,
    ref: 'User',
    required: [true, 'Creator user ID is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Validation to ensure either requestId or demandFormId is provided, but not both
tenderSchema.pre('save', function(next) {
  if (!this.requestId && !this.demandFormId) {
    return next(new Error('Either requestId or demandFormId must be provided'));
  }
  if (this.requestId && this.demandFormId) {
    return next(new Error('Cannot have both requestId and demandFormId'));
  }
  this.updatedAt = new Date();
  next();
});

// // Update status based on closing date
// tenderSchema.pre('save', function(next) {
//   if (this.closingDate < new Date()) {
//     this.status = 'closed';
//   }
//   this.updatedAt = new Date();
//   next();
// });

// // Update status when querying if closing date has passed
// tenderSchema.pre(/^find/, function(next) {
//   this.updateMany(
//     { closingDate: { $lt: new Date() }, status: 'active' },
//     { $set: { status: 'closed' } }
//   );
//   next();
// });

const Tender = mongoose.model('Tender', tenderSchema);

module.exports = Tender;
const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  subCategory: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  colorPickup: {
    type: String,
    required: true
  },
  currentItemCount: {
    type: Number,
    required: true
  },
  damagedItemCount: {
    type: Number,
    required: true
  },
  newItemRequestCount: {
    type: Number,
    required: true
  },
  note: {
    type: String,
    default: ''
  },
  requestStage: {
    type: String,
    enum: ['HOD', 'Logistics Officer', 'Warehouse Officer', 'Rector', 'Procurement Officer','delivered'],
    default: 'HOD'
  },
  isApproved: {
    type: Boolean,
    default: false
  },


  ProcurementisApproved: {
    type: Boolean,
    default: false
  },
  ProcurementcreatedAt: {
    type: Date,
    default: null
  },
  ProcurementUserID: {
    type: String,
    default: null
  },


  
  RectorisApproved: {
    type: Boolean,
    default: false
  },
  RectorcreatedAt: {
    type: Date,
    default: null
  },
  RectorUserID: {
    type: String,
    default: null
  },




  HODisApproved: {
    type: Boolean,
    default: false
  },
  HODcreatedAt: {
    type: Date,
    default: null
  },
  HODUserID: {
    type: String,
    default: null
  },




  LogisticsisApproved: {
    type: Boolean,
    default: false
  },
  LogisticscreatedAt: {
    type: Date,
    default: null
  },
  LogisticsUserID: {
    type: String,
    default: null
  },





  WarehouseisApproved: {
    type: Boolean,
    default: false
  },
  WarehousecreatedAt: {
    type: Date,
    default: null
  },
  WarehouseUserID: {
    type: String,
    default: null
  },


  
  requestedUserID: {
    type: String,
    required: true
  },
  requestedUserRole: {
    type: String,
    required: true
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

// Update the updatedAt field before saving
RequestSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Request', RequestSchema);
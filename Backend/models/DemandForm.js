const mongoose = require('mongoose');

const DemandItemSchema = new mongoose.Schema({
  srNo: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  partNo: {
    type: String,
    default: ''
  },
  deno: {
    type: String,
    default: ''
  },
  qty: {
    type: Number,
    required: true,
    min: 0
  },
  approxCost: {
    type: Number,
    required: true,
    min: 0
  }
});

const DemandFormSchema = new mongoose.Schema({
  department: {
    type: String,
    required: true
  },
  demandNo: {
    type: String,
    required: true,
    unique: true
  },
  items: {
    type: [DemandItemSchema],
    required: true,
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'At least one item is required'
    }
  },
  totalCost: {
    type: Number,
    default: 0
  },
  requirement: {
    type: String,
    required: true
  },
  specifications: {
    type: String,
    required: true
  },
  useFor: {
    type: String,
    required: true
  },
  corporateStrategyRef: {
    type: String,
    default: ''
  },
  manufacturer: {
    type: String,
    default: ''
  },
  localAgent: {
    type: String,
    default: ''
  },
  otherSuppliers: {
    type: String,
    default: ''
  },
  presentAvailableQty: {
    type: String,
    default: ''
  },
  requirementType: {
    type: String,
    required: true,
    enum: ['Urgent', 'Priority', 'Routine'],
    default: 'Routine'
  },
  requestStage: {
    type: String,
    enum: ['HOD', 'Logistics Officer', 'Bursar', 'Warehouse Officer', 'Rector', 'Procurement Officer', 'delivered', 'Rejected Logistics Officer', 'Rejected Bursar', 'Rejected Rector', 'Rejected Procurement Officer'],
    default: 'HOD'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  
  // HOD Approval details
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

  // Logistics Approval details
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

  // Logistics Log Section Data
  logData: [{
    srNo: {
      type: Number,
      default: null
    },
    availabilityInStock: {
      type: String,
      default: ''
    },
    dateLastIssueMade: {
      type: Date,
      default: null
    },
    dateLastPurchase: {
      type: Date,
      default: null
    },
    lastPurchasePrice: {
      type: Number,
      default: null
    }
  }],
  logNotes: {
    type: String,
    default: ''
  },

  // Bursar Approval details
  BursarisApproved: {
    type: Boolean,
    default: false
  },
  BursarcreatedAt: {
    type: Date,
    default: null
  },
  BursarUserID: {
    type: String,
    default: null
  },

  // Bursar Budget Approval Fields
  bursarBudgetInfo: {
    provisionsAvailability: {
      type: String,
      default: ''
    },
    voteParticulars: {
      type: String,
      default: ''
    },
    provisionsAllocated: {
      type: Number,
      default: 0
    },
    totalExpenditure: {
      type: Number,
      default: 0
    },
    balanceAvailable: {
      type: Number,
      default: 0
    },
    budgetApprovalDate: {
      type: Date,
      default: null
    }
  },

  // Warehouse Approval details
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

  // Rector Approval details
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

  // Procurement Approval details
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

  // Request metadata
  requestedUserID: {
    type: String,
    required: true
  },
  requestedUserRole: {
    type: String,
    required: true
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  note: {
    type: String,
    default: ''
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

// Calculate total cost before saving
DemandFormSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate total cost from items
  if (this.items && this.items.length > 0) {
    this.totalCost = this.items.reduce((total, item) => {
      return total + (item.qty * item.approxCost);
    }, 0);
  }
  
  next();
});

module.exports = mongoose.model('DemandForm', DemandFormSchema);
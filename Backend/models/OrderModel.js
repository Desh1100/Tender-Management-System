const mongoose = require('mongoose');


const orderSchema = new mongoose.Schema({
    tenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tender',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    deliveryDate: {
      type: Date,
      required: true
    },
    notes: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    // Delivery options
    freeDelivery: Boolean,
    deliveryCost: Number,
    estimatedDeliveryDays: Number,
    // Warranty information
    standardWarranty: Number, // in months
    extendedWarranty: Boolean,
    extendedWarrantyPeriod: Number, // in months
    extendedWarrantyCost: Number,
    // Material & Quality
    materialGrade: {
      type: String,
      enum: ['standard', 'premium', 'industrial', 'custom']
    },
    customMaterialSpec: String,
    qualityCertification: Boolean,
    // After-sales service
    installationService: Boolean,
    installationCost: Number,
    maintenanceContract: Boolean,
    maintenancePeriod: Number, // in months
    maintenanceCost: Number,
    maintenanceTerms: String,
    // Additional information
    specialRequirements: String,
    // Payment information
    totalAmount: Number,
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid'],
      default: 'unpaid'
    },
    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  });

  module.exports = mongoose.model('Orders', orderSchema);
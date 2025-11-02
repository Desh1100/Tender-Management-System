const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  profilePicture: { type: String, default: '' },
  address: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  userRole: { type: String, required: true, enum: ['HOD', 'Logistics Officer', 'Warehouse Officer', 'Rector', 'Supplier', 'Procurement Officer', 'Bursar', 'Super Admin'] },
  // Additional fields based on user role
  departmentName: { type: String, default: '' },
  facultyName: { type: String, default: '' },
  officeLocation: { type: String, default: '' },
  employeeId: { type: String, default: '' },
  warehouseName: { type: String, default: '' },
  warehouseLocation: { type: String, default: '' },
  universityName: { type: String, default: '' },
  rectorOfficeAddress: { type: String, default: '' },
  companyName: { type: String, default: '' },
  businessRegistrationNumber: { type: String, default: '' },
  companyAddress: { type: String, default: '' },
  supplierType: { type: String, default: '' },
  contactPersonName: { type: String, default: '' },
  ministryOfDefenceDocument: { type: String, default: '' },
  isActive: { type: Boolean, default: false },

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
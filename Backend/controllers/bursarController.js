const DemandForm = require('../models/DemandForm');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all demand forms pending Bursar approval
const getBursarPendingRequests = catchAsync(async (req, res, next) => {
  const demandForms = await DemandForm.find({
    requestStage: 'Bursar',
    BursarisApproved: false
  }).populate([
    { path: 'HODUserID', model: 'User', select: 'fullName email departmentName facultyName' },
    { path: 'LogisticsUserID', model: 'User', select: 'fullName email departmentName facultyName' }
  ]);

  res.status(200).json({
    status: 'success',
    results: demandForms.length,
    data: demandForms
  });
});

// Get all requests approved by current Bursar
const getBursarApprovedRequests = catchAsync(async (req, res, next) => {
  const { bursarId } = req.params;

  const demandForms = await DemandForm.find({
    BursarUserID: bursarId,
    BursarisApproved: true
  }).populate([
    { path: 'HODUserID', model: 'User', select: 'fullName email departmentName facultyName' },
    { path: 'LogisticsUserID', model: 'User', select: 'fullName email departmentName facultyName' },
    { path: 'RectorUserID', model: 'User', select: 'fullName email universityName rectorOfficeAddress' },
    { path: 'ProcurementUserID', model: 'User', select: 'fullName email departmentName facultyName' }
  ]);

  res.status(200).json({
    status: 'success',
    results: demandForms.length,
    data: demandForms
  });
});

// Approve a demand form by Bursar
const approveDemandForm = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { 
    BursarisApproved, 
    BursarUserID, 
    provisionsAvailability,
    voteParticulars,
    provisionsAllocated,
    totalExpenditure,
    balanceAvailable
  } = req.body;

  // Find the demand form
  const demandForm = await DemandForm.findById(id);
  
  if (!demandForm) {
    return next(new AppError('Demand form not found', 404));
  }

  // Check if the request is at Bursar stage
  if (demandForm.requestStage !== 'Bursar') {
    return next(new AppError('This request is not at Bursar approval stage', 400));
  }

  // Validate required budget information
  if (!provisionsAvailability || !voteParticulars || 
      provisionsAllocated === undefined || totalExpenditure === undefined || 
      balanceAvailable === undefined) {
    return next(new AppError('All budget information fields are required for approval', 400));
  }

  // Check if balance is sufficient for the total cost
  if (balanceAvailable < demandForm.totalCost) {
    return next(new AppError('Insufficient balance available for this demand', 400));
  }

  // Update the demand form with Bursar approval and budget information
  demandForm.BursarisApproved = BursarisApproved;
  demandForm.BursarUserID = BursarUserID;
  demandForm.BursarcreatedAt = new Date();
  
  // Add budget approval information
  demandForm.bursarBudgetInfo = {
    provisionsAvailability,
    voteParticulars,
    provisionsAllocated: Number(provisionsAllocated),
    totalExpenditure: Number(totalExpenditure),
    balanceAvailable: Number(balanceAvailable),
    budgetApprovalDate: new Date()
  };
  
  // Move to next stage (Rector)
  demandForm.requestStage = 'Rector';
  demandForm.isApproved = false; // Reset overall approval for next stage

  await demandForm.save();

  // Populate user details for response
  await demandForm.populate([
    { path: 'HODUserID', model: 'User', select: 'fullName email departmentName facultyName' },
    { path: 'LogisticsUserID', model: 'User', select: 'fullName email departmentName facultyName' },
    { path: 'BursarUserID', model: 'User', select: 'fullName email departmentName facultyName' }
  ]);

  res.status(200).json({
    status: 'success',
    message: 'Demand form approved by Bursar successfully with budget allocation',
    data: demandForm
  });
});

// Reject a demand form by Bursar
const rejectDemandForm = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { BursarUserID, rejectionReason } = req.body;

  // Find the demand form
  const demandForm = await DemandForm.findById(id);
  
  if (!demandForm) {
    return next(new AppError('Demand form not found', 404));
  }

  // Check if the request is at Bursar stage
  if (demandForm.requestStage !== 'Bursar') {
    return next(new AppError('This request is not at Bursar approval stage', 400));
  }

  // Update the demand form with Bursar rejection
  demandForm.BursarisApproved = false;
  demandForm.BursarUserID = BursarUserID;
  demandForm.BursarcreatedAt = new Date();
  demandForm.requestStage = 'Rejected Bursar';
  demandForm.isApproved = null; // Set to null to indicate rejection
  demandForm.rejectionReason = rejectionReason || 'Rejected by Bursar';

  await demandForm.save();

  // Populate user details for response
  await demandForm.populate([
    { path: 'HODUserID', model: 'User', select: 'fullName email departmentName facultyName' },
    { path: 'LogisticsUserID', model: 'User', select: 'fullName email departmentName facultyName' },
    { path: 'BursarUserID', model: 'User', select: 'fullName email departmentName facultyName' }
  ]);

  res.status(200).json({
    status: 'success',
    message: 'Demand form rejected by Bursar',
    data: demandForm
  });
});

// Get Bursar dashboard stats
const getBursarStats = catchAsync(async (req, res, next) => {
  const { bursarId } = req.params;

  // Get pending requests count
  const pendingCount = await DemandForm.countDocuments({
    requestStage: 'Bursar',
    BursarisApproved: false
  });

  // Get approved requests count by this Bursar
  const approvedCount = await DemandForm.countDocuments({
    BursarUserID: bursarId,
    BursarisApproved: true
  });

  // Get rejected requests count by this Bursar
  const rejectedCount = await DemandForm.countDocuments({
    BursarUserID: bursarId,
    requestStage: 'Rejected Bursar'
  });

  res.status(200).json({
    status: 'success',
    data: {
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      total: pendingCount + approvedCount + rejectedCount
    }
  });
});

module.exports = {
  getBursarPendingRequests,
  getBursarApprovedRequests,
  approveDemandForm,
  rejectDemandForm,
  getBursarStats
};
const Tender = require('../models/Tender');
const Request = require('../models/TenderRequest');
const DemandForm = require('../models/DemandForm');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const TenderRequest = require('../models/TenderRequest');
const User = require('../models/User');
const Order = require('../models/OrderModel');

// Create a new tender
exports.createTender = catchAsync(async (req, res, next) => {
  console.log('Create tender request body:', req.body); // Debug log

  const {
    title,
    location,
    category,
    referenceNo,
    startingDate,
    closingDate,
    details,
    requestId,
    demandFormId,
    createdBy,
    procurementUserID
  } = req.body;

  // Validate that a user ID is provided
  const userId = createdBy || procurementUserID;
  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }

  // Validate that either requestId, demandFormId, or neither (standalone) is provided, but not both
  if (requestId && demandFormId) {
    return next(new AppError('Cannot provide both requestId and demandFormId', 400));
  }

  // Check if request or demand form exists (only if provided)
  let sourceDocument = null;
  let sourceField = '';
  
  if (requestId) {
    sourceDocument = await Request.findById(requestId);
    sourceField = 'requestId';
    if (!sourceDocument) {
      return next(new AppError('No request found with that ID', 404));
    }
  } else if (demandFormId) {
    sourceDocument = await DemandForm.findById(demandFormId);
    sourceField = 'demandFormId';
    if (!sourceDocument) {
      return next(new AppError('No demand form found with that ID', 404));
    }
  }

  // Check if a tender already exists for this source document with status "active" (only if linked to request/demand form)
  if (requestId || demandFormId) {
    const query = {};
    query[sourceField] = requestId || demandFormId;
    query.status = 'active';
    
    const existingTender = await Tender.findOne(query);
    if (existingTender) {
      console.log('Existing active tender found:', existingTender); // Debug log
      return next(new AppError(`An active tender already exists for this ${requestId ? 'request' : 'demand form'}. Tender ID: ${existingTender._id}, Reference: ${existingTender.referenceNo}`, 400));
    }
  }

  // Create tender
  const tenderData = {
    title,
    location,
    category,
    referenceNo,
    startingDate,
    closingDate,
    details,
    createdBy: userId // Use the validated user ID
  };
  
  if (requestId) {
    tenderData.requestId = requestId;
  } else {
    tenderData.demandFormId = demandFormId;
  }

  const newTender = await Tender.create(tenderData);

  console.log('Created tender successfully:', newTender); // Debug log

  res.status(201).json({
    status: 'success',
    data: {
      tender: newTender
    }
  });
});


exports.getAllTenders = catchAsync(async (req, res, next) => {  
  try {
    const tenders = await Tender.find()
      .populate('requestId')  // Populate full TenderRequest data
      .populate('createdBy'); // Populate full User data

    console.log('Fetched tenders:', tenders); // Debug log

    res.status(200).json({
      status: 'success',
      results: tenders.length,
      data: { tenders },
    });
  } catch (error) {
    next(error); // Pass errors to error-handling middleware
  }
});




// Get tender by ID
exports.getTender = catchAsync(async (req, res, next) => {
  const tender = await Tender.findById(req.params.id)
    .populate('requestId')
    .populate('createdBy', 'fullName email');

  if (!tender) {
    return next(new AppError('No tender found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tender
    }
  });
});

// Update tender
exports.updateTender = catchAsync(async (req, res, next) => {
  const tender = await Tender.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!tender) {
    return next(new AppError('No tender found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tender
    }
  });
});

// Delete tender
exports.deleteTender = catchAsync(async (req, res, next) => {
  const tender = await Tender.findByIdAndDelete(req.params.id);

  if (!tender) {
    return next(new AppError('No tender found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get tender count
exports.getTenderCount = catchAsync(async (req, res, next) => {
  const count = await Tender.countDocuments();
  
  res.status(200).json({
    status: 'success',
    data: {
      count
    }
  });
});

// Get tenders by status
exports.getTendersByStatus = catchAsync(async (req, res, next) => {
  const { status } = req.params;
  const tenders = await Tender.find({ status })
    .populate('requestId')
    .populate('createdBy', 'fullName email');

  res.status(200).json({
    status: 'success',
    results: tenders.length,
    data: {
      tenders
    }
  });
});

// Get all tenders with their order details
exports.getAllTendersWithOrders = catchAsync(async (req, res, next) => {
  try {
    // First get all tenders with populated request and creator info
    const tenders = await Tender.find()
      .populate('requestId')
      .populate('createdBy');
    
    // Get all orders grouped by tenderId
    const orders = await Order.aggregate([
      {
        $group: {
          _id: '$tenderId',
          orders: { $push: '$$ROOT' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'orders.userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      }
    ]);

    // Create a map of tenderId to orders for quick lookup
    const ordersMap = new Map();
    orders.forEach(item => {
      ordersMap.set(item._id.toString(), {
        orders: item.orders,
        userDetails: item.userDetails
      });
    });

    // Combine tenders with their orders
    const tendersWithOrders = tenders.map(tender => {
      const tenderObj = tender.toObject();
      const orderInfo = ordersMap.get(tender._id.toString()) || { orders: [], userDetails: [] };
      
      return {
        ...tenderObj,
        orders: orderInfo.orders.map(order => {
          const user = orderInfo.userDetails.find(u => u._id.toString() === order.userId.toString());
          return {
            ...order,
            userDetails: user || null
          };
        }),
        orderCount: orderInfo.orders.length
      };
    });

    res.status(200).json({
      status: 'success',
      results: tendersWithOrders.length,
      data: { tenders: tendersWithOrders },
    });
  } catch (error) {
    next(error);
  }
});

// Close an existing tender (change status to closed)
exports.closeTender = catchAsync(async (req, res, next) => {
  const tender = await Tender.findByIdAndUpdate(
    req.params.id, 
    { status: 'closed', updatedAt: new Date() }, 
    { new: true }
  );

  if (!tender) {
    return next(new AppError('No tender found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tender
    }
  });
});

// Get existing tender for a specific request or demand form
exports.getExistingTender = catchAsync(async (req, res, next) => {
  const { requestId, demandFormId } = req.query;
  
  if (!requestId && !demandFormId) {
    return next(new AppError('Either requestId or demandFormId must be provided', 400));
  }

  const query = { status: 'active' };
  if (requestId) {
    query.requestId = requestId;
  } else {
    query.demandFormId = demandFormId;
  }

  const tender = await Tender.findOne(query)
    .populate('requestId')
    .populate('demandFormId')
    .populate('createdBy', 'fullName email');

  if (!tender) {
    return res.status(200).json({
      status: 'success',
      data: {
        tender: null
      }
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tender
    }
  });
});
const DemandForm = require('../models/DemandForm');
const User = require('../models/User');

// Create a new demand form
exports.createDemandForm = async (req, res) => {
  try {
    const demandData = req.body;

    // Set default requestStage to 'Logistics Officer' if not provided
    // Since HOD is creating the demand, it should go to Logistics Officer for approval
    if (!demandData.requestStage) {
      demandData.requestStage = 'Logistics Officer';
    }

    // Validate items array
    if (!demandData.items || demandData.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required'
      });
    }

    // Check for unique demand number
    if (demandData.demandNo) {
      const existingDemand = await DemandForm.findOne({ demandNo: demandData.demandNo });
      if (existingDemand) {
        return res.status(400).json({
          success: false,
          message: 'Demand number already exists'
        });
      }
    }

    const newDemandForm = new DemandForm(demandData);
    const savedDemandForm = await newDemandForm.save();

    res.status(201).json({
      success: true,
      message: 'Demand form created successfully',
      data: savedDemandForm
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000 && error.keyPattern && error.keyPattern.demandNo) {
      return res.status(400).json({
        success: false,
        message: 'Demand number already exists'
      });
    }

    res.status(400).json({
      success: false,
      message: 'Failed to create demand form',
      error: error.message
    });
  }
};

// Get all demand forms
exports.getAllDemandForms = async (req, res) => {
  try {
    const demandForms = await DemandForm.find().sort({ createdAt: -1 }).lean();
    
    // Collect all user IDs to fetch in one batch
    const userIds = new Set();
    demandForms.forEach((demand) => {
      if (demand.HODUserID) userIds.add(demand.HODUserID);
      if (demand.LogisticsUserID) userIds.add(demand.LogisticsUserID);
      if (demand.BursarUserID) userIds.add(demand.BursarUserID);
      if (demand.RectorUserID) userIds.add(demand.RectorUserID);
      if (demand.ProcurementUserID) userIds.add(demand.ProcurementUserID);
      if (demand.WarehouseUserID) userIds.add(demand.WarehouseUserID);
    });

    // Fetch all users at once
    const users = await User.find({ _id: { $in: Array.from(userIds) } }).select('fullName email departmentName facultyName userRole');

    // Create a mapping of user IDs to user details
    const userMap = {};
    users.forEach((user) => {
      userMap[user._id.toString()] = user;
    });

    // Map demand forms with user details
    const demandFormsWithUserDetails = demandForms.map((demand) => {
      const updatedDemand = { ...demand };

      if (demand.HODUserID) updatedDemand.HODUser = userMap[demand.HODUserID.toString()];
      if (demand.LogisticsUserID) updatedDemand.LogisticsUser = userMap[demand.LogisticsUserID.toString()];
      if (demand.BursarUserID) updatedDemand.BursarUser = userMap[demand.BursarUserID.toString()];
      if (demand.RectorUserID) updatedDemand.RectorUser = userMap[demand.RectorUserID.toString()];
      if (demand.ProcurementUserID) updatedDemand.ProcurementUser = userMap[demand.ProcurementUserID.toString()];
      if (demand.WarehouseUserID) updatedDemand.WarehouseUser = userMap[demand.WarehouseUserID.toString()];

      return updatedDemand;
    });

    res.json(demandFormsWithUserDetails);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch demand forms',
      error: error.message
    });
  }
};

// Get demand forms by user ID
exports.getDemandFormsByUser = async (req, res) => {
  try {
    const demandForms = await DemandForm.find({ requestedUserID: req.params.userId })
      .sort({ createdAt: -1 });

    // Collect all user IDs to fetch in one batch
    const userIds = new Set();
    demandForms.forEach((demand) => {
      if (demand.HODUserID) userIds.add(demand.HODUserID);
      if (demand.LogisticsUserID) userIds.add(demand.LogisticsUserID);
      if (demand.BursarUserID) userIds.add(demand.BursarUserID);
      if (demand.RectorUserID) userIds.add(demand.RectorUserID);
      if (demand.ProcurementUserID) userIds.add(demand.ProcurementUserID);
      if (demand.WarehouseUserID) userIds.add(demand.WarehouseUserID);
    });

    // Fetch all users at once
    const users = await User.find({ _id: { $in: Array.from(userIds) } }).select('fullName email departmentName facultyName userRole');

    // Create a mapping of user IDs to user details
    const userMap = {};
    users.forEach((user) => {
      userMap[user._id.toString()] = user;
    });

    // Map demand forms with user details
    const demandFormsWithUserDetails = demandForms.map((demand) => {
      const updatedDemand = demand.toObject();

      if (demand.HODUserID) updatedDemand.HODUser = userMap[demand.HODUserID.toString()];
      if (demand.LogisticsUserID) updatedDemand.LogisticsUser = userMap[demand.LogisticsUserID.toString()];
      if (demand.BursarUserID) updatedDemand.BursarUser = userMap[demand.BursarUserID.toString()];
      if (demand.RectorUserID) updatedDemand.RectorUser = userMap[demand.RectorUserID.toString()];
      if (demand.ProcurementUserID) updatedDemand.ProcurementUser = userMap[demand.ProcurementUserID.toString()];
      if (demand.WarehouseUserID) updatedDemand.WarehouseUser = userMap[demand.WarehouseUserID.toString()];

      return updatedDemand;
    });

    res.json({
      success: true,
      count: demandForms.length,
      data: demandFormsWithUserDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user demand forms',
      error: error.message
    });
  }
};

// Get a single demand form by ID
exports.getDemandFormById = async (req, res) => {
  try {
    const demandForm = await DemandForm.findById(req.params.id);
    if (!demandForm) {
      return res.status(404).json({
        success: false,
        message: 'Demand form not found'
      });
    }
    res.json({
      success: true,
      data: demandForm
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch demand form',
      error: error.message
    });
  }
};

// Update a demand form
exports.updateDemandForm = async (req, res) => {
  try {
    const updatedDemandForm = await DemandForm.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!updatedDemandForm) {
      return res.status(404).json({
        success: false,
        message: 'Demand form not found'
      });
    }

    res.json({
      success: true,
      message: 'Demand form updated successfully',
      data: updatedDemandForm
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update demand form',
      error: error.message
    });
  }
};

// Update demand form stage
exports.updateDemandFormStage = async (req, res) => {
  try {
    const { requestStage } = req.body;

    if (!['HOD', 'Logistics Officer', 'Bursar', 'Warehouse Officer', 'Rector', 'Procurement Officer', 'delivered'].includes(requestStage)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request stage'
      });
    }

    const updatedDemandForm = await DemandForm.findByIdAndUpdate(
      req.params.id,
      {
        requestStage,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!updatedDemandForm) {
      return res.status(404).json({
        success: false,
        message: 'Demand form not found'
      });
    }

    res.json({
      success: true,
      message: 'Demand form stage updated successfully',
      data: updatedDemandForm
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update demand form stage',
      error: error.message
    });
  }
};

// Delete a demand form
exports.deleteDemandForm = async (req, res) => {
  try {
    const deletedDemandForm = await DemandForm.findByIdAndDelete(req.params.id);
    if (!deletedDemandForm) {
      return res.status(404).json({
        success: false,
        message: 'Demand form not found'
      });
    }
    res.json({
      success: true,
      message: 'Demand form deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete demand form',
      error: error.message
    });
  }
};

// Logistics Officer functions
exports.getLogisticsDemandForms = async (req, res) => {
  try {
    const demandForms = await DemandForm.find({
      requestStage: 'Logistics Officer',
      isApproved: false
    }).lean();

    const demandFormsWithUserDetails = await Promise.all(
      demandForms.map(async (demand) => {
        if (demand.HODUserID) {
          const user = await User.findById(demand.HODUserID).select('fullName email departmentName facultyName userRole');
          return { ...demand, HODUser: user };
        }
        return demand;
      })
    );

    res.json(demandFormsWithUserDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveDemandFormLogistics = async (req, res) => {
  try {
    console.log('Received approval request body:', req.body);
    
    const updateData = {
      isApproved: false,
      requestStage: 'Bursar',
      updatedAt: Date.now(),
      LogisticsisApproved: req.body.LogisticsisApproved,
      LogisticscreatedAt: Date.now(),
      LogisticsUserID: req.body.LogisticsUserID
    };

    // Add log data if provided
    if (req.body.logData) {
      updateData.logData = req.body.logData;
      console.log('Adding log data:', req.body.logData);
    }

    // Add log notes if provided
    if (req.body.logNotes) {
      updateData.logNotes = req.body.logNotes;
      console.log('Adding log notes:', req.body.logNotes);
    }

    console.log('Update data:', updateData);

    const demandForm = await DemandForm.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('Updated demand form:', demandForm);
    res.json(demandForm);
  } catch (error) {
    console.error('Error in approveDemandFormLogistics:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.rejectDemandFormLogistics = async (req, res) => {
  try {
    const demandForm = await DemandForm.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: null,
        LogisticsisApproved: false,
        LogisticscreatedAt: Date.now(),
        LogisticsUserID: req.body.LogisticsUserID,
        requestStage: 'Rejected Logistics Officer',
        updatedAt: Date.now()
      },
      { new: true }
    );
    res.json(demandForm);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get approved demand forms by logistics user
exports.getApprovedDemandFormsByLogisticsUser = async (req, res) => {
  try {
    const { logisticsUserID } = req.params;
    const demandForms = await DemandForm.find({ 
      LogisticsUserID: logisticsUserID,
      LogisticsisApproved: true 
    })
      .sort({ createdAt: -1 })
      .lean();

    const demandFormsWithUserDetails = await Promise.all(
      demandForms.map(async (demand) => {
        const updatedDemand = { ...demand };

        if (demand.HODUserID) {
          const hodUser = await User.findById(demand.HODUserID).select('fullName email departmentName facultyName userRole');
          updatedDemand.HODUser = hodUser;
        }

        if (demand.LogisticsUserID) {
          const logisticsUser = await User.findById(demand.LogisticsUserID).select('fullName email departmentName facultyName userRole');
          updatedDemand.LogisticsUser = logisticsUser;
        }

        if (demand.RectorUserID) {
          const rectorUser = await User.findById(demand.RectorUserID).select('fullName email departmentName facultyName userRole');
          updatedDemand.RectorUser = rectorUser;
        }

        if (demand.ProcurementUserID) {
          const procurementUser = await User.findById(demand.ProcurementUserID).select('fullName email departmentName facultyName userRole');
          updatedDemand.ProcurementUser = procurementUser;
        }

        return updatedDemand;
      })
    );

    res.json(demandFormsWithUserDetails);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching approved demand forms'
    });
  }
};

// Rector functions
exports.getRectorDemandForms = async (req, res) => {
  try {
    const demandForms = await DemandForm.find({
      requestStage: 'Rector',
      isApproved: false
    }).lean();

    const demandFormsWithUserDetails = await Promise.all(
      demandForms.map(async (demand) => {
        const updatedDemand = { ...demand };

        if (demand.HODUserID) {
          const hodUser = await User.findById(demand.HODUserID).select('fullName email departmentName facultyName userRole');
          updatedDemand.HODUser = hodUser;
        }

        if (demand.LogisticsUserID) {
          const logisticsUser = await User.findById(demand.LogisticsUserID).select('fullName email departmentName facultyName userRole');
          updatedDemand.LogisticsUser = logisticsUser;
        }

        return updatedDemand;
      })
    );

    res.json(demandFormsWithUserDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveDemandFormRector = async (req, res) => {
  try {
    const demandForm = await DemandForm.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: false,
        requestStage: 'Procurement Officer',
        updatedAt: Date.now(),
        RectorisApproved: req.body.RectorisApproved,
        RectorcreatedAt: Date.now(),
        RectorUserID: req.body.rectorUserID
      },
      { new: true, runValidators: true }
    );

    res.json(demandForm);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.rejectDemandFormRector = async (req, res) => {
  try {
    const demandForm = await DemandForm.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: null,
        RectorisApproved: false,
        RectorcreatedAt: Date.now(),
        RectorUserID: req.body.rectorUserID,
        requestStage: 'Rejected Rector',
        updatedAt: Date.now()
      },
      { new: true }
    );
    res.json(demandForm);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get approved demand forms by rector user
exports.getApprovedDemandFormsByRector = async (req, res) => {
  try {
    const { userId } = req.params;
    const demandForms = await DemandForm.find({ 
      RectorUserID: userId,
      RectorisApproved: true 
    })
      .sort({ createdAt: -1 })
      .lean();

    const demandFormsWithUserDetails = await Promise.all(
      demandForms.map(async (demand) => {
        const updatedDemand = { ...demand };

        if (demand.HODUserID) {
          const hodUser = await User.findById(demand.HODUserID).select('fullName email departmentName facultyName userRole');
          updatedDemand.HODUser = hodUser;
        }

        if (demand.LogisticsUserID) {
          const logisticsUser = await User.findById(demand.LogisticsUserID).select('fullName email departmentName facultyName userRole');
          updatedDemand.LogisticsUser = logisticsUser;
        }

        if (demand.RectorUserID) {
          const rectorUser = await User.findById(demand.RectorUserID).select('fullName email departmentName facultyName userRole');
          updatedDemand.RectorUser = rectorUser;
        }

        if (demand.ProcurementUserID) {
          const procurementUser = await User.findById(demand.ProcurementUserID).select('fullName email departmentName facultyName userRole');
          updatedDemand.ProcurementUser = procurementUser;
        }

        return updatedDemand;
      })
    );

    res.json(demandFormsWithUserDetails);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching approved demand forms by rector'
    });
  }
};

// Procurement Officer functions
exports.getProcurementDemandForms = async (req, res) => {
  try {
    const demandForms = await DemandForm.find({
      requestStage: 'Procurement Officer',
      isApproved: false
    }).lean();

    const demandFormsWithUserDetails = await Promise.all(
      demandForms.map(async (demand) => {
        const updatedDemand = { ...demand };

        if (demand.HODUserID) {
          const hodUser = await User.findById(demand.HODUserID).select('fullName email departmentName facultyName userRole');
          updatedDemand.HODUser = hodUser;
        }

        if (demand.LogisticsUserID) {
          const logisticsUser = await User.findById(demand.LogisticsUserID).select('fullName email departmentName facultyName userRole');
          updatedDemand.LogisticsUser = logisticsUser;
        }

        if (demand.RectorUserID) {
          const rectorUser = await User.findById(demand.RectorUserID).select('fullName email departmentName facultyName userRole');
          updatedDemand.RectorUser = rectorUser;
        }

        return updatedDemand;
      })
    );

    res.json(demandFormsWithUserDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveDemandFormProcurement = async (req, res) => {
  try {
    const demandForm = await DemandForm.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: true,
        requestStage: 'Procurement Officer',
        updatedAt: Date.now(),
        ProcurementisApproved: true,
        ProcurementcreatedAt: Date.now(),
        ProcurementUserID: req.body.procurementUserID
      },
      { new: true, runValidators: true }
    );

    res.json(demandForm);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.rejectDemandFormProcurement = async (req, res) => {
  try {
    const demandForm = await DemandForm.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: null,
        ProcurementisApproved: false,
        ProcurementcreatedAt: Date.now(),
        ProcurementUserID: req.body.procurementUserID,
        requestStage: 'Rejected Procurement Officer',
        updatedAt: Date.now()
      },
      { new: true }
    );
    res.json(demandForm);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get approved demand forms by user
exports.getApprovedDemandFormsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const demandForms = await DemandForm.find({
      requestedUserID: userId,
      isApproved: true
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: demandForms.length,
      data: demandForms
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get demand forms created by specific HOD
exports.getDemandFormsByHOD = async (req, res) => {
  try {
    const demandForms = await DemandForm.find({ HODUserID: req.params.hodUserId })
      .sort({ createdAt: -1 });

    // Collect all user IDs to fetch in one batch
    const userIds = new Set();
    demandForms.forEach((demand) => {
      if (demand.HODUserID) userIds.add(demand.HODUserID);
      if (demand.LogisticsUserID) userIds.add(demand.LogisticsUserID);
      if (demand.BursarUserID) userIds.add(demand.BursarUserID);
      if (demand.RectorUserID) userIds.add(demand.RectorUserID);
      if (demand.ProcurementUserID) userIds.add(demand.ProcurementUserID);
      if (demand.WarehouseUserID) userIds.add(demand.WarehouseUserID);
    });

    // Fetch all users at once
    const users = await User.find({ _id: { $in: Array.from(userIds) } }).select('fullName email departmentName facultyName userRole');

    // Create a mapping of user IDs to user details
    const userMap = {};
    users.forEach((user) => {
      userMap[user._id.toString()] = user;
    });

    // Map demand forms with user details
    const demandFormsWithUserDetails = demandForms.map((demand) => {
      const updatedDemand = demand.toObject();

      if (demand.HODUserID) updatedDemand.HODUser = userMap[demand.HODUserID.toString()];
      if (demand.LogisticsUserID) updatedDemand.LogisticsUser = userMap[demand.LogisticsUserID.toString()];
      if (demand.BursarUserID) updatedDemand.BursarUser = userMap[demand.BursarUserID.toString()];
      if (demand.RectorUserID) updatedDemand.RectorUser = userMap[demand.RectorUserID.toString()];
      if (demand.ProcurementUserID) updatedDemand.ProcurementUser = userMap[demand.ProcurementUserID.toString()];
      if (demand.WarehouseUserID) updatedDemand.WarehouseUser = userMap[demand.WarehouseUserID.toString()];

      return updatedDemand;
    });

    res.json({
      success: true,
      data: demandFormsWithUserDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch demand forms',
      error: error.message
    });
  }
};
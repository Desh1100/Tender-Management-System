const Request = require('../models/TenderRequest');
const User = require('../models/User');
const Tender = require('../models/Tender');

// Create a new request
exports.createRequest = async (req, res) => {
  try {
    const requestData = req.body;

    // Set default requestStage to 'HOD' if not provided
    if (!requestData.requestStage) {
      requestData.requestStage = 'HOD';
    }

    const newRequest = new Request(requestData);
    const savedRequest = await newRequest.save();

    res.status(201).json({
      success: true,
      message: 'Request created successfully',
      data: savedRequest
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create request',
      error: error.message
    });
  }
};

// Get all requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find();
    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests',
      error: error.message
    });
  }
};

// Get requests by user ID
exports.getRequestsByUser = async (req, res) => {
  try {
    const requests = await Request.find({ requestedUserID: req.params.userId });

    // Collect all user IDs to fetch in one batch
    const userIds = new Set();
    requests.forEach((request) => {
      if (request.HODUserID) userIds.add(request.HODUserID);
      if (request.LogisticsUserID) userIds.add(request.LogisticsUserID);
      if (request.RectorUserID) userIds.add(request.RectorUserID);
      if (request.ProcurementUserID) userIds.add(request.ProcurementUserID);
    });

    // Fetch all users at once
    const users = await User.find({ _id: { $in: Array.from(userIds) } }).select('fullName email departmentName facultyName userRole');

    // Create a mapping of user IDs to user details
    const userMap = {};
    users.forEach((user) => {
      userMap[user._id.toString()] = user;
    });

    // Map requests with user details
    const requestsWithUserDetails = requests.map((request) => {
      const updatedRequest = request.toObject(); // Convert Mongoose document to plain object

      if (request.HODUserID) updatedRequest.HODUser = userMap[request.HODUserID.toString()];
      if (request.LogisticsUserID) updatedRequest.LogisticsUser = userMap[request.LogisticsUserID.toString()];
      if (request.RectorUserID) updatedRequest.RectorUser = userMap[request.RectorUserID.toString()];
      if (request.ProcurementUserID) updatedRequest.ProcurementUser = userMap[request.ProcurementUserID.toString()];

      return updatedRequest;
    });

    res.json({
      success: true,
      count: requests.length,
      data: requestsWithUserDetails, // Send the updated list
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user requests',
      error: error.message
    });
  }
};



// Get a single request by ID
exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }
    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch request',
      error: error.message
    });
  }
};

// Update a request
exports.updateRequest = async (req, res) => {
  try {
    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    res.json({
      success: true,
      message: 'Request updated successfully',
      data: updatedRequest
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update request',
      error: error.message
    });
  }
};

// Update request stage
exports.updateRequestStage = async (req, res) => {
  try {
    const { requestStage } = req.body;

    if (!['HOD', 'Logistics Officer', 'Warehouse Officer', 'Rector', 'Procurement Officer'].includes(requestStage)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request stage'
      });
    }

    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      {
        requestStage,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    res.json({
      success: true,
      message: 'Request stage updated successfully',
      data: updatedRequest
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update request stage',
      error: error.message
    });
  }
};

// Delete a request
exports.deleteRequest = async (req, res) => {
  try {
    const deletedRequest = await Request.findByIdAndDelete(req.params.id);
    if (!deletedRequest) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }
    res.json({
      success: true,
      message: 'Request deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete request',
      error: error.message
    });
  }
};

// Get all requests for Logistics Officer
exports.getLogisticsRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      requestStage: 'Logistics Officer',
      isApproved: false
    }).lean(); // Convert Mongoose documents to plain objects

    // Fetch user details for each request
    const requestsWithUserDetails = await Promise.all(
      requests.map(async (request) => {
        if (request.HODUserID) {
          const user = await User.findById(request.HODUserID).select('fullName email');
          return { ...request, HODUser: user }; // Attach user details
        }
        return request;
      })
    );

    res.json(requestsWithUserDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get approved requests by user
exports.getApprovedRequests = async (req, res) => {
  try {
    const userId = req.params.userId;
    const requests = await Request.find({
      requestedUserID: userId,
      isApproved: true
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    console.log('Incoming body:', req.body); // Debug log

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: false,
        requestStage: 'Rector',
        updatedAt: Date.now(),
        LogisticsisApproved: req.body.logisticsIsApproved,
        LogisticscreatedAt: Date.now(),
        LogisticsUserID: req.body.logisticsUserID
      },
      { new: true, runValidators: true } // Added runValidators
    );

    console.log('Updated request:', request); // Debug log
    res.json(request);
  } catch (error) {
    console.error('Update error:', error); // Debug log
    res.status(400).json({ message: error.message });
  }
};

// Reject request
exports.rejectRequest = async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: null,
        LogisticsisApproved: false,
        LogisticscreatedAt: Date.now(),
        LogisticsUserID: req.body.logisticsUserID,
        requestStage: 'Rejected Logistics Officer',
        note: req.body.reason || 'Rejected by Logistics Officer',
        updatedAt: Date.now()
      },
      { new: true }
    );
    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all requests by logisticsUserID with user details
exports.getRequestsByLogisticsUser = async (req, res) => {
  try {
    const { LogisticsUserID } = req.params;
    console.log('LogisticsUserID:', LogisticsUserID); // Debug log

    const requests = await Request.find({ LogisticsUserID: LogisticsUserID })
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean(); // Convert Mongoose documents to plain objects

    // Fetch user details for each request
    const requestsWithUserDetails = await Promise.all(
      requests.map(async (request) => {
        const updatedRequest = { ...request };

        if (request.HODUserID) {
          const hodUser = await User.findById(request.HODUserID).select('fullName email');
          updatedRequest.HODUser = hodUser; // Attach HOD user details
        }

        if (request.LogisticsUserID) {
          const logisticsUser = await User.findById(request.LogisticsUserID).select('fullName email');
          updatedRequest.LogisticsUser = logisticsUser; // Attach Logistics user details
        }

        if (request.RectorUserID) {
          const RectorUser = await User.findById(request.RectorUserID).select('fullName email');
          updatedRequest.RectorUser = RectorUser; // Attach Rector user details
        }


        if (request.ProcurementUserID) {
          const ProcurementUser = await User.findById(request.ProcurementUserID).select('fullName email');
          updatedRequest.ProcurementUser = ProcurementUser; // Attach Procurement User user details
        }

        return updatedRequest;
      })
    );

    res.json(requestsWithUserDetails);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error fetching requests'
    });
  }
};

exports.getRectorRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      requestStage: 'Rector',
      isApproved: false
    }).lean(); // Convert Mongoose documents to plain objects

    const requestsWithUserDetails = await Promise.all(
      requests.map(async (request) => {
        const updatedRequest = { ...request };

        if (request.HODUserID) {
          const hodUser = await User.findById(request.HODUserID).select('fullName email');
          updatedRequest.HODUser = hodUser; // Attach HOD user details
        }

        if (request.LogisticsUserID) {
          const logisticsUser = await User.findById(request.LogisticsUserID).select('fullName email');
          updatedRequest.LogisticsUser = logisticsUser; // Attach Logistics user details
        }

        if (request.RectorUserID) {
          const RectorUser = await User.findById(request.RectorUserID).select('fullName email');
          updatedRequest.RectorUser = RectorUser; // Attach Rector user details
        }


        if (request.ProcurementUserID) {
          const ProcurementUser = await User.findById(request.ProcurementUserID).select('fullName email');
          updatedRequest.ProcurementUser = ProcurementUser; // Attach Procurement User user details
        }

        return updatedRequest;
      })
    );

    res.json(requestsWithUserDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveRequestRector = async (req, res) => {
  try {

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: false,
        requestStage: 'Procurement Officer',
        updatedAt: Date.now(),
        RectorisApproved: req.body.rectorIsApproved,
        RectorcreatedAt: Date.now(),
        RectorUserID: req.body.rectorUserID
      },
      { new: true, runValidators: true } // Added runValidators
    );

    console.log('Updated request:', request); // Debug log
    res.json(request);
  } catch (error) {
    console.error('Update error:', error); // Debug log
    res.status(400).json({ message: error.message });
  }
};

// Get approved requests by user
exports.getApprovedRequestsRector = async (req, res) => {
  try {
    const userId = req.params.userId;

    const requests = await Request.find({
      RectorUserID: userId,
      RectorisApproved: true
    });

    // Populate user details for each request
    const updatedRequests = await Promise.all(requests.map(async (request) => {
      const updatedRequest = request.toObject(); // Convert Mongoose document to plain object

      if (request.HODUserID) {
        const hodUser = await User.findById(request.HODUserID).select('fullName email');
        updatedRequest.HODUser = hodUser; // Attach HOD user details
      }

      if (request.LogisticsUserID) {
        const logisticsUser = await User.findById(request.LogisticsUserID).select('fullName email');
        updatedRequest.LogisticsUser = logisticsUser; // Attach Logistics user details
      }

      if (request.RectorUserID) {
        const rectorUser = await User.findById(request.RectorUserID).select('fullName email');
        updatedRequest.RectorUser = rectorUser; // Attach Rector user details
      }

      if (request.ProcurementUserID) {
        const procurementUser = await User.findById(request.ProcurementUserID).select('fullName email');
        updatedRequest.ProcurementUser = procurementUser; // Attach Procurement User details
      }

      return updatedRequest;
    }));

    res.json(updatedRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getRejectedRequestsRector = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find all requests that match the criteria (returns an array)
    const requests = await Request.find({
      RectorUserID: userId,
      requestStage: 'Rejected Rector',
      RectorisApproved: false
    });

    // Process each request to add user details
    const updatedRequests = await Promise.all(requests.map(async (request) => {
      const updatedRequest = request.toObject(); // Convert mongoose document to plain object

      if (request.HODUserID) {
        const hodUser = await User.findById(request.HODUserID).select('fullName email');
        updatedRequest.HODUser = hodUser;
      }

      if (request.LogisticsUserID) {
        const logisticsUser = await User.findById(request.LogisticsUserID).select('fullName email');
        updatedRequest.LogisticsUser = logisticsUser;
      }

      if (request.RectorUserID) {
        const rectorUser = await User.findById(request.RectorUserID).select('fullName email');
        updatedRequest.RectorUser = rectorUser;
      }

      if (request.ProcurementUserID) {
        const procurementUser = await User.findById(request.ProcurementUserID).select('fullName email');
        updatedRequest.ProcurementUser = procurementUser;
      }

      return updatedRequest;
    }));

    res.json(updatedRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectRequestRector = async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: null,
        RectorisApproved: false,
        RectorcreatedAt: Date.now(),
        RectorUserID: req.body.rectorUserID,
        requestStage: 'Rejected Rector',
        note: req.body.rectorRejectionReason || 'Rejected by Rector',
        updatedAt: Date.now()
      },
      { new: true }
    );
    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


//Procurement Officer


exports.getRejectedRequestsProcurement = async (req, res) => {
  try {
    const userId = req.params.userId;

    const requests = await Request.find({
      ProcurementUserID: userId,
      requestStage: 'Rejected Procurement Officer',
      ProcurementisApproved: false
    });

    // Process each request to add user details
    const updatedRequests = await Promise.all(requests.map(async (request) => {
      const updatedRequest = request.toObject(); // Convert mongoose document to plain object

      if (request.HODUserID) {
        const hodUser = await User.findById(request.HODUserID).select('fullName email');
        updatedRequest.HODUser = hodUser;
      }

      if (request.LogisticsUserID) {
        const logisticsUser = await User.findById(request.LogisticsUserID).select('fullName email');
        updatedRequest.LogisticsUser = logisticsUser;
      }

      if (request.RectorUserID) {
        const rectorUser = await User.findById(request.RectorUserID).select('fullName email');
        updatedRequest.RectorUser = rectorUser;
      }

      if (request.ProcurementUserID) {
        const procurementUser = await User.findById(request.ProcurementUserID).select('fullName email');
        updatedRequest.ProcurementUser = procurementUser;
      }

      return updatedRequest;
    }));

    res.json(updatedRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getApprovedRequestsProcurement = async (req, res) => {
  try {
    const userId = req.params.userId;

    const requests = await Request.find({
      ProcurementUserID: userId,
      ProcurementisApproved: true
    });

    // Populate user details and check for tender existence for each request
    const updatedRequests = await Promise.all(requests.map(async (request) => {
      const updatedRequest = request.toObject(); // Convert Mongoose document to plain object

      // Check if a tender exists for this request
      const tenderExists = await Tender.exists({ requestId: request._id });
      updatedRequest.Tender = tenderExists ? true : false;

      if (request.HODUserID) {
        const hodUser = await User.findById(request.HODUserID).select('fullName email');
        updatedRequest.HODUser = hodUser; // Attach HOD user details
      }

      if (request.LogisticsUserID) {
        const logisticsUser = await User.findById(request.LogisticsUserID).select('fullName email');
        updatedRequest.LogisticsUser = logisticsUser; // Attach Logistics user details
      }

      if (request.RectorUserID) {
        const rectorUser = await User.findById(request.RectorUserID).select('fullName email');
        updatedRequest.RectorUser = rectorUser; // Attach Rector user details
      }

      if (request.ProcurementUserID) {
        const procurementUser = await User.findById(request.ProcurementUserID).select('fullName email');
        updatedRequest.ProcurementUser = procurementUser; // Attach Procurement User details
      }

      return updatedRequest;
    }));

    res.json(updatedRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.approveRequestProcurementOfficer = async (req, res) => {
  try {
    console.log('Incoming body:', req.body); // Debug log

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: true,
        requestStage: 'Procurement Officer',
        updatedAt: Date.now(),
        ProcurementisApproved: req.body.procurementIsApproved,
        ProcurementcreatedAt: Date.now(),
        ProcurementUserID: req.body.procurementUserID,
        ProcurementisApproved: true
      },
      { new: true, runValidators: true } // Added runValidators
    );

    console.log('Updated request:', request); // Debug log
    res.json(request);
  } catch (error) {
    console.error('Update error:', error); // Debug log
    res.status(400).json({ message: error.message });
  }
};


exports.getProcurementRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      requestStage: 'Procurement Officer',
      isApproved: false
    }).lean(); // Convert Mongoose documents to plain objects

    const requestsWithUserDetails = await Promise.all(
      requests.map(async (request) => {
        const updatedRequest = { ...request };

        if (request.HODUserID) {
          const hodUser = await User.findById(request.HODUserID).select('fullName email');
          updatedRequest.HODUser = hodUser; // Attach HOD user details
        }

        if (request.LogisticsUserID) {
          const logisticsUser = await User.findById(request.LogisticsUserID).select('fullName email');
          updatedRequest.LogisticsUser = logisticsUser; // Attach Logistics user details
        }

        if (request.RectorUserID) {
          const RectorUser = await User.findById(request.RectorUserID).select('fullName email');
          updatedRequest.RectorUser = RectorUser; // Attach Rector user details
        }


        if (request.ProcurementUserID) {
          const ProcurementUser = await User.findById(request.ProcurementUserID).select('fullName email');
          updatedRequest.ProcurementUser = ProcurementUser; // Attach Procurement User user details
        }

        return updatedRequest;
      })
    );

    res.json(requestsWithUserDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
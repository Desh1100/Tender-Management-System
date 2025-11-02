const Order = require('../models/OrderModel');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    // Check for required fields
    const requiredFields = ['tenderId', 'userId', 'quantity', 'deliveryDate', 'totalAmount'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        missingFields 
      });
    }

    // Check for duplicate order (same user and tender)
    const existingOrder = await Order.findOne({
      userId: req.body.userId,
      tenderId: req.body.tenderId
    });

    if (existingOrder) {
      return res.status(409).json({ 
        error: 'An order already exists for this user and tender',
        existingOrderId: existingOrder._id
      });
    }

    // Validate data types and formats
    if (isNaN(req.body.quantity)) {
      return res.status(400).json({ error: 'Quantity must be a number' });
    }

    if (isNaN(req.body.totalAmount)) {
      return res.status(400).json({ error: 'Total amount must be a number' });
    }

    // Validate materialGrade if provided
    if (req.body.materialGrade && !['standard', 'premium', 'industrial', 'custom'].includes(req.body.materialGrade)) {
      return res.status(400).json({ error: 'Invalid material grade' });
    }

    // Create the order
    const order = new Order({
      ...req.body,
      // Ensure dates are properly formatted
      deliveryDate: new Date(req.body.deliveryDate),
      // Set default values if not provided
      status: req.body.status || 'pending',
      paymentStatus: req.body.paymentStatus || 'unpaid',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await order.save();
    
    res.status(201).json(order);
  } catch (error) {
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ errors });
    }
    
    // Handle other errors
    res.status(500).json({ 
      error: 'Failed to create order',
      details: error.message 
    });
  }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('tenderId')
      .populate('userId');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('tenderId')
      .populate('userId');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update order
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get orders by user
exports.getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate('tenderId')
      .populate('userId');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get orders by tender
exports.getOrdersByTender = async (req, res) => {
  try {
    const orders = await Order.find({ tenderId: req.params.tenderId })
      .populate('tenderId')
      .populate('userId');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update order status using :id and :action from params
// Update order status using :id and :action from params
exports.updateOrderStatusByAction = async (req, res) => {
  try {
    const { id, action } = req.params;

    const actionToStatus = {
      approve: 'approved',
      reject: 'rejected',
      cancel: 'cancelled',
      complete: 'completed',
      delivered: 'delivered'
    };

    const status = actionToStatus[action.toLowerCase()];
    if (!status) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // If status changed to 'delivered', update the related Request's requestStage
    if (status === 'delivered' && order.tenderId) {
      // First, get the Tender to find the requestId
      const Tender = require('../models/Tender');
      const Request = require('../models/TenderRequest');
      
      const tender = await Tender.findById(order.tenderId);
      if (tender && tender.requestId) {
        // Update the Request's requestStage to 'delivered'
        await Request.findByIdAndUpdate(
          tender.requestId,
          { requestStage: 'delivered', updatedAt: Date.now() },
          { new: true, runValidators: true }
        );
      }
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all approved orders
exports.getApprovedOrders = async (req, res) => {
  try {
    const approvedOrders = await Order.find({ status: 'approved' })
      .populate('tenderId')
      .populate('userId');
      
    res.json(approvedOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');



router.post('/',  orderController.createOrder);
router.get('/',  orderController.getAllOrders);
router.get('/:id',  orderController.getOrderById);
router.put('/:id',  orderController.updateOrder);
router.delete('/:id',  orderController.deleteOrder);

// User-specific orders
router.get('/user/:userId', orderController.getOrdersByUser);

// Tender-specific orders
router.get('/tender/:tenderId', orderController.getOrdersByTender);

// Status update
router.patch('/:id/status',  orderController.updateOrderStatus);

router.patch('/:id/:action', orderController.updateOrderStatusByAction);

router.get('/status/approved', orderController.getApprovedOrders);


module.exports = router;
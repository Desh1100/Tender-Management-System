const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');

// Get pending requests for Logistics Officer
router.get('/pending', requestController.getLogisticsRequests);

// Get approved requests by user
router.get('/approved/:userId', requestController.getApprovedRequests);

// Approve request
router.post('/approve/:id', requestController.approveRequest);

// Reject request
router.patch('/reject/:id', requestController.rejectRequest);

router.get('/by-logistics-user/:LogisticsUserID', requestController.getRequestsByLogisticsUser);

module.exports = router;
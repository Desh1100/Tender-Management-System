const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');

// Get pending requests for Logistics Officer
router.get('/pending', requestController.getRectorRequests);

// Get approved requests by user
router.get('/approved/:userId', requestController.getApprovedRequestsRector);

// Approve request
router.post('/approve/:id', requestController.approveRequestRector);

// Reject request
router.get('/rejected/:userId', requestController.getRejectedRequestsRector);

router.patch('/rector-reject/:id', requestController.rejectRequestRector);

// router.get('/by-logistics-user/:LogisticsUserID', requestController.getRequestsByLogisticsUser);

module.exports = router;
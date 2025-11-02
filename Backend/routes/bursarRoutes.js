const express = require('express');
const {
  getBursarPendingRequests,
  getBursarApprovedRequests,
  approveDemandForm,
  rejectDemandForm,
  getBursarStats
} = require('../controllers/bursarController');

const router = express.Router();

// Get all demand forms pending Bursar approval
router.get('/pending', getBursarPendingRequests);

// Get all requests approved by specific Bursar
router.get('/approved/:bursarId', getBursarApprovedRequests);

// Get Bursar dashboard statistics
router.get('/stats/:bursarId', getBursarStats);

// Approve a demand form
router.patch('/:id/approve', approveDemandForm);

// Reject a demand form
router.patch('/:id/reject', rejectDemandForm);

module.exports = router;
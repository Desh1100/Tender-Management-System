const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');

// Create a new request
router.post('/', requestController.createRequest);

// Get all requests
router.get('/', requestController.getAllRequests);

// Get requests by user ID
router.get('/user/:userId', requestController.getRequestsByUser);

// Get a single request by ID
router.get('/:id', requestController.getRequestById);

// Update a request
router.put('/:id', requestController.updateRequest);

// Update request stage
router.patch('/:id/stage', requestController.updateRequestStage);

// Delete a request
router.delete('/:id', requestController.deleteRequest);

module.exports = router;
const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');

router.get('/pending', requestController.getProcurementRequests);

router.get('/approved/:userId', requestController.getApprovedRequestsProcurement);

router.post('/approve/:id', requestController.approveRequestProcurementOfficer);

router.get('/rejected/:userId', requestController.getRejectedRequestsProcurement);

router.patch('/rector-reject/:id', requestController.rejectRequestRector);


module.exports = router;
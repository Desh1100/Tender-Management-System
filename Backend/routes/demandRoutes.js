const express = require('express');
const router = express.Router();
const demandController = require('../controllers/demandController');

// Basic CRUD routes
router.post('/', demandController.createDemandForm);
router.get('/', demandController.getAllDemandForms);
router.get('/:id', demandController.getDemandFormById);
router.put('/:id', demandController.updateDemandForm);
router.delete('/:id', demandController.deleteDemandForm);

// User-specific routes
router.get('/user/:userId', demandController.getDemandFormsByUser);
router.get('/hod/:hodUserId', demandController.getDemandFormsByHOD);
router.get('/approved/user/:userId', demandController.getApprovedDemandFormsByUser);

// Stage management
router.patch('/:id/stage', demandController.updateDemandFormStage);

// Logistics Officer routes
router.get('/logistics/pending', demandController.getLogisticsDemandForms);
router.get('/logistics/approved/:logisticsUserID', demandController.getApprovedDemandFormsByLogisticsUser);
router.patch('/:id/approve/logistics', demandController.approveDemandFormLogistics);
router.patch('/:id/reject/logistics', demandController.rejectDemandFormLogistics);

// Rector routes
router.get('/rector/pending', demandController.getRectorDemandForms);
router.get('/rector/approved/:userId', demandController.getApprovedDemandFormsByRector);
router.patch('/:id/approve/rector', demandController.approveDemandFormRector);
router.patch('/:id/reject/rector', demandController.rejectDemandFormRector);

// Procurement Officer routes
router.get('/procurement/pending', demandController.getProcurementDemandForms);
router.patch('/:id/approve/procurement', demandController.approveDemandFormProcurement);
router.patch('/:id/reject/procurement', demandController.rejectDemandFormProcurement);

module.exports = router;
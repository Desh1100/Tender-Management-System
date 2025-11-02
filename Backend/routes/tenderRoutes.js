const express = require('express');
const router = express.Router();
const tenderController = require('../controllers/tenderController');

router
  .route('/')
  .post(tenderController.createTender)
  .get(tenderController.getAllTenders);

router.get('/count', tenderController.getTenderCount);
router.get('/status/:status', tenderController.getTendersByStatus);
router.get('/existing', tenderController.getExistingTender);

router.get('/getAllTendersWithOrders', tenderController.getAllTendersWithOrders);

router.patch('/:id/close', tenderController.closeTender);

router
  .route('/:id')
  .get(tenderController.getTender)
  .patch(tenderController.updateTender)
  .delete(tenderController.deleteTender);


module.exports = router;
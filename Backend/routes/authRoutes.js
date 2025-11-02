const express = require('express');
const { registerUser, loginUser, getPendingUsers, approveUser, getAllUsers } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/pending-users', getPendingUsers); // Super Admin only
router.post('/approve-user', approveUser); // Super Admin only
router.get('/all-users', getAllUsers); // Super Admin only

module.exports = router;
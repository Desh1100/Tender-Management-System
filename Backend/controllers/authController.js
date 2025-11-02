const User = require('../models/User');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
    const {
        fullName,
        email,
        username,
        password,
        phoneNumber,
        profilePicture,
        address,
        dateOfBirth,
        userRole,
        departmentName,
        facultyName,
        officeLocation,
        employeeId,
        warehouseName,
        warehouseLocation,
        universityName,
        rectorOfficeAddress,
        companyName,
        businessRegistrationNumber,
        companyAddress,
        supplierType,
        contactPersonName,
        ministryOfDefenceDocument,
    } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            fullName,
            email,
            username,
            password: hashedPassword,
            phoneNumber,
            profilePicture,
            address,
            dateOfBirth,
            userRole,
            departmentName,
            facultyName,
            officeLocation,
            employeeId,
            warehouseName,
            warehouseLocation,
            universityName,
            rectorOfficeAddress,
            companyName,
            businessRegistrationNumber,
            companyAddress,
            supplierType,
            contactPersonName,
            ministryOfDefenceDocument,
            isActive: 0,
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if user is active (approved by Super Admin)
        if (!user.isActive && user.userRole !== 'Super Admin') {
            return res.status(400).json({ message: 'Account pending approval' });
        }

        // Return user data (excluding password)
        const userData = { ...user._doc };
        delete userData.password;
        res.status(200).json({ message: 'Login successful', user: userData });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getPendingUsers = async (req, res) => {
    try {
        const pendingUsers = await User.find({ isActive: false });
        res.status(200).json(pendingUsers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const allUsers = await User.find();  // Fetches all users
        res.status(200).json(allUsers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const approveUser = async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findByIdAndUpdate(userId, { isActive: true }, { new: true });
        res.status(200).json({ message: 'User approved successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { registerUser, loginUser, getPendingUsers, approveUser,getAllUsers };

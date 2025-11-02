import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  Paper,
  Link,
} from '@mui/material';
import Swal from 'sweetalert2'; // Import SweetAlert2

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    profilePicture: '',
    address: '',
    dateOfBirth: '',
    userRole: '',
    departmentName: '',
    facultyName: '',
    officeLocation: '',
    employeeId: '',
    warehouseName: '',
    warehouseLocation: '',
    universityName: '',
    rectorOfficeAddress: '',
    companyName: '',
    businessRegistrationNumber: '',
    companyAddress: '',
    supplierType: '',
    contactPersonName: '',
    ministryOfDefenceDocument: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Passwords do not match!',
      });
      return;
    }

    try {
      // Send registration request
      const response = await api.post('api/auth/register', formData);

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Registration successful!',
      }).then(() => {
        // Reset form after successful registration
        setFormData({
          fullName: '',
          email: '',
          username: '',
          password: '',
          confirmPassword: '',
          phoneNumber: '',
          profilePicture: '',
          address: '',
          dateOfBirth: '',
          userRole: '',
          departmentName: '',
          facultyName: '',
          officeLocation: '',
          employeeId: '',
          warehouseName: '',
          warehouseLocation: '',
          universityName: '',
          rectorOfficeAddress: '',
          companyName: '',
          businessRegistrationNumber: '',
          companyAddress: '',
          supplierType: '',
          contactPersonName: '',
          ministryOfDefenceDocument: '',
        });

        navigate('/');
      });

      console.log('Registration Response:', response.data);
    } catch (error) {
      // Show error message
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Registration failed. Please try again.',
      });
      console.error('Registration Error:', error);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      }}
    >
      {/* Left Section: Visual Design */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
          color: 'white',
          p: 4,
        }}
      >
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
          General Sir John Kotelawala Defence University Southern campus 

          </Typography>
          <Typography variant="h6">
          Tender Management System
          </Typography>
        </Box>
      </Box>

      {/* Right Section: Registration Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#ffffff',
          p: 4,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: '500px' }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            User Registration
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            {/* Common Fields for All Users */}
            <TextField
              fullWidth
              margin="normal"
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
            {/* <TextField
              fullWidth
              margin="normal"
              label="Profile Picture URL (Optional)"
              name="profilePicture"
              value={formData.profilePicture}
              onChange={handleChange}
            /> */}
            <TextField
              fullWidth
              margin="normal"
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Date of Birth"
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>User Role</InputLabel>
              <Select
                name="userRole"
                value={formData.userRole}
                onChange={handleChange}
                label="User Role"
              >
                <MenuItem value="">Select Role</MenuItem>
                <MenuItem value="HOD">HOD</MenuItem>
                <MenuItem value="Logistics Officer">Logistics Officer</MenuItem>
                <MenuItem value="Bursar">Bursar</MenuItem>
                {/* <MenuItem value="Warehouse Officer">Warehouse Officer</MenuItem> */}
                <MenuItem value="Rector">Rector</MenuItem>
                <MenuItem value="Supplier">Supplier</MenuItem>
                <MenuItem value="Procurement Officer">Procurement Officer</MenuItem>
              </Select>
            </FormControl>

            {formData.userRole === 'HOD' && (
              <>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Faculty Name"
                  name="facultyName"
                  value={formData.facultyName}
                  onChange={handleChange}
                  required
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Department Name"
                  name="departmentName"
                  value={formData.departmentName}
                  onChange={handleChange}
                  required
                />

              </>
            )}

            {formData.userRole === 'Bursar' && (
              <>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Department Name"
                  name="departmentName"
                  value={formData.departmentName}
                  onChange={handleChange}
                  required
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Office Location"
                  name="officeLocation"
                  value={formData.officeLocation}
                  onChange={handleChange}
                  required
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Employee ID"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  required
                />
              </>
            )}

            {/* Role-Specific Fields */}
            {formData.userRole === 'Supplier' && (
              <>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Business Registration Number"
                  name="businessRegistrationNumber"
                  value={formData.businessRegistrationNumber}
                  onChange={handleChange}
                  required
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Company Address"
                  name="companyAddress"
                  value={formData.companyAddress}
                  onChange={handleChange}
                  required
                />
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Supplier Type</InputLabel>
                  <Select
                    name="supplierType"
                    value={formData.supplierType}
                    onChange={handleChange}
                    label="Supplier Type"
                  >
                    <MenuItem value="">Select Type</MenuItem>
                    <MenuItem value="Goods">Goods</MenuItem>
                    <MenuItem value="Services">Services</MenuItem>
                    <MenuItem value="Equipment">Equipment</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Contact Person Name"
                  name="contactPersonName"
                  value={formData.contactPersonName}
                  onChange={handleChange}
                  required
                />
                {/* Ministry of Defence Document Upload */}
                <label>Ministry of Defence Register Document Upload *</label>
                <input
                  style={{ marginTop: 20, display: 'block', width: '100%' }}
                  type="file"
                  name="ministryOfDefenceDocument"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, ministryOfDefenceDocument: reader.result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  required
                />
              </>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                mb: 2,
                py: 1.5,
                background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #2575fc 0%, #6a11cb 100%)' },
              }}
            >
              Register
            </Button>

            {/* Login Link */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                Have an account?{' '}
                <Link href="/" variant="body2" sx={{ color: '#2575fc', fontWeight: 'bold' }}>
                  Login
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Register;
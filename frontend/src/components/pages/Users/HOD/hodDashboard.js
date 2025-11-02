import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../../api';
import logo from '../../../assets/img/navlogo.png';
import background from '../../../assets/img/background.jpg';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Paper,
  TextField,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

const HODDashboard = () => {
  const navigate = useNavigate();
  const [demandData, setDemandData] = useState({
    department: '',
    demandNo: '',
    requirement: '',
    specifications: '',
    useFor: '',
    corporateStrategyRef: '',
    manufacturer: '',
    localAgent: '',
    otherSuppliers: '',
    presentAvailableQty: '',
    requirementType: 'Routine',
    requestStage: 'Logistics Officer',
    isApproved: false
  });

  const [items, setItems] = useState([
    { srNo: 1, description: '', partNo: '', deno: '', qty: 0, approxCost: 0 }
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDemandData({ ...demandData, [name]: value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    const newSrNo = items.length + 1;
    setItems([...items, { srNo: newSrNo, description: '', partNo: '', deno: '', qty: 0, approxCost: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      // Update serial numbers
      const updatedItems = newItems.map((item, i) => ({ ...item, srNo: i + 1 }));
      setItems(updatedItems);
    }
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.qty * item.approxCost), 0);
  };

  const generateDemandNo = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    return `DMD-${timestamp}-${randomNum}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !demandData.department ||
      !demandData.requirement ||
      !demandData.specifications ||
      !demandData.useFor ||
      items.some(item => !item.description || item.qty <= 0 || item.approxCost <= 0)
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please fill all required fields and ensure all items have valid description, quantity, and cost!',
      });
      return;
    }

    try {
      // Get user info from localStorage
      const userId = localStorage.getItem('userId');
      const userRole = localStorage.getItem('userRole');

      if (!userId || !userRole) {
        throw new Error('User information not found. Please login again.');
      }

      // Generate demand number if not provided
      const demandNo = demandData.demandNo || generateDemandNo();

      // Prepare the request payload
      const payload = {
        ...demandData,
        demandNo,
        items,
        totalCost: calculateTotal(),
        requestedUserID: userId,
        requestedUserRole: userRole,
        HODisApproved: true,
        HODcreatedAt: Date.now(),
        HODUserID: userId,
        requestStage: 'Logistics Officer', // Set to Logistics Officer for approval
      };

      // Submit to API
      const response = await api.post('api/demands', payload);

      console.log("response", response);

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Demand form submitted successfully!',
      });

      // Reset form
      setDemandData({
        department: '',
        demandNo: '',
        requirement: '',
        specifications: '',
        useFor: '',
        corporateStrategyRef: '',
        manufacturer: '',
        localAgent: '',
        otherSuppliers: '',
        presentAvailableQty: '',
        requirementType: 'Routine',
        requestStage: 'Logistics Officer',
        isApproved: false
      });
      setItems([
        { srNo: 1, description: '', partNo: '', deno: '', qty: 0, approxCost: 0 }
      ]);

    } catch (error) {
      console.error('Demand form submission failed:', error);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: error.response?.data?.message || error.message || 'Failed to submit demand form',
      });
    }
  };

  const handleReset = () => {
    setDemandData({
      department: '',
      demandNo: '',
      requirement: '',
      specifications: '',
      useFor: '',
      corporateStrategyRef: '',
      manufacturer: '',
      localAgent: '',
      otherSuppliers: '',
      presentAvailableQty: '',
      requirementType: 'Routine',
      requestStage: 'Logistics Officer',
      isApproved: false
    });
    setItems([
      { srNo: 1, description: '', partNo: '', deno: '', qty: 0, approxCost: 0 }
    ]);
  };

   const handleLogout = () => {
     Swal.fire({
       title: 'Logout?',
       text: 'Are you sure you want to logout?',
       icon: 'question',
       showCancelButton: true,
       confirmButtonColor: '#253B80',
       cancelButtonColor: '#F44336',
       confirmButtonText: 'Yes, logout!',
       background: 'linear-gradient(145deg, #ffffff, #f5f5f5)'
     }).then((result) => {
       if (result.isConfirmed) {
         localStorage.clear();
         navigate('/');
       }
     });
   };

  return (
    <Box
      sx={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AppBar position="static" sx={{ 
              background: 'linear-gradient(135deg, #253B80 0%, #1E88E5 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
        <Toolbar>
          <img src={logo} alt="Logo" style={{ height: 50 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}></Typography>
          <Button color="inherit" onClick={() => navigate('/hod-dashboard')}>Home</Button>
          <Button color="inherit" onClick={() => navigate('/request-status')}>Demand Status</Button>
          {/* <Button color="inherit" onClick={() => navigate('/contact-us')}>Contact Us</Button> */}
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Container
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          py: 4,
          flexGrow: 1,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: '1200px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 3,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ color: '#253B80', fontWeight: 'bold' }}>
              Demand Form
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ color: '#666' }}>
              General Sir John Kotelawala Defence University
            </Typography>
            <Divider sx={{ my: 2 }} />
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            {/* Basic Information Section */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#253B80', mb: 3 }}>
                  Basic Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Department "
                      name="department"
                      value={demandData.department}
                      onChange={handleChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Demand No (Auto-generated if empty)"
                      name="demandNo"
                      value={demandData.demandNo}
                      onChange={handleChange}
                      variant="outlined"
                      placeholder="Leave empty for auto-generation"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Items Table Section */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#253B80' }}>
                    Items List
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={addItem}
                    sx={{
                      backgroundColor: '#253B80',
                      '&:hover': { backgroundColor: '#1a2d5a' }
                    }}
                  >
                    Add Item
                  </Button>
                </Box>
                
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell><strong>Sr No</strong></TableCell>
                        <TableCell><strong>Description of Items *</strong></TableCell>
                        <TableCell><strong>Part No</strong></TableCell>
                        <TableCell><strong>Deno</strong></TableCell>
                        <TableCell><strong>Qty *</strong></TableCell>
                        <TableCell><strong>Approx Cost *</strong></TableCell>
                        <TableCell><strong>Total</strong></TableCell>
                        <TableCell><strong>Action</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.srNo}</TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                              variant="outlined"
                              size="small"
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              value={item.partNo}
                              onChange={(e) => handleItemChange(index, 'partNo', e.target.value)}
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              value={item.deno}
                              onChange={(e) => handleItemChange(index, 'deno', e.target.value)}
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              type="number"
                              value={item.qty}
                              onChange={(e) => handleItemChange(index, 'qty', parseInt(e.target.value) || 0)}
                              variant="outlined"
                              size="small"
                              inputProps={{ min: 0 }}
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              type="number"
                              value={item.approxCost}
                              onChange={(e) => handleItemChange(index, 'approxCost', parseFloat(e.target.value) || 0)}
                              variant="outlined"
                              size="small"
                              inputProps={{ min: 0, step: 0.01 }}
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {(item.qty * item.approxCost).toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => removeItem(index)}
                              disabled={items.length === 1}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ backgroundColor: '#f9f9f9' }}>
                        <TableCell colSpan={6} sx={{ textAlign: 'right', fontWeight: 'bold' }}>
                          <strong>Total Cost:</strong>
                        </TableCell>
                        <TableCell>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#253B80' }}>
                            {calculateTotal().toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Requirements and Specifications Section */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#253B80', mb: 3 }}>
                  Requirements & Specifications
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Requirement "
                      name="requirement"
                      value={demandData.requirement}
                      onChange={handleChange}
                      required
                      multiline
                      rows={3}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Specifications "
                      name="specifications"
                      value={demandData.specifications}
                      onChange={handleChange}
                      required
                      multiline
                      rows={3}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Use For "
                      name="useFor"
                      value={demandData.useFor}
                      onChange={handleChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Requirement Type *</InputLabel>
                      <Select
                        name="requirementType"
                        value={demandData.requirementType}
                        onChange={handleChange}
                        label="Requirement Type *"
                        required
                      >
                        <MenuItem value="Urgent">Urgent</MenuItem>
                        <MenuItem value="Priority">Priority</MenuItem>
                        <MenuItem value="Routine">Routine</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Additional Information Section */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#253B80', mb: 3 }}>
                  Additional Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Corporate Strategy Number / Annual Procurement Plan Reference"
                      name="corporateStrategyRef"
                      value={demandData.corporateStrategyRef}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Name of Manufacturer"
                      name="manufacturer"
                      value={demandData.manufacturer}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Name of Local Agent"
                      name="localAgent"
                      value={demandData.localAgent}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Other Possible Suppliers"
                      name="otherSuppliers"
                      value={demandData.otherSuppliers}
                      onChange={handleChange}
                      multiline
                      rows={2}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Present Available Quantity at Relevant Department"
                      name="presentAvailableQty"
                      value={demandData.presentAvailableQty}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: '#253B80',
                  '&:hover': { backgroundColor: '#1a2d5a' },
                  px: 4,
                  py: 1.5
                }}
              >
                Submit Demand
              </Button>
              <Button
                type="button"
                variant="outlined"
                size="large"
                onClick={handleReset}
                sx={{
                  color: '#253B80',
                  borderColor: '#253B80',
                  '&:hover': { 
                    borderColor: '#1a2d5a',
                    backgroundColor: 'rgba(37, 59, 128, 0.1)'
                  },
                  px: 4,
                  py: 1.5
                }}
              >
                Reset Form
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default HODDashboard;
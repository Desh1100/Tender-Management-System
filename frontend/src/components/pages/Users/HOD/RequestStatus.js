import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import Swal from 'sweetalert2';
import logo from '../../../assets/img/navlogo.png';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  Paper,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import EventIcon from '@mui/icons-material/Event';
import CategoryIcon from '@mui/icons-material/Category';
import TitleIcon from '@mui/icons-material/Title';
import DescriptionIcon from '@mui/icons-material/Description';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import NoteIcon from '@mui/icons-material/Note';
import CancelIcon from '@mui/icons-material/Cancel';

const DemandStatus = () => {
  const navigate = useNavigate();
  const [demandForms, setDemandForms] = useState([]);
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) throw new Error('User not logged in');
        
        // Fetch demands created by this HOD user
        const response = await api.get(`api/demands/hod/${userId}`);
        setDemandForms(response.data.data || []);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to fetch data',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleViewDetails = (item) => {
    setSelectedDemand(item);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDemand(null);
  };

  // Get all demand forms created by this HOD
  const getAllItems = () => {
    return demandForms.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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

  const statusColors = {
    'HOD': 'warning',
    'Logistics Officer': 'success',
    'Warehouse Officer': 'info',
    'Rector': 'secondary',
    'Procurement Officer': 'error',
    'Rejected Logistics Officer': 'error',
    'Rejected Rector': 'error',
    'Rejected Procurement Officer': 'error'
  };

  const getApprovalStatus = (item) => {
    if (item.requestStage && item.requestStage.includes('Rejected')) {
      return {
        label: 'Rejected',
        color: 'error',
        icon: <CancelIcon color="error" />
      };
    }
    if (item.requestStage === 'delivered') {
      return {
        label: 'Completed',
        color: 'success',
        icon: <CheckCircleIcon color="success" />
      };
    }
    if (item.isApproved === true && item.requestStage === 'Procurement Officer') {
      return {
        label: 'Final Approval',
        color: 'success',
        icon: <CheckCircleIcon color="success" />
      };
    }
    return {
      label: 'In Progress',
      color: 'warning',
      icon: <PendingIcon color="warning" />
    };
  };

  const getDisplayTitle = (item) => {
    return item.demandNo || 'Demand Form';
  };

  const getDisplayCategory = (item) => {
    return item.department || 'Department';
  };

  const getRejectionDetails = (item) => {
    if (item.requestStage === 'Rejected Logistics Officer') {
      return {
        rejectedBy: 'Logistics Officer',
        rejectedAt: item.LogisticscreatedAt,
        rejectedByUser: item.LogisticsUserID,
        note: item.rejectionReason || item.note
      };
    }
    if (item.requestStage === 'Rejected Rector') {
      return {
        rejectedBy: 'Rector',
        rejectedAt: item.RectorcreatedAt,
        rejectedByUser: item.RectorUserID,
        note: item.rejectionReason || item.note
      };
    }
    if (item.requestStage === 'Rejected Procurement Officer') {
      return {
        rejectedBy: 'Procurement Officer',
        rejectedAt: item.ProcurementcreatedAt,
        rejectedByUser: item.ProcurementUserID,
        note: item.rejectionReason || item.note
      };
    }
    return null;
  };

  const approvalSteps = [
    { key: 'HODUser', label: 'HOD Requested' },
    { key: 'LogisticsUser', label: 'Logistics Approval' },
    { key: 'RectorUser', label: 'Rector Approval' },
    { key: 'ProcurementUser', label: 'Procurement Approval' }
  ];

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Typography variant="h6">Loading demandForms...</Typography>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <AppBar position="static" sx={{
        background: 'linear-gradient(135deg, #253B80 0%, #1E88E5 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <Toolbar>
          <img src={logo} alt="Logo" style={{ height: 50 }} />
          <Box sx={{ flexGrow: 1 }} />
          <Button color="inherit" onClick={() => navigate('/hod-dashboard')}>Home</Button>
          <Button color="inherit" onClick={() => navigate('/request-status')}>Demand Status</Button>

          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              My demandForms & Demand Forms
            </Typography>
            {getAllItems().length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography variant="body1">No demandForms or demand forms found.</Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 2, backgroundColor: '#253B80' }}
                  onClick={() => navigate('/hod-dashboard')}
                >
                  Create New Request
                </Button>
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Category/Department</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Title/Demand No</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Approval</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getAllItems().map((item) => {
                      const approvalStatus = getApprovalStatus(item);
                      return (
                        <TableRow key={`${item.type}-${item._id}`} hover>
                          <TableCell>{item._id.substring(0, 8)}...</TableCell>
                          <TableCell>
                            <Chip
                              label="Demand"
                              color="primary"
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{getDisplayCategory(item)}</TableCell>
                          <TableCell>{getDisplayTitle(item)}</TableCell>
                          <TableCell>
                            <Chip
                              label={item.requestStage}
                              color={statusColors[item.requestStage] || 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={approvalStatus.label}
                              size="small"
                              color={approvalStatus.color}
                              variant="outlined"
                              icon={approvalStatus.icon}
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => handleViewDetails(item)}
                              color="primary"
                              size="small"
                            >
                              <InfoIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Container>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#253B80',
          color: 'white'
        }}>
          <Box display="flex" alignItems="center">
            <DescriptionIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              Demand Form Details
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} color="inherit">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 3 }}>
          {selectedDemand && (
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <EventIcon color="action" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">
                          <b>ID:</b> {selectedDemand._id}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" mb={1}>
                        <CategoryIcon color="action" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">
                          <b>Type:</b> Demand Form
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <CategoryIcon color="action" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">
                          <b>Department:</b> {selectedDemand.department}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <PendingIcon color="action" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">
                          <b>Status:</b>
                          <Chip
                            label={selectedDemand.requestStage}
                            color={statusColors[selectedDemand.requestStage] || 'default'}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" mb={1}>
                        <CheckCircleIcon color="action" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">
                          <b>Approval:</b>
                          <Chip
                            label={getApprovalStatus(selectedDemand).label}
                            size="small"
                            color={getApprovalStatus(selectedDemand).color}
                            variant="outlined"
                            icon={getApprovalStatus(selectedDemand).icon}
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <EventIcon color="action" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">
                          <b>Date Created:</b> {new Date(selectedDemand.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>

              {/* Demand Form Details */}
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <TitleIcon sx={{ mr: 1 }} /> Demand Form Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box mb={2}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Demand Number</Typography>
                        <Typography>{selectedDemand.demandNo}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box mb={2}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Total Cost</Typography>
                        <Typography>{selectedDemand.totalCost?.toFixed(2) || '0.00'}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box mb={2}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Requirement Type</Typography>
                        <Chip 
                          label={selectedDemand.requirementType}
                          color={selectedDemand.requirementType === 'Urgent' ? 'error' : 
                                 selectedDemand.requirementType === 'Priority' ? 'warning' : 'success'}
                          size="small"
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box mb={2}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Use For</Typography>
                        <Typography>{selectedDemand.useFor}</Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box mb={3}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Requirement</Typography>
                    <Typography>{selectedDemand.requirement}</Typography>
                  </Box>

                  <Box mb={3}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Specifications</Typography>
                    <Typography>{selectedDemand.specifications}</Typography>
                  </Box>
                </Card>
              </Grid>

              {/* Items Table */}
              {selectedDemand.items && selectedDemand.items.length > 0 && (
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Items List</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Sr No</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Part No</TableCell>
                            <TableCell>Deno</TableCell>
                            <TableCell>Qty</TableCell>
                            <TableCell>Cost</TableCell>
                            <TableCell>Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedDemand.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.srNo}</TableCell>
                              <TableCell>{item.description}</TableCell>
                              <TableCell>{item.partNo || '-'}</TableCell>
                              <TableCell>{item.deno || '-'}</TableCell>
                              <TableCell>{item.qty}</TableCell>
                              <TableCell>{item.approxCost.toFixed(2)}</TableCell>
                              <TableCell>{(item.qty * item.approxCost).toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Card>
                </Grid>
              )}

              {/* Additional Information */}
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Additional Information</Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    {selectedDemand.corporateStrategyRef && (
                      <Grid item xs={12}>
                        <Box mb={2}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Corporate Strategy Reference</Typography>
                          <Typography>{selectedDemand.corporateStrategyRef}</Typography>
                        </Box>
                      </Grid>
                    )}
                    {selectedDemand.manufacturer && (
                      <Grid item xs={12} md={6}>
                        <Box mb={2}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Manufacturer</Typography>
                          <Typography>{selectedDemand.manufacturer}</Typography>
                        </Box>
                      </Grid>
                    )}
                    {selectedDemand.localAgent && (
                      <Grid item xs={12} md={6}>
                        <Box mb={2}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Local Agent</Typography>
                          <Typography>{selectedDemand.localAgent}</Typography>
                        </Box>
                      </Grid>
                    )}
                    {selectedDemand.otherSuppliers && (
                      <Grid item xs={12}>
                        <Box mb={2}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Other Suppliers</Typography>
                          <Typography>{selectedDemand.otherSuppliers}</Typography>
                        </Box>
                      </Grid>
                    )}
                    {selectedDemand.presentAvailableQty && (
                      <Grid item xs={12}>
                        <Box mb={2}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Present Available Quantity</Typography>
                          <Typography>{selectedDemand.presentAvailableQty}</Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Card>
              </Grid>

              {/* Rejection Details (if rejected) */}
              {selectedDemand.requestStage && selectedDemand.requestStage.includes('Rejected') && (
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ p: 2, borderColor: 'error.main' }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                      <CancelIcon sx={{ mr: 1 }} /> Rejection Details
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    {getRejectionDetails(selectedDemand) && (
                      <>
                        <Box mb={2}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Rejected By</Typography>
                          <Typography>{getRejectionDetails(selectedDemand).rejectedBy}</Typography>
                        </Box>
                        <Box mb={2}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Rejected At</Typography>
                          <Typography>
                            {new Date(getRejectionDetails(selectedDemand).rejectedAt).toLocaleString()}
                          </Typography>
                        </Box>
                        <Box mb={2}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Rejection Note</Typography>
                          <Typography>{getRejectionDetails(selectedDemand).note || 'No reason provided'}</Typography>
                        </Box>
                      </>
                    )}
                  </Card>
                </Grid>
              )}

              {/* Approval Flow Stepper */}
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ mr: 1 }} /> {selectedDemand.type === 'demand' ? 'Demand Form' : 'Request'} Approval Flow
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Stepper activeStep={approvalSteps.findIndex(step => !selectedDemand[step.key])} alternativeLabel>
                    {approvalSteps.map((step) => {
                      const user = selectedDemand[step.key];
                      const isRejected = selectedDemand.demandFormstage && selectedDemand.demandFormstage.includes('Rejected');
                      const isRejectedAtThisStep = 
                        (step.label === 'Logistics Approval' && selectedDemand.demandFormstage === 'Rejected Logistics Officer') ||
                        (step.label === 'Rector Approval' && selectedDemand.demandFormstage === 'Rejected Rector') ||
                        (step.label === 'Procurement Approval' && selectedDemand.demandFormstage === 'Rejected Procurement Officer');

                      return (
                        <Step key={step.key}>
                          <StepLabel
                            icon={
                              isRejectedAtThisStep ? 
                                <CancelIcon color="error" /> : 
                                user ? 
                                  <CheckCircleIcon color={isRejected ? 'disabled' : 'success'} /> : 
                                  <PendingIcon color={isRejected ? 'disabled' : 'action'} />
                            }
                          >
                            {step.label}
                            {user && (
                              <Typography variant="body2" color={isRejected ? 'text.disabled' : 'text.secondary'}>
                                {selectedDemand.type === 'demand' ? 'Requested' : 'Requested'} by {user.fullName}
                                <br />
                                {user.departmentName && user.facultyName && (
                                  <>Department: {user.departmentName}, Faculty: {user.facultyName}<br /></>
                                )}
                                Email: {user.email} | ID: {user._id}
                              </Typography>
                            )}
                            {isRejectedAtThisStep && (
                              <Typography variant="body2" color="error">
                                Rejected on {new Date(getRejectionDetails(selectedDemand).rejectedAt).toLocaleDateString()}
                              </Typography>
                            )}
                          </StepLabel>
                        </Step>
                      );
                    })}
                  </Stepper>
                </Card>
              </Grid>

              {/* Additional Notes */}
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <NoteIcon sx={{ mr: 1 }} /> Additional Notes
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography>
                    {selectedDemand.note || 'No additional notes provided'}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            sx={{ backgroundColor: '#253B80' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DemandStatus;

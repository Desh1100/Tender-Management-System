import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import Swal from 'sweetalert2';
import logo from '../../../assets/img/navlogo.png';
import background from '../../../assets/img/background.jpg';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Tabs,
  Tab,
  Box,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  DialogActions,
  TextField,
  IconButton,
  Avatar,
  Divider,
  LinearProgress,
  Paper,
  styled,
  Slide,
  Badge
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Info as DetailsIcon,
  Close as CloseIcon,
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
  Star as FeaturesIcon
} from '@mui/icons-material';

// Custom styled components
const GradientCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(245,245,245,0.95) 100%)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  backdropFilter: 'blur(4px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.25)'
  }
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
    minWidth: '600px'
  }
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 'bold',
  textTransform: 'uppercase',
  fontSize: '0.7rem',
  ...(status === 'Logistics Officer' && {
    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
    color: 'white'
  }),
  ...(status === 'Rector' && {
    background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
    color: 'white'
  }),
  ...(status === 'HOD' && {
    background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
    color: 'white'
  }),
  ...(status === 'Rejected Logistics Officer' && {
    background: 'linear-gradient(45deg, #F44336 30%, #E57373 90%)',
    color: 'white'
  }),
  ...(status === 'Rejected Rector' && {
    background: 'linear-gradient(45deg, #F44336 30%, #E57373 90%)',
    color: 'white'
  }),
  ...(status === 'Rejected Procurement Officer' && {
    background: 'linear-gradient(45deg, #F44336 30%, #E57373 90%)',
    color: 'white'
  })
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const LogisticsDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [demandForms, setDemandForms] = useState([]);
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Try to fetch all demand forms first
      let allDemands = [];
      let pendingCount = 0;
      let approvedCount = 0;
      let rejectedCount = 0;

      try {
        const response = await api.get('/api/demands');
        allDemands = response.data || [];
        console.log('Fetched all demands:', allDemands);
        
        // Filter data for logistics
        const pending = allDemands.filter(item => 
          item.requestStage === 'Logistics Officer' && !item.LogisticsisApproved
        );
        
        const userId = localStorage.getItem('userId');
        console.log('Current user ID for filtering:', userId);
        
        const approved = allDemands.filter(item => {
          const isApproved = item.LogisticsisApproved === true && item.LogisticsUserID === userId;
          const isRector = item.requestStage === 'Rector' && item.LogisticsUserID === userId;
          const isProcurement = item.requestStage === 'Procurement Officer' && item.LogisticsUserID === userId;
          return isApproved || isRector || isProcurement;
        });
        
        const rejected = allDemands.filter(item => 
          item.requestStage === 'Rejected Logistics Officer' && item.LogisticsUserID === userId
        );

        console.log('Filtered - Pending:', pending.length, 'Approved:', approved.length, 'Rejected:', rejected.length);

        setDemandForms(allDemands);
        
        pendingCount = pending.length;
        approvedCount = approved.length;
        rejectedCount = rejected.length;
      } catch (apiError) {
        console.warn('Primary API failed, trying individual endpoints:', apiError);
        
        // Fallback to individual endpoints
        try {
          const pendingResponse = await api.get('/api/demands/logistics/pending');
          const userId = localStorage.getItem('userId');
          const approvedResponse = await api.get(`/api/demands/logistics/approved/${userId}`);
          
          allDemands = [
            ...pendingResponse.data,
            ...approvedResponse.data
          ];
          
          pendingCount = pendingResponse.data.length;
          approvedCount = approvedResponse.data.length;
          rejectedCount = 0;
          
          setDemandForms(allDemands);
        } catch (fallbackError) {
          console.error('Fallback API also failed:', fallbackError);
          throw fallbackError;
        }
      }
      
      setStats({
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount
      });
    } catch (error) {
      console.error('Final error in fetchData:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to fetch demand forms',
        background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
        backdrop: `
          rgba(0,0,0,0.4)
          url("/images/nyan-cat.gif")
          left top
          no-repeat
        `
      });
    } finally {
      setLoading(false);
    }
  };

  // Get filtered items based on current tab
  const getAllItems = () => {
    return getFilteredItems().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const getDisplayTitle = (item) => {
    return item.demandNo || 'Demand Form';
  };

  const getDisplayCategory = (item) => {
    return item.department || 'Demand';
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // No need to fetch again as we already have all data
  };

  // Filter items based on current tab
  const getFilteredItems = () => {
    console.log('Tab Value:', tabValue);
    console.log('All Demand Forms:', demandForms);
    console.log('Current User ID:', localStorage.getItem('userId'));
    
    if (tabValue === 0) {
      // Pending items
      const pending = demandForms.filter(item => 
        item.requestStage === 'Logistics Officer' && !item.LogisticsisApproved
      );
      console.log('Pending items:', pending);
      return pending;
    } else {
      // Approved items by current user - including those that moved to next stages
      const userId = localStorage.getItem('userId');
      const approved = demandForms.filter(item => {
        const isApproved = item.LogisticsisApproved === true && item.LogisticsUserID === userId;
        const isRector = item.requestStage === 'Rector' && item.LogisticsUserID === userId;
        const isProcurement = item.requestStage === 'Procurement Officer' && item.LogisticsUserID === userId;
        const result = isApproved || isRector || isProcurement;
        
        console.log('Checking item:', item._id, 
          'LogisticsisApproved:', item.LogisticsisApproved, 
          'LogisticsUserID:', item.LogisticsUserID, 
          'requestStage:', item.requestStage,
          'userId:', userId,
          'result:', result);
        
        return result;
      });
      console.log('Approved items by current user:', approved);
      return approved;
    }
  };

  const handleViewDetails = (request) => {
    setSelectedDemand(request);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDemand(null);
    setRejectionReason('');
  };

  const handleApprove = async (item) => {
    const result = await Swal.fire({
      title: 'Confirm Approval',
      text: 'Are you sure you want to approve this demand form?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4CAF50',
      cancelButtonColor: '#F44336',
      confirmButtonText: 'Yes, approve it!',
      background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
      backdrop: `
        rgba(0,0,0,0.4)
      `
    });

    if (result.isConfirmed) {
      try {
        const userId = localStorage.getItem('userId');
        
        await api.patch(`/api/demands/${item._id}/approve/logistics`, {
          LogisticsisApproved: true,
          LogisticsUserID: userId
        });

        Swal.fire({
          title: 'Approved!',
          text: 'Demand form approved successfully!',
          icon: 'success',
          background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
          showConfirmButton: false,
          timer: 1500
        });

        fetchData();
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || 'Approval failed',
          icon: 'error',
          background: 'linear-gradient(145deg, #ffffff, #f5f5f5)'
        });
      }
    }
  };

  const handleReject = async () => {
    setOpenDialog(false);
    if (!rejectionReason) {
      Swal.fire({
        title: 'Error',
        text: 'Please provide a rejection reason',
        icon: 'error',
        background: 'linear-gradient(145deg, #ffffff, #f5f5f5)'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Confirm Rejection',
      text: 'Are you sure you want to reject this demand form?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F44336',
      cancelButtonColor: '#2196F3',
      confirmButtonText: 'Yes, reject it!',
      background: 'linear-gradient(145deg, #ffffff, #f5f5f5)'
    });

    if (result.isConfirmed) {
      try {
        const userId = localStorage.getItem('userId');
        
        await api.patch(`/api/demands/${selectedDemand._id}/reject/logistics`, {
          LogisticsUserID: userId
        });

        Swal.fire({
          title: 'Rejected!',
          text: 'Demand form rejected successfully!',
          icon: 'success',
          background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
          showConfirmButton: false,
          timer: 1500
        });

        fetchData();
        handleCloseDialog();
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || 'Rejection failed',
          icon: 'error',
          background: 'linear-gradient(145deg, #ffffff, #f5f5f5)'
        });
      }
    }
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

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover'
      }}>
        <GradientCard sx={{ p: 4, textAlign: 'center' }}>
          <LinearProgress color="primary" sx={{ height: 8, borderRadius: 4, mb: 2 }} />
          <Typography variant="h6" color="primary">Loading requests...</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>Please wait while we fetch your data</Typography>
        </GradientCard>
      </Box>
    );
  }

  return (
    <Box sx={{
      backgroundImage: `url(${background})`,
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <AppBar position="static" sx={{
        background: 'linear-gradient(135deg, #253B80 0%, #1E88E5 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <img src={logo} alt="Logo" style={{ height: 40, marginRight: 16 }} />
            <Typography variant="h6" component="div" sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #FFFFFF 30%, #EEEEEE 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Logistics Dashboard
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              color="inherit"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/logistics-officer-dashboard')}
              sx={{
                '&:hover': {
                  background: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Home
            </Button>
            <Button
              color="inherit"
              startIcon={<FeaturesIcon />}
              onClick={() => navigate('/logistics/orders/tracking')}
              sx={{
                '&:hover': {
                  background: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Approved Orders
            </Button>
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                '&:hover': {
                  background: 'rgba(255,0,0,0.1)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4, flexGrow: 1 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <GradientCard>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{
                  mr: 3,
                  bgcolor: 'primary.main',
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
                }}>
                  <InventoryIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">Pending Demand Forms</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.pending}</Typography>
                </Box>
              </CardContent>
            </GradientCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <GradientCard>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{
                  mr: 3,
                  bgcolor: 'success.main',
                  background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)'
                }}>
                  <ShippingIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">Request Status</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.approved}</Typography>
                </Box>
              </CardContent>
            </GradientCard>
          </Grid>
        </Grid>

        <GradientCard>
          <CardContent>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  '& .MuiTabs-indicator': {
                    height: 4,
                    background: 'linear-gradient(90deg, #2196F3 0%, #21CBF3 100%)',
                    borderRadius: '4px 4px 0 0'
                  }
                }}
              >
                <Tab
                  label={
                    <Badge badgeContent={stats.pending} color="primary" sx={{ mr: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <InventoryIcon sx={{ mr: 1 }} />
                        Pending Approval
                      </Box>
                    </Badge>
                  }
                  sx={{ fontWeight: 'bold' }}
                />
                <Tab
                  label={
                    <Badge badgeContent={stats.approved} color="success" sx={{ mr: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ShippingIcon sx={{ mr: 1 }} />
                        My Approved
                      </Box>
                    </Badge>
                  }
                  sx={{ fontWeight: 'bold' }}
                />
              </Tabs>
            </Box>

            {getAllItems().length === 0 ? (
              <Box sx={{
                textAlign: 'center',
                py: 8,
                background: 'linear-gradient(145deg, rgba(255,255,255,0.7), rgba(245,245,245,0.8))',
                borderRadius: 2
              }}>
                <InventoryIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  {tabValue === 0 ? 'No pending items' : 'No approved items found'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {tabValue === 0 ? 'All clear!' : 'You haven\'t approved any items yet'}
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {getAllItems().map((item) => (
                  <Grid item xs={12} key={item._id}>
                    <GradientCard>
                      <CardContent>
                        <Box sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 2
                        }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {getDisplayTitle(item)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              ID: {item._id.substring(0, 8)}... • {getDisplayCategory(item)}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <Chip
                                label="Demand"
                                color="primary"
                                size="small"
                                variant="outlined"
                              />
                              <StatusChip
                                status={item.requestStage}
                                label={item.requestStage}
                                size="small"
                              />
                              <Chip
                                label={
                                  item.requestStage && item.requestStage.includes('Rejected')
                                    ? 'Rejected'
                                    : item.isApproved
                                      ? 'Approved'
                                      : 'Pending'
                                }
                                size="small"
                                color={
                                  item.requestStage && item.requestStage.includes('Rejected')
                                    ? 'error'
                                    : item.isApproved
                                      ? 'success'
                                      : 'warning'
                                }
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex' }}>
                            {tabValue === 0 && (
                              <>
                                <IconButton
                                  onClick={() => handleApprove(item)}
                                  sx={{
                                    color: 'success.main',
                                    background: 'rgba(76, 175, 80, 0.1)',
                                    '&:hover': { background: 'rgba(76, 175, 80, 0.2)' },
                                    mr: 1
                                  }}
                                >
                                  <ApproveIcon />
                                </IconButton>
                                <IconButton
                                  onClick={() => handleViewDetails(item)}
                                  sx={{
                                    color: 'error.main',
                                    background: 'rgba(244, 67, 54, 0.1)',
                                    '&:hover': { background: 'rgba(244, 67, 54, 0.2)' },
                                    mr: 1
                                  }}
                                >
                                  <RejectIcon />
                                </IconButton>
                              </>
                            )}
                            <IconButton
                              onClick={() => handleViewDetails(item)}
                              sx={{
                                color: 'info.main',
                                background: 'rgba(33, 150, 243, 0.1)',
                                '&:hover': { background: 'rgba(33, 150, 243, 0.2)' }
                              }}
                            >
                              <DetailsIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </GradientCard>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </GradientCard>
      </Container>

      {/* Request Details Dialog */}
      <StyledDialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        TransitionComponent={Transition}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #253B80 0%, #1E88E5 100%)',
          color: 'white',
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InventoryIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              Demand Form Details
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 3 }}>
          {selectedDemand && (
            <Box>
              {/* Header Section */}
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                p: 2,
                background: 'linear-gradient(145deg, rgba(37, 59, 128, 0.05), rgba(30, 136, 229, 0.05))',
                borderRadius: 2
              }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {getDisplayTitle(selectedDemand)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {selectedDemand._id} • Demand Form • Created: {new Date(selectedDemand.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label="Demand"
                    color="primary"
                    size="small"
                    variant="outlined"
                  />
                  <StatusChip
                    status={selectedDemand.requestStage}
                    label={selectedDemand.requestStage}
                  />
                  <Chip
                    label={
                      selectedDemand.isApproved === null
                        ? 'Rejected'
                        : selectedDemand.isApproved
                          ? 'Approved'
                          : 'Pending'
                    }
                    size="small"
                    color={
                      selectedDemand.isApproved === null
                        ? 'error'
                        : selectedDemand.isApproved
                          ? 'success'
                          : 'warning'
                    }
                    variant="outlined"
                  />
                </Box>
              </Box>

              <Grid container spacing={3}>
                {/* Left Column */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                      <DetailsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Demand Form Information
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">Department</Typography>
                      <Typography sx={{ mb: 2 }}>{selectedDemand.department || 'N/A'}</Typography>

                      <Typography variant="subtitle2" color="text.secondary">Demand Number</Typography>
                      <Typography sx={{ mb: 2 }}>{selectedDemand.demandNo || 'N/A'}</Typography>

                      <Typography variant="subtitle2" color="text.secondary">Requirement Type</Typography>
                      <Chip 
                        label={selectedDemand.requirementType || 'N/A'}
                        color={selectedDemand.requirementType === 'Urgent' ? 'error' : 
                               selectedDemand.requirementType === 'Priority' ? 'warning' : 'success'}
                        size="small"
                        sx={{ mb: 2 }}
                      />

                      <Typography variant="subtitle2" color="text.secondary">Total Cost</Typography>
                      <Typography sx={{ mb: 2 }}>{selectedDemand.totalCost?.toFixed(2) || '0.00'}</Typography>

                      <Typography variant="subtitle2" color="text.secondary">Requirement</Typography>
                      <Typography sx={{ mb: 2 }}>{selectedDemand.requirement || 'N/A'}</Typography>

                      <Typography variant="subtitle2" color="text.secondary">Specifications</Typography>
                      <Typography sx={{ mb: 2 }}>{selectedDemand.specifications || 'N/A'}</Typography>

                      <Typography variant="subtitle2" color="text.secondary">Use For</Typography>
                      <Typography sx={{ mb: 2 }}>{selectedDemand.useFor || 'N/A'}</Typography>

                      <Typography variant="subtitle2" color="text.secondary">Corporate Strategy Reference</Typography>
                      <Typography sx={{ mb: 2 }}>{selectedDemand.corporateStrategyRef || 'N/A'}</Typography>

                      <Typography variant="subtitle2" color="text.secondary">Manufacturer</Typography>
                      <Typography sx={{ mb: 2 }}>{selectedDemand.manufacturer || 'N/A'}</Typography>

                      <Typography variant="subtitle2" color="text.secondary">Local Agent</Typography>
                      <Typography sx={{ mb: 2 }}>{selectedDemand.localAgent || 'N/A'}</Typography>

                      <Typography variant="subtitle2" color="text.secondary">Other Suppliers</Typography>
                      <Typography sx={{ mb: 2 }}>{selectedDemand.otherSuppliers || 'N/A'}</Typography>

                      <Typography variant="subtitle2" color="text.secondary">Present Available Quantity</Typography>
                      <Typography sx={{ mb: 2 }}>{selectedDemand.presentAvailableQty || 'N/A'}</Typography>

                      <Typography variant="subtitle2" color="text.secondary">Request Stage</Typography>
                      <StatusChip
                        status={selectedDemand.requestStage}
                        label={selectedDemand.requestStage || 'N/A'}
                        size="small"
                        sx={{ mb: 2 }}
                      />

                      <Typography variant="subtitle2" color="text.secondary">Overall Approval Status</Typography>
                      <Chip
                        label={
                          selectedDemand.isApproved === null
                            ? 'Rejected'
                            : selectedDemand.isApproved
                              ? 'Approved'
                              : 'Pending'
                        }
                        size="small"
                        color={
                          selectedDemand.isApproved === null
                            ? 'error'
                            : selectedDemand.isApproved
                              ? 'success'
                              : 'warning'
                        }
                        sx={{ mb: 2 }}
                      />

                      <Typography variant="subtitle2" color="text.secondary">Requested User ID</Typography>
                      <Typography sx={{ mb: 2 }}>{selectedDemand.requestedUserID || 'N/A'}</Typography>

                      <Typography variant="subtitle2" color="text.secondary">Requested User Role</Typography>
                      <Typography sx={{ mb: 2 }}>{selectedDemand.requestedUserRole || 'N/A'}</Typography>

                      <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
                      <Typography sx={{ mb: 2 }}>
                        {selectedDemand.createdAt ? new Date(selectedDemand.createdAt).toLocaleString() : 'N/A'}
                      </Typography>

                      <Typography variant="subtitle2" color="text.secondary">Last Updated At</Typography>
                      <Typography>
                        {selectedDemand.updatedAt ? new Date(selectedDemand.updatedAt).toLocaleString() : 'N/A'}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                  
                    

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                      <InventoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Items List
                    </Typography>

                    {selectedDemand.items ? (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          Total Items: {selectedDemand.items.length}
                        </Typography>
                        {selectedDemand.items.slice(0, 3).map((item, index) => (
                          <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">Sr. No.</Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>{item.srNo || 'N/A'}</Typography>
                                
                                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>{item.description || 'N/A'}</Typography>
                                
                                <Typography variant="subtitle2" color="text.secondary">Part No.</Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>{item.partNo || 'N/A'}</Typography>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">Denomination</Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>{item.deno || 'N/A'}</Typography>
                                
                                <Typography variant="subtitle2" color="text.secondary">Quantity</Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>{item.qty || 'N/A'}</Typography>
                                
                                <Typography variant="subtitle2" color="text.secondary">Approximate Cost</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                  {item.approxCost ? item.approxCost.toFixed(2) : 'N/A'}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>
                        ))}
                        {selectedDemand.items.length > 3 && (
                          <Typography variant="body2" color="text.secondary">
                            ... and {selectedDemand.items.length - 3} more items
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No items available
                      </Typography>
                    )}
                    <Divider sx={{ my: 2 }} />
                    {selectedDemand.requestStage === "Rejected Logistics Officer" && (
                      <Box sx={{ mt: 2, p: 2, background: 'rgba(244, 67, 54, 0.05)', borderRadius: 2 }}>
                        <Typography variant="subtitle2" color="error" sx={{ fontWeight: 'bold' }}>
                          Rejected by Logistics Officer
                        </Typography>
                        <Typography variant="body2">{selectedDemand.note}</Typography>
                        <Typography variant="caption" display="block">
                          {new Date(selectedDemand.LogisticscreatedAt).toLocaleString()}
                        </Typography>
                      </Box>
                    )}

                    {selectedDemand.requestStage === "Rejected Rector" && (
                      <Box sx={{ mt: 2, p: 2, background: 'rgba(244, 67, 54, 0.05)', borderRadius: 2 }}>
                        <Typography variant="subtitle2" color="error" sx={{ fontWeight: 'bold' }}>
                          Rejected by Rector
                        </Typography>
                        <Typography variant="body2">{selectedDemand.note}</Typography>
                        <Typography variant="caption" display="block">
                          {new Date(selectedDemand.RectorcreatedAt).toLocaleString()}
                        </Typography>
                      </Box>
                    )}

                    {selectedDemand.requestStage === "Rejected Procurement Officer" && (
                      <Box sx={{ mt: 2, p: 2, background: 'rgba(244, 67, 54, 0.05)', borderRadius: 2 }}>
                        <Typography variant="subtitle2" color="error" sx={{ fontWeight: 'bold' }}>
                          Rejected by Procurement Officer
                        </Typography>
                        <Typography variant="body2">{selectedDemand.note}</Typography>
                        <Typography variant="caption" display="block">
                          {new Date(selectedDemand.ProcurementcreatedAt).toLocaleString()}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                {/* Right Column */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
                      <ShippingIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Approval Flow
                    </Typography>

                    {/* HOD Information - Enhanced Display */}
                    
                      
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Avatar sx={{
                          mr: 2,
                          width: 50,
                          height: 50,
                          bgcolor: 'orange',
                          background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
                          fontSize: '1.2rem',
                          fontWeight: 'bold'
                        }}>
                          {selectedDemand.HODUser.fullName.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                            {selectedDemand.HODUser.fullName}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <Typography variant="body2" sx={{ 
                              color: 'text.secondary',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              📧 {selectedDemand.HODUser.email}
                            </Typography>
                          </Box>

                          

                          {selectedDemand.department && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Typography variant="body2" sx={{ 
                                color: 'text.secondary',
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                                🏛️ Request Department: {selectedDemand.department}
                              </Typography>
                            </Box>
                          )}

                       

                          {selectedDemand.demandNo && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Typography variant="body2" sx={{ 
                                color: 'text.secondary',
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                                📋 Demand No: {selectedDemand.demandNo}
                              </Typography>
                            </Box>
                          )}

                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Typography variant="caption" sx={{ 
                              fontWeight: 'bold',
                              color: '#FF9800',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              📅 Created:
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                              {new Date(selectedDemand.createdAt).toLocaleString()}
                            </Typography>
                          </Box>

                          {selectedDemand.HODcreatedAt && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Typography variant="caption" sx={{ 
                                fontWeight: 'bold',
                                color: '#FF9800',
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                                ✅ HOD Approved:
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                {new Date(selectedDemand.HODcreatedAt).toLocaleString()}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>

                    {/* Logistics Officer Information - Enhanced Display */}
                    {selectedDemand.LogisticsUser && (
                      <Box sx={{ 
                        mb: 3, 
                        p: 2.5, 
                        border: '2px solid #2196F3',
                        borderRadius: 2,
                        background: 'linear-gradient(145deg, rgba(33, 150, 243, 0.05), rgba(33, 203, 243, 0.1))',
                        boxShadow: '0 4px 12px rgba(33, 150, 243, 0.15)'
                      }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 'bold', 
                          mb: 2, 
                          color: '#2196F3',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          🚚 Logistics Officer
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <Avatar sx={{
                            mr: 2,
                            width: 50,
                            height: 50,
                            bgcolor: 'primary.main',
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                          }}>
                            {selectedDemand.LogisticsUser.fullName.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                              {selectedDemand.LogisticsUser.fullName}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Typography variant="body2" sx={{ 
                                color: 'text.secondary',
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                                📧 {selectedDemand.LogisticsUser.email}
                              </Typography>
                            </Box>

                            {selectedDemand.LogisticsUser.departmentName && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <Typography variant="body2" sx={{ 
                                  color: 'text.secondary',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}>
                                  🏢 Department: {selectedDemand.LogisticsUser.departmentName}
                                </Typography>
                              </Box>
                            )}

                            {selectedDemand.LogisticsUser.facultyName && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <Typography variant="body2" sx={{ 
                                  color: 'text.secondary',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}>
                                  🎓 Faculty: {selectedDemand.LogisticsUser.facultyName}
                                </Typography>
                              </Box>
                            )}

                            {selectedDemand.LogisticscreatedAt && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <Typography variant="caption" sx={{ 
                                  fontWeight: 'bold',
                                  color: '#2196F3',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}>
                                  ✅ Approved:
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                  {new Date(selectedDemand.LogisticscreatedAt).toLocaleString()}
                                </Typography>
                              </Box>
                            )}

                            <Typography variant="caption" display="block" sx={{ 
                              mt: 1, 
                              p: 1, 
                              background: 'rgba(0,0,0,0.05)', 
                              borderRadius: 1,
                              fontFamily: 'monospace'
                            }}>
                              ID: {selectedDemand.LogisticsUser._id}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}

                    {selectedDemand.RectorUser && (
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Rector
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{
                            mr: 2,
                            bgcolor: 'primary.main',
                            background: 'linear-gradient(45deg,rgb(11, 207, 43) 30%,rgb(9, 129, 25) 90%)'
                          }}>
                            {selectedDemand.RectorUser.fullName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography>{selectedDemand.RectorUser.fullName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {selectedDemand.RectorUser.email}
                            </Typography>
                            <Typography variant="caption" display="block">
                              ID: {selectedDemand.RectorUser._id}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}

                    {selectedDemand.ProcurementUser && (
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Procurement Officer
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{
                            mr: 2,
                            bgcolor: 'primary.main',
                            background: 'linear-gradient(45deg,rgb(218, 20, 69) 30%,rgb(226, 7, 36) 90%)'
                          }}>
                            {selectedDemand.ProcurementUser.fullName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography>{selectedDemand.ProcurementUser.fullName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {selectedDemand.ProcurementUser.email}
                            </Typography>
                            <Typography variant="caption" display="block">
                              ID: {selectedDemand.ProcurementUser._id}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}


                  </Paper>
                </Grid>
              </Grid>

              {tabValue === 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    <RejectIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'error.main' }} />
                    Rejection Reason
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a detailed reason for rejection..."
                    variant="outlined"
                    sx={{ mb: 2 }}
                    InputProps={{
                      sx: {
                        borderRadius: 2,
                        borderColor: 'divider'
                      }
                    }}
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{
          p: 2,
          background: 'linear-gradient(145deg, rgba(245,245,245,1), rgba(255,255,255,1))',
          borderTop: '1px solid rgba(0,0,0,0.1)'
        }}>
          {tabValue === 0 && (
            <Button
              onClick={handleReject}
              color="error"
              variant="contained"
              startIcon={<RejectIcon />}
              sx={{
                background: 'linear-gradient(45deg, #F44336 30%, #E57373 90%)',
                borderRadius: 2,
                boxShadow: '0 3px 5px 2px rgba(244, 67, 54, 0.1)',
                '&:hover': {
                  boxShadow: '0 3px 10px 2px rgba(244, 67, 54, 0.2)'
                }
              }}
            >
              Reject Request
            </Button>
          )}
          <Button
            onClick={handleCloseDialog}
            color="primary"
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              borderRadius: 2,
              boxShadow: '0 3px 5px 2px rgba(33, 150, 243, 0.1)',
              '&:hover': {
                boxShadow: '0 3px 10px 2px rgba(33, 150, 243, 0.2)'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </StyledDialog>
    </Box>
  );
};

export default LogisticsDashboard;

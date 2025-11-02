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
  AccountBalance as BursarIcon,
  LocalShipping as ShippingIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
  MonetizationOn as MoneyIcon
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
  ...(status === 'Bursar' && {
    background: 'linear-gradient(45deg, #9C27B0 30%, #BA68C8 90%)',
    color: 'white'
  }),
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
  ...(status === 'Rejected Bursar' && {
    background: 'linear-gradient(45deg, #F44336 30%, #E57373 90%)',
    color: 'white'
  }),
  ...(status === 'Rejected Logistics Officer' && {
    background: 'linear-gradient(45deg, #F44336 30%, #E57373 90%)',
    color: 'white'
  }),
  ...(status === 'Rejected Rector' && {
    background: 'linear-gradient(45deg, #F44336 30%, #E57373 90%)',
    color: 'white'
  })
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const BursarDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [demandForms, setDemandForms] = useState([]);
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openBudgetDialog, setOpenBudgetDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [budgetForm, setBudgetForm] = useState({
    provisionsAvailability: '',
    voteParticulars: '',
    provisionsAllocated: '',
    totalExpenditure: '',
    balanceAvailable: ''
  });
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
        
        // Filter data for Bursar
        const pending = allDemands.filter(item => 
          item.requestStage === 'Bursar' && !item.BursarisApproved
        );
        
        const userId = localStorage.getItem('userId');
        console.log('Current user ID for filtering:', userId);
        
        const approved = allDemands.filter(item => {
          const isApproved = item.BursarisApproved === true && item.BursarUserID === userId;
          const isRector = item.requestStage === 'Rector' && item.BursarUserID === userId;
          const isProcurement = item.requestStage === 'Procurement Officer' && item.BursarUserID === userId;
          return isApproved || isRector || isProcurement;
        });
        
        const rejected = allDemands.filter(item => 
          item.requestStage === 'Rejected Bursar' && item.BursarUserID === userId
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
          const pendingResponse = await api.get('/api/bursar/pending');
          const userId = localStorage.getItem('userId');
          const approvedResponse = await api.get(`/api/bursar/approved/${userId}`);
          
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
  };

  // Filter items based on current tab
  const getFilteredItems = () => {
    console.log('Tab Value:', tabValue);
    console.log('All Demand Forms:', demandForms);
    console.log('Current User ID:', localStorage.getItem('userId'));
    
    if (tabValue === 0) {
      // Pending items
      const pending = demandForms.filter(item => 
        item.requestStage === 'Bursar' && !item.BursarisApproved
      );
      console.log('Pending items:', pending);
      return pending;
    } else {
      // Approved items by current user - including those that moved to next stages
      const userId = localStorage.getItem('userId');
      const approved = demandForms.filter(item => {
        const isApproved = item.BursarisApproved === true && item.BursarUserID === userId;
        const isRector = item.requestStage === 'Rector' && item.BursarUserID === userId;
        const isProcurement = item.requestStage === 'Procurement Officer' && item.BursarUserID === userId;
        const result = isApproved || isRector || isProcurement;
        
        console.log('Checking item:', item._id, 
          'BursarisApproved:', item.BursarisApproved, 
          'BursarUserID:', item.BursarUserID, 
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

  const handleCloseBudgetDialog = () => {
    setOpenBudgetDialog(false);
    setSelectedDemand(null);
    setBudgetForm({
      provisionsAvailability: '',
      voteParticulars: '',
      provisionsAllocated: '',
      totalExpenditure: '',
      balanceAvailable: ''
    });
  };

  const handleBudgetFormChange = (field, value) => {
    setBudgetForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-calculate balance if provisions allocated and total expenditure are provided
    if (field === 'provisionsAllocated' || field === 'totalExpenditure') {
      const provisionsAllocated = field === 'provisionsAllocated' ? parseFloat(value) || 0 : parseFloat(budgetForm.provisionsAllocated) || 0;
      const totalExpenditure = field === 'totalExpenditure' ? parseFloat(value) || 0 : parseFloat(budgetForm.totalExpenditure) || 0;
      const balance = provisionsAllocated - totalExpenditure;
      
      setBudgetForm(prev => ({
        ...prev,
        balanceAvailable: balance.toString()
      }));
    }
  };

  const handleBudgetApproval = async () => {
    // Validate all fields are filled
    const { provisionsAvailability, voteParticulars, provisionsAllocated, totalExpenditure, balanceAvailable } = budgetForm;
    
    if (!provisionsAvailability || !voteParticulars || !provisionsAllocated || !totalExpenditure || !balanceAvailable) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please fill in all budget information fields before approving.',
        icon: 'warning',
        background: 'linear-gradient(145deg, #ffffff, #f5f5f5)'
      });
      return;
    }

    // Check if balance is sufficient
    const balance = parseFloat(balanceAvailable);
    const totalCost = selectedDemand?.totalCost || 0;
    
    if (balance < totalCost) {
      Swal.fire({
        title: 'Insufficient Budget',
        text: `Available balance (${balance.toFixed(2)}) is less than the required amount (${totalCost.toFixed(2)}).`,
        icon: 'error',
        background: 'linear-gradient(145deg, #ffffff, #f5f5f5)'
      });
      return;
    }

    // Auto-close the budget form
    handleCloseBudgetDialog();

    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Confirm Budget Approval',
      html: `
        <div style="text-align: left; padding: 10px;">
          <p><strong>Demand:</strong> ${selectedDemand?.demandNo}</p>
          <p><strong>Total Cost:</strong> ${totalCost.toFixed(2)}</p>
          <p><strong>Vote Particulars:</strong> ${voteParticulars}</p>
          <p><strong>Provisions Allocated:</strong> ${parseFloat(provisionsAllocated).toFixed(2)}</p>
          <p><strong>Total Expenditure:</strong> ${parseFloat(totalExpenditure).toFixed(2)}</p>
          <p><strong>Balance Available:</strong> ${balance.toFixed(2)}</p>
        </div>
        <br/>
        <p>Are you sure you want to approve this demand with the above budget allocation?</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#9C27B0',
      cancelButtonColor: '#F44336',
      confirmButtonText: 'Yes, approve with budget!',
      background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
      backdrop: `rgba(0,0,0,0.4)`
    });

    if (result.isConfirmed) {
      try {
        const userId = localStorage.getItem('userId');
        
        await api.patch(`/api/bursar/${selectedDemand._id}/approve`, {
          BursarisApproved: true,
          BursarUserID: userId,
          provisionsAvailability,
          voteParticulars,
          provisionsAllocated: parseFloat(provisionsAllocated),
          totalExpenditure: parseFloat(totalExpenditure),
          balanceAvailable: balance
        });

        Swal.fire({
          title: 'Approved!',
          text: 'Demand form approved by Bursar with budget allocation successfully!',
          icon: 'success',
          background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
          showConfirmButton: false,
          timer: 2000
        });

        fetchData();
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || 'Budget approval failed',
          icon: 'error',
          background: 'linear-gradient(145deg, #ffffff, #f5f5f5)'
        });
      }
    } else if (result.isDismissed) {
      // If user cancels confirmation, reopen the budget dialog
      setOpenBudgetDialog(true);
    }
  };

  const handleApprove = async (item) => {
    setSelectedDemand(item);
    setBudgetForm({
      provisionsAvailability: '',
      voteParticulars: '',
      provisionsAllocated: '',
      totalExpenditure: '',
      balanceAvailable: ''
    });
    setOpenBudgetDialog(true);
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
      cancelButtonColor: '#9C27B0',
      confirmButtonText: 'Yes, reject it!',
      background: 'linear-gradient(145deg, #ffffff, #f5f5f5)'
    });

    if (result.isConfirmed) {
      try {
        const userId = localStorage.getItem('userId');
        
        await api.patch(`/api/bursar/${selectedDemand._id}/reject`, {
          BursarUserID: userId,
          rejectionReason: rejectionReason
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
      confirmButtonColor: '#9C27B0',
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
          <LinearProgress color="secondary" sx={{ height: 8, borderRadius: 4, mb: 2 }} />
          <Typography variant="h6" color="secondary">Loading requests...</Typography>
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
        background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
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
              Bursar Dashboard
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              color="inherit"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/bursar-dashboard')}
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
                  bgcolor: 'secondary.main',
                  background: 'linear-gradient(45deg, #9C27B0 30%, #BA68C8 90%)'
                }}>
                  <BursarIcon />
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
                  <MoneyIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">Approved by Bursar</Typography>
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
                    background: 'linear-gradient(90deg, #9C27B0 0%, #BA68C8 100%)',
                    borderRadius: '4px 4px 0 0'
                  }
                }}
              >
                <Tab
                  label={
                    <Badge badgeContent={stats.pending} color="secondary" sx={{ mr: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BursarIcon sx={{ mr: 1 }} />
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
                        <MoneyIcon sx={{ mr: 1 }} />
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
                <BursarIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
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
                            <Typography variant="body2" color="text.primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                              Total Cost: {item.totalCost?.toFixed(2) || '0.00'}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <Chip
                                label="Demand"
                                color="secondary"
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
                                    : item.BursarisApproved
                                      ? 'Approved'
                                      : 'Pending'
                                }
                                size="small"
                                color={
                                  item.requestStage && item.requestStage.includes('Rejected')
                                    ? 'error'
                                    : item.BursarisApproved
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
          background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
          color: 'white',
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BursarIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              Demand Form Details - Bursar Review
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
                background: 'linear-gradient(145deg, rgba(156, 39, 176, 0.05), rgba(186, 104, 200, 0.05))',
                borderRadius: 2
              }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {getDisplayTitle(selectedDemand)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {selectedDemand._id} • Demand Form • Created: {new Date(selectedDemand.createdAt).toLocaleString()}
                  </Typography>
                  <Typography variant="h6" color="secondary" sx={{ mt: 1, fontWeight: 'bold' }}>
                    Total Cost: {selectedDemand.totalCost?.toFixed(2) || '0.00'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label="Financial Review"
                    color="secondary"
                    size="small"
                    variant="outlined"
                  />
                  <StatusChip
                    status={selectedDemand.requestStage}
                    label={selectedDemand.requestStage}
                  />
                </Box>
              </Box>

              <Grid container spacing={3}>
                {/* Left Column - Demand Details */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'secondary.main' }}>
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
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'secondary.main' }}>
                        {selectedDemand.totalCost?.toFixed(2) || '0.00'}
                      </Typography>

                      <Typography variant="subtitle2" color="text.secondary">Requirement</Typography>
                      <Typography sx={{ mb: 2 }}>{selectedDemand.requirement || 'N/A'}</Typography>

                      <Typography variant="subtitle2" color="text.secondary">Specifications</Typography>
                      <Typography sx={{ mb: 2 }}>{selectedDemand.specifications || 'N/A'}</Typography>

                      <Typography variant="subtitle2" color="text.secondary">Use For</Typography>
                      <Typography sx={{ mb: 2 }}>{selectedDemand.useFor || 'N/A'}</Typography>

                      <Typography variant="subtitle2" color="text.secondary">Corporate Strategy Reference</Typography>
                      <Typography sx={{ mb: 2 }}>{selectedDemand.corporateStrategyRef || 'N/A'}</Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'secondary.main' }}>
                      <MoneyIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Financial Summary
                    </Typography>

                    {selectedDemand.items ? (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          Total Items: {selectedDemand.items.length}
                        </Typography>
                        {selectedDemand.items.slice(0, 3).map((item, index) => (
                          <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={8}>
                                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>{item.description || 'N/A'}</Typography>
                                
                                <Typography variant="subtitle2" color="text.secondary">Quantity</Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>{item.qty || 'N/A'}</Typography>
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" color="text.secondary">Cost</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                                  {item.approxCost ? item.approxCost.toFixed(2) : 'N/A'}
                                </Typography>
                                
                                <Typography variant="subtitle2" color="text.secondary">Total</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                  {item.qty && item.approxCost ? (item.qty * item.approxCost).toFixed(2) : 'N/A'}
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
                  </Paper>
                </Grid>

                {/* Right Column - Approval Flow */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: 'secondary.main' }}>
                      <ShippingIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Approval Flow
                    </Typography>

                    {/* HOD Information */}
                    {selectedDemand.HODUser && (
                      <Box sx={{ 
                        mb: 3, 
                        p: 2.5, 
                        border: '2px solid #FF9800',
                        borderRadius: 2,
                        background: 'linear-gradient(145deg, rgba(255, 152, 0, 0.05), rgba(255, 183, 77, 0.1))',
                        boxShadow: '0 4px 12px rgba(255, 152, 0, 0.15)'
                      }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 'bold', 
                          mb: 2, 
                          color: '#FF9800',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          👨‍💼 HOD Information
                        </Typography>
                        
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
                            
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              📧 {selectedDemand.HODUser.email}
                            </Typography>

                            {selectedDemand.department && (
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                🏛️ Department: {selectedDemand.department}
                              </Typography>
                            )}

                            <Typography variant="caption" sx={{ 
                              fontWeight: 'bold',
                              color: '#FF9800',
                              display: 'block',
                              mt: 1
                            }}>
                              ✅ Approved: {new Date(selectedDemand.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}

                    {/* Logistics Officer Information */}
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
                            
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              📧 {selectedDemand.LogisticsUser.email}
                            </Typography>

                            {selectedDemand.LogisticscreatedAt && (
                              <Typography variant="caption" sx={{ 
                                fontWeight: 'bold',
                                color: '#2196F3',
                                display: 'block',
                                mt: 1
                              }}>
                                ✅ Approved: {new Date(selectedDemand.LogisticscreatedAt).toLocaleString()}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    )}

                    {/* Bursar Information - Current Stage */}
                    <Box sx={{ 
                      mb: 3, 
                      p: 2.5, 
                      border: '2px solid #9C27B0',
                      borderRadius: 2,
                      background: 'linear-gradient(145deg, rgba(156, 39, 176, 0.05), rgba(186, 104, 200, 0.1))',
                      boxShadow: '0 4px 12px rgba(156, 39, 176, 0.15)'
                    }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 'bold', 
                        mb: 2, 
                        color: '#9C27B0',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        💰 Bursar Review
                      </Typography>
                      
                      {selectedDemand.BursarisApproved && selectedDemand.bursarBudgetInfo ? (
                        // Show budget approval information
                        <Box>
                          <Typography variant="body1" sx={{ 
                            color: 'success.main',
                            fontWeight: 'bold',
                            mb: 2,
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            ✅ Approved with Budget Allocation
                          </Typography>
                          
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" color="text.secondary">Provisions Availability</Typography>
                              <Typography variant="body2" sx={{ mb: 1 }}>{selectedDemand.bursarBudgetInfo.provisionsAvailability}</Typography>
                            </Grid>
                            
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" color="text.secondary">Vote Particulars</Typography>
                              <Typography variant="body2" sx={{ mb: 1 }}>{selectedDemand.bursarBudgetInfo.voteParticulars}</Typography>
                            </Grid>
                            
                            <Grid item xs={6}>
                              <Typography variant="subtitle2" color="text.secondary">Provisions Allocated</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                {selectedDemand.bursarBudgetInfo.provisionsAllocated?.toFixed(2)}
                              </Typography>
                            </Grid>
                            
                            <Grid item xs={6}>
                              <Typography variant="subtitle2" color="text.secondary">Total Expenditure</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                                {selectedDemand.bursarBudgetInfo.totalExpenditure?.toFixed(2)}
                              </Typography>
                            </Grid>
                            
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" color="text.secondary">Balance Available</Typography>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 'bold', 
                                color: 'success.main'
                              }}>
                                {selectedDemand.bursarBudgetInfo.balanceAvailable?.toFixed(2)}
                              </Typography>
                            </Grid>
                            
                            {selectedDemand.bursarBudgetInfo.budgetApprovalDate && (
                              <Grid item xs={12}>
                                <Typography variant="caption" sx={{ 
                                  fontWeight: 'bold',
                                  color: '#9C27B0',
                                  display: 'block',
                                  mt: 1
                                }}>
                                  ✅ Budget Approved: {new Date(selectedDemand.bursarBudgetInfo.budgetApprovalDate).toLocaleString()}
                                </Typography>
                              </Grid>
                            )}
                          </Grid>
                        </Box>
                      ) : (
                        // Show pending approval
                        <Box>
                          <Typography variant="body1" sx={{ 
                            color: 'text.primary',
                            fontWeight: 'bold',
                            mb: 1
                          }}>
                            Financial Approval Required
                          </Typography>
                          
                          <Typography variant="body2" sx={{ 
                            color: 'text.secondary',
                            mb: 2
                          }}>
                            This request requires Bursar approval for financial authorization before proceeding to Rector.
                          </Typography>

                          <Box sx={{ 
                            p: 2, 
                            background: 'rgba(156, 39, 176, 0.1)', 
                            borderRadius: 1,
                            border: '1px dashed #9C27B0'
                          }}>
                            <Typography variant="h6" sx={{ 
                              color: '#9C27B0',
                              fontWeight: 'bold',
                              textAlign: 'center'
                            }}>
                              Total Amount: {selectedDemand.totalCost?.toFixed(2) || '0.00'}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>

                    {/* Show next stages if this is approved view */}
                    {selectedDemand.RectorUser && (
                      <Box sx={{ 
                        mb: 3, 
                        p: 2.5, 
                        border: '2px solid #4CAF50',
                        borderRadius: 2,
                        background: 'linear-gradient(145deg, rgba(76, 175, 80, 0.05), rgba(129, 199, 132, 0.1))',
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)'
                      }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 'bold', 
                          mb: 2, 
                          color: '#4CAF50',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          🎓 Rector
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{
                            mr: 2,
                            width: 50,
                            height: 50,
                            bgcolor: 'success.main',
                            background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                          }}>
                            {selectedDemand.RectorUser.fullName.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                              {selectedDemand.RectorUser.fullName}
                            </Typography>
                            
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              📧 {selectedDemand.RectorUser.email}
                            </Typography>

                            {selectedDemand.RectorcreatedAt && (
                              <Typography variant="caption" sx={{ 
                                fontWeight: 'bold',
                                color: '#4CAF50',
                                display: 'block',
                                mt: 1
                              }}>
                                ✅ Approved: {new Date(selectedDemand.RectorcreatedAt).toLocaleString()}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    )}

                    {/* Show rejection if applicable */}
                    {selectedDemand.requestStage === "Rejected Bursar" && (
                      <Box sx={{ mt: 2, p: 2, background: 'rgba(244, 67, 54, 0.05)', borderRadius: 2 }}>
                        <Typography variant="subtitle2" color="error" sx={{ fontWeight: 'bold' }}>
                          Rejected by Bursar
                        </Typography>
                        <Typography variant="body2">{selectedDemand.rejectionReason || 'No reason provided'}</Typography>
                        <Typography variant="caption" display="block">
                          {selectedDemand.BursarcreatedAt ? new Date(selectedDemand.BursarcreatedAt).toLocaleString() : 'N/A'}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>

              {tabValue === 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    <RejectIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'error.main' }} />
                    Rejection Reason (if rejecting)
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a detailed financial reason for rejection..."
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
            color="secondary"
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #9C27B0 30%, #BA68C8 90%)',
              borderRadius: 2,
              boxShadow: '0 3px 5px 2px rgba(156, 39, 176, 0.1)',
              '&:hover': {
                boxShadow: '0 3px 10px 2px rgba(156, 39, 176, 0.2)'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </StyledDialog>

      {/* Budget Approval Dialog */}
      <StyledDialog
        open={openBudgetDialog}
        onClose={handleCloseBudgetDialog}
        maxWidth="md"
        fullWidth
        TransitionComponent={Transition}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
          color: 'white',
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MoneyIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              Budget Approval - Financial Information Required
            </Typography>
          </Box>
          <IconButton onClick={handleCloseBudgetDialog} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 3 }}>
          {selectedDemand && (
            <Box>
              {/* Demand Summary */}
              <Box sx={{
                p: 3,
                mb: 3,
                background: 'linear-gradient(145deg, rgba(156, 39, 176, 0.05), rgba(186, 104, 200, 0.05))',
                borderRadius: 2,
                border: '1px solid rgba(156, 39, 176, 0.2)'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'secondary.main', mb: 2 }}>
                  📋 Demand Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Demand No:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{selectedDemand.demandNo}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Department:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{selectedDemand.department}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Total Cost Required:</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                      {selectedDemand.totalCost?.toFixed(2) || '0.00'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Requirement Type:</Typography>
                    <Chip 
                      label={selectedDemand.requirementType}
                      color={selectedDemand.requirementType === 'Urgent' ? 'error' : 
                             selectedDemand.requirementType === 'Priority' ? 'warning' : 'success'}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Budget Information Form */}
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'secondary.main', mb: 2 }}>
                💰 Budget Authorization Form
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Any Availability of the Provisions"
                    placeholder="E.g., Available from Q2 budget allocation"
                    value={budgetForm.provisionsAvailability}
                    onChange={(e) => handleBudgetFormChange('provisionsAvailability', e.target.value)}
                    variant="outlined"
                    required
                    sx={{ mb: 2 }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Vote Particulars"
                    placeholder="E.g., Vote 2024-025 - Equipment Purchase"
                    value={budgetForm.voteParticulars}
                    onChange={(e) => handleBudgetFormChange('voteParticulars', e.target.value)}
                    variant="outlined"
                    required
                    sx={{ mb: 2 }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Provisions Allocated for the Vote"
                    type="number"
                    placeholder="0.00"
                    value={budgetForm.provisionsAllocated}
                    onChange={(e) => handleBudgetFormChange('provisionsAllocated', e.target.value)}
                    variant="outlined"
                    required
                    sx={{ mb: 2 }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Total Expenditure"
                    type="number"
                    placeholder="0.00"
                    value={budgetForm.totalExpenditure}
                    onChange={(e) => handleBudgetFormChange('totalExpenditure', e.target.value)}
                    variant="outlined"
                    required
                    sx={{ mb: 2 }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Balance Available"
                    type="number"
                    placeholder="0.00"
                    value={budgetForm.balanceAvailable}
                    onChange={(e) => handleBudgetFormChange('balanceAvailable', e.target.value)}
                    variant="outlined"
                    required
                    InputProps={{
                      readOnly: true
                    }}
                    sx={{ 
                      mb: 2,
                      '& .MuiInputBase-input': {
                        backgroundColor: '#f5f5f5'
                      }
                    }}
                    helperText="Auto-calculated: Provisions Allocated - Total Expenditure"
                  />
                </Grid>
              </Grid>

              {/* Budget Validation */}
              {budgetForm.balanceAvailable && selectedDemand.totalCost && (
                <Box sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: 2,
                  background: parseFloat(budgetForm.balanceAvailable) >= selectedDemand.totalCost 
                    ? 'linear-gradient(145deg, rgba(76, 175, 80, 0.1), rgba(129, 199, 132, 0.1))'
                    : 'linear-gradient(145deg, rgba(244, 67, 54, 0.1), rgba(229, 115, 115, 0.1))',
                  border: parseFloat(budgetForm.balanceAvailable) >= selectedDemand.totalCost 
                    ? '1px solid rgba(76, 175, 80, 0.3)'
                    : '1px solid rgba(244, 67, 54, 0.3)'
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold',
                    color: parseFloat(budgetForm.balanceAvailable) >= selectedDemand.totalCost ? 'success.main' : 'error.main',
                    display: 'flex',
                    alignItems: 'center',
                    mb: 1
                  }}>
                    {parseFloat(budgetForm.balanceAvailable) >= selectedDemand.totalCost ? '✅' : '❌'}
                    {parseFloat(budgetForm.balanceAvailable) >= selectedDemand.totalCost ? ' Budget Sufficient' : ' Insufficient Budget'}
                  </Typography>
                  <Typography variant="body2">
                    Required: {selectedDemand.totalCost.toFixed(2)} | 
                    Available: {parseFloat(budgetForm.balanceAvailable || 0).toFixed(2)} | 
                    {parseFloat(budgetForm.balanceAvailable) >= selectedDemand.totalCost 
                      ? `Surplus: ${(parseFloat(budgetForm.balanceAvailable) - selectedDemand.totalCost).toFixed(2)}`
                      : `Deficit: ${(selectedDemand.totalCost - parseFloat(budgetForm.balanceAvailable)).toFixed(2)}`
                    }
                  </Typography>
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
          <Button
            onClick={handleCloseBudgetDialog}
            color="secondary"
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBudgetApproval}
            color="primary"
            variant="contained"
            startIcon={<ApproveIcon />}
            disabled={!budgetForm.provisionsAvailability || !budgetForm.voteParticulars || 
                     !budgetForm.provisionsAllocated || !budgetForm.totalExpenditure || 
                     !budgetForm.balanceAvailable || 
                     parseFloat(budgetForm.balanceAvailable) < (selectedDemand?.totalCost || 0)}
            sx={{
              background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
              borderRadius: 2,
              boxShadow: '0 3px 5px 2px rgba(76, 175, 80, 0.1)',
              '&:hover': {
                boxShadow: '0 3px 10px 2px rgba(76, 175, 80, 0.2)'
              },
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)'
              }
            }}
          >
            Approve with Budget
          </Button>
        </DialogActions>
      </StyledDialog>
    </Box>
  );
};

export default BursarDashboard;
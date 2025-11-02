import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from '../../../assets/img/navlogo.png';
import background from '../../../assets/img/background.jpg';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
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
  School as SchoolIcon,
  Gavel as GavelIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
  Star as FeaturesIcon,
  BarChart as StatsIcon,
  Timeline as TimelineIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';

// Custom styled components
const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(12px)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
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
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
    minWidth: '600px',
    border: '1px solid rgba(255, 255, 255, 0.18)'
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
  ...(status === 'Bursar' && {
    background: 'linear-gradient(45deg, #9C27B0 30%, #BA68C8 90%)',
    color: 'white'
  }),
  ...(status === 'Rector' && {
    background: 'linear-gradient(45deg, #9C27B0 30%, #E91E63 90%)',
    color: 'white'
  }),
  ...(status === 'HOD' && {
    background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
    color: 'white'
  }),
  ...(status === 'Rejected Bursar' && {
    background: 'linear-gradient(45deg, #F44336 30%, #E57373 90%)',
    color: 'white'
  })
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const RectorDashboard = () => {
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
    fetchDemandForms();
  }, []);

  const fetchDemandForms = async () => {
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
        
        // Filter data for rector
        const pending = allDemands.filter(item => 
          item.requestStage === 'Rector' && !item.RectorisApproved
        );
        
        const userId = localStorage.getItem('userId');
        console.log('Current user ID for filtering:', userId);
        
        const approved = allDemands.filter(item => {
          const isApproved = item.RectorisApproved === true && item.RectorUserID === userId;
          const isProcurement = item.requestStage === 'Procurement Officer' && item.RectorUserID === userId;
          return isApproved || isProcurement;
        });
        
        const rejected = allDemands.filter(item => 
          item.requestStage === 'Rejected Rector' && item.RectorUserID === userId
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
          const userId = localStorage.getItem('userId');
          const pendingResponse = await api.get('/api/demands/rector/pending');
          const approvedResponse = await api.get(`/api/demands/rector/approved/${userId}`);
          
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
      console.error('Final error in fetchDemandForms:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to fetch demand forms',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(5px)'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get filtered items based on current tab
  const getAllItems = () => {
    return getFilteredItems().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const getFilteredItems = () => {
    const userId = localStorage.getItem('userId');
    console.log('Tab Value:', tabValue);
    console.log('All Demand Forms:', demandForms);
    console.log('Current User ID:', userId);
    
    if (tabValue === 0) {
      // Pending items
      const pending = demandForms.filter(item => {
        const isPending = item.requestStage === 'Rector' && item.RectorisApproved === false;
        console.log('Filtering pending item:', item._id, 'requestStage:', item.requestStage, 'RectorisApproved:', item.RectorisApproved, 'matches:', isPending);
        return isPending;
      });
      console.log('Pending items:', pending);
      return pending;
    } else if (tabValue === 1) {
      // Approved items by current user - including those that moved to next stages
      const approved = demandForms.filter(item => {
        const isApproved = item.RectorisApproved === true && item.RectorUserID === userId;
        const isProcurement = item.requestStage === 'Procurement Officer' && item.RectorUserID === userId;
        const result = isApproved || isProcurement;
        
        console.log('Checking approved item:', item._id, 
          'RectorisApproved:', item.RectorisApproved, 
          'RectorUserID:', item.RectorUserID, 
          'requestStage:', item.requestStage,
          'userId:', userId,
          'result:', result);
        
        return result;
      });
      console.log('Approved items by current user:', approved);
      return approved;
    } else {
      // Rejected items by current user
      const rejected = demandForms.filter(item => 
        item.requestStage === 'Rejected Rector' && item.RectorUserID === userId
      );
      console.log('Rejected items by current user:', rejected);
      return rejected;
    }
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

  const handleViewDetails = (demand) => {
    setSelectedDemand(demand);
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
      confirmButtonColor: '#9C27B0',
      cancelButtonColor: '#F44336',
      confirmButtonText: 'Yes, approve it!',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(5px)'
    });

    if (result.isConfirmed) {
      try {
        const userId = localStorage.getItem('userId');
        
        await api.patch(`/api/demands/${item._id}/approve/rector`, {
          RectorisApproved: true,
          rectorUserID: userId
        });

        Swal.fire({
          title: 'Approved!',
          text: 'Demand form approved successfully!',
          icon: 'success',
          background: 'rgba(255, 255, 255, 0.9)',
          showConfirmButton: false,
          timer: 1500
        });

        fetchDemandForms();
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || 'Approval failed',
          icon: 'error',
          background: 'rgba(255, 255, 255, 0.9)'
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
        background: 'rgba(255, 255, 255, 0.9)'
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
      background: 'rgba(255, 255, 255, 0.9)'
    });

    if (result.isConfirmed) {
      try {
        const userId = localStorage.getItem('userId');
        
        await api.patch(`/api/demands/${selectedDemand._id}/reject/rector`, {
          rectorUserID: userId
        });

        Swal.fire({
          title: 'Rejected!',
          text: 'Demand form rejected successfully!',
          icon: 'success',
          background: 'rgba(255, 255, 255, 0.9)',
          showConfirmButton: false,
          timer: 1500
        });

        fetchDemandForms();
        handleCloseDialog();
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || 'Rejection failed',
          icon: 'error',
          background: 'rgba(255, 255, 255, 0.9)'
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
      background: 'rgba(255, 255, 255, 0.9)'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        navigate('/');
      }
    });
  };

  const handleExportApprovedList = () => {
    const userId = localStorage.getItem('userId');
    const currentUser = localStorage.getItem('fullName') || 'Rector';
    const currentDate = new Date().toLocaleDateString();
    
    try {
      // Get approved items only
      const approvedItems = demandForms.filter(item => {
        const isApproved = item.RectorisApproved === true && item.RectorUserID === userId;
        const isProcurement = item.requestStage === 'Procurement Officer' && item.RectorUserID === userId;
        return isApproved || isProcurement;
      });

      if (approvedItems.length === 0) {
        Swal.fire({
          title: 'No Data',
          text: 'No approved demand forms found to export.',
          icon: 'info',
          background: 'rgba(255, 255, 255, 0.9)',
          confirmButtonColor: '#9C27B0'
        });
        return;
      }

      console.log('Creating PDF with', approvedItems.length, 'items');

      // Create new PDF document
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      console.log('PDF created, autoTable available:', typeof pdf.autoTable);
      
      // Set document properties
      pdf.setProperties({
        title: 'Approved Demand Forms Report',
        subject: 'Rector Dashboard Export',
        author: currentUser,
        creator: 'University Tender Management System'
      });

      // Add header
      pdf.setFontSize(18);
      pdf.setTextColor(156, 39, 176); // Purple color
      pdf.text('Approved Demand Forms Report', 20, 20);
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Generated by: ' + currentUser, 20, 30);
      pdf.text('Report Date: ' + currentDate, 20, 35);
      pdf.text('Total Approved: ' + approvedItems.length + ' Demand Forms', 20, 40);
      
      const totalCost = approvedItems.reduce((sum, item) => sum + (parseFloat(item.totalCost) || 0), 0);
      pdf.text('Total Cost: $' + totalCost.toFixed(2), 20, 45);

      // Prepare table data with safe string handling
      const tableData = approvedItems.map((item, index) => {
        try {
          return [
            String(item.demandNo || 'N/A'),
            String(item.department || 'N/A'),
            String(item.requirement ? (item.requirement.length > 25 ? item.requirement.substring(0, 25) + '...' : item.requirement) : 'N/A'),
            '$' + String(parseFloat(item.totalCost || 0).toFixed(2)),
            String(item.items?.length || 0),
            'Approved',
            String(item.requestStage || 'N/A'),
            String(item.RectorcreatedAt ? new Date(item.RectorcreatedAt).toLocaleDateString() : new Date(item.createdAt).toLocaleDateString()),
            String(item.items?.slice(0, 2).map(itm => itm.description || '').join(', ') || 'No items').substring(0, 30) + (item.items?.length > 2 ? '...' : '')
          ];
        } catch (itemError) {
          console.error('Error processing item', index, itemError);
          return [
            'Error',
            'Error',
            'Error processing item',
            '$0.00',
            '0',
            'Error',
            'Error',
            'N/A',
            'Error'
          ];
        }
      });

      console.log('Table data prepared, rows:', tableData.length);

      // Add table with error handling
      const tableConfig = {
        startY: 55,
        head: [['Demand No', 'Department', 'Requirement', 'Cost', 'Items', 'Status', 'Stage', 'Date', 'Preview']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [156, 39, 176],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8
        },
        bodyStyles: {
          fontSize: 7,
          cellPadding: 2
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 25 },
          2: { cellWidth: 40 },
          3: { cellWidth: 20 },
          4: { cellWidth: 15 },
          5: { cellWidth: 20 },
          6: { cellWidth: 30 },
          7: { cellWidth: 25 },
          8: { cellWidth: 35 }
        },
        margin: { left: 15, right: 15 },
        didDrawPage: function (data) {
          try {
            const pageHeight = pdf.internal.pageSize.height;
            pdf.setFontSize(8);
            pdf.setTextColor(128, 128, 128);
            pdf.text('University Tender Management System - Confidential', 15, pageHeight - 10);
            pdf.text('Page ' + String(data.pageNumber) + ' - ' + new Date().toLocaleString(), 15, pageHeight - 5);
          } catch (footerError) {
            console.error('Footer error:', footerError);
          }
        }
      };

      console.log('Adding table to PDF...');
      
      // Check if autoTable is available
      if (typeof pdf.autoTable === 'function') {
        // Use autoTable if available
        pdf.autoTable(tableConfig);
      } else {
        // Fallback to manual table creation
        console.log('autoTable not available, using manual table creation');
        
        let yPos = 55;
        const lineHeight = 6;
        const colWidths = [25, 25, 40, 20, 15, 20, 30, 25, 35];
        const headers = ['Demand No', 'Department', 'Requirement', 'Cost', 'Items', 'Status', 'Stage', 'Date', 'Preview'];
        
        // Draw header
        pdf.setFontSize(8);
        pdf.setFont(undefined, 'bold');
        pdf.setFillColor(156, 39, 176);
        pdf.rect(15, yPos, colWidths.reduce((a, b) => a + b, 0), 8, 'F');
        
        pdf.setTextColor(255, 255, 255);
        let xPos = 15;
        headers.forEach((header, index) => {
          pdf.text(header, xPos + 2, yPos + 5);
          xPos += colWidths[index];
        });
        
        yPos += 8;
        
        // Draw data rows
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(0, 0, 0);
        
        tableData.forEach((row, rowIndex) => {
          if (rowIndex % 2 === 0) {
            pdf.setFillColor(249, 249, 249);
            pdf.rect(15, yPos, colWidths.reduce((a, b) => a + b, 0), lineHeight, 'F');
          }
          
          xPos = 15;
          row.forEach((cell, cellIndex) => {
            const cellText = String(cell).substring(0, Math.floor(colWidths[cellIndex] / 2));
            pdf.text(cellText, xPos + 2, yPos + 4);
            xPos += colWidths[cellIndex];
          });
          
          yPos += lineHeight;
          
          // Add new page if needed
          if (yPos > 180) {
            pdf.addPage();
            yPos = 20;
          }
        });
      }

      // Save the PDF
      const fileName = 'Rector_Approved_Demands_' + new Date().toISOString().split('T')[0] + '.pdf';
      console.log('Saving PDF as:', fileName);
      
      pdf.save(fileName);

      console.log('PDF saved successfully');

      // Show success message
      Swal.fire({
        title: 'PDF Generated!',
        text: 'Successfully exported ' + approvedItems.length + ' approved demand forms to PDF.',
        icon: 'success',
        background: 'rgba(255, 255, 255, 0.9)',
        confirmButtonColor: '#9C27B0'
      });

    } catch (error) {
      console.error('PDF generation error:', error);
      console.error('Error stack:', error.stack);
      
      // More detailed error message
      let errorMessage = 'Failed to generate PDF. ';
      if (error.message) {
        errorMessage += 'Error: ' + error.message;
      } else {
        errorMessage += 'Please check console for details.';
      }
      
      Swal.fire({
        title: 'Export Error',
        text: errorMessage,
        icon: 'error',
        background: 'rgba(255, 255, 255, 0.9)',
        confirmButtonColor: '#F44336'
      });
    }
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
        <GlassCard sx={{ p: 4, textAlign: 'center', width: 400 }}>
          <LinearProgress color="secondary" sx={{ height: 8, borderRadius: 4, mb: 2 }} />
          <Typography variant="h6" color="secondary">Loading requests...</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>Please wait while we fetch your data</Typography>
        </GlassCard>
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
        background: 'linear-gradient(135deg, #6A1B9A 0%, #9C27B0 100%)',
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
              Rector Dashboard
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              color="inherit"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/rector-dashboard')}
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
              startIcon={<PdfIcon />}
              onClick={handleExportApprovedList}
              sx={{
                '&:hover': {
                  background: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Export Approved
            </Button>
            {/* <Button
              color="inherit"
              startIcon={<StatsIcon />}
              onClick={() => navigate('/rector-statistics')}
              sx={{
                '&:hover': {
                  background: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Statistics
            </Button>
            <Button
              color="inherit"
              startIcon={<FeaturesIcon />}
              onClick={() => navigate('/rector-features')}
              sx={{
                '&:hover': {
                  background: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Features
            </Button> */}
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
          <Grid item xs={12} md={4}>
            <GlassCard>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{
                  mr: 3,
                  background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)'
                }}>
                  <GavelIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">Pending Demand Forms</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.pending}</Typography>
                </Box>
              </CardContent>
            </GlassCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <GlassCard>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{
                  mr: 3,
                  background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)'
                }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">Approved Demand Forms</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.approved}</Typography>
                </Box>
              </CardContent>
            </GlassCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <GlassCard>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{
                  mr: 3,
                  background: 'linear-gradient(45deg, #F44336 30%, #E57373 90%)'
                }}>
                  <CancelIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">Rejected Demand Forms</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.rejected}</Typography>
                </Box>
              </CardContent>
            </GlassCard>
          </Grid>
        </Grid>

        <GlassCard>
          <CardContent>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  '& .MuiTabs-indicator': {
                    height: 4,
                    background: 'linear-gradient(90deg, #9C27B0 0%, #E91E63 100%)',
                    borderRadius: '4px 4px 0 0'
                  }
                }}
              >
                <Tab
                  label={
                    <Badge badgeContent={stats.pending} color="warning" sx={{ mr: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <GavelIcon sx={{ mr: 1 }} />
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
                        <CheckCircleIcon sx={{ mr: 1 }} />
                        Approved
                      </Box>
                    </Badge>
                  }
                  sx={{ fontWeight: 'bold' }}
                />
                <Tab
                  label={
                    <Badge badgeContent={stats.rejected} color="error" sx={{ mr: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CancelIcon sx={{ mr: 1 }} />
                        Rejected
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
                background: 'rgba(255, 255, 255, 0.7)',
                borderRadius: 2,
                backdropFilter: 'blur(5px)'
              }}>
                <SchoolIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  {tabValue === 0 ? 'No pending demand forms' :
                    tabValue === 1 ? 'No approved demand forms' : 'No rejected demand forms'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {tabValue === 0 ? 'All clear!' :
                    tabValue === 1 ? 'You haven\'t approved any requests yet' : 'You haven\'t rejected any requests yet'}
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {getAllItems().map((item) => (
                  <Grid item xs={12} key={item._id}>
                    <GlassCard>
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
                                color: 'secondary.main',
                                background: 'rgba(156, 39, 176, 0.1)',
                                '&:hover': { background: 'rgba(156, 39, 176, 0.2)' }
                              }}
                            >
                              <DetailsIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </GlassCard>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </GlassCard>
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
          background: 'linear-gradient(135deg, #6A1B9A 0%, #9C27B0 100%)',
          color: 'white',
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SchoolIcon sx={{ mr: 1 }} />
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
                background: 'rgba(106, 27, 154, 0.05)',
                borderRadius: 2,
                backdropFilter: 'blur(5px)'
              }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {selectedDemand.demandNo || 'Demand Form'}
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
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, height: '100%', background: 'transparent' }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'secondary.main' }}>
                      <DetailsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Demand Form Information
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">Department</Typography>
                      <Typography sx={{ mb: 2 }}>{selectedDemand.department}</Typography>

                      <Typography variant="subtitle2" color="text.secondary">Demand Number</Typography>
                      <Typography sx={{ mb: 2 }}>{selectedDemand.demandNo}</Typography>

                      <Typography variant="subtitle2" color="text.secondary">Requirement Type</Typography>
                      <Chip 
                        label={selectedDemand.requirementType}
                        color={selectedDemand.requirementType === 'Urgent' ? 'error' : 
                               selectedDemand.requirementType === 'Priority' ? 'warning' : 'success'}
                        size="small"
                        sx={{ mb: 2 }}
                      />

                      <Typography variant="subtitle2" color="text.secondary">Total Cost</Typography>
                      <Typography sx={{ mb: 2 }}>{selectedDemand.totalCost?.toFixed(2) || '0.00'}</Typography>

                      <Typography variant="subtitle2" color="text.secondary">Requirement</Typography>
                      <Typography sx={{ mb: 2 }}>{selectedDemand.requirement}</Typography>

                      <Typography variant="subtitle2" color="text.secondary">Specifications</Typography>
                      <Typography sx={{ mb: 2 }}>{selectedDemand.specifications}</Typography>

                      <Typography variant="subtitle2" color="text.secondary">Use For</Typography>
                      <Typography>{selectedDemand.useFor}</Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'secondary.main' }}>
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
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                                <Typography variant="body2">{item.description}</Typography>
                              </Grid>
                              <Grid item xs={3}>
                                <Typography variant="subtitle2" color="text.secondary">Qty</Typography>
                                <Typography variant="body2">{item.qty}</Typography>
                              </Grid>
                              <Grid item xs={3}>
                                <Typography variant="subtitle2" color="text.secondary">Cost</Typography>
                                <Typography variant="body2">{item.approxCost.toFixed(2)}</Typography>
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

                {/* Right Column */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, height: '100%', background: 'transparent' }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: 'secondary.main' }}>
                      <TimelineIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Approval Timeline
                    </Typography>

                    {/* HOD Information */}
                    {selectedDemand.HODUser && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#FF9800' }}>
                          👨‍💼 HOD: {selectedDemand.HODUser.fullName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          📧 {selectedDemand.HODUser.email}
                        </Typography>
                        {selectedDemand.department && (
                          <Typography variant="body2" color="text.secondary">
                            🏛️ Department: {selectedDemand.department}
                          </Typography>
                        )}
                        <Typography variant="caption" sx={{ color: '#FF9800' }}>
                          ✅ Approved: {new Date(selectedDemand.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* Logistics Officer Information */}
                    {selectedDemand.LogisticsUser && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#2196F3' }}>
                          🚚 Logistics Officer: {selectedDemand.LogisticsUser.fullName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          📧 {selectedDemand.LogisticsUser.email}
                        </Typography>
                        {selectedDemand.LogisticsUser.departmentName && (
                          <Typography variant="body2" color="text.secondary">
                            🏢 Department: {selectedDemand.LogisticsUser.departmentName}
                          </Typography>
                        )}
                        {selectedDemand.LogisticscreatedAt && (
                          <Typography variant="caption" sx={{ color: '#2196F3' }}>
                            ✅ Approved: {new Date(selectedDemand.LogisticscreatedAt).toLocaleString()}
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* Log Data Section - Show if logistics officer has provided log data */}
                    {selectedDemand.logData && selectedDemand.logData.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ 
                          fontWeight: 'bold', 
                          mb: 1, 
                          color: '#FF9800',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          📋 Log Section Data
                        </Typography>
                        
                        {selectedDemand.logData.map((log, index) => (
                          <Paper key={index} elevation={1} sx={{ p: 2, mb: 1, borderRadius: 2, backgroundColor: 'rgba(255,152,0,0.05)' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#FF9800' }}>
                              Item {index + 1}: {selectedDemand.items?.[index]?.description || 'N/A'}
                            </Typography>
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">SR No:</Typography>
                                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{log.srNo || 'N/A'}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Stock Availability:</Typography>
                                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{log.availabilityInStock || 'N/A'}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Last Issue Date:</Typography>
                                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                  {log.dateLastIssueMade ? new Date(log.dateLastIssueMade).toLocaleDateString() : 'N/A'}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Last Purchase Date:</Typography>
                                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                  {log.dateLastPurchase ? new Date(log.dateLastPurchase).toLocaleDateString() : 'N/A'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary">Last Purchase Price:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main', fontSize: '0.875rem' }}>
                                  {log.lastPurchasePrice || '0.00'}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Paper>
                        ))}
                        
                        {selectedDemand.logNotes && (
                          <Box sx={{ mt: 1, p: 1.5, background: 'rgba(255, 152, 0, 0.1)', borderRadius: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                              Logistics Officer Notes:
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.875rem', mt: 0.5 }}>{selectedDemand.logNotes}</Typography>
                          </Box>
                        )}
                      </Box>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* Bursar Information */}
                    {selectedDemand.BursarUser ? (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#9C27B0' }}>
                          💰 Bursar: {selectedDemand.BursarUser.fullName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          📧 {selectedDemand.BursarUser.email}
                        </Typography>
                        {selectedDemand.BursarUser.departmentName && (
                          <Typography variant="body2" color="text.secondary">
                            🏢 Department: {selectedDemand.BursarUser.departmentName}
                          </Typography>
                        )}
                        {selectedDemand.BursarcreatedAt && selectedDemand.BursarisApproved && (
                          <Typography variant="caption" sx={{ color: '#9C27B0' }}>
                            ✅ Approved: {new Date(selectedDemand.BursarcreatedAt).toLocaleString()}
                          </Typography>
                        )}
                        {selectedDemand.requestStage === 'Rejected Bursar' && (
                          <Typography variant="caption" sx={{ color: 'error.main' }}>
                            ❌ Rejected: {selectedDemand.BursarcreatedAt ? new Date(selectedDemand.BursarcreatedAt).toLocaleString() : 'N/A'}
                          </Typography>
                        )}

                        {/* Bursar Budget Information */}
                        {selectedDemand.BursarisApproved && selectedDemand.bursarBudgetInfo && (
                          <Box sx={{
                            mt: 2,
                            p: 2,
                            background: 'rgba(156, 39, 176, 0.05)',
                            borderRadius: 1,
                            border: '1px solid rgba(156, 39, 176, 0.2)'
                          }}>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 'bold', 
                              color: '#9C27B0',
                              mb: 1,
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              💰 Budget Allocation Details
                            </Typography>
                            
                            <Grid container spacing={1}>
                              <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary">Vote Particulars:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                                  {selectedDemand.bursarBudgetInfo.voteParticulars}
                                </Typography>
                              </Grid>
                              
                              <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary">Provisions Availability:</Typography>
                                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                  {selectedDemand.bursarBudgetInfo.provisionsAvailability}
                                </Typography>
                              </Grid>
                              
                              <Grid item xs={4}>
                                <Typography variant="caption" color="text.secondary">Allocated:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '0.85rem' }}>
                                  {selectedDemand.bursarBudgetInfo.provisionsAllocated?.toFixed(2)}
                                </Typography>
                              </Grid>
                              
                              <Grid item xs={4}>
                                <Typography variant="caption" color="text.secondary">Expenditure:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'warning.main', fontSize: '0.85rem' }}>
                                  {selectedDemand.bursarBudgetInfo.totalExpenditure?.toFixed(2)}
                                </Typography>
                              </Grid>
                              
                              <Grid item xs={4}>
                                <Typography variant="caption" color="text.secondary">Balance:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main', fontSize: '0.85rem' }}>
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
                                    💰 Budget Approved: {new Date(selectedDemand.bursarBudgetInfo.budgetApprovalDate).toLocaleString()}
                                  </Typography>
                                </Grid>
                              )}
                            </Grid>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      selectedDemand.requestStage === 'Bursar' && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#9C27B0' }}>
                            💰 Bursar: Pending Approval
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Waiting for Bursar financial approval
                          </Typography>
                        </Box>
                      )
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* Rector Information */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: selectedDemand.requestStage === 'Rector' ? '#9C27B0' : '#4CAF50' }}>
                        🎓 Rector: {selectedDemand.requestStage === 'Rector' ? 'Pending Your Approval' : (selectedDemand.RectorUser?.fullName || 'Not yet assigned')}
                      </Typography>
                      {selectedDemand.RectorUser && (
                        <>
                          <Typography variant="body2" color="text.secondary">
                            📧 {selectedDemand.RectorUser.email}
                          </Typography>
                          {selectedDemand.RectorUser.universityName && (
                            <Typography variant="body2" color="text.secondary">
                              🏛️ University: {selectedDemand.RectorUser.universityName}
                            </Typography>
                          )}
                          {selectedDemand.RectorcreatedAt && selectedDemand.RectorisApproved && (
                            <Typography variant="caption" sx={{ color: '#4CAF50' }}>
                              ✅ Approved: {new Date(selectedDemand.RectorcreatedAt).toLocaleString()}
                            </Typography>
                          )}
                        </>
                      )}
                      {selectedDemand.requestStage === 'Rector' && (
                        <Typography variant="body2" color="text.secondary">
                          ⏳ Awaiting your decision
                        </Typography>
                      )}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Procurement Officer Information */}
                    {selectedDemand.ProcurementUser ? (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#E75F0F' }}>
                          📋 Procurement Officer: {selectedDemand.ProcurementUser.fullName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          📧 {selectedDemand.ProcurementUser.email}
                        </Typography>
                        {selectedDemand.ProcurementUser.departmentName && (
                          <Typography variant="body2" color="text.secondary">
                            🏢 Department: {selectedDemand.ProcurementUser.departmentName}
                          </Typography>
                        )}
                        {selectedDemand.ProcurementcreatedAt && (
                          <Typography variant="caption" sx={{ color: '#E75F0F' }}>
                            ✅ Approved: {new Date(selectedDemand.ProcurementcreatedAt).toLocaleString()}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      selectedDemand.requestStage === 'Procurement Officer' && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#E75F0F' }}>
                            📋 Procurement Officer: Pending Assignment
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Will be assigned after Rector approval
                          </Typography>
                        </Box>
                      )
                    )}

                    {/* Show rejection reasons */}
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

                    {selectedDemand.RectorRejectionReason && (
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Rejection Reason
                        </Typography>
                        <Paper elevation={0} sx={{ p: 2, background: 'rgba(244, 67, 54, 0.05)', borderRadius: 2 }}>
                          <Typography>{selectedDemand.RectorRejectionReason}</Typography>
                        </Paper>
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
                        borderColor: 'divider',
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(5px)'
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
          background: 'rgba(255, 255, 255, 0.9)',
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
              background: 'linear-gradient(45deg, #9C27B0 30%, #E91E63 90%)',
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
    </Box>
  );
};

export default RectorDashboard;

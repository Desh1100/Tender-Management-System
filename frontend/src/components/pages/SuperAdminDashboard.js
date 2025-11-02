import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  DashboardOutlined,
  PeopleAltOutlined,
  PendingActionsOutlined,
  LogoutOutlined,
  PictureAsPdf,
} from '@mui/icons-material';
import api from '../api';

const drawerWidth = 240;

const DialogItem = ({ label, value }) => (
  value && (
    <Grid item xs={12} sm={6}>
      <Typography variant="subtitle2" gutterBottom>
        <strong>{label}:</strong> {value}
      </Typography>
    </Grid>
  )
);

const PdfViewer = ({ base64Data }) => {
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    if (base64Data) {
      // Create a blob URL from the base64 data
      const byteCharacters = atob(base64Data.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      // Clean up the URL when component unmounts
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [base64Data]);

  if (!pdfUrl) return null;

  return (
    <Box sx={{ mt: 2, width: '100%', height: '500px' }}>
      <iframe 
        src={pdfUrl} 
        width="100%" 
        height="100%" 
        title="PDF Viewer"
        style={{ border: 'none' }}
      />
    </Box>
  );
};

const SuperAdminDashboard = () => {
  const [viewMode, setViewMode] = useState('dashboard');
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (viewMode === 'pending') {
      fetchPendingUsers();
    } else if (viewMode === 'all') {
      fetchAllUsers();
    }
    else if(viewMode==="dashboard"){
      fetchPendingUsers();
      fetchAllUsers();
    }
  }, [viewMode]);

  const fetchPendingUsers = async () => {
    try {
      const response = await api.get('api/auth/pending-users');
      setPendingUsers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await api.get('api/auth/all-users');
      setAllUsers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await api.post('api/auth/approve-user', { userId });
      alert('User approved successfully');
      fetchPendingUsers(); // Refresh the list
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemove = async (userId) => {
    try {
      await api.post('api/auth/remove-user', { userId });
      alert('User removed successfully');
      fetchPendingUsers(); // Refresh the list
    } catch (error) {
      console.error(error);
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
    setShowPdf(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setShowPdf(false);
  };

  const handleViewPdf = () => {
    setShowPdf(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const renderRoleSpecificFields = (user) => {
    switch (user.userRole) {
      case 'HOD':
        return (
          <>
            <DialogItem label="Department Name" value={user.departmentName} />
            <DialogItem label="Faculty Name" value={user.facultyName} />
          </>
        );
      case 'Logistics Officer':
      case 'Procurement Officer':
        return (
          <>
            <DialogItem label="Office Location" value={user.officeLocation} />
            <DialogItem label="Employee ID" value={user.employeeId} />
          </>
        );
      case 'Warehouse Officer':
        return (
          <>
            <DialogItem label="Warehouse Name" value={user.warehouseName} />
            <DialogItem label="Warehouse Location" value={user.warehouseLocation} />
            <DialogItem label="Employee ID" value={user.employeeId} />
          </>
        );
      case 'Rector':
        return (
          <>
            <DialogItem label="University Name" value={user.universityName} />
            <DialogItem label="Office Address" value={user.rectorOfficeAddress} />
          </>
        );
      case 'Supplier':
        return (
          <>
            <DialogItem label="Company Name" value={user.companyName} />
            <DialogItem label="Business Registration" value={user.businessRegistrationNumber} />
            <DialogItem label="Company Address" value={user.companyAddress} />
            <DialogItem label="Supplier Type" value={user.supplierType} />
            <DialogItem label="Contact Person" value={user.contactPersonName} />
            {user.ministryOfDefenceDocument && (
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  startIcon={<PictureAsPdf />}
                  onClick={handleViewPdf}
                  sx={{ mt: 1 }}
                >
                  View Ministry of Defence Document
                </Button>
              </Grid>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Side Navigation Bar */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#f5f5f5'
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="primary">
            Admin Portal
          </Typography>
        </Box>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton
              selected={viewMode === 'dashboard'}
              onClick={() => setViewMode('dashboard')}
            >
              <ListItemIcon>
                <DashboardOutlined color="action" />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              selected={viewMode === 'pending'}
              onClick={() => setViewMode('pending')}
            >
              <ListItemIcon>
                <PendingActionsOutlined color="action" />
              </ListItemIcon>
              <ListItemText primary="Pending Users" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              selected={viewMode === 'all'}
              onClick={() => setViewMode('all')}
            >
              <ListItemIcon>
                <PeopleAltOutlined color="action" />
              </ListItemIcon>
              <ListItemText primary="All Users" />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <LogoutOutlined color="error" />
              </ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ color: 'error' }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {viewMode === 'dashboard' && (
          <>
            <Typography variant="h4" component="h1" gutterBottom>
              Dashboard
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      Pending Users
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {pendingUsers.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      All Users
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {allUsers.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}

        {viewMode === 'pending' && (
          <>
            <Typography variant="h4" component="h1" gutterBottom>
              Pending Users
            </Typography>
            <TableContainer component={Paper} elevation={3}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Full Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Phone Number</TableCell>
                    <TableCell>Actions</TableCell>
                    <TableCell>View Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.userRole}</TableCell>
                      <TableCell>{user.phoneNumber}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="success"
                          sx={{ mr: 1 }}
                          onClick={() => handleApprove(user._id)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleRemove(user._id)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          onClick={() => handleViewDetails(user)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {viewMode === 'all' && (
          <>
            <Typography variant="h4" component="h1" gutterBottom>
              All Users
            </Typography>
            <TableContainer component={Paper} elevation={3}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Full Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Phone Number</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>View Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.userRole}</TableCell>
                      <TableCell>{user.phoneNumber}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.isActive ? 'Active' : 'Inactive'}
                          color={user.isActive ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          onClick={() => handleViewDetails(user)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* Dialog to show full user details */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
          fullWidth 
          maxWidth="md"
          fullScreen={showPdf}
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" component="div">
                User Details
                <Chip
                  label={selectedUser?.userRole}
                  color="primary"
                  sx={{ ml: 2, borderRadius: 1 }}
                />
              </Typography>
              {showPdf && (
                <Tooltip title="Close PDF Viewer">
                  <IconButton onClick={() => setShowPdf(false)}>
                    <PictureAsPdf />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {showPdf && selectedUser?.ministryOfDefenceDocument ? (
              <PdfViewer base64Data={selectedUser.ministryOfDefenceDocument} />
            ) : (
              <Grid container spacing={3}>
                {/* Common Fields */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary' }}>
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                <DialogItem label="Full Name" value={selectedUser?.fullName} />
                <DialogItem label="Username" value={selectedUser?.username} />
                <DialogItem label="Email" value={selectedUser?.email} />
                <DialogItem label="Phone" value={selectedUser?.phoneNumber} />
                <DialogItem label="Address" value={selectedUser?.address} />
                <DialogItem
                  label="Date of Birth"
                  value={selectedUser?.dateOfBirth && new Date(selectedUser.dateOfBirth).toLocaleDateString()}
                />

                {/* Role-Specific Fields */}
                {selectedUser && (
                  <>
                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary' }}>
                        Role-Specific Information
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>
                    {renderRoleSpecificFields(selectedUser)}
                  </>
                )}

                {/* System Information */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary' }}>
                    System Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                <DialogItem
                  label="Request Created"
                  value={selectedUser?.createdAt && new Date(selectedUser.createdAt).toLocaleString()}
                />
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default SuperAdminDashboard;
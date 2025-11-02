import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import Swal from 'sweetalert2';
import {
    Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, Chip, Dialog, DialogTitle, DialogContent, Grid,
    DialogActions, IconButton, LinearProgress, Tooltip, TableSortLabel, Divider,
    Card, CardContent, List, ListItem, ListItemText, Badge
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Description as DescriptionIcon,
    DateRange as DateRangeIcon,
    LocationOn as LocationIcon,
    Category as CategoryIcon,
    ConfirmationNumber as ReferenceIcon,
    ArrowBack as BackIcon,
    Close as CloseIcon,
    Visibility as ViewIcon,
    VisibilityOff as DisabledIcon,
    List as ListIcon,
    Star as StarIcon,
    Check as CheckIcon,
    Info as InfoIcon,
    AttachMoney as MoneyIcon,
    LocalShipping as ShippingIcon,
    VerifiedUser as WarrantyIcon,
    Build as InstallationIcon,
    Engineering as MaintenanceIcon,
    Assignment as DetailsIcon
} from '@mui/icons-material';

const TendersPage = () => {
    const navigate = useNavigate();
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTender, setSelectedTender] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openOrdersDialog, setOpenOrdersDialog] = useState(false);
    const [openOrderDetailsDialog, setOpenOrderDetailsDialog] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [bestOffer, setBestOffer] = useState(null);

    useEffect(() => {
        fetchTenders();
        const interval = setInterval(() => {
            setTenders(prevTenders => [...prevTenders]);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const fetchTenders = async () => {
        try {
            const response = await api.get('/api/tenders/getAllTendersWithOrders');
            setTenders(response.data.data.tenders);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to fetch tenders',
                background: 'rgba(255, 255, 255, 0.9)'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleViewTender = (tender) => {
        setSelectedTender(tender);
        setOpenDialog(true);
    };

    const handleViewOrders = (tender) => {
        setSelectedTender(tender);
        
        // Calculate best offer when opening orders dialog
        if (tender.orders && tender.orders.length > 0) {
            const best = determineBestOffer(tender.orders);
            setBestOffer(best);
        }
        
        setOpenOrdersDialog(true);
    };

    const handleViewOrderDetails = (order) => {
        setSelectedOrder(order);
        setOpenOrderDetailsDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedTender(null);
    };

    const handleCloseOrdersDialog = () => {
        setOpenOrdersDialog(false);
        setSelectedTender(null);
        setBestOffer(null);
    };

    const handleCloseOrderDetailsDialog = () => {
        setOpenOrderDetailsDialog(false);
        setSelectedOrder(null);
    };

    const handleBack = () => {
        navigate('/procurement-officer-dashboard');
    };

    const calculateTimeRemaining = (closingDate) => {
        const now = new Date();
        const end = new Date(closingDate);
        const diff = end - now;

        if (diff <= 0) {
            return '00:00:00';
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60))) / 1000;

        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };

    const isTenderClosed = (closingDate) => {
        return new Date(closingDate) < new Date();
    };

    const determineBestOffer = (orders) => {
        if (!orders || orders.length === 0) return null;

        // Score each order based on multiple factors
        const scoredOrders = orders.map(order => {
            let score = 0;
            
            // Price (lower is better)
            const priceScore = (1 - (order.totalAmount / 10000)) * 40; // Max 40 points
            
            // Delivery time (shorter is better)
            const deliveryDays = order.estimatedDeliveryDays || 14;
            const deliveryScore = (1 - (deliveryDays / 30)) * 20; // Max 20 points
            
            // Warranty (longer is better)
            const warrantyScore = (order.standardWarranty / 24) * 15; // Max 15 points
            const extendedWarrantyScore = order.extendedWarranty ? (order.extendedWarrantyPeriod / 12) * 5 : 0; // Max 5 points
            
            // Quality certifications
            const qualityCertScore = order.qualityCertification ? 5 : 0;
            
            // Additional services
            const installationScore = order.installationService ? 5 : 0;
            const maintenanceScore = order.maintenanceContract ? 5 : 0;
            const freeDeliveryScore = order.freeDelivery ? 5 : 0;
            
            // Total score
            score = priceScore + deliveryScore + warrantyScore + extendedWarrantyScore + 
                   qualityCertScore + installationScore + maintenanceScore + freeDeliveryScore;
            
            return {
                ...order,
                score,
                priceScore,
                deliveryScore,
                warrantyScore: warrantyScore + extendedWarrantyScore,
                serviceScore: qualityCertScore + installationScore + maintenanceScore + freeDeliveryScore
            };
        });

        // Sort by score descending
        scoredOrders.sort((a, b) => b.score - a.score);
        
        return scoredOrders[0];
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleApproveOrder = async (orderId) => {
        try {
            await api.patch(`/api/orders/${orderId}/approve`);
            Swal.fire({
                icon: 'success',
                title: 'Order Approved',
                text: 'The order has been approved successfully',
                background: 'rgba(255, 255, 255, 0.9)'
            });
            fetchTenders(); // Refresh data
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to approve order',
                background: 'rgba(255, 255, 255, 0.9)'
            });
        }
    };

    const handleRejectOrder = async (orderId) => {
        try {
            await api.patch(`/api/orders/${orderId}/reject`);
            Swal.fire({
                icon: 'success',
                title: 'Order Rejected',
                text: 'The order has been rejected',
                background: 'rgba(255, 255, 255, 0.9)'
            });
            fetchTenders(); // Refresh data
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to reject order',
                background: 'rgba(255, 255, 255, 0.9)'
            });
        }
    };

    const sortedOrders = selectedTender?.orders ? [...selectedTender.orders] : [];
    if (sortConfig.key) {
        sortedOrders.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center', width: 400 }}>
                    <LinearProgress color="primary" sx={{ height: 8, borderRadius: 4, mb: 2 }} />
                    <Typography variant="h6" color="primary">Loading tenders...</Typography>
                </Paper>
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    All Tenders
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<BackIcon />}
                    onClick={handleBack}
                    sx={{
                        background: 'linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)',
                        borderRadius: 2,
                        boxShadow: '0 3px 5px 2px rgba(46, 125, 50, 0.1)',
                        '&:hover': {
                            boxShadow: '0 3px 10px 2px rgba(46, 125, 50, 0.2)'
                        }
                    }}
                >
                    Back to Dashboard
                </Button>
            </Box>

            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Reference No</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Orders</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Time Remaining</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Closing Date</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tenders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        <Typography variant="body1" color="text.secondary">
                                            No tenders found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tenders.map((tender) => {
                                    const isClosed = isTenderClosed(tender.closingDate);
                                    const timeRemaining = calculateTimeRemaining(tender.closingDate);
                                    
                                    return (
                                        <TableRow key={tender._id}>
                                            <TableCell>{tender.referenceNo}</TableCell>
                                            <TableCell>{tender.title}</TableCell>
                                            <TableCell>{tender.category}</TableCell>
                                            <TableCell>
                                                <Badge 
                                                    badgeContent={tender.orderCount || 0} 
                                                    color="primary"
                                                    anchorOrigin={{
                                                        vertical: 'top',
                                                        horizontal: 'right',
                                                    }}
                                                >
                                                    <ListIcon color="action" />
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={isClosed ? 'Closed' : 'Active'}
                                                    color={isClosed ? 'error' : 'success'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {isClosed ? 'Closed' : timeRemaining}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(tender.closingDate).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title="View Tender Details">
                                                    <IconButton
                                                        onClick={() => handleViewTender(tender)}
                                                        color="primary"
                                                    >
                                                        <ViewIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                {isClosed && (
                                                    <Tooltip title="View Orders">
                                                        <IconButton
                                                            onClick={() => handleViewOrders(tender)}
                                                            color="secondary"
                                                        >
                                                            <ListIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Tender Details Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                    color: 'white',
                    py: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DescriptionIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">Tender Details</Typography>
                    </Box>
                    <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ py: 3 }}>
                    {selectedTender && (
                        <Box>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {selectedTender.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Reference No: {selectedTender.referenceNo}
                                </Typography>
                            </Box>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                                        <Typography>{selectedTender.category}</Typography>
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                                        <Typography>{selectedTender.location}</Typography>
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Starting Date</Typography>
                                        <Typography>
                                            {new Date(selectedTender.startingDate).toLocaleString()}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Closing Date</Typography>
                                        <Typography>
                                            {new Date(selectedTender.closingDate).toLocaleString()}
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Tender Details</Typography>
                                        <Typography>{selectedTender.details}</Typography>
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                                        <Chip
                                            label={isTenderClosed(selectedTender.closingDate) ? 'Closed' : 'Active'}
                                            color={isTenderClosed(selectedTender.closingDate) ? 'error' : 'success'}
                                        />
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Orders Received</Typography>
                                        <Chip 
                                            label={selectedTender.orderCount || 0} 
                                            color="primary" 
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{
                    p: 2,
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderTop: '1px solid rgba(0,0,0,0.1)'
                }}>
                    <Button
                        onClick={handleCloseDialog}
                        color="primary"
                        variant="contained"
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Orders Dialog */}
            <Dialog
                open={openOrdersDialog}
                onClose={handleCloseOrdersDialog}
                maxWidth="lg"
                fullWidth
                scroll="paper"
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                    color: 'white',
                    py: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ListIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">Orders for {selectedTender?.title}</Typography>
                    </Box>
                    <IconButton onClick={handleCloseOrdersDialog} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ py: 3 }}>
                    {selectedTender && (
                        <Box>
                            {bestOffer && (
                                <Card sx={{ mb: 3, borderLeft: '4px solid #ffc107', backgroundColor: '#fff8e1' }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <StarIcon color="warning" sx={{ mr: 1 }} />
                                            <Typography variant="h6" color="text.primary">
                                                Recommended Best Offer
                                            </Typography>
                                        </Box>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="subtitle1">
                                                    Supplier: <strong>{bestOffer.userDetails?.companyName || 'N/A'}</strong>
                                                </Typography>
                                                <Typography variant="body2">
                                                    Price: <strong>${bestOffer.totalAmount}</strong>
                                                </Typography>
                                                <Typography variant="body2">
                                                    Delivery: <strong>{bestOffer.estimatedDeliveryDays} days</strong>
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="body2">
                                                    Warranty: <strong>{bestOffer.standardWarranty} months</strong>
                                                    {bestOffer.extendedWarranty && (
                                                        <span> + {bestOffer.extendedWarrantyPeriod} months extended</span>
                                                    )}
                                                </Typography>
                                                <Typography variant="body2">
                                                    Quality Certification: <strong>{bestOffer.qualityCertification ? 'Yes' : 'No'}</strong>
                                                </Typography>
                                                <Typography variant="body2">
                                                    Installation: <strong>{bestOffer.installationService ? 'Included' : 'Not included'}</strong>
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                        <Box sx={{ mt: 2 }}>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                startIcon={<CheckIcon />}
                                                onClick={() => handleApproveOrder(bestOffer._id)}
                                                sx={{ mr: 2 }}
                                            >
                                                Approve Best Offer
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                startIcon={<InfoIcon />}
                                                onClick={() => handleViewOrderDetails(bestOffer)}
                                            >
                                                View Details
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            )}

                            <Typography variant="subtitle1" sx={{ mb: 2 }}>
                                All Orders ({selectedTender.orderCount || 0})
                            </Typography>

                            {sortedOrders.length > 0 ? (
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>
                                                    <TableSortLabel
                                                        active={sortConfig.key === 'userDetails.companyName'}
                                                        direction={sortConfig.direction}
                                                        onClick={() => handleSort('userDetails.companyName')}
                                                    >
                                                        Supplier
                                                    </TableSortLabel>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <TableSortLabel
                                                        active={sortConfig.key === 'totalAmount'}
                                                        direction={sortConfig.direction}
                                                        onClick={() => handleSort('totalAmount')}
                                                    >
                                                        Amount
                                                    </TableSortLabel>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <TableSortLabel
                                                        active={sortConfig.key === 'estimatedDeliveryDays'}
                                                        direction={sortConfig.direction}
                                                        onClick={() => handleSort('estimatedDeliveryDays')}
                                                    >
                                                        Delivery Days
                                                    </TableSortLabel>
                                                </TableCell>
                                                <TableCell>Warranty</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {sortedOrders.map((order) => (
                                                <TableRow 
                                                    key={order._id}
                                                    sx={{ 
                                                        '&:last-child td, &:last-child th': { border: 0 },
                                                        backgroundColor: bestOffer?._id === order._id ? '#fff8e1' : 'inherit'
                                                    }}
                                                >
                                                    <TableCell component="th" scope="row">
                                                        {order.userDetails?.companyName || 'N/A'}
                                                        {bestOffer?._id === order._id && (
                                                            <StarIcon color="warning" fontSize="small" sx={{ ml: 1 }} />
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="right">${order.totalAmount}</TableCell>
                                                    <TableCell align="right">{order.estimatedDeliveryDays}</TableCell>
                                                    <TableCell>
                                                        {order.standardWarranty} months
                                                        {order.extendedWarranty && (
                                                            <span> + {order.extendedWarrantyPeriod} months</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={order.status} 
                                                            color={
                                                                order.status === 'pending' ? 'default' :
                                                                order.status === 'approved' ? 'success' :
                                                                order.status === 'rejected' ? 'error' : 'warning'
                                                            } 
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Tooltip title="View Details">
                                                            <IconButton
                                                                onClick={() => handleViewOrderDetails(order)}
                                                                color="primary"
                                                                size="small"
                                                            >
                                                                <DetailsIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        {order.status === 'pending' && (
                                                            <>
                                                                <Tooltip title="Approve Order">
                                                                    <IconButton
                                                                        onClick={() => handleApproveOrder(order._id)}
                                                                        color="success"
                                                                        size="small"
                                                                    >
                                                                        <CheckCircleIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Reject Order">
                                                                    <IconButton
                                                                        onClick={() => handleRejectOrder(order._id)}
                                                                        color="error"
                                                                        size="small"
                                                                    >
                                                                        <CancelIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                                    No orders received for this tender.
                                </Typography>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{
                    p: 2,
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderTop: '1px solid rgba(0,0,0,0.1)'
                }}>
                    <Button
                        onClick={handleCloseOrdersDialog}
                        color="primary"
                        variant="contained"
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Order Details Dialog */}
            <Dialog
                open={openOrderDetailsDialog}
                onClose={handleCloseOrderDetailsDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #673ab7 0%, #9c27b0 100%)',
                    color: 'white',
                    py: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DetailsIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">Order Details</Typography>
                    </Box>
                    <IconButton onClick={handleCloseOrderDetailsDialog} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ py: 3 }}>
                    {selectedOrder && (
                        <Box>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" sx={{ mb: 2 }}>Supplier Information</Typography>
                                    <List>
                                        <ListItem>
                                            <ListItemText 
                                                primary="Company Name" 
                                                secondary={selectedOrder.userDetails?.companyName || 'N/A'} 
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText 
                                                primary="Contact Person" 
                                                secondary={selectedOrder.userDetails?.contactPersonName || 'N/A'} 
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText 
                                                primary="Email" 
                                                secondary={selectedOrder.userDetails?.email || 'N/A'} 
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText 
                                                primary="Phone" 
                                                secondary={selectedOrder.userDetails?.phoneNumber || 'N/A'} 
                                            />
                                        </ListItem>
                                    </List>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" sx={{ mb: 2 }}>Order Summary</Typography>
                                    <List>
                                        <ListItem>
                                            <ListItemText 
                                                primary="Status" 
                                                secondary={
                                                    <Chip 
                                                        label={selectedOrder.status} 
                                                        color={
                                                            selectedOrder.status === 'pending' ? 'default' :
                                                            selectedOrder.status === 'approved' ? 'success' :
                                                            selectedOrder.status === 'rejected' ? 'error' : 'warning'
                                                        } 
                                                    />
                                                } 
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText 
                                                primary="Quantity" 
                                                secondary={selectedOrder.quantity} 
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText 
                                                primary="Total Amount" 
                                                secondary={`$${selectedOrder.totalAmount}`} 
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText 
                                                primary="Delivery Date" 
                                                secondary={new Date(selectedOrder.deliveryDate).toLocaleDateString()} 
                                            />
                                        </ListItem>
                                    </List>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="h6" sx={{ mb: 2 }}>Order Specifications</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined" sx={{ mb: 2 }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <MoneyIcon color="primary" sx={{ mr: 1 }} />
                                                <Typography variant="subtitle1">Pricing</Typography>
                                            </Box>
                                            <List dense>
                                                <ListItem>
                                                    <ListItemText 
                                                        primary="Total Amount" 
                                                        secondary={`$${selectedOrder.totalAmount}`} 
                                                    />
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemText 
                                                        primary="Delivery Cost" 
                                                        secondary={selectedOrder.freeDelivery ? 'Free' : `$${selectedOrder.deliveryCost}`} 
                                                    />
                                                </ListItem>
                                            </List>
                                        </CardContent>
                                    </Card>

                                    <Card variant="outlined" sx={{ mb: 2 }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <ShippingIcon color="primary" sx={{ mr: 1 }} />
                                                <Typography variant="subtitle1">Delivery</Typography>
                                            </Box>
                                            <List dense>
                                                <ListItem>
                                                    <ListItemText 
                                                        primary="Estimated Delivery Days" 
                                                        secondary={selectedOrder.estimatedDeliveryDays} 
                                                    />
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemText 
                                                        primary="Delivery Date" 
                                                        secondary={new Date(selectedOrder.deliveryDate).toLocaleDateString()} 
                                                    />
                                                </ListItem>
                                            </List>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined" sx={{ mb: 2 }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <WarrantyIcon color="primary" sx={{ mr: 1 }} />
                                                <Typography variant="subtitle1">Warranty</Typography>
                                            </Box>
                                            <List dense>
                                                <ListItem>
                                                    <ListItemText 
                                                        primary="Standard Warranty" 
                                                        secondary={`${selectedOrder.standardWarranty} months`} 
                                                    />
                                                </ListItem>
                                                {selectedOrder.extendedWarranty && (
                                                    <ListItem>
                                                        <ListItemText 
                                                            primary="Extended Warranty" 
                                                            secondary={`${selectedOrder.extendedWarrantyPeriod} months ($${selectedOrder.extendedWarrantyCost})`} 
                                                        />
                                                    </ListItem>
                                                )}
                                                <ListItem>
                                                    <ListItemText 
                                                        primary="Quality Certification" 
                                                        secondary={selectedOrder.qualityCertification ? 'Yes' : 'No'} 
                                                    />
                                                </ListItem>
                                            </List>
                                        </CardContent>
                                    </Card>

                                    <Card variant="outlined">
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <InstallationIcon color="primary" sx={{ mr: 1 }} />
                                                <Typography variant="subtitle1">Services</Typography>
                                            </Box>
                                            <List dense>
                                                <ListItem>
                                                    <ListItemText 
                                                        primary="Installation Service" 
                                                        secondary={selectedOrder.installationService ? `Included ($${selectedOrder.installationCost})` : 'Not included'} 
                                                    />
                                                </ListItem>
                                                {selectedOrder.maintenanceContract && (
                                                    <ListItem>
                                                        <ListItemText 
                                                            primary="Maintenance Contract" 
                                                            secondary={`${selectedOrder.maintenancePeriod} months ($${selectedOrder.maintenanceCost})`} 
                                                        />
                                                    </ListItem>
                                                )}
                                            </List>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            {selectedOrder.notes && (
                                <>
                                    <Divider sx={{ my: 3 }} />
                                    <Typography variant="h6" sx={{ mb: 1 }}>Additional Notes</Typography>
                                    <Typography variant="body1">{selectedOrder.notes}</Typography>
                                </>
                            )}

                            {selectedOrder.specialRequirements && (
                                <>
                                    <Divider sx={{ my: 3 }} />
                                    <Typography variant="h6" sx={{ mb: 1 }}>Special Requirements</Typography>
                                    <Typography variant="body1">{selectedOrder.specialRequirements}</Typography>
                                </>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{
                    p: 2,
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderTop: '1px solid rgba(0,0,0,0.1)'
                }}>
                    <Button
                        onClick={handleCloseOrderDetailsDialog}
                        color="primary"
                        variant="contained"
                    >
                        Close
                    </Button>
                    {selectedOrder?.status === 'pending' && (
                        <>
                            <Button
                                onClick={() => handleRejectOrder(selectedOrder._id)}
                                color="error"
                                variant="outlined"
                                startIcon={<CancelIcon />}
                                sx={{ mr: 1 }}
                            >
                                Reject
                            </Button>
                            <Button
                                onClick={() => handleApproveOrder(selectedOrder._id)}
                                color="success"
                                variant="contained"
                                startIcon={<CheckIcon />}
                            >
                                Approve
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default TendersPage;
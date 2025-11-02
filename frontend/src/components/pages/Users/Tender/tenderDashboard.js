import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import Swal from 'sweetalert2';
import logo from '../../../assets/img/navlogo.png';
import background from '../../../assets/img/backgroundTender.jpg';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Pagination,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Checkbox,
    FormControlLabel,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    useTheme
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterAlt as FilterIcon,
    Event as DateIcon,
    Category as CategoryIcon,
    Info as DetailsIcon,
    Close as CloseIcon,
    Logout as LogoutIcon,
    Home as HomeIcon,
    BarChart as StatsIcon,
    Star as FeaturesIcon,
    CheckCircle as CheckCircleIcon,
    ExpandMore as ExpandMoreIcon,
    AddShoppingCart as OrderIcon,
    CalendarToday as CalendarIcon,
    Assignment as TenderIcon,
    Business as CompanyIcon,
    Description as DescriptionIcon,
    LocationOn as LocationIcon,
    Assignment as AssignmentIcon,
    LocalShipping as LocalShippingIcon,
    AssignmentReturn as AssignmentReturnIcon,
    Construction as ConstructionIcon,
    SupportAgent as SupportAgentIcon,
    Payment as PaymentIcon,
    NoteAdd as NoteAddIcon
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
        minWidth: '800px',
        border: '1px solid rgba(255, 255, 255, 0.18)'
    }
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: '0.7rem',
    ...(status === 'active' && {
        background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
        color: 'white'
    }),
    ...(status === 'upcoming' && {
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        color: 'white'
    }),
    ...(status === 'closed' && {
        background: 'linear-gradient(45deg, #9E9E9E 30%, #BDBDBD 90%)',
        color: 'white'
    }),
    ...(status === 'cancelled' && {
        background: 'linear-gradient(45deg, #F44336 30%, #E57373 90%)',
        color: 'white'
    })
}));

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const InfoRow = ({ label, value, icon }) => (
    <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
            {icon && React.cloneElement(icon, { sx: { fontSize: '1rem', mr: 0.5 } })}
            {label}
        </Typography>
        <Typography variant="body1" sx={{ ml: icon ? 1.5 : 0 }}>
            {value || '-'}
        </Typography>
    </Box>
);

const SectionHeader = ({ icon, title }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {React.cloneElement(icon, {
            sx: {
                color: 'primary.main',
                mr: 1,
                fontSize: '1.5rem'
            }
        })}
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {title}
        </Typography>
    </Box>
);

const TenderDashboard = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [tenders, setTenders] = useState([]);
    const [filteredTenders, setFilteredTenders] = useState([]);
    const [selectedTender, setSelectedTender] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [tendersPerPage] = useState(5);
    const [orderDetails, setOrderDetails] = useState({
        quantity: 1,
        unitPrice: 0,
        deliveryDate: '',
        notes: '',
        freeDelivery: false,
        deliveryCost: 0,
        estimatedDeliveryDays: 7,
        standardWarranty: 12,
        extendedWarranty: false,
        extendedWarrantyPeriod: 0,
        extendedWarrantyCost: 0,
        materialGrade: 'standard',
        customMaterialSpec: '',
        qualityCertification: false,
        installationService: false,
        installationCost: 0,
        maintenanceContract: false,
        maintenancePeriod: 0,
        maintenanceCost: 0,
        maintenanceTerms: '',
        specialRequirements: ''
    });

    // Function to update tender status based on dates
    const updateTenderStatus = (tendersList) => {
        const now = new Date();
        return tendersList.map(tender => {
            const startingDate = new Date(tender.startingDate);
            const closingDate = new Date(tender.closingDate);
            
            let status = tender.status;
            
            // Only update status if it's not already manually set to 'cancelled'
            if (tender.status !== 'cancelled') {
                if (now < startingDate) {
                    status = 'upcoming';
                } else if (now >= startingDate && now <= closingDate) {
                    status = 'active';
                } else if (now > closingDate) {
                    status = 'closed';
                }
            }
            
            return {
                ...tender,
                status
            };
        });
    };

    const fetchTenders = async () => {
        try {
            const response = await api.get('/api/tenders');
            // Update status based on current date
            const updatedTenders = updateTenderStatus(response.data.data.tenders);
            setTenders(updatedTenders);
            setFilteredTenders(updatedTenders);

            // Extract unique categories
            const uniqueCategories = [...new Set(updatedTenders.map(t => t.category).filter(Boolean))];
            setCategories(uniqueCategories);

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to fetch tenders',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(5px)'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTenders();
        
        // Set up interval to check tender status every hour
        const intervalId = setInterval(() => {
            setTenders(prevTenders => {
                const updatedTenders = updateTenderStatus(prevTenders);
                setFilteredTenders(updatedTenders);
                return updatedTenders;
            });
        }, 3600000); // 1 hour in milliseconds

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchQuery, selectedCategory, dateFilter, tenders]);

    const applyFilters = () => {
        let result = [...tenders];

        // Apply category filter
        if (selectedCategory !== 'all') {
            result = result.filter(tender => (tender.category || '') === selectedCategory);
        }

        // Apply date filter
        if (dateFilter === 'active') {
            result = result.filter(tender => tender.status === 'active');
        } else if (dateFilter === 'upcoming') {
            result = result.filter(tender => tender.status === 'upcoming');
        } else if (dateFilter === 'closed') {
            result = result.filter(tender => tender.status === 'closed');
        }

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(tender =>
                (tender.title || '').toLowerCase().includes(query) ||
                (tender.referenceNo || '').toLowerCase().includes(query) ||
                (tender.location || '').toLowerCase().includes(query) ||
                (tender.details || '').toLowerCase().includes(query)
            );
        }

        setFilteredTenders(result);
        setCurrentPage(1);
    };

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
    };

    const handleDateFilterChange = (event) => {
        setDateFilter(event.target.value);
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleViewDetails = (tender) => {
        // Check if tender is closed before allowing view
        const now = new Date();
        const closingDate = new Date(tender.closingDate);
        
        // Update status if needed
        let updatedTender = tender;
        if (tender.status !== 'cancelled') {
            if (now > closingDate && tender.status !== 'closed') {
                updatedTender = {
                    ...tender,
                    status: 'closed'
                };
            } else if (now >= new Date(tender.startingDate) && now <= closingDate && tender.status !== 'active') {
                updatedTender = {
                    ...tender,
                    status: 'active'
                };
            } else if (now < new Date(tender.startingDate) && tender.status !== 'upcoming') {
                updatedTender = {
                    ...tender,
                    status: 'upcoming'
                };
            }
        }
        
        setSelectedTender(updatedTender);
        setOrderDetails(prev => ({
            ...prev,
            unitPrice: updatedTender.estimatedPrice || 0
        }));
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedTender(null);
        setOrderDetails({
            quantity: 1,
            unitPrice: 0,
            deliveryDate: '',
            notes: '',
            freeDelivery: false,
            deliveryCost: 0,
            estimatedDeliveryDays: 7,
            standardWarranty: 12,
            extendedWarranty: false,
            extendedWarrantyPeriod: 0,
            extendedWarrantyCost: 0,
            materialGrade: 'standard',
            customMaterialSpec: '',
            qualityCertification: false,
            installationService: false,
            installationCost: 0,
            maintenanceContract: false,
            maintenancePeriod: 0,
            maintenanceCost: 0,
            maintenanceTerms: '',
            specialRequirements: ''
        });
    };

    const handleOrderChange = (e) => {
        const { name, value, type, checked } = e.target;
        setOrderDetails(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const calculateSubtotal = () => {
        return (parseFloat(orderDetails.unitPrice) || 0) * (parseInt(orderDetails.quantity) || 0);
    };

    const calculateAdditionalCharges = () => {
        let charges = 0;

        if (!orderDetails.freeDelivery) {
            charges += parseFloat(orderDetails.deliveryCost) || 0;
        }

        if (orderDetails.extendedWarranty) {
            charges += parseFloat(orderDetails.extendedWarrantyCost) || 0;
        }

        if (orderDetails.installationService) {
            charges += parseFloat(orderDetails.installationCost) || 0;
        }

        if (orderDetails.maintenanceContract) {
            charges += parseFloat(orderDetails.maintenanceCost) || 0;
        }

        return charges;
    };

    const calculateTotalAmount = () => {
        return calculateSubtotal() + calculateAdditionalCharges();
    };

    const validateOrderDetails = () => {
        if (!orderDetails.deliveryDate) {
            return { valid: false, message: 'Please provide a delivery date' };
        }

        if (orderDetails.quantity < 1) {
            return { valid: false, message: 'Quantity must be at least 1' };
        }

        if (orderDetails.unitPrice <= 0) {
            return { valid: false, message: 'Unit price must be greater than 0' };
        }

        if (selectedTender && orderDetails.quantity > (selectedTender.requestId?.newItemRequestCount || 1000)) {
            return { valid: false, message: 'Quantity cannot exceed requested amount' };
        }

        if (orderDetails.extendedWarranty && (!orderDetails.extendedWarrantyPeriod || !orderDetails.extendedWarrantyCost)) {
            return { valid: false, message: 'Please provide extended warranty details' };
        }

        if (orderDetails.installationService && !orderDetails.installationCost) {
            return { valid: false, message: 'Please provide installation cost' };
        }

        if (orderDetails.maintenanceContract && (!orderDetails.maintenancePeriod || !orderDetails.maintenanceCost)) {
            return { valid: false, message: 'Please provide maintenance contract details' };
        }

        return { valid: true };
    };

    const handlePlaceOrder = async () => {
        const validation = validateOrderDetails();
        if (!validation.valid) {
            setOpenDialog(false);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: validation.message,
                background: 'rgba(255, 255, 255, 0.9)'
            });
            return;
        }

        try {
            const userId = localStorage.getItem('userId');
            const totalAmount = calculateTotalAmount();

            const orderData = {
                tenderId: selectedTender._id,
                userId,
                quantity: orderDetails.quantity,
                unitPrice: orderDetails.unitPrice,
                deliveryDate: orderDetails.deliveryDate,
                notes: orderDetails.notes,
                freeDelivery: orderDetails.freeDelivery,
                deliveryCost: orderDetails.deliveryCost,
                estimatedDeliveryDays: orderDetails.estimatedDeliveryDays,
                standardWarranty: orderDetails.standardWarranty,
                extendedWarranty: orderDetails.extendedWarranty,
                extendedWarrantyPeriod: orderDetails.extendedWarrantyPeriod,
                extendedWarrantyCost: orderDetails.extendedWarrantyCost,
                materialGrade: orderDetails.materialGrade,
                customMaterialSpec: orderDetails.customMaterialSpec,
                qualityCertification: orderDetails.qualityCertification,
                installationService: orderDetails.installationService,
                installationCost: orderDetails.installationCost,
                maintenanceContract: orderDetails.maintenanceContract,
                maintenancePeriod: orderDetails.maintenancePeriod,
                maintenanceCost: orderDetails.maintenanceCost,
                maintenanceTerms: orderDetails.maintenanceTerms,
                specialRequirements: orderDetails.specialRequirements,
                totalAmount,
                status: 'pending',
                paymentStatus: 'unpaid'
            };

            const response = await api.post('/api/orders', orderData);

            Swal.fire({
                title: 'Order Placed!',
                text: 'Your order has been submitted successfully',
                icon: 'success',
                background: 'rgba(255, 255, 255, 0.9)',
                confirmButtonText: 'OK',
                confirmButtonColor: '#6A1B9A'
            });

            handleCloseDialog();
        } catch (error) {
            setOpenDialog(false);
            Swal.fire({
                title: 'Order Failed',
                text: error.response?.data?.error ||
                    error.response?.data?.message ||
                    'Failed to place order. Please try again.',
                icon: 'error',
                background: 'rgba(255, 255, 255, 0.9)'
            });
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

    // Pagination logic
    const indexOfLastTender = currentPage * tendersPerPage;
    const indexOfFirstTender = indexOfLastTender - tendersPerPage;
    const currentTenders = filteredTenders.slice(indexOfFirstTender, indexOfLastTender);
    const totalPages = Math.ceil(filteredTenders.length / tendersPerPage);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
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
                    <Typography variant="h6" color="secondary">Loading tenders...</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>Please wait while we fetch tender data</Typography>
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
                            Supplier Dashboard
                        </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            color="inherit"
                            startIcon={<HomeIcon />}
                            onClick={() => navigate('/supplier-dashboard')}
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
                        {/* <Button
                            color="inherit"
                            startIcon={<StatsIcon />}
                            onClick={() => navigate('/statistics')}
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
                            onClick={() => navigate('/features')}
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
                {/* Filter Section */}
                <GlassCard sx={{ mb: 4 }}>
                    <CardContent>
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Search tenders..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    InputProps={{
                                        startAdornment: (
                                            <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                                        ),
                                        sx: {
                                            borderRadius: '12px',
                                            background: 'rgba(255, 255, 255, 0.8)'
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel id="category-filter-label">Category</InputLabel>
                                    <Select
                                        labelId="category-filter-label"
                                        value={selectedCategory}
                                        onChange={handleCategoryChange}
                                        label="Category"
                                        sx={{
                                            borderRadius: '12px',
                                            background: 'rgba(255, 255, 255, 0.8)'
                                        }}
                                        startAdornment={
                                            <CategoryIcon sx={{ color: 'text.secondary', mr: 1 }} />
                                        }
                                    >
                                        <MenuItem value="all">All Categories</MenuItem>
                                        {categories.map((category) => (
                                            <MenuItem key={category} value={category}>
                                                {category}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel id="date-filter-label">Status</InputLabel>
                                    <Select
                                        labelId="date-filter-label"
                                        value={dateFilter}
                                        onChange={handleDateFilterChange}
                                        label="Status"
                                        sx={{
                                            borderRadius: '12px',
                                            background: 'rgba(255, 255, 255, 0.8)'
                                        }}
                                        startAdornment={
                                            <DateIcon sx={{ color: 'text.secondary', mr: 1 }} />
                                        }
                                    >
                                        <MenuItem value="all">All Tenders</MenuItem>
                                        <MenuItem value="active">Active</MenuItem>
                                        <MenuItem value="upcoming">Upcoming</MenuItem>
                                        <MenuItem value="closed">Closed</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<FilterIcon />}
                                    onClick={applyFilters}
                                    sx={{
                                        height: '56px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #6A1B9A 0%, #9C27B0 100%)'
                                    }}
                                >
                                    Apply
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </GlassCard>

                {/* Tenders List */}
                <GlassCard>
                    <CardContent>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                <TenderIcon sx={{ mr: 1, color: 'secondary.main' }} />
                                Available Tenders
                                <Chip
                                    label={`${filteredTenders.length} items`}
                                    size="small"
                                    color="secondary"
                                    sx={{ ml: 2 }}
                                />
                            </Typography>
                        </Box>

                        {filteredTenders.length === 0 ? (
                            <Box sx={{
                                textAlign: 'center',
                                py: 8,
                                background: 'rgba(255, 255, 255, 0.7)',
                                borderRadius: 2,
                                backdropFilter: 'blur(5px)'
                            }}>
                                <TenderIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary">
                                    No tenders found
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    Try adjusting your search or filter criteria
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                <TableContainer component={Paper} sx={{ background: 'transparent', boxShadow: 'none' }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Reference No</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Dates</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {currentTenders.map((tender) => (
                                                <TableRow key={tender._id} hover>
                                                    <TableCell>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                            {tender.referenceNo || 'N/A'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography>{tender.title || 'No Title'}</Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {tender.details ? tender.details.substring(0, 50) + '...' : 'No details available'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={tender.category || 'Uncategorized'}
                                                            size="small"
                                                            icon={<CategoryIcon fontSize="small" />}
                                                            sx={{ background: 'rgba(106, 27, 154, 0.1)' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <LocationIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                                            {tender.location || 'Location not specified'}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box>
                                                            <Typography variant="caption" display="block">
                                                                <CalendarIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                                                {tender.startingDate ? formatDate(tender.startingDate) : 'Start date not set'}
                                                            </Typography>
                                                            <Typography variant="caption" display="block">
                                                                <CalendarIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                                                {tender.closingDate ? formatDate(tender.closingDate) : 'End date not set'}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusChip
                                                            status={tender.status || 'unknown'}
                                                            label={tender.status || 'Unknown'}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <IconButton
                                                                onClick={() => handleViewDetails(tender)}
                                                                sx={{
                                                                    color: 'secondary.main',
                                                                    background: 'rgba(156, 39, 176, 0.1)',
                                                                    '&:hover': { background: 'rgba(156, 39, 176, 0.2)' }
                                                                }}
                                                            >
                                                                <DetailsIcon />
                                                            </IconButton>
                                                            {tender.status === 'active' ? (
                                                                <IconButton
                                                                    onClick={() => handleViewDetails(tender)}
                                                                    sx={{
                                                                        color: 'success.main',
                                                                        background: 'rgba(76, 175, 80, 0.1)',
                                                                        '&:hover': { background: 'rgba(76, 175, 80, 0.2)' }
                                                                    }}
                                                                >
                                                                    <OrderIcon />
                                                                </IconButton>
                                                            ) : (
                                                                <IconButton
                                                                    disabled
                                                                    sx={{
                                                                        color: 'text.disabled',
                                                                        background: 'rgba(158, 158, 158, 0.1)',
                                                                        cursor: 'not-allowed'
                                                                    }}
                                                                    title={tender.status === 'closed' ? 'This tender is closed' : tender.status === 'upcoming' ? 'This tender is not yet active' : 'This tender is cancelled'}
                                                                >
                                                                    <OrderIcon />
                                                                </IconButton>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                        <Pagination
                                            count={totalPages}
                                            page={currentPage}
                                            onChange={handlePageChange}
                                            color="secondary"
                                            shape="rounded"
                                        />
                                    </Box>
                                )}
                            </>
                        )}
                    </CardContent>
                </GlassCard>
            </Container>

            {/* Order Dialog */}
            <StyledDialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
                TransitionComponent={Transition}
                scroll="paper"
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: theme.palette.mode === 'light'
                        ? 'linear-gradient(135deg, #6A1B9A 0%, #9C27B0 100%)'
                        : 'linear-gradient(135deg, #4A148C 0%, #7B1FA2 100%)',
                    color: 'white',
                    py: 2,
                    pr: 2,
                    pl: 3
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TenderIcon sx={{ mr: 1.5, fontSize: '1.8rem' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Tender Details</Typography>
                    </Box>
                    <IconButton
                        onClick={handleCloseDialog}
                        sx={{
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers sx={{ py: 0 }}>
                    {selectedTender && (
                        <Box sx={{ p: { xs: 2, md: 3 } }}>
                            {/* Header Section */}
                            <Box sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                justifyContent: 'space-between',
                                alignItems: { xs: 'flex-start', sm: 'center' },
                                mb: 3,
                                p: 3,
                                background: theme.palette.mode === 'light'
                                    ? 'linear-gradient(135deg, rgba(106, 27, 154, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)'
                                    : 'rgba(255, 255, 255, 0.05)',
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.divider}`,
                                gap: 2
                            }}>
                                <Box>
                                    <Typography variant="h5" sx={{
                                        fontWeight: 700,
                                        mb: 1,
                                        color: theme.palette.mode === 'light' ? 'primary.main' : 'primary.light'
                                    }}>
                                        {selectedTender.title || 'No Title'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Reference: <strong>{selectedTender.referenceNo || 'N/A'}</strong> • Category: <strong>{selectedTender.category || 'Uncategorized'}</strong>
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <StatusChip
                                        status={selectedTender.status}
                                        label={selectedTender.status.toUpperCase()}
                                    />
                                </Box>
                            </Box>

                            <Grid container spacing={3}>
                                {/* Left Column - Tender Information */}
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={0} sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        height: '100%',
                                        border: `1px solid ${theme.palette.divider}`,
                                        background: theme.palette.background.paper
                                    }}>
                                        <SectionHeader
                                            icon={<DescriptionIcon />}
                                            title="Tender Information"
                                        />

                                        <InfoRow
                                            label="Reference Number"
                                            value={selectedTender.referenceNo || 'N/A'}
                                        />

                                        <InfoRow
                                            label="Category"
                                            value={selectedTender.category || 'Uncategorized'}
                                        />

                                        <InfoRow
                                            label="Location"
                                            value={selectedTender.location || 'Location not specified'}
                                            icon={<LocationIcon />}
                                        />

                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                                Dates
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={6}>
                                                    <Box sx={{
                                                        p: 1.5,
                                                        borderRadius: 1,
                                                        border: `1px solid ${theme.palette.divider}`,
                                                        background: theme.palette.background.default
                                                    }}>
                                                        <Typography variant="caption" display="block" color="text.secondary">
                                                            Starting Date
                                                        </Typography>
                                                        <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <CalendarIcon fontSize="small" sx={{ mr: 0.5 }} />
                                                            {selectedTender.startingDate ? formatDate(selectedTender.startingDate) : 'Start date not set'}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Box sx={{
                                                        p: 1.5,
                                                        borderRadius: 1,
                                                        border: `1px solid ${theme.palette.divider}`,
                                                        background: theme.palette.background.default
                                                    }}>
                                                        <Typography variant="caption" display="block" color="text.secondary">
                                                            Closing Date
                                                        </Typography>
                                                        <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <CalendarIcon fontSize="small" sx={{ mr: 0.5 }} />
                                                            {selectedTender.closingDate ? formatDate(selectedTender.closingDate) : 'End date not set'}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Box>

                                        <InfoRow
                                            label="Details"
                                            value={selectedTender.details || 'No details available'}
                                        />

                                        <Divider sx={{ my: 3 }} />

                                        <SectionHeader
                                            icon={<CompanyIcon />}
                                            title="Procurement Information"
                                        />

                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            p: 2,
                                            borderRadius: 1,
                                            border: `1px solid ${theme.palette.divider}`,
                                            background: theme.palette.background.default
                                        }}>
                                            <Avatar sx={{
                                                mr: 2,
                                                width: 48,
                                                height: 48,
                                                background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)'
                                            }}>
                                                {selectedTender.createdBy?.fullName?.charAt(0) || 'U'}
                                            </Avatar>
                                            <Box>
                                                <Typography sx={{ fontWeight: 600 }}>
                                                    {selectedTender.createdBy?.fullName || 'Unknown User'}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {selectedTender.createdBy?.email || 'No email provided'}
                                                </Typography>
                                                <Typography variant="caption" display="block" color="text.secondary">
                                                    Created on {formatDate(selectedTender.createdAt)}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <SectionHeader
                                            icon={<AssignmentIcon />}
                                            title="Original Request Details"
                                        />

                                        {selectedTender.requestId ? (
                                            <Accordion
                                                defaultExpanded
                                                sx={{
                                                    mb: 2,
                                                    borderRadius: '8px !important',
                                                    overflow: 'hidden',
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    '&:before': {
                                                        display: 'none'
                                                    }
                                                }}
                                            >
                                                <AccordionSummary
                                                    expandIcon={<ExpandMoreIcon />}
                                                    sx={{
                                                        backgroundColor: theme.palette.action.hover,
                                                        '& .MuiAccordionSummary-content': {
                                                            alignItems: 'center'
                                                        }
                                                    }}
                                                >
                                                    <Typography sx={{ fontWeight: 600 }}>Item Information</Typography>
                                                </AccordionSummary>
                                                <AccordionDetails sx={{ pt: 2 }}>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={6}>
                                                            <InfoRow
                                                                label="Title"
                                                                value={selectedTender.requestId?.title || 'N/A'}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <InfoRow
                                                                label="Sub Category"
                                                                value={selectedTender.requestId?.subCategory || 'N/A'}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <InfoRow
                                                                label="Color"
                                                                value={selectedTender.requestId?.colorPickup || 'N/A'}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <InfoRow
                                                                label="Current Qty"
                                                                value={selectedTender.requestId?.currentItemCount || 'N/A'}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <InfoRow
                                                                label="Damaged Qty"
                                                                value={selectedTender.requestId?.damagedItemCount || 'N/A'}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <InfoRow
                                                                label="Requested Qty"
                                                                value={selectedTender.requestId?.newItemRequestCount || 'N/A'}
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </AccordionDetails>
                                            </Accordion>
                                        ) : selectedTender.demandFormId ? (
                                            <Box sx={{
                                                p: 2,
                                                borderRadius: 2,
                                                border: `1px solid ${theme.palette.divider}`,
                                                background: theme.palette.action.hover
                                            }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                                    Demand Form Information
                                                </Typography>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={6}>
                                                        <InfoRow
                                                            label="Demand Form ID"
                                                            value={selectedTender.demandFormId}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <InfoRow
                                                            label="Details"
                                                            value={selectedTender.details || 'No details available'}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        ) : (
                                            <Box sx={{
                                                p: 2,
                                                borderRadius: 2,
                                                border: `1px solid ${theme.palette.divider}`,
                                                background: theme.palette.action.hover,
                                                textAlign: 'center'
                                            }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    No original request information available
                                                </Typography>
                                            </Box>
                                        )}
                                    </Paper>
                                </Grid>

                                {/* Right Column - Order Form */}
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={0} sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        height: '100%',
                                        border: `1px solid ${theme.palette.divider}`,
                                        background: theme.palette.background.paper
                                    }}>
                                        {selectedTender.status === 'active' ? (
                                            <>
                                                <SectionHeader
                                                    icon={<CheckCircleIcon />}
                                                    title="Place Order"
                                                />

                                                <Grid container spacing={2}>
                                                    {/* Basic Information */}
                                                    <Grid item xs={12} md={6}>
                                                        <TextField
                                                            fullWidth
                                                            label="Quantity"
                                                            type="number"
                                                            name="quantity"
                                                            value={orderDetails.quantity}
                                                            onChange={handleOrderChange}
                                                            InputProps={{
                                                                inputProps: {
                                                                    min: 1,
                                                                    max: selectedTender.requestId?.newItemRequestCount || 1000
                                                                }
                                                            }}
                                                            sx={{ mb: 2 }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField
                                                            fullWidth
                                                            label="Unit Price ($)"
                                                            type="number"
                                                            name="unitPrice"
                                                            value={orderDetails.unitPrice}
                                                            onChange={handleOrderChange}
                                                            InputProps={{
                                                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                                            }}
                                                            sx={{ mb: 2 }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            fullWidth
                                                            label="Requested Delivery Date"
                                                            type="date"
                                                            name="deliveryDate"
                                                            value={orderDetails.deliveryDate}
                                                            onChange={handleOrderChange}
                                                            InputLabelProps={{ shrink: true }}
                                                            sx={{ mb: 2 }}
                                                        />
                                                    </Grid>

                                                    {/* Delivery Options */}
                                                    <Grid item xs={12}>
                                                        <Paper elevation={0} sx={{
                                                            p: 2,
                                                            background: theme.palette.action.hover,
                                                            borderRadius: 2,
                                                            border: `1px solid ${theme.palette.divider}`
                                                        }}>
                                                            <Typography variant="subtitle1" sx={{
                                                                mb: 2,
                                                                fontWeight: 600,
                                                                display: 'flex',
                                                                alignItems: 'center'
                                                            }}>
                                                                <LocalShippingIcon sx={{ mr: 1 }} />
                                                                Delivery Options
                                                            </Typography>
                                                            <FormControlLabel
                                                                control={
                                                                    <Checkbox
                                                                        checked={orderDetails.freeDelivery}
                                                                        onChange={handleOrderChange}
                                                                        name="freeDelivery"
                                                                        color="primary"
                                                                    />
                                                                }
                                                                label="Free Delivery"
                                                            />
                                                            {!orderDetails.freeDelivery && (
                                                                <TextField
                                                                    fullWidth
                                                                    label="Delivery Cost ($)"
                                                                    type="number"
                                                                    name="deliveryCost"
                                                                    value={orderDetails.deliveryCost}
                                                                    onChange={handleOrderChange}
                                                                    InputProps={{
                                                                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                                                    }}
                                                                    sx={{ mt: 2 }}
                                                                />
                                                            )}
                                                            <TextField
                                                                fullWidth
                                                                label="Estimated Delivery Days"
                                                                type="number"
                                                                name="estimatedDeliveryDays"
                                                                value={orderDetails.estimatedDeliveryDays}
                                                                onChange={handleOrderChange}
                                                                sx={{ mt: 2 }}
                                                            />
                                                        </Paper>
                                                    </Grid>

                                                    {/* Warranty Information */}
                                                    <Grid item xs={12} md={6}>
                                                        <Paper elevation={0} sx={{
                                                            p: 2,
                                                            background: theme.palette.action.hover,
                                                            borderRadius: 2,
                                                            border: `1px solid ${theme.palette.divider}`,
                                                            height: '100%'
                                                        }}>
                                                            <Typography variant="subtitle1" sx={{
                                                                mb: 2,
                                                                fontWeight: 600,
                                                                display: 'flex',
                                                                alignItems: 'center'
                                                            }}>
                                                                <AssignmentReturnIcon sx={{ mr: 1 }} />
                                                                Warranty
                                                            </Typography>
                                                            <TextField
                                                                fullWidth
                                                                label="Standard Warranty (months)"
                                                                type="number"
                                                                name="standardWarranty"
                                                                value={orderDetails.standardWarranty}
                                                                onChange={handleOrderChange}
                                                                sx={{ mb: 2 }}
                                                            />
                                                            <FormControlLabel
                                                                control={
                                                                    <Checkbox
                                                                        checked={orderDetails.extendedWarranty}
                                                                        onChange={handleOrderChange}
                                                                        name="extendedWarranty"
                                                                        color="primary"
                                                                    />
                                                                }
                                                                label="Include Extended Warranty"
                                                            />
                                                            {orderDetails.extendedWarranty && (
                                                                <>
                                                                    <TextField
                                                                        fullWidth
                                                                        label="Extended Warranty (months)"
                                                                        type="number"
                                                                        name="extendedWarrantyPeriod"
                                                                        value={orderDetails.extendedWarrantyPeriod}
                                                                        onChange={handleOrderChange}
                                                                        sx={{ mt: 1, mb: 2 }}
                                                                    />
                                                                    <TextField
                                                                        fullWidth
                                                                        label="Extended Warranty Cost ($)"
                                                                        type="number"
                                                                        name="extendedWarrantyCost"
                                                                        value={orderDetails.extendedWarrantyCost}
                                                                        onChange={handleOrderChange}
                                                                        InputProps={{
                                                                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                                                        }}
                                                                    />
                                                                </>
                                                            )}
                                                        </Paper>
                                                    </Grid>

                                                    {/* Material & Quality */}
                                                    <Grid item xs={12} md={6}>
                                                        <Paper elevation={0} sx={{
                                                            p: 2,
                                                            background: theme.palette.action.hover,
                                                            borderRadius: 2,
                                                            border: `1px solid ${theme.palette.divider}`,
                                                            height: '100%'
                                                        }}>
                                                            <Typography variant="subtitle1" sx={{
                                                                mb: 2,
                                                                fontWeight: 600,
                                                                display: 'flex',
                                                                alignItems: 'center'
                                                            }}>
                                                                <ConstructionIcon sx={{ mr: 1 }} />
                                                                Material & Quality
                                                            </Typography>
                                                            <FormControl fullWidth sx={{ mb: 2 }}>
                                                                <InputLabel>Material Grade</InputLabel>
                                                                <Select
                                                                    label="Material Grade"
                                                                    name="materialGrade"
                                                                    value={orderDetails.materialGrade}
                                                                    onChange={handleOrderChange}
                                                                >
                                                                    <MenuItem value="standard">Standard</MenuItem>
                                                                    <MenuItem value="premium">Premium</MenuItem>
                                                                    <MenuItem value="industrial">Industrial Grade</MenuItem>
                                                                    <MenuItem value="custom">Custom Specification</MenuItem>
                                                                </Select>
                                                            </FormControl>
                                                            {orderDetails.materialGrade === 'custom' && (
                                                                <TextField
                                                                    fullWidth
                                                                    label="Custom Material Specification"
                                                                    name="customMaterialSpec"
                                                                    value={orderDetails.customMaterialSpec}
                                                                    onChange={handleOrderChange}
                                                                    multiline
                                                                    rows={2}
                                                                />
                                                            )}
                                                            <FormControlLabel
                                                                control={
                                                                    <Checkbox
                                                                        checked={orderDetails.qualityCertification}
                                                                        onChange={handleOrderChange}
                                                                        name="qualityCertification"
                                                                        color="primary"
                                                                    />
                                                                }
                                                                label="Include Quality Certification"
                                                                sx={{ mt: 1 }}
                                                            />
                                                        </Paper>
                                                    </Grid>

                                                    {/* After-Sales Service */}
                                                    <Grid item xs={12}>
                                                        <Paper elevation={0} sx={{
                                                            p: 2,
                                                            background: theme.palette.action.hover,
                                                            borderRadius: 2,
                                                            border: `1px solid ${theme.palette.divider}`
                                                        }}>
                                                            <Typography variant="subtitle1" sx={{
                                                                mb: 2,
                                                                fontWeight: 600,
                                                                display: 'flex',
                                                                alignItems: 'center'
                                                            }}>
                                                                <SupportAgentIcon sx={{ mr: 1 }} />
                                                                After-Sales Service
                                                            </Typography>
                                                            <FormControlLabel
                                                                control={
                                                                    <Checkbox
                                                                        checked={orderDetails.installationService}
                                                                        onChange={handleOrderChange}
                                                                        name="installationService"
                                                                        color="primary"
                                                                    />
                                                                }
                                                                label="Include Installation Service"
                                                            />
                                                            {orderDetails.installationService && (
                                                                <TextField
                                                                    fullWidth
                                                                    label="Installation Cost ($)"
                                                                    type="number"
                                                                    name="installationCost"
                                                                    value={orderDetails.installationCost}
                                                                    onChange={handleOrderChange}
                                                                    InputProps={{
                                                                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                                                    }}
                                                                    sx={{ mt: 1, mb: 2 }}
                                                                />
                                                            )}
                                                            <FormControlLabel
                                                                control={
                                                                    <Checkbox
                                                                        checked={orderDetails.maintenanceContract}
                                                                        onChange={handleOrderChange}
                                                                        name="maintenanceContract"
                                                                        color="primary"
                                                                    />
                                                                }
                                                                label="Include Maintenance Contract"
                                                            />
                                                            {orderDetails.maintenanceContract && (
                                                                <>
                                                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                                                        <Grid item xs={12} md={6}>
                                                                            <TextField
                                                                                fullWidth
                                                                                label="Maintenance Period (months)"
                                                                                type="number"
                                                                                name="maintenancePeriod"
                                                                                value={orderDetails.maintenancePeriod}
                                                                                onChange={handleOrderChange}
                                                                            />
                                                                        </Grid>
                                                                        <Grid item xs={12} md={6}>
                                                                            <TextField
                                                                                fullWidth
                                                                                label="Maintenance Cost ($)"
                                                                                type="number"
                                                                                name="maintenanceCost"
                                                                                value={orderDetails.maintenanceCost}
                                                                                onChange={handleOrderChange}
                                                                                InputProps={{
                                                                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                                                                }}
                                                                            />
                                                                        </Grid>
                                                                    </Grid>
                                                                    <TextField
                                                                        fullWidth
                                                                        label="Maintenance Terms"
                                                                        name="maintenanceTerms"
                                                                        value={orderDetails.maintenanceTerms}
                                                                        onChange={handleOrderChange}
                                                                        multiline
                                                                        rows={2}
                                                                        sx={{ mt: 2 }}
                                                                    />
                                                                </>
                                                            )}
                                                        </Paper>
                                                    </Grid>

                                                    {/* Additional Information */}
                                                    <Grid item xs={12}>
                                                        <Paper elevation={0} sx={{
                                                            p: 2,
                                                            background: theme.palette.action.hover,
                                                            borderRadius: 2,
                                                            border: `1px solid ${theme.palette.divider}`
                                                        }}>
                                                            <Typography variant="subtitle1" sx={{
                                                                mb: 2,
                                                                fontWeight: 600,
                                                                display: 'flex',
                                                                alignItems: 'center'
                                                            }}>
                                                                <NoteAddIcon sx={{ mr: 1 }} />
                                                                Additional Information
                                                            </Typography>
                                                            <TextField
                                                                fullWidth
                                                                label="Special Requirements"
                                                                name="specialRequirements"
                                                                value={orderDetails.specialRequirements}
                                                                onChange={handleOrderChange}
                                                                multiline
                                                                rows={3}
                                                            />
                                                            <TextField
                                                                fullWidth
                                                                label="Notes"
                                                                name="notes"
                                                                value={orderDetails.notes}
                                                                onChange={handleOrderChange}
                                                                multiline
                                                                rows={2}
                                                                sx={{ mt: 2 }}
                                                            />
                                                        </Paper>
                                                    </Grid>

                                                    {/* Order Summary */}
                                                    <Grid item xs={12}>
                                                        <Paper elevation={0} sx={{
                                                            p: 3,
                                                            background: theme.palette.mode === 'light'
                                                                ? 'linear-gradient(135deg, rgba(106, 27, 154, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)'
                                                                : 'rgba(255, 255, 255, 0.1)',
                                                            borderRadius: 2,
                                                            border: `1px solid ${theme.palette.divider}`
                                                        }}>
                                                            <Typography variant="h6" sx={{
                                                                mb: 2,
                                                                fontWeight: 600,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                color: theme.palette.primary.main
                                                            }}>
                                                                <PaymentIcon sx={{ mr: 1 }} />
                                                                Order Summary
                                                            </Typography>

                                                            <Grid container spacing={1}>
                                                                {/* Item Details */}
                                                                <Grid item xs={7}>
                                                                    <Typography variant="subtitle2">Item</Typography>
                                                                </Grid>
                                                                <Grid item xs={5} sx={{ textAlign: 'right' }}>
                                                                    <Typography variant="subtitle2">Amount</Typography>
                                                                </Grid>

                                                                {/* Unit Price */}
                                                                <Grid item xs={7}>
                                                                    <Typography>Unit Price</Typography>
                                                                </Grid>
                                                                <Grid item xs={5} sx={{ textAlign: 'right' }}>
                                                                    <Typography>${parseFloat(orderDetails.unitPrice).toFixed(2)}</Typography>
                                                                </Grid>

                                                                {/* Quantity */}
                                                                <Grid item xs={7}>
                                                                    <Typography>Quantity</Typography>
                                                                </Grid>
                                                                <Grid item xs={5} sx={{ textAlign: 'right' }}>
                                                                    <Typography>× {orderDetails.quantity}</Typography>
                                                                </Grid>

                                                                {/* Subtotal */}
                                                                <Grid item xs={7}>
                                                                    <Typography variant="subtitle1">Subtotal</Typography>
                                                                </Grid>
                                                                <Grid item xs={5} sx={{ textAlign: 'right' }}>
                                                                    <Typography variant="subtitle1">${calculateSubtotal().toFixed(2)}</Typography>
                                                                </Grid>

                                                                <Grid item xs={12}>
                                                                    <Divider sx={{ my: 1 }} />
                                                                </Grid>

                                                                {/* Additional Charges */}
                                                                <Grid item xs={7}>
                                                                    <Typography variant="subtitle2">Additional Charges</Typography>
                                                                </Grid>
                                                                <Grid item xs={5} sx={{ textAlign: 'right' }}>
                                                                    <Typography variant="subtitle2"></Typography>
                                                                </Grid>

                                                                {/* Delivery */}
                                                                <Grid item xs={7}>
                                                                    <Typography>Delivery</Typography>
                                                                </Grid>
                                                                <Grid item xs={5} sx={{ textAlign: 'right' }}>
                                                                    <Typography>
                                                                        {orderDetails.freeDelivery ? 'Free' : `$${parseFloat(orderDetails.deliveryCost).toFixed(2)}`}
                                                                    </Typography>
                                                                </Grid>

                                                                {/* Extended Warranty */}
                                                                {orderDetails.extendedWarranty && (
                                                                    <>
                                                                        <Grid item xs={7}>
                                                                            <Typography>Extended Warranty</Typography>
                                                                        </Grid>
                                                                        <Grid item xs={5} sx={{ textAlign: 'right' }}>
                                                                            <Typography>${parseFloat(orderDetails.extendedWarrantyCost).toFixed(2)}</Typography>
                                                                        </Grid>
                                                                    </>
                                                                )}

                                                                {/* Installation */}
                                                                {orderDetails.installationService && (
                                                                    <>
                                                                        <Grid item xs={7}>
                                                                            <Typography>Installation</Typography>
                                                                        </Grid>
                                                                        <Grid item xs={5} sx={{ textAlign: 'right' }}>
                                                                            <Typography>${parseFloat(orderDetails.installationCost).toFixed(2)}</Typography>
                                                                        </Grid>
                                                                    </>
                                                                )}

                                                                {/* Maintenance */}
                                                                {orderDetails.maintenanceContract && (
                                                                    <>
                                                                        <Grid item xs={7}>
                                                                            <Typography>Maintenance Contract</Typography>
                                                                        </Grid>
                                                                        <Grid item xs={5} sx={{ textAlign: 'right' }}>
                                                                            <Typography>${parseFloat(orderDetails.maintenanceCost).toFixed(2)}</Typography>
                                                                        </Grid>
                                                                    </>
                                                                )}

                                                                <Grid item xs={12}>
                                                                    <Divider sx={{ my: 1 }} />
                                                                </Grid>

                                                                {/* Total */}
                                                                <Grid item xs={7}>
                                                                    <Typography variant="h6">Total Amount</Typography>
                                                                </Grid>
                                                                <Grid item xs={5} sx={{ textAlign: 'right' }}>
                                                                    <Typography variant="h6" color="primary">
                                                                        ${calculateTotalAmount().toFixed(2)}
                                                                    </Typography>
                                                                </Grid>
                                                            </Grid>
                                                        </Paper>
                                                    </Grid>
                                                </Grid>
                                            </>
                                        ) : (
                                            <Box sx={{
                                                textAlign: 'center',
                                                py: 4,
                                                background: 'rgba(255, 255, 255, 0.7)',
                                                borderRadius: 2
                                            }}>
                                                <Typography variant="h6" color="text.secondary">
                                                    This tender is {selectedTender.status}
                                                </Typography>
                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                    {selectedTender.status === 'closed' 
                                                        ? 'The tender has closed and no longer accepts orders.'
                                                        : selectedTender.status === 'upcoming'
                                                        ? 'The tender is not yet active. Please check back later.'
                                                        : 'This tender has been cancelled and is not accepting orders.'}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{
                    p: 2,
                    background: theme.palette.background.default,
                    borderTop: `1px solid ${theme.palette.divider}`
                }}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        width: '100%',
                        gap: 2
                    }}>
                        {selectedTender?.status === 'active' && (
                            <Button
                                onClick={handlePlaceOrder}
                                variant="contained"
                                startIcon={<CheckCircleIcon />}
                                sx={{
                                    minWidth: 150,
                                    background: theme.palette.mode === 'light'
                                        ? 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)'
                                        : 'linear-gradient(45deg, #388E3C 30%, #66BB6A 90%)',
                                    '&:hover': {
                                        boxShadow: theme.shadows[4]
                                    }
                                }}
                            >
                                Place Order
                            </Button>
                        )}
                        <Button
                            onClick={handleCloseDialog}
                            variant="outlined"
                            color="secondary"
                            sx={{
                                minWidth: 100,
                                borderColor: theme.palette.mode === 'light'
                                    ? 'rgba(156, 39, 176, 0.5)'
                                    : 'rgba(186, 104, 200, 0.5)',
                                '&:hover': {
                                    borderColor: theme.palette.secondary.main,
                                    backgroundColor: theme.palette.mode === 'light'
                                        ? 'rgba(156, 39, 176, 0.04)'
                                        : 'rgba(156, 39, 176, 0.1)'
                                }
                            }}
                        >
                            Close
                        </Button>
                    </Box>
                </DialogActions>
            </StyledDialog>
        </Box>
    );
};

export default TenderDashboard;
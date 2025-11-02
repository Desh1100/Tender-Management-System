import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import Swal from 'sweetalert2';
import logo from '../../../assets/img/navlogo.png';
import background from '../../../assets/img/procurement-bg.jpg'; // Different background image
import HistoryIcon from '@mui/icons-material/History';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Inventory as InventoryIcon,
    Assignment as TenderIcon,
    Gavel as GavelIcon,
    Description as DescriptionIcon,
    DateRange as DateRangeIcon,
    LocationOn as LocationIcon,
    Category as CategoryIcon,
    ConfirmationNumber as ReferenceIcon
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
    Badge,
    Menu,
    MenuItem,
    InputAdornment
} from '@mui/material';
import {
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    Info as DetailsIcon,
    Close as CloseIcon,
    School as SchoolIcon,
    Logout as LogoutIcon,
    Home as HomeIcon,
    Star as FeaturesIcon,
    BarChart as StatsIcon,
    Timeline as TimelineIcon,
    Add as AddIcon,
    MoreVert as MoreIcon,
    ArrowBack as BackIcon
} from '@mui/icons-material';

// Custom styled components
const GlassCard = styled(Card)(({ theme }) => ({
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(12px)',
    borderRadius: '12px',
    boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 8px 30px 0 rgba(0, 0, 0, 0.15)'
    }
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
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
        background: 'linear-gradient(45deg, #9C27B0 30%, #E91E63 90%)',
        color: 'white'
    }),
    ...(status === 'HOD' && {
        background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
        color: 'white'
    }),
    ...(status === 'Procurement Officer' && {
        background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
        color: 'white'
    })
}));

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const ProcurementDashboard = () => {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [requests, setRequests] = useState([]);
    const [demandForms, setDemandForms] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedDemandForm, setSelectedDemandForm] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDemandDialog, setOpenDemandDialog] = useState(false);
    const [openTenderDetailsDialog, setOpenTenderDetailsDialog] = useState(false);
    const [openTenderDialog, setOpenTenderDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [demandRejectionReason, setDemandRejectionReason] = useState('');
    const [loading, setLoading] = useState(true);
    const [tenderDemandFormDetails, setTenderDemandFormDetails] = useState(null);
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        tenders: 0
    });
    const [anchorEl, setAnchorEl] = useState(null);
    const [tenderForm, setTenderForm] = useState({
        title: '',
        location: '',
        category: '',
        referenceNo: `T-${Math.floor(100000 + Math.random() * 900000)}`, // Auto-generated reference
        startingDate: '',
        closingDate: '',
        details: ''
    });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        const userId = localStorage.getItem('userId');
        try {
            const [rejectedResponse, tendersResponse, demandsResponse] = await Promise.all([
                api.get(`/api/procurement/rejected/${userId}`),
                api.get('/api/tenders/count'),
                api.get('/api/demands')
            ]);

            // Count approved demand forms by current procurement officer
            const approvedDemandForms = demandsResponse.data.filter(demandForm => 
                demandForm.ProcurementisApproved === true && 
                demandForm.ProcurementUserID === userId
            );

            // Count rejected demand forms by current procurement officer
            const rejectedDemandForms = demandsResponse.data.filter(demandForm => 
                demandForm.requestStage === "Rejected Procurement Officer" && 
                demandForm.ProcurementUserID === userId
            );

            // Fetch pending requests (including demand forms) separately
            await fetchPendingRequests();

            setStats(prev => ({
                ...prev,
                approved: approvedDemandForms.length,
                rejected: rejectedResponse.data.length + rejectedDemandForms.length,
                tenders: tendersResponse.data.count
            }));
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to fetch requests',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(5px)'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchDemandForms = async () => {
        try {
            const response = await api.get('/api/demands/procurement/pending');
            setDemandForms(response.data);
            setStats(prev => ({
                ...prev,
                demandForms: response.data.length
            }));
        } catch (error) {
            console.error('Error fetching demand forms:', error);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        if (newValue === 0) {
            fetchPendingRequests();
        } else if (newValue === 1) {
            fetchApprovedRequests();
        } else if (newValue === 2) {
            fetchRejectedRequests();
        } else if (newValue === 3) {
            fetchTenders();
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const [requestsResponse, demandFormsResponse] = await Promise.all([
                api.get('/api/procurement/pending'),
                api.get('/api/demands/procurement/pending')
            ]);

            // Combine regular requests and demand forms, adding a type identifier
            const requests = requestsResponse.data.map(item => ({ ...item, type: 'request' }));
            const demandForms = demandFormsResponse.data.map(item => ({ ...item, type: 'demandForm' }));
            const combinedData = [...requests, ...demandForms];

            setRequests(combinedData);
            setStats(prev => ({ 
                ...prev, 
                pending: combinedData.length 
            }));
        } catch (error) {
            console.error('Error fetching pending requests:', error);
        }
    };

    const fetchApprovedRequests = async () => {
        const userId = localStorage.getItem('userId');
        try {
            // Fetch all demand forms and filter for approved ones by current procurement officer
            const response = await api.get('/api/demands');
            const approvedDemandForms = response.data.filter(demandForm => 
                demandForm.ProcurementisApproved === true && 
                demandForm.ProcurementUserID === userId
            );

            // Add type identifier for demand forms
            const demandFormsWithType = approvedDemandForms.map(item => ({ ...item, type: 'demandForm' }));
            
            setRequests(demandFormsWithType);
            setStats(prev => ({ ...prev, approved: demandFormsWithType.length }));
        } catch (error) {
            console.error('Error fetching approved requests:', error);
        }
    };

    const fetchRejectedRequests = async () => {
        const userId = localStorage.getItem('userId');
        try {
            const [requestsResponse, demandFormsResponse] = await Promise.all([
                api.get(`/api/procurement/rejected/${userId}`),
                api.get('/api/demands')
            ]);

            // Filter demand forms that are rejected by procurement officer
            const rejectedDemandForms = demandFormsResponse.data.filter(demandForm => 
                demandForm.requestStage === "Rejected Procurement Officer" && 
                demandForm.ProcurementUserID === userId
            );

            // Combine regular requests and rejected demand forms, adding a type identifier
            const requests = requestsResponse.data.map(item => ({ ...item, type: 'request' }));
            const demandForms = rejectedDemandForms.map(item => ({ ...item, type: 'demandForm' }));
            const combinedData = [...requests, ...demandForms];

            setRequests(combinedData);
            setStats(prev => ({ ...prev, rejected: combinedData.length }));
        } catch (error) {
            console.error('Error fetching rejected requests:', error);
        }
    };

    const fetchTenders = async () => {
        try {
            const response = await api.get('/api/tenders');
            console.log("response.data are", response.data.data.tenders)
            setRequests(response.data.data.tenders);
        } catch (error) {
            console.error('Error fetching tenders:', error);
        }
    };

    const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setOpenDialog(true);
    };

    const handleViewDemandDetails = (demandForm) => {
        setSelectedDemandForm(demandForm);
        setOpenDemandDialog(true);
    };

    const handleViewTender = async (request) => {
        setSelectedRequest(request);
        
        // If tender was created from a demand form, fetch the demand form details
        if (request.demandFormId) {
            try {
                const response = await api.get(`/api/demands/${request.demandFormId}`);
                setTenderDemandFormDetails(response.data);
            } catch (error) {
                console.error('Error fetching demand form details:', error);
                setTenderDemandFormDetails(null);
            }
        } else {
            setTenderDemandFormDetails(null);
        }
        
        setOpenTenderDetailsDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setOpenDemandDialog(false);
        setOpenTenderDetailsDialog(false);
        setSelectedRequest(null);
        setSelectedDemandForm(null);
        setTenderDemandFormDetails(null);
        setRejectionReason('');
        setDemandRejectionReason('');
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleCreateTender = (request) => {
        setSelectedRequest(request);
        setTenderForm({
            ...tenderForm,
            title: `${request.title} - Procurement`,
            category: request.category,
            details: `Tender for ${request.newItemRequestCount} units of ${request.title} (${request.colorPickup})`
        });
        setOpenTenderDialog(true);
        handleMenuClose();
    };

    const handleTenderApply = (demandForm) => {
        setSelectedDemandForm(demandForm);
        
        // Create a summary of items for the tender title and details
        const itemsSummary = demandForm.items?.map(item => item.description).join(', ') || 'Multiple items';
        const totalQuantity = demandForm.items?.reduce((sum, item) => sum + item.qty, 0) || 0;
        
        setTenderForm({
            ...tenderForm,
            title: `${demandForm.department} - ${demandForm.demandNo}`,
            category: demandForm.requirementType || 'General',
            details: `Tender for ${totalQuantity} items: ${itemsSummary}. Requirement: ${demandForm.requirement}. Specifications: ${demandForm.specifications}`
        });
        setOpenTenderDialog(true);
    };

    const handleTenderFormChange = (e) => {
        const { name, value } = e.target;
        setTenderForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetTenderForm = () => {
        setTenderForm({
            title: '',
            location: '',
            category: '',
            referenceNo: `T-${Math.floor(100000 + Math.random() * 900000)}`,
            startingDate: '',
            closingDate: '',
            details: ''
        });
        setSelectedDemandForm(null);
        setSelectedRequest(null);
    };

    const handleSubmitTender = async () => {
        if (!tenderForm.title || !tenderForm.location || !tenderForm.startingDate || !tenderForm.closingDate) {
            setOpenTenderDialog(false);
            Swal.fire({
                icon: 'error',
                title: 'Missing Information',
                text: 'Please fill in all required fields (Title, Location, Starting Date, and Closing Date)',
                background: 'rgba(255, 255, 255, 0.9)'
            });
            return;
        }

        // Validate that closing date is after starting date
        const startDate = new Date(tenderForm.startingDate);
        const closeDate = new Date(tenderForm.closingDate);
        
        if (closeDate <= startDate) {
            setOpenTenderDialog(false);
            Swal.fire({
                icon: 'error',
                title: 'Invalid Date Range',
                text: 'Closing date must be after starting date',
                background: 'rgba(255, 255, 255, 0.9)'
            });
            return;
        }

        try {
            const userId = localStorage.getItem('userId');
            const requestData = {
                ...tenderForm,
                createdBy: userId // Changed from procurementUserID to createdBy to match the model
            };

            // Add appropriate ID based on whether it's a request or demand form
            if (selectedRequest && selectedRequest.type !== 'demandForm') {
                requestData.requestId = selectedRequest._id;
            } else if (selectedDemandForm) {
                requestData.demandFormId = selectedDemandForm._id;
            }

            console.log('Submitting tender data:', requestData); // Debug log

            const response = await api.post('/api/tenders', requestData);
            
            console.log('Tender creation response:', response.data); // Debug log

            Swal.fire({
                title: 'Success!',
                text: 'Tender created successfully!',
                icon: 'success',
                background: 'rgba(255, 255, 255, 0.9)',
                showConfirmButton: false,
                timer: 1500
            });

            setOpenTenderDialog(false);
            resetTenderForm();
            fetchPendingRequests();
        } catch (error) {
            console.error('Tender creation error:', error); // Debug log
            console.error('Error response:', error.response?.data); // Debug log
            
            setOpenTenderDialog(false);
            resetTenderForm();
            
            // Check if it's a duplicate tender error
            if (error.response?.data?.message?.includes('An active tender already exists')) {
                const errorMessage = error.response.data.message;
                
                Swal.fire({
                    title: 'Tender Already Exists!',
                    html: `
                        <div style="text-align: left; margin: 20px 0;">
                            <p><strong>Error:</strong></p>
                            <p style="color: #d32f2f; margin: 10px 0;">${errorMessage}</p>
                            
                            <p style="margin-top: 20px;"><strong>What would you like to do?</strong></p>
                            <div style="margin: 10px 0;">
                                <p>• <strong>View Existing:</strong> See the current tender details</p>
                                <p>• <strong>Replace:</strong> Close existing and create your new tender</p>
                            </div>
                        </div>
                    `,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'View Existing Tender',
                    cancelButtonText: 'Replace with New',
                    confirmButtonColor: '#2196F3',
                    cancelButtonColor: '#ff9800',
                    allowOutsideClick: false,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdrop: 'rgba(0,0,0,0.4)'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // View existing tender - switch to tenders tab
                        console.log('User chose to view existing tender');
                        setTabValue(3);
                        fetchTenders();
                        
                        Swal.fire({
                            title: 'Redirected!',
                            text: 'Check the Tenders tab to see existing tenders',
                            icon: 'info',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    } else if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
                        // Replace tender - show confirmation
                        console.log('User chose to replace existing tender');
                        
                        Swal.fire({
                            title: 'Confirm Replacement',
                            text: 'This will permanently close the existing tender and create your new one. This action cannot be undone.',
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonText: 'Yes, Replace It',
                            cancelButtonText: 'No, Keep Existing',
                            confirmButtonColor: '#d32f2f',
                            cancelButtonColor: '#757575',
                            background: 'rgba(255, 255, 255, 0.95)'
                        }).then((replaceResult) => {
                            if (replaceResult.isConfirmed) {
                                console.log('User confirmed replacement');
                                handleForceCreateTender();
                            } else {
                                console.log('User cancelled replacement');
                            }
                        });
                    }
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: error.response?.data?.message || 'Failed to create tender',
                    icon: 'error',
                    background: 'rgba(255, 255, 255, 0.9)'
                });
            }
        }
    };

    const handleForceCreateTender = async () => {
        try {
            // First, find and close the existing tender
            const sourceId = selectedRequest?.type !== 'demandForm' ? selectedRequest._id : selectedDemandForm._id;
            const sourceType = selectedRequest?.type !== 'demandForm' ? 'requestId' : 'demandFormId';
            
            // Get existing tender
            const existingTenderResponse = await api.get(`/api/tenders/existing?${sourceType}=${sourceId}`);
            
            if (existingTenderResponse.data.data.tender) {
                // Close the existing tender
                await api.patch(`/api/tenders/${existingTenderResponse.data.data.tender._id}/close`);
                
                // Now try to create the new tender
                const userId = localStorage.getItem('userId');
                const requestData = {
                    ...tenderForm,
                    createdBy: userId
                };

                if (selectedRequest && selectedRequest.type !== 'demandForm') {
                    requestData.requestId = selectedRequest._id;
                } else if (selectedDemandForm) {
                    requestData.demandFormId = selectedDemandForm._id;
                }

                const response = await api.post('/api/tenders', requestData);
                
                Swal.fire({
                    title: 'Success!',
                    text: 'Previous tender closed and new tender created successfully!',
                    icon: 'success',
                    background: 'rgba(255, 255, 255, 0.9)',
                    showConfirmButton: false,
                    timer: 2000
                });

                resetTenderForm();
                fetchPendingRequests();
            }
        } catch (error) {
            console.error('Force create tender error:', error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'Failed to force create tender',
                icon: 'error',
                background: 'rgba(255, 255, 255, 0.9)'
            });
        }
    };

    const handleApprove = async (requestId) => {
        const result = await Swal.fire({
            title: 'Confirm Approval',
            text: 'Are you sure you want to approve this request?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4CAF50',
            cancelButtonColor: '#F44336',
            confirmButtonText: 'Yes, approve it!',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(5px)'
        });

        if (result.isConfirmed) {
            try {
                const userId = localStorage.getItem('userId');
                await api.post(`/api/procurement/approve/${requestId}`, {
                    ProcurementisApproved: true,
                    procurementUserID: userId
                });

                Swal.fire({
                    title: 'Approved!',
                    text: 'Request approved successfully!',
                    icon: 'success',
                    background: 'rgba(255, 255, 255, 0.9)',
                    showConfirmButton: false,
                    timer: 1500
                });

                fetchPendingRequests();
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
            text: 'Are you sure you want to reject this request?',
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
                await api.patch(`/api/procurement/reject/${selectedRequest._id}`, {
                    procurementRejectionReason: rejectionReason,
                    procurementUserID: userId
                });

                Swal.fire({
                    title: 'Rejected!',
                    text: 'Request rejected successfully!',
                    icon: 'success',
                    background: 'rgba(255, 255, 255, 0.9)',
                    showConfirmButton: false,
                    timer: 1500
                });

                fetchPendingRequests();
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

    const handleApproveDemandForm = async (demandFormId) => {
        const result = await Swal.fire({
            title: 'Confirm Approval',
            text: 'Are you sure you want to approve this demand form?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4CAF50',
            cancelButtonColor: '#F44336',
            confirmButtonText: 'Yes, approve it!',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(5px)'
        });

        if (result.isConfirmed) {
            try {
                const userId = localStorage.getItem('userId');
                await api.patch(`/api/demands/${demandFormId}/approve/procurement`, {
                    procurementUserID: userId
                });

                Swal.fire({
                    title: 'Approved!',
                    text: 'Demand form approved successfully!',
                    icon: 'success',
                    background: 'rgba(255, 255, 255, 0.9)',
                    showConfirmButton: false,
                    timer: 1500
                });

                // Refresh both pending and approved sections
                fetchPendingRequests();
                
                // Update approved count
                try {
                    const demandsResponse = await api.get('/api/demands');
                    const approvedDemandForms = demandsResponse.data.filter(demandForm => 
                        demandForm.ProcurementisApproved === true && 
                        demandForm.ProcurementUserID === userId
                    );
                    setStats(prev => ({ ...prev, approved: approvedDemandForms.length }));
                } catch (countError) {
                    console.error('Error updating approved count:', countError);
                }
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

    const handleRejectDemandForm = async () => {
        setOpenDemandDialog(false);
        if (!demandRejectionReason) {
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
                await api.patch(`/api/demands/${selectedDemandForm._id}/reject/procurement`, {
                    procurementUserID: userId,
                    rejectionReason: demandRejectionReason
                });

                Swal.fire({
                    title: 'Rejected!',
                    text: 'Demand form rejected successfully!',
                    icon: 'success',
                    background: 'rgba(255, 255, 255, 0.9)',
                    showConfirmButton: false,
                    timer: 1500
                });

                // Refresh both pending and rejected sections
                fetchPendingRequests();
                
                // Update rejected count
                try {
                    const demandsResponse = await api.get('/api/demands');
                    const rejectedDemandForms = demandsResponse.data.filter(demandForm => 
                        demandForm.requestStage === "Rejected Procurement Officer" && 
                        demandForm.ProcurementUserID === userId
                    );
                    const rejectedRequestsResponse = await api.get(`/api/procurement/rejected/${userId}`);
                    const totalRejected = rejectedRequestsResponse.data.length + rejectedDemandForms.length;
                    setStats(prev => ({ ...prev, rejected: totalRejected }));
                } catch (countError) {
                    console.error('Error updating rejected count:', countError);
                }
                
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
                    <LinearProgress color="primary" sx={{ height: 8, borderRadius: 4, mb: 2 }} />
                    <Typography variant="h6" color="primary">Loading requests...</Typography>
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
                background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
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
                            Procurement Dashboard
                        </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            color="inherit"
                            startIcon={<HomeIcon />}
                            onClick={() => navigate('/procurement-officer-dashboard')}
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
                            startIcon={<StatsIcon />}
                            onClick={() => navigate('/procurement-tenders')}
                            sx={{
                                '&:hover': {
                                    background: 'rgba(255,255,255,0.1)',
                                    transform: 'translateY(-2px)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            All Tenders
                        </Button>
                        {/* <Button
                            color="inherit"
                            startIcon={<FeaturesIcon />}
                            onClick={() => navigate('/procurement-features')}
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
                    <Grid item xs={12} md={3}>
                        <GlassCard>
                            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{
                                    mr: 3,
                                    background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)'
                                }}>
                                    <GavelIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Pending Requests</Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.pending}</Typography>
                                </Box>
                            </CardContent>
                        </GlassCard>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <GlassCard>
                            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{
                                    mr: 3,
                                    background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)'
                                }}>
                                    <CheckCircleIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Approved Requests</Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.approved}</Typography>
                                </Box>
                            </CardContent>
                        </GlassCard>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <GlassCard>
                            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{
                                    mr: 3,
                                    background: 'linear-gradient(45deg, #F44336 30%, #E57373 90%)'
                                }}>
                                    <CancelIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Rejected Requests</Typography>
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
                                        background: 'linear-gradient(90deg, #2E7D32 0%, #4CAF50 100%)',
                                        borderRadius: '4px 4px 0 0'
                                    }
                                }}
                            >
                                <Tab
                                    label={
                                        <Badge badgeContent={stats.pending} color="warning" sx={{ mr: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <GavelIcon sx={{ mr: 1 }} />
                                                Pending
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
                                <Tab
                                    label={
                                        <Badge badgeContent={stats.tenders} color="info" sx={{ mr: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <TenderIcon sx={{ mr: 1 }} />
                                                Tenders
                                            </Box>
                                        </Badge>
                                    }
                                    sx={{ fontWeight: 'bold' }}
                                />
                            </Tabs>
                        </Box>

                        {(tabValue < 4 ? requests : demandForms).length === 0 ? (
                            <Box sx={{
                                textAlign: 'center',
                                py: 8,
                                background: 'rgba(255, 255, 255, 0.7)',
                                borderRadius: 2,
                                backdropFilter: 'blur(5px)'
                            }}>
                                <SchoolIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary">
                                    {tabValue === 0 ? 'No pending requests or demand forms' :
                                        tabValue === 1 ? 'No approved requests' :
                                            tabValue === 2 ? 'No rejected requests' : 'No active tenders'}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    {tabValue === 0 ? 'All clear!' :
                                        tabValue === 1 ? 'You haven\'t approved any requests yet' :
                                            tabValue === 2 ? 'You haven\'t rejected any requests yet' : 'No tenders created yet'}
                                </Typography>
                            </Box>
                        ) : (
                            <Grid container spacing={3}>
                                {requests.map((item) => (
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
                                                            {item.type === 'demandForm' ? `${item.department} - ${item.demandNo}` : (item.title || item.tenderTitle)}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                            {item.type === 'demandForm' ? 
                                                                `${item.items?.length || 0} items • Total: ${item.totalCost?.toFixed(2) || '0.00'}` : 
                                                                `${item._id.substring(0, 8)}... • ${item.category || item.tenderCategory}`}
                                                            {item.subCategory && ` / ${item.subCategory}`}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                            <StatusChip
                                                                status={item.requestStage || 'Tender'}
                                                                label={item.requestStage || 'Tender'}
                                                                size="small"
                                                            />
                                                            {tabValue !== 3 && (
                                                                <Chip
                                                                    label={
                                                                        item.type === 'demandForm' ? 
                                                                            (item.ProcurementisApproved === null ? 'Rejected' :
                                                                                item.ProcurementisApproved ? 'Approved' : 'Pending') :
                                                                            (item.ProcurementisApproved === null ? 'Rejected' :
                                                                                item.ProcurementisApproved ? 'Approved' : 'Pending')
                                                                    }
                                                                    size="small"
                                                                    color={
                                                                        item.ProcurementisApproved === null ? 'error' :
                                                                            item.ProcurementisApproved ? 'success' : 'warning'
                                                                    }
                                                                    variant="outlined"
                                                                />
                                                            )}
                                                            {tabValue === 3 && (
                                                                <Chip
                                                                    label={
                                                                        new Date(item.closingDate) > new Date() ? 'Active' : 'Closed'
                                                                    }
                                                                    size="small"
                                                                    color={
                                                                        new Date(item.closingDate) > new Date() ? 'success' : 'error'
                                                                    }
                                                                    variant="outlined"
                                                                />
                                                            )}
                                                            {item.type === 'demandForm' && (
                                                                <Chip
                                                                    label={item.requirementType || 'Routine'}
                                                                    size="small"
                                                                    color={
                                                                        item.requirementType === 'Urgent' ? 'error' :
                                                                            item.requirementType === 'Priority' ? 'warning' : 'info'
                                                                    }
                                                                    variant="outlined"
                                                                />
                                                            )}
                                                            <Chip
                                                                label={item.type === 'demandForm' ? 'Demand Form' : 'Request'}
                                                                size="small"
                                                                color={item.type === 'demandForm' ? 'secondary' : 'primary'}
                                                                variant="outlined"
                                                            />
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ display: 'flex' }}>
                                                        {tabValue === 0 && (
                                                            <>
                                                                <IconButton
                                                                    onClick={() => item.type === 'demandForm' ? handleApproveDemandForm(item._id) : handleApprove(item._id)}
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
                                                                    onClick={() => item.type === 'demandForm' ? handleViewDemandDetails(item) : handleViewDetails(item)}
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
                                                        {tabValue === 1 && item.type !== 'demandForm' && (
                                                            <IconButton
                                                                onClick={() => handleCreateTender(item)}
                                                                sx={{
                                                                    color: 'info.main',
                                                                    background: 'rgba(33, 150, 243, 0.1)',
                                                                    '&:hover': { background: 'rgba(33, 150, 243, 0.2)' },
                                                                    mr: 1
                                                                }}
                                                            >
                                                                <TenderIcon />
                                                            </IconButton>
                                                        )}
                                                        {tabValue === 1 && item.type === 'demandForm' && (
                                                            <IconButton
                                                                onClick={() => handleTenderApply(item)}
                                                                sx={{
                                                                    color: 'info.main',
                                                                    background: 'rgba(33, 150, 243, 0.1)',
                                                                    '&:hover': { background: 'rgba(33, 150, 243, 0.2)' },
                                                                    mr: 1
                                                                }}
                                                            >
                                                                <TenderIcon />
                                                            </IconButton>
                                                        )}
                                                        <IconButton
                                                            onClick={(e) => {
                                                                if (item.type === 'demandForm') {
                                                                    setSelectedDemandForm(item);
                                                                } else {
                                                                    setSelectedRequest(item);
                                                                }
                                                                handleMenuOpen(e);
                                                            }}
                                                            sx={{
                                                                color: 'primary.main',
                                                                background: 'rgba(46, 125, 50, 0.1)',
                                                                '&:hover': { background: 'rgba(46, 125, 50, 0.2)' }
                                                            }}
                                                        >
                                                            <MoreIcon />
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
                    background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                    color: 'white',
                    py: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SchoolIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">Request Details</Typography>
                    </Box>
                    <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ py: 3 }}>
                    {selectedRequest && (
                        <Box>
                            {/* Header Section */}
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 3,
                                p: 2,
                                background: 'rgba(46, 125, 50, 0.05)',
                                borderRadius: 2,
                                backdropFilter: 'blur(5px)'
                            }}>
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{selectedRequest.title}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        ID: {selectedRequest._id} • Created: {new Date(selectedRequest.createdAt).toLocaleString()}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <StatusChip
                                        status={selectedRequest.requestStage}
                                        label={selectedRequest.requestStage}
                                    />
                                    <Chip
                                        label={
                                            selectedRequest.ProcurementisApproved === null
                                                ? 'Rejected'
                                                : selectedRequest.ProcurementisApproved
                                                    ? 'Approved'
                                                    : 'Pending'
                                        }
                                        size="small"
                                        color={
                                            selectedRequest.ProcurementisApproved === null
                                                ? 'error'
                                                : selectedRequest.ProcurementisApproved
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
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                            <DetailsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                            Request Information
                                        </Typography>

                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                                            <Typography sx={{ mb: 2 }}>{selectedRequest.category} / {selectedRequest.subCategory}</Typography>

                                            <Typography variant="subtitle2" color="text.secondary">Reason</Typography>
                                            <Typography sx={{ mb: 2 }}>{selectedRequest.reason}</Typography>

                                            {selectedRequest.note && (
                                                <>
                                                    <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                                                    <Typography>{selectedRequest.note}</Typography>
                                                </>
                                            )}
                                        </Box>

                                        <Divider sx={{ my: 2 }} />

                                    

                                        
                                    </Paper>
                                </Grid>

                                {/* Right Column */}
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, height: '100%', background: 'transparent' }}>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                            <TimelineIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                            Approval Timeline
                                        </Typography>

                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                HOD
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Avatar sx={{
                                                    mr: 2,
                                                    background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)'
                                                }}>
                                                    {selectedRequest.HODUser?.fullName?.charAt(0) || 'H'}
                                                </Avatar>
                                                <Box>
                                                    <Typography>{selectedRequest.HODUser?.fullName || 'Not available'}</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {selectedRequest.HODUser?.email || ''}
                                                    </Typography>
                                                    <Typography variant="caption" display="block">
                                                        {selectedRequest.HODcreatedAt ?
                                                            `Requested on ${new Date(selectedRequest.HODcreatedAt).toLocaleString()}` :
                                                            'Pending approval'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>

                                        {selectedRequest.LogisticsUser && (
                                            <Box sx={{ mb: 3 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                    Logistics
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Avatar sx={{
                                                        mr: 2,
                                                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
                                                    }}>
                                                        {selectedRequest.LogisticsUser.fullName.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography>{selectedRequest.LogisticsUser.fullName}</Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {selectedRequest.LogisticsUser.email}
                                                        </Typography>
                                                        <Typography variant="caption" display="block">
                                                            {selectedRequest.LogisticscreatedAt ?
                                                                `Approved on ${new Date(selectedRequest.LogisticscreatedAt).toLocaleString()}` :
                                                                'Pending approval'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        )}

                                        {selectedRequest.RectorUser && (
                                            <Box sx={{ mb: 3 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                    Rector
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Avatar sx={{
                                                        mr: 2,
                                                        background: 'linear-gradient(135deg, #6A1B9A 0%, #9C27B0 100%)',
                                                    }}>
                                                        {selectedRequest.RectorUser.fullName.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography>{selectedRequest.RectorUser.fullName}</Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {selectedRequest.RectorUser.email}
                                                        </Typography>
                                                        <Typography variant="caption" display="block">
                                                            {selectedRequest.RectorcreatedAt ?
                                                                `Approved on ${new Date(selectedRequest.RectorcreatedAt).toLocaleString()}` :
                                                                'Pending approval'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        )}

                                        {selectedRequest.ProcurementUser && (
                                            <Box sx={{ mb: 3 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                    Procurement Officer
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Avatar sx={{
                                                        mr: 2,
                                                        background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)'
                                                    }}>
                                                        {selectedRequest.ProcurementUser.fullName.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography>{selectedRequest.ProcurementUser.fullName}</Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {selectedRequest.ProcurementUser.email}
                                                        </Typography>
                                                        <Typography variant="caption" display="block">
                                                            {selectedRequest.ProcurementcreatedAt ?
                                                                `Approved on ${new Date(selectedRequest.ProcurementcreatedAt).toLocaleString()}` :
                                                                'Pending approval'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        )}

                                        {selectedRequest.requestStage === "Rejected Logistics Officer" && (
                                            <Box sx={{ mt: 2, p: 2, background: 'rgba(244, 67, 54, 0.05)', borderRadius: 2 }}>
                                                <Typography variant="subtitle2" color="error" sx={{ fontWeight: 'bold' }}>
                                                    Rejected by Logistics Officer
                                                </Typography>
                                                <Typography variant="body2">{selectedRequest.note}</Typography>
                                                <Typography variant="caption" display="block">
                                                    {new Date(selectedRequest.LogisticscreatedAt).toLocaleString()}
                                                </Typography>
                                            </Box>
                                        )}

                                        {selectedRequest.requestStage === "Rejected Rector" && (
                                            <Box sx={{ mt: 2, p: 2, background: 'rgba(244, 67, 54, 0.05)', borderRadius: 2 }}>
                                                <Typography variant="subtitle2" color="error" sx={{ fontWeight: 'bold' }}>
                                                    Rejected by Rector
                                                </Typography>
                                                <Typography variant="body2">{selectedRequest.note}</Typography>
                                                <Typography variant="caption" display="block">
                                                    {new Date(selectedRequest.RectorcreatedAt).toLocaleString()}
                                                </Typography>
                                            </Box>
                                        )}

                                        {selectedRequest.requestStage === "Rejected Procurement Officer" && (
                                            <Box sx={{ mt: 2, p: 2, background: 'rgba(244, 67, 54, 0.05)', borderRadius: 2 }}>
                                                <Typography variant="subtitle2" color="error" sx={{ fontWeight: 'bold' }}>
                                                    Rejected by Procurement Officer
                                                </Typography>
                                                <Typography variant="body2">{selectedRequest.note}</Typography>
                                                <Typography variant="caption" display="block">
                                                    {new Date(selectedRequest.ProcurementcreatedAt).toLocaleString()}
                                                </Typography>
                                            </Box>
                                        )}

                                        {selectedRequest.procurementRejectionReason && (
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                    Rejection Reason
                                                </Typography>
                                                <Paper elevation={0} sx={{ p: 2, background: 'rgba(244, 67, 54, 0.05)', borderRadius: 2 }}>
                                                    <Typography>{selectedRequest.procurementRejectionReason}</Typography>
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
                        color="primary"
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)',
                            borderRadius: 2,
                            boxShadow: '0 3px 5px 2px rgba(46, 125, 50, 0.1)',
                            '&:hover': {
                                boxShadow: '0 3px 10px 2px rgba(46, 125, 50, 0.2)'
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </StyledDialog>



            {/* Tender Details Dialog */}
            <StyledDialog
                open={openTenderDetailsDialog}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
                TransitionComponent={Transition}
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
                        <SchoolIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">Tender & Request Details</Typography>
                    </Box>
                    <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ py: 3 }}>
                    {selectedRequest && (
                        <Box>
                            {/* Header Section */}
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 3,
                                p: 2,
                                background: 'rgba(46, 125, 50, 0.05)',
                                borderRadius: 2,
                                backdropFilter: 'blur(5px)'
                            }}>
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{selectedRequest.title}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Reference No: {selectedRequest.referenceNo} • Created: {new Date(selectedRequest.createdAt).toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Location: {selectedRequest.location}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                    <StatusChip
                                        status={selectedRequest.status}
                                        label={selectedRequest.status === 'active' ? 'Active Tender' : 'Inactive'}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                        <Chip
                                            label={`${new Date(selectedRequest.startingDate).toLocaleDateString()} - ${new Date(selectedRequest.closingDate).toLocaleDateString()}`}
                                            size="small"
                                            color="info"
                                            variant="outlined"
                                            icon={<EventIcon fontSize="small" />}
                                        />
                                    </Box>
                                </Box>
                            </Box>

                            <Grid container spacing={3}>
                                {/* Left Column - Tender Information */}
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, height: '100%', border: '1px solid rgba(0,0,0,0.1)' }}>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                            <DescriptionIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                            Tender Information
                                        </Typography>

                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" color="text.secondary">Tender Details</Typography>
                                            <Typography sx={{ mb: 2 }}>{selectedRequest.details}</Typography>
                                        </Box>

                                        <Grid container spacing={2} sx={{ mb: 2 }}>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle2" color="text.secondary">Starting Date</Typography>
                                                <Typography>
                                                    {new Date(selectedRequest.startingDate).toLocaleString()}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle2" color="text.secondary">Closing Date</Typography>
                                                <Typography>
                                                    {new Date(selectedRequest.closingDate).toLocaleString()}
                                                </Typography>
                                            </Grid>
                                        </Grid>

                                        <Divider sx={{ my: 2 }} />

                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                            <PersonIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                            Procurement Officer
                                        </Typography>

                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                                {(selectedRequest.ProcurementUser?.fullName || selectedRequest.createdBy?.fullName || '').charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography>{selectedRequest.ProcurementUser?.fullName || selectedRequest.createdBy?.fullName}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {(selectedRequest.ProcurementUser?.email || selectedRequest.createdBy?.email)} /
                                                    {(selectedRequest.ProcurementUser?.phoneNumber || selectedRequest.createdBy?.phoneNumber)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>

                                {/* Right Column - Request Information */}
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, height: '100%', border: '1px solid rgba(0,0,0,0.1)' }}>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                            <DetailsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                            Original Request Information
                                        </Typography>

                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                                            <Typography sx={{ mb: 2 }}>
                                                {selectedRequest.category || selectedRequest.requestId?.category} / {selectedRequest.subCategory || selectedRequest.requestId?.subCategory}
                                            </Typography>

                                            <Typography variant="subtitle2" color="text.secondary">Reason</Typography>
                                            <Typography sx={{ mb: 2 }}>{selectedRequest.reason || selectedRequest.requestId?.reason}</Typography>

                                            {(selectedRequest.note || selectedRequest.requestId?.note) && (
                                                <>
                                                    <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                                                    <Typography>{selectedRequest.note || selectedRequest.requestId?.note}</Typography>
                                                </>
                                            )}
                                        </Box>

                                        <Divider sx={{ my: 2 }} />

                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                            <HowToRegIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                            Approval Status
                                        </Typography>

                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            <Chip
                                                label={`HOD: ${selectedRequest.HODisApproved || selectedRequest.requestId?.HODisApproved ? 'Approved' : 'Pending'}`}
                                                color={(selectedRequest.HODisApproved || selectedRequest.requestId?.HODisApproved) ? 'success' : 'warning'}
                                                size="small"
                                                variant="outlined"
                                            />
                                            <Chip
                                                label={`Logistics: ${selectedRequest.LogisticsisApproved || selectedRequest.requestId?.LogisticsisApproved ? 'Approved' : 'Pending'}`}
                                                color={(selectedRequest.LogisticsisApproved || selectedRequest.requestId?.LogisticsisApproved) ? 'success' : 'warning'}
                                                size="small"
                                                variant="outlined"
                                            />
                                            <Chip
                                                label={`Rector: ${selectedRequest.RectorisApproved || selectedRequest.requestId?.RectorisApproved ? 'Approved' : 'Pending'}`}
                                                color={(selectedRequest.RectorisApproved || selectedRequest.requestId?.RectorisApproved) ? 'success' : 'warning'}
                                                size="small"
                                                variant="outlined"
                                            />
                                            <Chip
                                                label={`Procurement: ${selectedRequest.ProcurementisApproved || selectedRequest.requestId?.ProcurementisApproved ? 'Approved' : 'Pending'}`}
                                                color={(selectedRequest.ProcurementisApproved || selectedRequest.requestId?.ProcurementisApproved) ? 'success' : 'warning'}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>

                            {/* Timeline Section - Custom implementation without @mui/lab */}
                           
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
                        sx={{
                            background: 'linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)',
                            borderRadius: 2,
                            boxShadow: '0 3px 5px 2px rgba(46, 125, 50, 0.1)',
                            '&:hover': {
                                boxShadow: '0 3px 10px 2px rgba(46, 125, 50, 0.2)'
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </StyledDialog>

            {/* Tender Creation Dialog */}
            <StyledDialog
                open={openTenderDialog}
                onClose={() => {
                    setOpenTenderDialog(false);
                    resetTenderForm();
                }}
                maxWidth="md"
                fullWidth
                TransitionComponent={Transition}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #1565C0 0%, #2196F3 100%)',
                    color: 'white',
                    py: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TenderIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">Create New Tender</Typography>
                    </Box>
                    <IconButton onClick={() => {
                        setOpenTenderDialog(false);
                        resetTenderForm();
                    }} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ py: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Tender Title"
                                name="title"
                                value={tenderForm.title}
                                onChange={handleTenderFormChange}
                                variant="outlined"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <DescriptionIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ mb: 2 }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Location"
                                name="location"
                                value={tenderForm.location}
                                onChange={handleTenderFormChange}
                                variant="outlined"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LocationIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Tender Category"
                                name="category"
                                value={tenderForm.category}
                                onChange={handleTenderFormChange}
                                variant="outlined"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CategoryIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Tender Reference No"
                                name="referenceNo"
                                value={tenderForm.referenceNo}
                                variant="outlined"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <ReferenceIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                    readOnly: true
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Starting Date & Time"
                                name="startingDate"
                                type="datetime-local"
                                value={tenderForm.startingDate}
                                onChange={handleTenderFormChange}
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <DateRangeIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Closing Date & Time"
                                name="closingDate"
                                type="datetime-local"
                                value={tenderForm.closingDate}
                                onChange={handleTenderFormChange}
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <DateRangeIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                                {selectedDemandForm ? 'Tender Details (from demand form)' : 'Tender Details (from request)'}
                            </Typography>
                            <Paper elevation={0} sx={{ p: 2, background: 'rgba(33, 150, 243, 0.05)', borderRadius: 2 }}>
                                <Grid container spacing={2}>
                                    {selectedDemandForm ? (
                                        // Display demand form details
                                        <>
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="subtitle2" color="text.secondary">Department</Typography>
                                                <Typography>{selectedDemandForm?.department}</Typography>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="subtitle2" color="text.secondary">Demand No</Typography>
                                                <Typography>{selectedDemandForm?.demandNo}</Typography>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="subtitle2" color="text.secondary">Total Cost</Typography>
                                                <Typography>{selectedDemandForm?.totalCost?.toLocaleString()}</Typography>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="subtitle2" color="text.secondary">Requirement Type</Typography>
                                                <Typography>
                                                    <Chip 
                                                        label={selectedDemandForm?.requirementType} 
                                                        color={
                                                            selectedDemandForm?.requirementType === 'Urgent' ? 'error' : 
                                                            selectedDemandForm?.requirementType === 'Priority' ? 'warning' : 'success'
                                                        }
                                                        size="small"
                                                    />
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="subtitle2" color="text.secondary">Manufacturer</Typography>
                                                <Typography>{selectedDemandForm?.manufacturer || 'Not specified'}</Typography>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="subtitle2" color="text.secondary">Local Agent</Typography>
                                                <Typography>{selectedDemandForm?.localAgent || 'Not specified'}</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" color="text.secondary">Requirement</Typography>
                                                <Typography>{selectedDemandForm?.requirement}</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" color="text.secondary">Specifications</Typography>
                                                <Typography>{selectedDemandForm?.specifications}</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" color="text.secondary">Use For</Typography>
                                                <Typography>{selectedDemandForm?.useFor}</Typography>
                                            </Grid>
                                            {selectedDemandForm?.corporateStrategyRef && (
                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle2" color="text.secondary">Corporate Strategy Reference</Typography>
                                                    <Typography>{selectedDemandForm?.corporateStrategyRef}</Typography>
                                                </Grid>
                                            )}
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                                                    Items Details ({selectedDemandForm?.items?.length || 0} items)
                                                </Typography>
                                                {selectedDemandForm?.items?.map((item, index) => (
                                                    <Paper key={index} elevation={2} sx={{ p: 2, mb: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', border: '1px solid rgba(25, 118, 210, 0.1)' }}>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={12}>
                                                                <Typography variant="subtitle3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                                    Item #{item.srNo}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={12} md={8}>
                                                                <Typography variant="caption" color="text.secondary">Description:</Typography>
                                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{item.description}</Typography>
                                                            </Grid>
                                                            <Grid item xs={6} md={2}>
                                                                <Typography variant="caption" color="text.secondary">Quantity:</Typography>
                                                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{item.qty}</Typography>
                                                            </Grid>
                                                            <Grid item xs={6} md={2}>
                                                                <Typography variant="caption" color="text.secondary">Unit Cost:</Typography>
                                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{item.approxCost?.toLocaleString()}</Typography>
                                                            </Grid>
                                                            {item.partNo && (
                                                                <Grid item xs={6} md={3}>
                                                                    <Typography variant="caption" color="text.secondary">Part No:</Typography>
                                                                    <Typography variant="body2">{item.partNo}</Typography>
                                                                </Grid>
                                                            )}
                                                            {item.deno && (
                                                                <Grid item xs={6} md={3}>
                                                                    <Typography variant="caption" color="text.secondary">Denomination:</Typography>
                                                                    <Typography variant="body2">{item.deno}</Typography>
                                                                </Grid>
                                                            )}
                                                            <Grid item xs={12} md={6}>
                                                                <Typography variant="caption" color="text.secondary">Total Cost:</Typography>
                                                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                                                    {(item.qty * item.approxCost)?.toLocaleString()}
                                                                </Typography>
                                                            </Grid>
                                                        </Grid>
                                                    </Paper>
                                                ))}
                                            </Grid>
                                        </>
                                    ) : (
                                        // Display regular request details
                                        <>
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                                                <Typography sx={{ fontWeight: 'medium' }}>{selectedRequest?.title}</Typography>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                                                <Typography>{selectedRequest?.category} / {selectedRequest?.subCategory}</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" color="text.secondary">Reason for Request</Typography>
                                                <Typography>{selectedRequest?.reason}</Typography>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="subtitle2" color="text.secondary">Required Color/Specification</Typography>
                                                <Typography>{selectedRequest?.colorPickup}</Typography>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="subtitle2" color="text.secondary">Request Stage</Typography>
                                                <Typography>
                                                    <Chip 
                                                        label={selectedRequest?.requestStage} 
                                                        color="info"
                                                        size="small"
                                                    />
                                                </Typography>
                                            </Grid>
                                            
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                                                    Item Count Details
                                                </Typography>
                                                <Paper elevation={1} sx={{ p: 2, bgcolor: 'rgba(25, 118, 210, 0.05)' }}>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={4}>
                                                            <Typography variant="caption" color="text.secondary">Current Items:</Typography>
                                                            <Typography variant="h6" color="info.main">{selectedRequest?.currentItemCount}</Typography>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="caption" color="text.secondary">Damaged Items:</Typography>
                                                            <Typography variant="h6" color="error.main">{selectedRequest?.damagedItemCount}</Typography>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="caption" color="text.secondary">New Items Requested:</Typography>
                                                            <Typography variant="h6" color="success.main">{selectedRequest?.newItemRequestCount}</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </Paper>
                                            </Grid>

                                            {selectedRequest?.note && (
                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle2" color="text.secondary">Additional Notes</Typography>
                                                    <Typography>{selectedRequest?.note}</Typography>
                                                </Grid>
                                            )}

                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" color="text.secondary">Request Date</Typography>
                                                <Typography>{new Date(selectedRequest?.createdAt).toLocaleDateString()}</Typography>
                                            </Grid>
                                        </>
                                    )}
                                </Grid>
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Additional Tender Details"
                                name="details"
                                value={tenderForm.details}
                                onChange={handleTenderFormChange}
                                multiline
                                rows={4}
                                variant="outlined"
                                sx={{ mt: 2 }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{
                    p: 2,
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderTop: '1px solid rgba(0,0,0,0.1)'
                }}>
                    <Button
                        onClick={() => {
                            setOpenTenderDialog(false);
                            resetTenderForm();
                        }}
                        color="primary"
                        variant="outlined"
                        startIcon={<BackIcon />}
                        sx={{
                            borderRadius: 2,
                            borderColor: 'primary.main',
                            '&:hover': {
                                borderColor: 'primary.dark'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmitTender}
                        color="primary"
                        variant="contained"
                        startIcon={<CheckCircleIcon />}
                        sx={{
                            background: 'linear-gradient(45deg, #1565C0 30%, #2196F3 90%)',
                            borderRadius: 2,
                            boxShadow: '0 3px 5px 2px rgba(21, 101, 192, 0.1)',
                            '&:hover': {
                                boxShadow: '0 3px 10px 2px rgba(21, 101, 192, 0.2)'
                            }
                        }}
                    >
                        Create Tender
                    </Button>
                </DialogActions>
            </StyledDialog>

            {/* Demand Form Details Dialog */}
            <StyledDialog
                open={openDemandDialog}
                onClose={handleCloseDialog}
                maxWidth="lg"
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
                        <DescriptionIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">Demand Form Details</Typography>
                    </Box>
                    <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ py: 3 }}>
                    {selectedDemandForm && (
                        <Box>
                            {/* Header Section */}
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 3,
                                p: 2,
                                background: 'rgba(156, 39, 176, 0.05)',
                                borderRadius: 2,
                                backdropFilter: 'blur(5px)'
                            }}>
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                        {selectedDemandForm.department} - {selectedDemandForm.demandNo}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Cost: {selectedDemandForm.totalCost?.toFixed(2) || '0.00'} • 
                                        Items: {selectedDemandForm.items?.length || 0} • 
                                        Created: {new Date(selectedDemandForm.createdAt).toLocaleString()}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                    <StatusChip
                                        status={selectedDemandForm.requestStage}
                                        label={selectedDemandForm.requestStage}
                                    />
                                    <Chip
                                        label={selectedDemandForm.requirementType || 'Routine'}
                                        size="small"
                                        color={
                                            selectedDemandForm.requirementType === 'Urgent' ? 'error' :
                                                selectedDemandForm.requirementType === 'Priority' ? 'warning' : 'info'
                                        }
                                        variant="outlined"
                                    />
                                </Box>
                            </Box>

                            <Grid container spacing={3}>
                                {/* Left Column - Demand Information */}
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, height: '100%', border: '1px solid rgba(0,0,0,0.1)' }}>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                            <InventoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                            Demand Information
                                        </Typography>

                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" color="text.secondary">Requirement</Typography>
                                            <Typography sx={{ mb: 2 }}>{selectedDemandForm.requirement}</Typography>

                                            <Typography variant="subtitle2" color="text.secondary">Specifications</Typography>
                                            <Typography sx={{ mb: 2 }}>{selectedDemandForm.specifications}</Typography>

                                            <Typography variant="subtitle2" color="text.secondary">Use For</Typography>
                                            <Typography sx={{ mb: 2 }}>{selectedDemandForm.useFor}</Typography>

                                            {selectedDemandForm.corporateStrategyRef && (
                                                <>
                                                    <Typography variant="subtitle2" color="text.secondary">Corporate Strategy Reference</Typography>
                                                    <Typography sx={{ mb: 2 }}>{selectedDemandForm.corporateStrategyRef}</Typography>
                                                </>
                                            )}

                                            {selectedDemandForm.manufacturer && (
                                                <>
                                                    <Typography variant="subtitle2" color="text.secondary">Manufacturer</Typography>
                                                    <Typography sx={{ mb: 2 }}>{selectedDemandForm.manufacturer}</Typography>
                                                </>
                                            )}

                                            {selectedDemandForm.localAgent && (
                                                <>
                                                    <Typography variant="subtitle2" color="text.secondary">Local Agent</Typography>
                                                    <Typography sx={{ mb: 2 }}>{selectedDemandForm.localAgent}</Typography>
                                                </>
                                            )}
                                        </Box>
                                    </Paper>
                                </Grid>

                                {/* Right Column - Items List */}
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, height: '100%', border: '1px solid rgba(0,0,0,0.1)' }}>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                            <ShoppingBasketIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                            Items ({selectedDemandForm.items?.length || 0})
                                        </Typography>

                                        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                                            {selectedDemandForm.items?.map((item, index) => (
                                                <Box key={index} sx={{ 
                                                    mb: 2, 
                                                    p: 2, 
                                                    border: '1px solid rgba(0,0,0,0.1)', 
                                                    borderRadius: 1,
                                                    background: 'rgba(156, 39, 176, 0.02)'
                                                }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                        {item.srNo}. {item.description}
                                                    </Typography>
                                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                                        {item.partNo && (
                                                            <Grid item xs={6}>
                                                                <Typography variant="caption" color="text.secondary">Part No:</Typography>
                                                                <Typography variant="body2">{item.partNo}</Typography>
                                                            </Grid>
                                                        )}
                                                        {item.deno && (
                                                            <Grid item xs={6}>
                                                                <Typography variant="caption" color="text.secondary">Denomination:</Typography>
                                                                <Typography variant="body2">{item.deno}</Typography>
                                                            </Grid>
                                                        )}
                                                        <Grid item xs={4}>
                                                            <Typography variant="caption" color="text.secondary">Quantity:</Typography>
                                                            <Typography variant="body2">{item.qty}</Typography>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="caption" color="text.secondary">Unit Cost:</Typography>
                                                            <Typography variant="body2">{item.approxCost?.toFixed(2) || '0.00'}</Typography>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography variant="caption" color="text.secondary">Total:</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                                {((item.qty || 0) * (item.approxCost || 0)).toFixed(2)}
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            ))}
                                        </Box>

                                        <Divider sx={{ my: 2 }} />
                                        
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                Total Cost:
                                            </Typography>
                                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                {selectedDemandForm.totalCost?.toFixed(2) || '0.00'}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>

                            {/* Approval Timeline */}
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                    <TimelineIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                    Approval Timeline
                                </Typography>
                                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.1)' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {/* Requested User */}
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Box sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                bgcolor: 'primary.main',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 2
                                            }}>
                                                <PersonIcon sx={{ color: 'white' }} />
                                            </Box>
                                            <Box>
                                                <Typography fontWeight="bold">Request Created by {selectedDemandForm.requestedUserRole}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Created on {new Date(selectedDemandForm.createdAt).toLocaleString()}
                                                </Typography>
                                                <Typography variant="caption" display="block">
                                                    User ID: {selectedDemandForm.requestedUserID}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* HOD Approval */}
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Box sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                bgcolor: selectedDemandForm.HODisApproved ? 'success.main' : 'grey.300',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 2
                                            }}>
                                                <HowToRegIcon sx={{ color: 'white' }} />
                                            </Box>
                                            <Box>
                                                <Typography fontWeight="bold">HOD Approval</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {selectedDemandForm.HODisApproved ?
                                                        `Approved on ${new Date(selectedDemandForm.HODcreatedAt).toLocaleString()}` :
                                                        'Pending'}
                                                </Typography>
                                                {selectedDemandForm.HODUser && (
                                                    <Typography variant="caption" display="block">
                                                        {selectedDemandForm.HODUser.fullName} ({selectedDemandForm.HODUser.email})
                                                    </Typography>
                                                )}
                                                {selectedDemandForm.HODUserID && (
                                                    <Typography variant="caption" display="block">
                                                        User ID: {selectedDemandForm.HODUserID}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Logistics Approval */}
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Box sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                bgcolor: selectedDemandForm.LogisticsisApproved ? 'success.main' : 'grey.300',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 2
                                            }}>
                                                <LocalShippingIcon sx={{ color: 'white' }} />
                                            </Box>
                                            <Box>
                                                <Typography fontWeight="bold">Logistics Approval</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {selectedDemandForm.LogisticsisApproved ?
                                                        `Approved on ${new Date(selectedDemandForm.LogisticscreatedAt).toLocaleString()}` :
                                                        'Pending'}
                                                </Typography>
                                                {selectedDemandForm.LogisticsUser && (
                                                    <Typography variant="caption" display="block">
                                                        {selectedDemandForm.LogisticsUser.fullName} ({selectedDemandForm.LogisticsUser.email})
                                                    </Typography>
                                                )}
                                                {selectedDemandForm.LogisticsUserID && (
                                                    <Typography variant="caption" display="block">
                                                        User ID: {selectedDemandForm.LogisticsUserID}
                                                    </Typography>
                                                )}
                                            </Box>

                                            {/* Log Data Section - Show if logistics officer has provided log data */}
                                            {selectedDemandForm.logData && selectedDemandForm.logData.length > 0 && (
                                                <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(255, 152, 0, 0.05)', borderRadius: 1 }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#FF9800' }}>
                                                        📋 Logistics Officer Log Section Data
                                                    </Typography>
                                                    
                                                    {selectedDemandForm.logData.map((log, index) => (
                                                        <Box key={index} sx={{ mb: 1, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                                                                Item {index + 1}: {selectedDemandForm.items?.[index]?.description || 'N/A'}
                                                            </Typography>
                                                            <Grid container spacing={1} sx={{ mt: 0.5 }}>
                                                                <Grid item xs={6}>
                                                                    <Typography variant="caption" color="text.secondary">SR No: {log.srNo || 'N/A'}</Typography>
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <Typography variant="caption" color="text.secondary">Stock: {log.availabilityInStock || 'N/A'}</Typography>
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        Last Issue: {log.dateLastIssueMade ? new Date(log.dateLastIssueMade).toLocaleDateString() : 'N/A'}
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        Last Purchase: {log.dateLastPurchase ? new Date(log.dateLastPurchase).toLocaleDateString() : 'N/A'}
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={12}>
                                                                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                                                        Last Purchase Price: ${log.lastPurchasePrice || '0.00'}
                                                                    </Typography>
                                                                </Grid>
                                                            </Grid>
                                                        </Box>
                                                    ))}
                                                    
                                                    {selectedDemandForm.logNotes && (
                                                        <Box sx={{ mt: 1, p: 1, backgroundColor: 'rgba(255, 152, 0, 0.1)', borderRadius: 1 }}>
                                                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                                                                Notes: {selectedDemandForm.logNotes}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            )}
                                        </Box>

                                        {/* Bursar Approval */}
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Box sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                bgcolor: selectedDemandForm.BursarisApproved ? 'success.main' : 'grey.300',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 2
                                            }}>
                                                <InventoryIcon sx={{ color: 'white' }} />
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography fontWeight="bold">Bursar Approval</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {selectedDemandForm.BursarisApproved ?
                                                        `Approved on ${new Date(selectedDemandForm.BursarcreatedAt).toLocaleString()}` :
                                                        'Pending'}
                                                </Typography>
                                                {selectedDemandForm.BursarUser && (
                                                    <Typography variant="caption" display="block">
                                                        {selectedDemandForm.BursarUser.fullName} ({selectedDemandForm.BursarUser.email})
                                                    </Typography>
                                                )}
                                                {selectedDemandForm.BursarUserID && (
                                                    <Typography variant="caption" display="block">
                                                        User ID: {selectedDemandForm.BursarUserID}
                                                    </Typography>
                                                )}

                                                {/* Bursar Budget Information */}
                                                {selectedDemandForm.BursarisApproved && selectedDemandForm.bursarBudgetInfo && (
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
                                                                    {selectedDemandForm.bursarBudgetInfo.voteParticulars}
                                                                </Typography>
                                                            </Grid>
                                                            
                                                            <Grid item xs={12}>
                                                                <Typography variant="caption" color="text.secondary">Provisions Availability:</Typography>
                                                                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                                                    {selectedDemandForm.bursarBudgetInfo.provisionsAvailability}
                                                                </Typography>
                                                            </Grid>
                                                            
                                                            <Grid item xs={4}>
                                                                <Typography variant="caption" color="text.secondary">Allocated:</Typography>
                                                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '0.85rem' }}>
                                                                    {selectedDemandForm.bursarBudgetInfo.provisionsAllocated?.toFixed(2)}
                                                                </Typography>
                                                            </Grid>
                                                            
                                                            <Grid item xs={4}>
                                                                <Typography variant="caption" color="text.secondary">Expenditure:</Typography>
                                                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'warning.main', fontSize: '0.85rem' }}>
                                                                    {selectedDemandForm.bursarBudgetInfo.totalExpenditure?.toFixed(2)}
                                                                </Typography>
                                                            </Grid>
                                                            
                                                            <Grid item xs={4}>
                                                                <Typography variant="caption" color="text.secondary">Balance:</Typography>
                                                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main', fontSize: '0.85rem' }}>
                                                                    {selectedDemandForm.bursarBudgetInfo.balanceAvailable?.toFixed(2)}
                                                                </Typography>
                                                            </Grid>

                                                            {selectedDemandForm.bursarBudgetInfo.budgetApprovalDate && (
                                                                <Grid item xs={12}>
                                                                    <Typography variant="caption" sx={{ 
                                                                        fontWeight: 'bold',
                                                                        color: '#9C27B0',
                                                                        display: 'block',
                                                                        mt: 1
                                                                    }}>
                                                                        💰 Budget Approved: {new Date(selectedDemandForm.bursarBudgetInfo.budgetApprovalDate).toLocaleString()}
                                                                    </Typography>
                                                                </Grid>
                                                            )}
                                                        </Grid>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Warehouse Approval */}
                                        

                                        {/* Rector Approval */}
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Box sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                bgcolor: selectedDemandForm.RectorisApproved ? 'success.main' : 'grey.300',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 2
                                            }}>
                                                <SchoolIcon sx={{ color: 'white' }} />
                                            </Box>
                                            <Box>
                                                <Typography fontWeight="bold">Rector Approval</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {selectedDemandForm.RectorisApproved ?
                                                        `Approved on ${new Date(selectedDemandForm.RectorcreatedAt).toLocaleString()}` :
                                                        'Pending'}
                                                </Typography>
                                                {selectedDemandForm.RectorUser && (
                                                    <Typography variant="caption" display="block">
                                                        {selectedDemandForm.RectorUser.fullName} ({selectedDemandForm.RectorUser.email})
                                                    </Typography>
                                                )}
                                                {selectedDemandForm.RectorUserID && (
                                                    <Typography variant="caption" display="block">
                                                        User ID: {selectedDemandForm.RectorUserID}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Procurement Approval */}
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Box sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                bgcolor: selectedDemandForm.ProcurementisApproved ? 'success.main' : 'warning.main',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 2
                                            }}>
                                                <ShoppingBasketIcon sx={{ color: 'white' }} />
                                            </Box>
                                            <Box>
                                                <Typography fontWeight="bold">Procurement Approval (Current Stage)</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {selectedDemandForm.ProcurementisApproved ?
                                                        `Approved on ${new Date(selectedDemandForm.ProcurementcreatedAt).toLocaleString()}` :
                                                        'Awaiting your approval'}
                                                </Typography>
                                                {selectedDemandForm.ProcurementUser && (
                                                    <Typography variant="caption" display="block">
                                                        {selectedDemandForm.ProcurementUser.fullName} ({selectedDemandForm.ProcurementUser.email})
                                                    </Typography>
                                                )}
                                                {selectedDemandForm.ProcurementUserID && (
                                                    <Typography variant="caption" display="block">
                                                        User ID: {selectedDemandForm.ProcurementUserID}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Box>

                            {/* Additional Information */}
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                    <DescriptionIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                    Additional Information
                                </Typography>
                                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.1)' }}>
                                    <Grid container spacing={2}>
                                        {selectedDemandForm.otherSuppliers && (
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="subtitle2" color="text.secondary">Other Suppliers</Typography>
                                                <Typography>{selectedDemandForm.otherSuppliers}</Typography>
                                            </Grid>
                                        )}
                                        {selectedDemandForm.presentAvailableQty && (
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="subtitle2" color="text.secondary">Present Available Quantity</Typography>
                                                <Typography>{selectedDemandForm.presentAvailableQty}</Typography>
                                            </Grid>
                                        )}
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2" color="text.secondary">Overall Approval Status</Typography>
                                            <Typography>
                                                {selectedDemandForm.isApproved ? 'Fully Approved' : 'Pending Approval'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2" color="text.secondary">Current Stage</Typography>
                                            <Typography>{selectedDemandForm.requestStage}</Typography>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                                            <Typography>{new Date(selectedDemandForm.updatedAt).toLocaleString()}</Typography>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2" color="text.secondary">Demand Form ID</Typography>
                                            <Typography sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                                {selectedDemandForm._id}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Box>

                            {/* Rejection Reason Input */}
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                    <RejectIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'error.main' }} />
                                    Rejection Reason
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={demandRejectionReason}
                                    onChange={(e) => setDemandRejectionReason(e.target.value)}
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
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{
                    p: 2,
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderTop: '1px solid rgba(0,0,0,0.1)'
                }}>
                    <Button
                        onClick={handleRejectDemandForm}
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
                        Reject Demand Form
                    </Button>
                    <Button
                        onClick={handleCloseDialog}
                        color="primary"
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

            {/* Context Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >

                {tabValue !== 3 && (
                    <MenuItem onClick={() => {
                        // Check if selected item is a demand form or regular request
                        if (selectedDemandForm) {
                            handleViewDemandDetails(selectedDemandForm);
                        } else if (selectedRequest) {
                            handleViewDetails(selectedRequest);
                        }
                        handleMenuClose();
                    }}>
                        <Avatar sx={{ background: 'rgba(33, 150, 243, 0.1)', color: '#2196F3' }}>
                            <DetailsIcon fontSize="small" />
                        </Avatar>
                        View Details
                    </MenuItem>

                )}
                {tabValue === 1 && selectedRequest && selectedRequest.type !== 'demandForm' && (
                    <MenuItem onClick={() => {
                        handleCreateTender(selectedRequest);
                        handleMenuClose();
                    }}>
                        <Avatar sx={{ background: 'rgba(33, 150, 243, 0.1)', color: '#2196F3' }}>
                            <TenderIcon fontSize="small" />
                        </Avatar>
                        Create Tender
                    </MenuItem>
                )}
                {tabValue === 3 && (
                    <MenuItem onClick={() => {
                        handleViewTender(selectedRequest);
                        handleMenuClose();
                    }}>
                        <Avatar sx={{ background: 'rgba(33, 150, 243, 0.1)', color: '#2196F3' }}>
                            <TenderIcon fontSize="small" />
                        </Avatar>
                        View Tender
                    </MenuItem>
                )}
            </Menu>
        </Box>
    );
};

export default ProcurementDashboard;
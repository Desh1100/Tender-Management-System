import React, { useState, useEffect } from 'react';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Divider,
  Box,
  LinearProgress,
  IconButton,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Payment as PaymentIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  DoneAll as DoneAllIcon,
  LocalShipping as LocalShippingIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PdfIcon,
  Print as PrintIcon,
  MoreVert as MoreVertIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import api from '../../../api';
import Swal from 'sweetalert2';
import { format, differenceInDays, parseISO } from 'date-fns';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

const OrderTrackingPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openCompleteDialog, setOpenCompleteDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrderForMenu, setSelectedOrderForMenu] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApprovedOrders();
  }, []);

  const fetchApprovedOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/orders/status/approved');
      const ordersWithDetails = response.data.map(order => {
        const now = new Date();
        const deliveryDate = new Date(order.deliveryDate);
        const daysRemaining = differenceInDays(deliveryDate, now);

        return {
          ...order,
          daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
          isOverdue: daysRemaining < 0,
          amountDue: order.totalAmount - (order.amountPaid || 0)
        };
      });
      setOrders(ordersWithDetails);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to fetch orders',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOrder = async () => {
    try {
      await api.patch(`/api/orders/${selectedOrder._id}/complete`, { completionNotes });
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Order marked as completed',
      });
      setOpenCompleteDialog(false);
      fetchApprovedOrders();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to complete order',
      });
    }
  };

  const handleRecordPayment = async () => {
    try {
      await api.patch(`/api/orders/${selectedOrder._id}/delivered`, { amount: paymentAmount });
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Payment recorded successfully',
      });
      setOpenPaymentDialog(false);
      fetchApprovedOrders();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to record payment',
      });
    }
  };

  const getStatusChip = (order) => {
    if (order.isOverdue) {
      return <Chip label="Overdue" color="error" size="small" />;
    }
    if (order.daysRemaining <= 3) {
      return <Chip label={`${order.daysRemaining} days`} color="warning" size="small" />;
    }
    return <Chip label={`${order.daysRemaining} days`} color="success" size="small" />;
  };

  const getPaymentStatusChip = (order) => {
    switch (order.paymentStatus) {
      case 'paid':
        return <Chip label="Paid" color="success" size="small" />;
      case 'partial':
        return <Chip label="Partial" color="warning" size="small" />;
      default:
        return <Chip label="Unpaid" color="error" size="small" />;
    }
  };

  const handleMenuClick = (event, order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrderForMenu(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrderForMenu(null);
  };

  const generatePDF = (order) => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text(`Order Details - ${order.tenderId?.referenceNo}`, 14, 20);

    // Add order information
    doc.setFontSize(12);
    doc.text('Order Information', 14, 35);

    let yPosition = 45;
    doc.text(`Order ID: ${order._id}`, 14, yPosition);
    yPosition += 10;
    doc.text(`Tender Reference: ${order.tenderId?.referenceNo}`, 14, yPosition);
    yPosition += 10;
    doc.text(`Created Date: ${format(parseISO(order.createdAt), 'PPpp')}`, 14, yPosition);
    yPosition += 10;
    doc.text(`Status: ${order.status}`, 14, yPosition);
    yPosition += 10;
    doc.text(`Payment Status: ${order.paymentStatus}`, 14, yPosition);
    yPosition += 15;

    // Add product details
    doc.text('Product Details', 14, yPosition);
    yPosition += 10;
    doc.text(`Product Name: ${order.tenderId?.title}`, 14, yPosition);
    yPosition += 10;
    doc.text(`Description: ${order.tenderId?.details}`, 14, yPosition);
    yPosition += 10;
    doc.text(`Category: ${order.tenderId?.category}`, 14, yPosition);
    yPosition += 10;
    doc.text(`Quantity: ${order.quantity}`, 14, yPosition);
    yPosition += 10;
    doc.text(`Unit Price: $${order.unitPrice?.toFixed(2) || '0.00'}`, 14, yPosition);
    yPosition += 15;

    // Add supplier information
    doc.text('Supplier Information', 14, yPosition);
    yPosition += 10;
    doc.text(`Supplier: ${order.userId?.companyName || order.userId?.fullName}`, 14, yPosition);
    yPosition += 10;
    doc.text(`Contact Person: ${order.userId?.contactPersonName || order.userId?.fullName}`, 14, yPosition);
    yPosition += 10;
    doc.text(`Phone: ${order.userId?.phoneNumber}`, 14, yPosition);
    yPosition += 10;
    doc.text(`Address: ${order.userId?.companyAddress || order.userId?.address}`, 14, yPosition);
    yPosition += 15;

    // Add delivery and payment info
    doc.text('Delivery & Payment', 14, yPosition);
    yPosition += 10;
    doc.text(`Delivery Date: ${format(parseISO(order.deliveryDate), 'PPpp')}`, 14, yPosition);
    yPosition += 10;
    doc.text(`Days Remaining: ${order.daysRemaining > 0 ? order.daysRemaining : 0}`, 14, yPosition);
    yPosition += 10;
    doc.text(`Delivery Method: ${order.freeDelivery ? 'Free Delivery' : `Paid Delivery ($${order.deliveryCost?.toFixed(2) || '0.00'})`}`, 14, yPosition);
    yPosition += 10;
    doc.text(`Total Amount: $${order.totalAmount?.toFixed(2) || '0.00'}`, 14, yPosition);
    yPosition += 10;
    doc.text(`Amount Paid: $${order.amountPaid?.toFixed(2) || '0.00'}`, 14, yPosition);
    yPosition += 10;
    doc.text(`Amount Due: $${order.amountDue?.toFixed(2) || '0.00'}`, 14, yPosition);
    yPosition += 15;

    // Add additional info
    doc.text('Additional Information', 14, yPosition);
    yPosition += 10;
    doc.text(`Special Requirements: ${order.specialRequirements || 'None'}`, 14, yPosition);
    yPosition += 10;
    doc.text(`Notes: ${order.notes || 'None'}`, 14, yPosition);

    // Save the PDF
    doc.save(`order_${order.tenderId?.referenceNo}.pdf`);
    handleMenuClose();
  };

  const generatePDFFromHTML = async (order) => {
    const element = document.getElementById('order-details-dialog-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollY: -window.scrollY
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`order_${order.tenderId?.referenceNo}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to generate PDF from content',
      });
    }

    handleMenuClose();
  };

  const generateTablePDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text('Approved Orders Report', 14, 20);

    // Define the columns for the table
    const columns = [
      { header: 'Order Ref', dataKey: 'orderRef' },
      { header: 'Product', dataKey: 'product' },
      { header: 'Supplier', dataKey: 'supplier' },
      { header: 'Quantity', dataKey: 'quantity' },
      { header: 'Delivery Date', dataKey: 'deliveryDate' },
      { header: 'Amount Due', dataKey: 'amountDue' },
    ];

    // Transform the orders data into the format needed for the PDF
    const rows = orders.map(order => ({
      orderRef: order.tenderId?.referenceNo || 'N/A',
      product: order.tenderId?.title || 'N/A',
      supplier: order.userId?.companyName || order.userId?.fullName || 'N/A',
      quantity: order.quantity,
      deliveryDate: format(parseISO(order.deliveryDate), 'PP'),
      amountDue: `$${order.amountDue.toFixed(2)}`
    }));

    // Create the PDF table
    autoTable(doc, {
      head: [columns.map(col => col.header)],
      body: rows.map(row => columns.map(col => row[col.dataKey])),
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 40 },
        2: { cellWidth: 40 },
        3: { cellWidth: 20 },
        4: { cellWidth: 30 },
        6: { cellWidth: 25 }
      }
    });

    // Save the PDF
    doc.save('approved_orders_report.pdf');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading orders...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Approved Orders
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Track your approved orders and manage deliveries
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={generateTablePDF}
        startIcon={<FileDownloadIcon />}
      >
        Export PDF
      </Button>

      {orders.length === 0 ? (
        <Card sx={{ mt: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No approved orders found
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              All your approved orders will appear here
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order Ref</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Delivery Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Amount Due</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{order.tenderId?.referenceNo}</TableCell>
                  <TableCell>
                    <Typography fontWeight="bold">{order.tenderId?.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.tenderId?.details.substring(0, 30)}...
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                        {order.userId?.fullName?.charAt(0) || 'S'}
                      </Avatar>
                      <Typography variant="body2">
                        {order.userId?.companyName || order.userId?.fullName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>
                    {format(parseISO(order.deliveryDate), 'PP')}
                  </TableCell>
                  <TableCell>
                    {getStatusChip(order)}
                  </TableCell>
                  <TableCell>
                    ${order.amountDue.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View details">
                        <IconButton
                          size="small"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Record payment">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => {
                            setSelectedOrder(order);
                            setPaymentAmount(order.amountDue);
                            setOpenPaymentDialog(true);
                          }}
                        >
                          <PaymentIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Mark as completed">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => {
                            setSelectedOrder(order);
                            setOpenCompleteDialog(true);
                          }}
                        >
                          <DoneAllIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="More options">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, order)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Order Details Dialog */}
      <Dialog
        open={!!selectedOrder && !openCompleteDialog && !openPaymentDialog}
        onClose={() => setSelectedOrder(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Order Details - {selectedOrder.tenderId?.referenceNo}</Typography>
              <Box>
                <Tooltip title="Download as PDF">
                  <IconButton onClick={() => generatePDF(selectedOrder)}>
                    <PdfIcon />
                  </IconButton>
                </Tooltip>
                <IconButton onClick={() => setSelectedOrder(null)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers id="order-details-dialog-content">
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Order Information
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Order ID</Typography>
                    <Typography>{selectedOrder._id}</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Tender Reference</Typography>
                    <Typography>{selectedOrder.tenderId?.referenceNo}</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Created Date</Typography>
                    <Typography>{format(parseISO(selectedOrder.createdAt), 'PPpp')}</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={selectedOrder.status}
                        color={
                          selectedOrder.status === 'approved' ? 'success' :
                            selectedOrder.status === 'completed' ? 'primary' : 'default'
                        }
                        size="small"
                      />
                      {getPaymentStatusChip(selectedOrder)}
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Product Details
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Product Name</Typography>
                    <Typography>{selectedOrder.tenderId?.title}</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Description</Typography>
                    <Typography>{selectedOrder.tenderId?.details}</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Category</Typography>
                    <Typography>{selectedOrder.tenderId?.category}</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Quantity</Typography>
                    <Typography>{selectedOrder.quantity}</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Unit Price</Typography>
                    <Typography>${selectedOrder.unitPrice?.toFixed(2) || '0.00'}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Supplier Information
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ width: 40, height: 40, mr: 2 }}>
                      {selectedOrder.userId?.fullName?.charAt(0) || 'S'}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {selectedOrder.userId?.companyName || selectedOrder.userId?.fullName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedOrder.userId?.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Contact Person</Typography>
                    <Typography>{selectedOrder.userId?.contactPersonName || selectedOrder.userId?.fullName}</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Phone Number</Typography>
                    <Typography>{selectedOrder.userId?.phoneNumber}</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Address</Typography>
                    <Typography>{selectedOrder.userId?.companyAddress || selectedOrder.userId?.address}</Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocalShippingIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Delivery & Payment
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Delivery Date</Typography>
                    <Typography>
                      {format(parseISO(selectedOrder.deliveryDate), 'PPpp')}
                      {selectedOrder.isOverdue && (
                        <Chip label="Overdue" color="error" size="small" sx={{ ml: 1 }} />
                      )}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Days Remaining</Typography>
                    <Typography>
                      {selectedOrder.daysRemaining > 0 ? selectedOrder.daysRemaining : 0}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Delivery Method</Typography>
                    <Typography>
                      {selectedOrder.freeDelivery ? 'Free Delivery' : `Paid Delivery ($${selectedOrder.deliveryCost?.toFixed(2) || '0.00'})`}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                    <Typography>${selectedOrder.totalAmount?.toFixed(2) || '0.00'}</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Amount Paid</Typography>
                    <Typography>${selectedOrder.amountPaid?.toFixed(2) || '0.00'}</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Amount Due</Typography>
                    <Typography>${selectedOrder.amountDue?.toFixed(2) || '0.00'}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Additional Information
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Special Requirements</Typography>
                    <Typography>{selectedOrder.specialRequirements || 'None'}</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Notes</Typography>
                    <Typography>{selectedOrder.notes || 'None'}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => generatePDF(selectedOrder)}
                startIcon={<PdfIcon />}
                variant="outlined"
                color="error"
              >
                Download PDF
              </Button>
              <Button onClick={() => setSelectedOrder(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Complete Order Dialog */}
      <Dialog
        open={openCompleteDialog}
        onClose={() => setOpenCompleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <DoneAllIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Complete Order</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to mark this order as completed?
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Order Ref: {selectedOrder?.tenderId?.referenceNo}
          </Typography>
          <TextField
            fullWidth
            label="Completion Notes"
            multiline
            rows={4}
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Add any notes about the completion of this order..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCompleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCompleteOrder}
            variant="contained"
            color="success"
            startIcon={<DoneAllIcon />}
          >
            Mark as Completed
          </Button>
        </DialogActions>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog
        open={openPaymentDialog}
        onClose={() => setOpenPaymentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <PaymentIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Record Payment</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" gutterBottom>
            Record payment for order: {selectedOrder?.tenderId?.referenceNo}
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2">Total Amount:</Typography>
              <Typography variant="h6">${selectedOrder?.totalAmount?.toFixed(2) || '0.00'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2">Amount Paid:</Typography>
              <Typography variant="h6">${selectedOrder?.amountPaid?.toFixed(2) || '0.00'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2">Amount Due:</Typography>
              <Typography variant="h6" color="primary">
                ${selectedOrder?.amountDue?.toFixed(2) || '0.00'}
              </Typography>
            </Grid>
            <Grid item xs={12} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Payment Amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  inputProps: {
                    min: 0,
                    max: selectedOrder?.amountDue
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
          <Button
            onClick={handleRecordPayment}
            variant="contained"
            color="primary"
            startIcon={<PaymentIcon />}
            disabled={!paymentAmount || paymentAmount <= 0}
          >
            Record Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* More Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          setSelectedOrder(selectedOrderForMenu);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <InfoIcon fontSize="small" />
          </ListItemIcon>
          View Details
        </MenuItem>
        <MenuItem onClick={() => {
          generatePDF(selectedOrderForMenu);
        }}>
          <ListItemIcon>
            <PdfIcon fontSize="small" />
          </ListItemIcon>
          Download as PDF
        </MenuItem>
        {/* <MenuItem onClick={() => {
          generatePDFFromHTML(selectedOrderForMenu);
        }}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          Print
        </MenuItem> */}
      </Menu>
    </Container>
  );
};

export default OrderTrackingPage;
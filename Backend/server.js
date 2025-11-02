const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('MongoDB connection error:', err));

// Test route
app.get('/', (req, res) => {
    res.send('Tender Management Backend is running');
});  

const authRoutes = require('./routes/authRoutes');
// const requestRoutes = require('./routes/requestRoutes'); // Disabled - Using demand forms only
const logisticsRoutes = require('./routes/logisticsRoutes');
const bursarRoutes = require('./routes/bursarRoutes');
const rectorRoutes = require('./routes/rectorRoute');
const procurementRoute = require('./routes/procurementRoute');
const tenderRoutes = require('./routes/tenderRoutes');  
const orderRoutes = require('./routes/orderRoutes');
const demandRoutes = require('./routes/demandRoutes');  



// Routes
app.use('/api/auth', authRoutes);
// app.use('/api/requests', requestRoutes); // Disabled - Using demand forms only
app.use('/api/logistics', logisticsRoutes);
app.use('/api/bursar', bursarRoutes);
app.use('/api/rector', rectorRoutes);
app.use('/api/procurement', procurementRoute);
app.use('/api/tenders', tenderRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/demands', demandRoutes);



// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
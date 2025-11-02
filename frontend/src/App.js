import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import SuperAdminDashboard from './components/pages/SuperAdminDashboard';
import HODDashboard from './components/pages/Users/HOD/hodDashboard';
import RequestStatus from './components/pages/Users/HOD/RequestStatus';
import LogisticsDashboard from './components/pages/Users/Logistics/LogisticsDashboard';
import OrderTrackingPage from './components/pages/Users/Logistics/OrderTrackingPage';
import BursarDashboard from './components/pages/Users/Bursar/BursarDashboard';
import RectorDashboard from './components/pages/Users/Rector/RectorDashboard';
import ProcurementOfficer from './components/pages/Users/ProcurementOfficer/ProcurementofficerDashboard';
import TendersPage from './components/pages/Users/ProcurementOfficer/TendersPage';
import TenderDashboard from './components/pages/Users/Tender/tenderDashboard';





function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/request-status" element={<RequestStatus />} />

        {/* SUPER ADMIN */}
        <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
        

        {/* HOD */}
        <Route path="/hod-dashboard" element={<HODDashboard />} />

        {/* Logistics Officer */}
        <Route path="/logistics-officer-dashboard" element={<LogisticsDashboard />} />
        <Route path="/logistics/orders/tracking" element={<OrderTrackingPage  />} />

        {/* Bursar */}
        <Route path="/bursar-dashboard" element={<BursarDashboard />} />

       {/* Rector Officer */}
       <Route path="/rector-dashboard" element={<RectorDashboard />} />

       {/* Procurement Officer */}
       <Route path="/procurement-officer-dashboard" element={<ProcurementOfficer />} />
       <Route path="/procurement-tenders" element={<TendersPage />} />

       {/* Tender Dashbaord */}
       <Route path="/supplier-dashboard" element={<TenderDashboard />} />


      </Routes>
    </Router>
  );
}

export default App;
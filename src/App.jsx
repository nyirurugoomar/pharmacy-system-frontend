import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import CashierDashboard from './CashierDashboard';
import PharmacistDashboard from './PharmacistDashboard';
import StockKeeperDashboard from './StockKeeperDashboard';
import AdminDashboard from './AdminDashboard';
import PrivateRoute from './PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cashier" element={<PrivateRoute><CashierDashboard /></PrivateRoute>} />
        <Route path="/pharmacist" element={<PrivateRoute><PharmacistDashboard /></PrivateRoute>} />
        <Route path="/stock-keeper" element={<PrivateRoute><StockKeeperDashboard /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;

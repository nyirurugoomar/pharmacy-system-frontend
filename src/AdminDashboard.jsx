import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import { FaChartLine, FaBox, FaSignOutAlt, FaSearch, FaUser, FaMoneyBillWave, FaCreditCard, FaMobileAlt, FaCashRegister, FaFileExcel, FaFilePdf, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const API = 'https://pharmacy-system-efz8.onrender.com/admin-report';
const CASHIER_API = 'https://pharmacy-system-efz8.onrender.com/cashier';
const PHARMACIST_API = 'https://pharmacy-system-efz8.onrender.com/pharmacist';

function AdminDashboard() {
  const navigate = useNavigate();
  const [earningsVsExpenses, setEarningsVsExpenses] = useState({ earnings: [], expenses: [], labels: [] });
  const [period, setPeriod] = useState('month');
  const [insuranceStatus, setInsuranceStatus] = useState({});
  const [purchaseExpenses, setPurchaseExpenses] = useState({ totalPurchases: 0, outstandingCredits: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // User registration state
  const [regUser, setRegUser] = useState({ username: '', password: '', role: 'cashier' });
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [financialData, setFinancialData] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [insuranceStatusData, setInsuranceStatusData] = useState(null);
  const [purchaseData, setPurchaseData] = useState(null);
  const [insuranceDetails, setInsuranceDetails] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');

  const token = localStorage.getItem('token');
  const authHeader = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };

  // Fetch all reports
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true); setError('');
      try {
        // Earnings vs Expenses
        const res1 = await fetch(`${API}/earnings-vs-expenses?period=${period}`, { headers: authHeader });
        if (!res1.ok) throw new Error('Failed to fetch earnings vs expenses');
        const evs = await res1.json();
        setEarningsVsExpenses(evs);
        // Insurance status
        const res2 = await fetch(`${API}/insurance-status`, { headers: authHeader });
        if (!res2.ok) throw new Error('Failed to fetch insurance status');
        setInsuranceStatus(await res2.json());
        // Purchase expenses
        const res3 = await fetch(`${API}/purchase-expenses`, { headers: authHeader });
        if (!res3.ok) throw new Error('Failed to fetch purchase expenses');
        setPurchaseExpenses(await res3.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [period]);

  const fetchFinancialData = async () => {
    setLoading(true);
    setError('');
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const res = await fetch(`${CASHIER_API}/net-profit?date=${formattedDate}`, { headers: authHeader });
      if (!res.ok) throw new Error('Failed to fetch financial data');
      const data = await res.json();
      setFinancialData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch insurance status with details
  const fetchInsuranceStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      // Fetch insurance payments
      const paymentsRes = await fetch(
        `${PHARMACIST_API}/insurance-payments`,
        { headers: authHeader }
      );

      if (!paymentsRes.ok) {
        setInsuranceStatusData({
          'Paid': { count: 0, amount: 0 },
          'Not Paid': { count: 0, amount: 0 },
          'Pending': { count: 0, amount: 0 }
        });
        setInsuranceDetails([]);
        return;
      }

      const payments = await paymentsRes.json();
      setInsuranceDetails(payments);

      // Process the data to get status counts and amounts
      const statusData = {
        'Paid': { count: 0, amount: 0 },
        'Not Paid': { count: 0, amount: 0 },
        'Pending': { count: 0, amount: 0 }
      };

      // Count payments by status and sum amounts
      payments.forEach(payment => {
        const status = payment.status || 'Pending';
        statusData[status].count += 1;
        statusData[status].amount += Number(payment.amount) || 0;
      });

      setInsuranceStatusData(statusData);
    } catch (err) {
      console.error('Error fetching insurance data:', err);
      setInsuranceStatusData({
        'Paid': { count: 0, amount: 0 },
        'Not Paid': { count: 0, amount: 0 },
        'Pending': { count: 0, amount: 0 }
      });
      setInsuranceDetails([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch purchase expenses
  const fetchPurchaseExpenses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/purchase-expenses`, { headers: authHeader });
      if (!res.ok) {
        setPurchaseData({
          totalPurchases: 0,
          outstandingCredits: 0
        });
        return;
      }
      const data = await res.json();
      setPurchaseData(data);
    } catch (err) {
      console.error('Error fetching purchase expenses:', err);
      setPurchaseData({
        totalPurchases: 0,
        outstandingCredits: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle export
  const handleExport = async (format) => {
    setLoading(true);
    setError('');
    try {
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      const res = await fetch(
        `${CASHIER_API}/export/${format}?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
        { headers: authHeader }
      );
      if (!res.ok) throw new Error(`Failed to export ${format}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pharmacy-report.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Use single values for earnings, expenses, netProfit
  const totalEarnings = Number(earningsVsExpenses.earnings) || 0;
  const totalExpenses = Number(earningsVsExpenses.expenses) || 0;
  const netProfit = Number(earningsVsExpenses.netProfit) || (totalEarnings - totalExpenses);

  // Chart data for earnings vs expenses (simple bar chart)
  const evsChartData = {
    labels: ['Earnings', 'Expenses'],
    datasets: [
      {
        label: 'Amount',
        data: [totalEarnings, totalExpenses],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 99, 132, 0.7)'
        ],
      },
    ],
  };
  const evsChartOptions = {
    responsive: true,
    plugins: {
      title: { display: true, text: 'Earnings vs Expenses' },
      legend: { display: false },
    },
  };

  // Insurance status chart
  const insuranceLabels = Object.keys(insuranceStatusData || {});
  const insuranceChartValues = Object.values(insuranceStatusData || {}).map(Number);
  const totalInsurance = insuranceChartValues.reduce((a, b) => a + b, 0);
  const insuranceChartData = {
    labels: insuranceLabels,
    datasets: [
      {
        label: 'Insurance Status',
        data: insuranceChartValues,
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(75, 192, 192, 0.7)',
        ],
      },
    ],
  };

  // Helper for number formatting
  const formatNumber = (num) => num?.toLocaleString('en-US') || 0;

  // Download raw data as JSON
  const downloadJSON = (data, name) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // User registration handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    setRegLoading(true);
    try {
      const res = await fetch('https://pharmacy-system-efz8.onrender.com/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(regUser),
      });
      const data = await res.json();
      if (res.ok) {
        setRegSuccess('User registered successfully!');
        setRegUser({ username: '', password: '', role: 'cashier' });
      } else {
        setRegError(data.message || 'Registration failed');
      }
    } catch (err) {
      setRegError('Network error');
    } finally {
      setRegLoading(false);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Sort insurance details
  const sortInsuranceDetails = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedData = [...insuranceDetails].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setInsuranceDetails(sortedData);
  };

  // Filter insurance details
  const filteredInsuranceDetails = insuranceDetails.filter(payment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      payment.patientName?.toLowerCase().includes(searchLower) ||
      payment.insuranceCompany?.toLowerCase().includes(searchLower) ||
      payment.status?.toLowerCase().includes(searchLower) ||
      payment.amount?.toString().includes(searchLower)
    );
  });

  useEffect(() => {
    fetchFinancialData();
    fetchInsuranceStatus();
    fetchPurchaseExpenses();
  }, [selectedDate, startDate, endDate]);

  return (
    <div className="d-flex" style={{ minHeight: '100vh', width: 1430, background: '#f8f9fa' }}>
      {/* Sidebar */}
      <nav className="bg-dark text-white p-4" style={{ width: 250, minHeight: '100vh', boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }}>
        <h4 className="mb-4 d-flex align-items-center">
          <FaChartLine className="me-2" />
          Pharmacy App
        </h4>
        <ul className="nav flex-column">
          <li className="nav-item mb-3">
            <a className="nav-link text-white d-flex align-items-center" href="#" style={{ borderRadius: '8px', padding: '10px 15px', background: 'rgba(255,255,255,0.1)' }}>
              <FaChartLine className="me-2" /> Dashboard
            </a>
          </li>
          <li className="nav-item mb-3">
            <a className="nav-link text-white d-flex align-items-center" href="#" style={{ borderRadius: '8px', padding: '10px 15px' }}>
              <FaBox className="me-2" /> Reports
            </a>
          </li>
          <li className="nav-item mb-3">
            <a className="nav-link text-white d-flex align-items-center" href="#" style={{ borderRadius: '8px', padding: '10px 15px' }}>
              <FaUser className="me-2" /> Register User
            </a>
          </li>
          <li className="nav-item mt-auto">
            <button 
              className="nav-link text-white btn btn-link p-0 d-flex align-items-center" 
              style={{ textAlign: 'left', borderRadius: '8px', padding: '10px 15px' }} 
              onClick={handleLogout}
            >
              <FaSignOutAlt className="me-2" /> Logout
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        {/* Top Bar */}
        <div className="d-flex justify-content-between align-items-center p-4 bg-white shadow-sm" style={{ minWidth: 0 }}>
          <h5 className="mb-0 fw-bold">Admin Dashboard</h5>
          <div className="d-flex align-items-center">
            <div className="position-relative me-3">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                className="form-control"
                dateFormat="MMMM d, yyyy"
              />
            </div>
            <div className="d-flex align-items-center bg-light rounded-pill px-3 py-2">
              <FaUser className="me-2 text-primary" />
              <span className="fw-bold">{localStorage.getItem('username')}</span>
            </div>
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <>
              {/* Financial Overview Cards */}
              <div className="row g-4 mb-4">
                <div className="col-md-4">
                  <div className="card shadow-sm border-0 rounded-3">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-success bg-opacity-10 p-3 rounded-3 me-3">
                          <FaMoneyBillWave className="text-success" size={24} />
                        </div>
                        <div>
                          <h6 className="card-subtitle text-muted mb-1">Total Earnings</h6>
                          <h3 className="card-title mb-0 text-success">
                            {financialData?.earnings?.toLocaleString() || '0'} Rwf
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card shadow-sm border-0 rounded-3">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-danger bg-opacity-10 p-3 rounded-3 me-3">
                          <FaBox className="text-danger" size={24} />
                        </div>
                        <div>
                          <h6 className="card-subtitle text-muted mb-1">Total Expenses</h6>
                          <h3 className="card-title mb-0 text-danger">
                            {financialData?.expenses?.toLocaleString() || '0'} Rwf
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card shadow-sm border-0 rounded-3">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-primary bg-opacity-10 p-3 rounded-3 me-3">
                          <FaChartLine className="text-primary" size={24} />
                        </div>
                        <div>
                          <h6 className="card-subtitle text-muted mb-1">Net Profit</h6>
                          <h3 className="card-title mb-0 text-primary">
                            {financialData?.netProfit?.toLocaleString() || '0'} Rwf
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="card shadow-sm border-0 rounded-3 mb-4">
                <div className="card-body p-4">
                  <h6 className="card-title mb-4">Payment Breakdown</h6>
                  <div className="row g-4">
                    <div className="col-md-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-info bg-opacity-10 p-3 rounded-3 me-3">
                          <FaCashRegister className="text-info" size={20} />
                        </div>
                        <div>
                          <h6 className="text-muted mb-1">POS</h6>
                          <h5 className="mb-0">
                            {financialData?.breakdown?.posTotal?.toLocaleString() || '0'} Rwf
                          </h5>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-success bg-opacity-10 p-3 rounded-3 me-3">
                          <FaMoneyBillWave className="text-success" size={20} />
                        </div>
                        <div>
                          <h6 className="text-muted mb-1">Cash</h6>
                          <h5 className="mb-0">
                            {financialData?.breakdown?.cashTotal?.toLocaleString() || '0'} Rwf
                          </h5>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 p-3 rounded-3 me-3">
                          <FaMobileAlt className="text-primary" size={20} />
                        </div>
                        <div>
                          <h6 className="text-muted mb-1">Mobile Money</h6>
                          <h5 className="mb-0">
                            {financialData?.breakdown?.momoTotal?.toLocaleString() || '0'} Rwf
                          </h5>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-warning bg-opacity-10 p-3 rounded-3 me-3">
                          <FaCreditCard className="text-warning" size={20} />
                        </div>
                        <div>
                          <h6 className="text-muted mb-1">Total Transactions</h6>
                          <h5 className="mb-0">
                            {financialData?.breakdown?.totalTransactions || '0'}
                          </h5>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insurance Status Section */}
              <div className="card shadow-sm border-0 rounded-3 mb-4">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h6 className="card-title mb-0">Insurance Status</h6>
                    <div className="d-flex gap-2">
                      <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        className="form-control"
                        dateFormat="MMMM d, yyyy"
                        placeholderText="Start Date"
                      />
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        className="form-control"
                        dateFormat="MMMM d, yyyy"
                        placeholderText="End Date"
                      />
                    </div>
                  </div>
                  {insuranceStatusData ? (
                    <>
                      <div className="row g-4 mb-4">
                        {Object.entries(insuranceStatusData).map(([status, data]) => (
                          <div key={status} className="col-md-4">
                            <div className="d-flex align-items-center">
                              <div className={`bg-${getStatusColor(status)} bg-opacity-10 p-3 rounded-3 me-3`}>
                                <FaCreditCard className={`text-${getStatusColor(status)}`} size={20} />
                              </div>
                              <div>
                                <h6 className="text-muted mb-1">{status}</h6>
                                <h5 className="mb-0">{data.count} Records</h5>
                                <small className="text-muted">{data.amount.toLocaleString()} Rwf</small>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Detailed Insurance Status Table */}
                      <div className="mt-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="mb-0">Detailed Insurance Records</h6>
                          <div className="d-flex gap-2">
                            <div className="input-group" style={{ width: '300px' }}>
                              <span className="input-group-text bg-light border-end-0">
                                <FaSearch className="text-muted" />
                              </span>
                              <input
                                type="text"
                                className="form-control border-start-0"
                                placeholder="Search records..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead className="table-light">
                              <tr>
                                <th onClick={() => sortInsuranceDetails('patientName')} style={{ cursor: 'pointer' }}>
                                  Patient Name
                                  {sortConfig.key === 'patientName' && (
                                    sortConfig.direction === 'asc' ? <FaSortUp className="ms-1" /> : <FaSortDown className="ms-1" />
                                  )}
                                </th>
                                <th onClick={() => sortInsuranceDetails('insuranceCompany')} style={{ cursor: 'pointer' }}>
                                  Insurance Company
                                  {sortConfig.key === 'insuranceCompany' && (
                                    sortConfig.direction === 'asc' ? <FaSortUp className="ms-1" /> : <FaSortDown className="ms-1" />
                                  )}
                                </th>
                                <th onClick={() => sortInsuranceDetails('amount')} style={{ cursor: 'pointer' }}>
                                  Amount
                                  {sortConfig.key === 'amount' && (
                                    sortConfig.direction === 'asc' ? <FaSortUp className="ms-1" /> : <FaSortDown className="ms-1" />
                                  )}
                                </th>
                                <th onClick={() => sortInsuranceDetails('date')} style={{ cursor: 'pointer' }}>
                                  Date
                                  {sortConfig.key === 'date' && (
                                    sortConfig.direction === 'asc' ? <FaSortUp className="ms-1" /> : <FaSortDown className="ms-1" />
                                  )}
                                </th>
                                <th onClick={() => sortInsuranceDetails('status')} style={{ cursor: 'pointer' }}>
                                  Status
                                  {sortConfig.key === 'status' && (
                                    sortConfig.direction === 'asc' ? <FaSortUp className="ms-1" /> : <FaSortDown className="ms-1" />
                                  )}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredInsuranceDetails.map((payment, index) => (
                                <tr key={index}>
                                  <td>{payment.patientName || 'N/A'}</td>
                                  <td>{payment.insuranceCompany || 'N/A'}</td>
                                  <td>{payment.amount?.toLocaleString() || '0'} Rwf</td>
                                  <td>{new Date(payment.date).toLocaleDateString()}</td>
                                  <td>
                                    <span className={`badge bg-${getStatusColor(payment.status)}`}>
                                      {payment.status || 'Pending'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                              {filteredInsuranceDetails.length === 0 && (
                                <tr>
                                  <td colSpan="5" className="text-center py-4">No insurance records found</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">No insurance data available</div>
                  )}
                </div>
              </div>

              {/* Purchase Expenses Section */}
              <div className="card shadow-sm border-0 rounded-3 mb-4">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h6 className="card-title mb-0">Purchase Expenses & Credits</h6>
                  </div>
                  {purchaseData ? (
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 p-3 rounded-3 me-3">
                            <FaBox className="text-primary" size={24} />
                          </div>
                          <div>
                            <h6 className="text-muted mb-1">Total Purchases</h6>
                            <h3 className="mb-0">{purchaseData.totalPurchases?.toLocaleString() || '0'} Rwf</h3>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex align-items-center">
                          <div className="bg-warning bg-opacity-10 p-3 rounded-3 me-3">
                            <FaMoneyBillWave className="text-warning" size={24} />
                          </div>
                          <div>
                            <h6 className="text-muted mb-1">Outstanding Credits</h6>
                            <h3 className="mb-0">{purchaseData.outstandingCredits?.toLocaleString() || '0'} Rwf</h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">No purchase data available</div>
                  )}
                </div>
              </div>

              {/* User Registration Section */}
              <div className="card shadow-sm border-0 rounded-3">
                <div className="card-body p-4">
                  <h6 className="card-title mb-4">Register New User</h6>
                  <form onSubmit={handleRegister}>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label className="form-label">Username</label>
                          <input
                            type="text"
                            className="form-control"
                            value={regUser.username}
                            onChange={(e) => setRegUser({ ...regUser, username: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label className="form-label">Password</label>
                          <input
                            type="password"
                            className="form-control"
                            value={regUser.password}
                            onChange={(e) => setRegUser({ ...regUser, password: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label className="form-label">Role</label>
                          <select
                            className="form-select"
                            value={regUser.role}
                            onChange={(e) => setRegUser({ ...regUser, role: e.target.value })}
                            required
                          >
                            <option value="cashier">Cashier</option>
                            <option value="stockkeeper">Stock Keeper</option>
                            <option value="pharmacist">Pharmacist</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={regLoading}
                      >
                        {regLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Registering...
                          </>
                        ) : (
                          'Register User'
                        )}
                      </button>
                    </div>
                    {regError && <div className="alert alert-danger mt-3">{regError}</div>}
                    {regSuccess && <div className="alert alert-success mt-3">{regSuccess}</div>}
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function for status colors
const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'success';
    case 'not paid':
      return 'danger';
    case 'pending':
      return 'warning';
    default:
      return 'primary';
  }
};

export default AdminDashboard; 
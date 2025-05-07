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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const API = 'https://pharmacy-system-efz8.onrender.com/admin-report';

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

  // Export handler
  const handleExport = async (format) => {
    try {
      const res = await fetch(`${API}/export?format=${format}`, { headers: authHeader });
      if (!res.ok) throw new Error('Failed to export report');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Export failed: ' + err.message);
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
  const insuranceLabels = Object.keys(insuranceStatus);
  const insuranceData = Object.values(insuranceStatus).map(Number);
  const totalInsurance = insuranceData.reduce((a, b) => a + b, 0);
  const insuranceChartData = {
    labels: insuranceLabels,
    datasets: [
      {
        label: 'Insurance Status',
        data: insuranceData,
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
      const res = await fetch('http://localhost:3000/auth/register', {
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

  return (
    <div className="container-fluid" style={{ background: '#f4f6fa', minHeight: '100vh',width:1450 }}>
      <div className="row">
        <div className="col-2 bg-primary text-white p-3" style={{ minHeight: '100vh' }}>
          <h4>Admin Panel</h4>
          <ul className="nav flex-column mt-4">
            <li className="nav-item mb-2"><a className="nav-link text-white active" href="#">Dashboard</a></li>
            <li className="nav-item mb-2"><a className="nav-link text-white" href="#">Reports</a></li>
            <li className="nav-item mb-2"><button className="nav-link text-white btn btn-link p-0" style={{textAlign:'left'}} onClick={handleLogout}>Logout</button></li>
          </ul>
        </div>
        <div className="col-10">
          <div className="d-flex justify-content-between align-items-center p-3 bg-white shadow-sm">
            <h5 className="mb-0">Admin Dashboard</h5>
            <div className="d-flex align-items-center">
              <button className="btn btn-outline-primary me-2" onClick={() => handleExport('csv')}>Export CSV</button>
              <button className="btn btn-outline-secondary me-3" onClick={() => handleExport('pdf')}>Export PDF</button>
              <span className="fw-bold" style={{ fontSize: 16 }}>{localStorage.getItem('username')}</span>
            </div>
          </div>

          {error && <div className="alert alert-danger mt-3">{error}</div>}
          {loading ? <div className="mt-4">Loading...</div> : (
            <>
              {/* Stat Cards */}
              <div className="row g-4 mt-3">
                <div className="col-md-3">
                  <div className="card text-center shadow-sm">
                    <div className="card-body">
                      <h6 className="card-title">Total Earnings</h6>
                      <h3 className="text-success">{formatNumber(totalEarnings)} Rwf</h3>
                      <button className="btn btn-link btn-sm p-0" onClick={() => downloadJSON(totalEarnings, 'earnings')}>Download</button>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card text-center shadow-sm">
                    <div className="card-body">
                      <h6 className="card-title">Total Expenses</h6>
                      <h3 className="text-danger">{formatNumber(totalExpenses)} Rwf</h3>
                      <button className="btn btn-link btn-sm p-0" onClick={() => downloadJSON(totalExpenses, 'expenses')}>Download</button>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card text-center shadow-sm">
                    <div className="card-body">
                      <h6 className="card-title">Net Profit</h6>
                      <h3 className="text-primary">{formatNumber(netProfit)} Rwf</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card text-center shadow-sm">
                    <div className="card-body">
                      <h6 className="card-title">Total Purchases</h6>
                      <h3 className="text-warning">{formatNumber(purchaseExpenses.totalPurchases)} Rwf</h3>
                      <button className="btn btn-link btn-sm p-0" onClick={() => downloadJSON(purchaseExpenses.totalPurchases, 'total_purchases')}>Download</button>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card text-center shadow-sm">
                    <div className="card-body">
                      <h6 className="card-title">Outstanding Credits</h6>
                      <h3 className="text-danger">{formatNumber(purchaseExpenses.outstandingCredits)} Rwf</h3>
                      <button className="btn btn-link btn-sm p-0" onClick={() => downloadJSON(purchaseExpenses.outstandingCredits, 'outstanding_credits')}>Download</button>
                    </div>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="card text-center shadow-sm">
                    <div className="card-body">
                      <h6 className="card-title">Insurance</h6>
                      <h3 className="text-info">{formatNumber(totalInsurance)}</h3>
                      <button className="btn btn-link btn-sm p-0" onClick={() => downloadJSON(insuranceStatus, 'insurance_status')}>Download</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="row mt-4">
                <div className="col-md-8">
                  <div className="card shadow-sm mb-4">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="card-title mb-0">Earnings vs Expenses</h6>
                        <select className="form-select w-auto" value={period} onChange={e => setPeriod(e.target.value)}>
                          <option value="day">Day</option>
                          <option value="week">Week</option>
                          <option value="month">Month</option>
                        </select>
                      </div>
                      <Bar data={evsChartData} options={evsChartOptions} height={220} />
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card shadow-sm mb-4">
                    <div className="card-body">
                      <h6 className="card-title mb-3">Insurance Status</h6>
                      <Pie data={insuranceChartData} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Reports Table (placeholder) */}
              <div className="row mt-4">
                <div className="col-md-8">
                  <div className="card shadow-sm mb-4">
                    <div className="card-body">
                      <h6 className="card-title mb-3">Recent Reports</h6>
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr><td>2025-05-05</td><td>PDF</td><td>Exported</td></tr>
                          <tr><td>2025-05-04</td><td>CSV</td><td>Exported</td></tr>
                          <tr><td>2025-05-03</td><td>PDF</td><td>Failed</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Registration Card */}
              <div className="row mt-4">
                <div className="col-md-6">
                  <div className="card shadow-sm mb-4">
                    <div className="card-body">
                      <h6 className="card-title mb-3">Register New User</h6>
                      <form onSubmit={handleRegister}>
                        <div className="mb-2">
                          <label className="form-label">Username</label>
                          <input type="text" className="form-control" value={regUser.username} onChange={e => setRegUser({ ...regUser, username: e.target.value })} required />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Password</label>
                          <input type="password" className="form-control" value={regUser.password} onChange={e => setRegUser({ ...regUser, password: e.target.value })} required />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Role</label>
                          <select className="form-select" value={regUser.role} onChange={e => setRegUser({ ...regUser, role: e.target.value })}>
                            <option value="cashier">Cashier</option>
                            <option value="pharmacist">Pharmacist</option>
                            <option value="stock-keeper">Stock Keeper</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        {regError && <div className="alert alert-danger py-1">{regError}</div>}
                        {regSuccess && <div className="alert alert-success py-1">{regSuccess}</div>}
                        <button type="submit" className="btn btn-primary mt-2 w-100" disabled={regLoading}>Register</button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard; 
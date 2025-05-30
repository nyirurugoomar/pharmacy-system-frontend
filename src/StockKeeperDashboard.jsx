import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import { FaPills, FaEdit, FaTrash } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function StockKeeperDashboard() {
  const navigate = useNavigate();
  // Purchase state
  const [purchase, setPurchase] = useState({
    medicineName: '',
    totalAmount: '',
    supplier: '',
    purchaseDate: new Date(),
    status: 'paid',
    notes: ''
  });
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(null);
  const [summary, setSummary] = useState(null);
  const API = 'https://pharmacy-system-efz8.onrender.com/stock-keeper';
  const token = localStorage.getItem('token');
  const authHeader = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };

  // Fetch purchases
  const fetchPurchases = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/purchases`, { headers: authHeader });
      if (!res.ok) throw new Error('Failed to fetch purchases');
      const data = await res.json();
      setPurchases(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch summary
  const fetchSummary = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/summary`, { headers: authHeader });
      if (!res.ok) throw new Error('Failed to fetch summary');
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      setError(err.message);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch total purchases
  const fetchTotalPurchases = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/total-purchases`, { headers: authHeader });
      if (!res.ok) throw new Error('Failed to fetch total purchases');
      setTotal(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
    fetchSummary();
    fetchTotalPurchases();
  }, []);

  // Add Purchase
  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const purchaseData = {
        medicineName: purchase.medicineName,
        totalAmount: parseInt(purchase.totalAmount),
        supplier: purchase.supplier,
        purchaseDate: purchase.purchaseDate.toISOString(),
        status: purchase.status,
        notes: purchase.notes
      };

      const res = await fetch(`${API}/purchase`, {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify(purchaseData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add purchase');
      }

      setPurchase({
        medicineName: '',
        totalAmount: '',
        supplier: '',
        purchaseDate: new Date(),
        status: 'paid',
        notes: ''
      });
      fetchPurchases();
      fetchSummary();
      fetchTotalPurchases();
    } catch (err) {
      setError(err.message);
    }
  };

  // Purchases Over Time chart data
  const purchasesByDate = {};
  purchases.forEach(p => {
    const date = p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString() : 'Unknown';
    purchasesByDate[date] = (purchasesByDate[date] || 0) + (Number(p.totalAmount) || 0);
  });
  const chartLabels = Object.keys(purchasesByDate).sort((a, b) => new Date(a) - new Date(b));
  const chartData = chartLabels.map(date => purchasesByDate[date]);
  const barChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Purchases Over Time',
        data: chartData,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Purchases Over Time' },
    },
    scales: {
      x: { title: { display: true, text: 'Date' } },
      y: { title: { display: true, text: 'Total Amount (Rwf)' }, beginAtZero: true },
    },
  };

  // Purchases by Supplier data
  const purchasesBySupplier = {};
  purchases.forEach(p => {
    if (!p.supplier) return;
    purchasesBySupplier[p.supplier] = (purchasesBySupplier[p.supplier] || 0) + (Number(p.totalAmount) || 0);
  });

  // Stat card calculations
  const totalPurchases = purchases.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
  const outstandingCredits = purchases
    .filter((p) => p.paymentStatus === 'Credit')
    .reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
  const uniqueDepots = new Set(purchases.map((p) => p.depotName)).size;

  // Filtered purchases
  const filteredPurchases = purchases.filter(p => {
    const searchLower = search.toLowerCase();
    const medicineName = (p.medicineName || '').toLowerCase();
    const supplier = (p.supplier || '').toLowerCase();
    
    return medicineName.includes(searchLower) || 
           supplier.includes(searchLower);
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', width: 1430, background: '#f4f6fa' }}>
      {/* Sidebar */}
      <nav className="bg-primary text-white p-3" style={{ width: 220, minHeight: '100vh' }}>
        <h4 className="mb-4">Pharmacy App</h4>
        <ul className="nav flex-column">
          <li className="nav-item mb-2"><a className="nav-link text-white active" href="#">Dashboard</a></li>
          <li className="nav-item mb-2"><a className="nav-link text-white" href="#">Purchases</a></li>
          <li className="nav-item mb-2"><a className="nav-link text-white" href="#">Credits</a></li>
          <li className="nav-item mb-2"><button className="nav-link text-white btn btn-link p-0" style={{textAlign:'left'}} onClick={handleLogout}>Logout</button></li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        {/* Top Bar */}
        <div className="d-flex justify-content-between align-items-center p-3 bg-white shadow-sm" style={{ minWidth: 0 }}>
          <h5 className="mb-0">Stock Keeper Dashboard</h5>
          <div className="d-flex align-items-center">
            <input className="form-control me-2" type="search" placeholder="Search" style={{ width: 200 }} />
            <span className="fw-bold" style={{ fontSize: 16 }}>{localStorage.getItem('username')}</span>
          </div>
        </div>
        <div className="w-100 px-4 mt-4" style={{ maxWidth: '100%' }}>
          <div className="row g-4">
            {/* Purchase Form */}
            <div className="col-md-6">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h6 className="card-title mb-3">Add Purchase</h6>
                  <form onSubmit={handlePurchaseSubmit}>
                  <div className="mb-2">
                      <label className="form-label">Supplier Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={purchase.supplier} 
                        onChange={e => setPurchase({ ...purchase, supplier: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Total Amount (Rwf)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        value={purchase.totalAmount} 
                        onChange={e => setPurchase({ ...purchase, totalAmount: e.target.value })}
                        required
                        min="0"
                        step="1"
                        placeholder="Enter amount in Rwf"
                      />
                    </div>
                    
                    <div className="mb-2">
                      <label className="form-label">Purchase Date</label>
                      <DatePicker
                        selected={purchase.purchaseDate}
                        onChange={(date) => setPurchase({ ...purchase, purchaseDate: date })}
                        className="form-control"
                        dateFormat="MMMM d, yyyy"
                        required
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Status</label>
                      <select 
                        className="form-select" 
                        value={purchase.status} 
                        onChange={e => setPurchase({ ...purchase, status: e.target.value })}
                        required
                      >
                        <option value="paid">Paid</option>
                        <option value="credit">Credit</option>
                      </select>
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Notes</label>
                      <textarea 
                        className="form-control" 
                        value={purchase.notes} 
                        onChange={e => setPurchase({ ...purchase, notes: e.target.value })}
                        rows="3"
                      />
                    </div>
                    {error && <div className="alert alert-danger py-1">{error}</div>}
                    <button type="submit" className="btn btn-primary mt-2 w-100" disabled={loading}>
                      {loading ? 'Adding...' : 'Add Purchase'}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Purchases Table */}
            <div className="col-md-6">
              <div className="card shadow-lg mb-4 border-0" style={{ borderRadius: 18 }}>
                <div className="card-header bg-success text-white d-flex align-items-center" style={{ borderTopLeftRadius: 18, borderTopRightRadius: 18, fontWeight: 600, fontSize: 18, letterSpacing: 1 }}>
                  <FaPills className="me-2" /> Purchases
                </div>
                <div className="card-body" style={{ background: '#f8fafc', borderBottomLeftRadius: 18, borderBottomRightRadius: 18 }}>
                  {/* Search filter */}
                  <div className="mb-3 d-flex justify-content-end">
                    <input
                      type="text"
                      className="form-control"
                      style={{ maxWidth: 220 }}
                      placeholder="Search by supplier..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="alert alert-danger py-1">{error}</div>
                  ) : (
                    <div style={{ maxHeight: 350, overflowY: 'auto', borderRadius: 12 }}>
                      <table className="table table-sm table-striped align-middle" style={{ background: '#fff', borderRadius: 12 }}>
                        <thead className="table-success">
                          <tr>
                            <th>Purchase Date</th>
                            <th>Supplier</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th>Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPurchases.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="text-center py-4">No purchases found</td>
                            </tr>
                          ) : (
                            filteredPurchases.map((p) => (
                              <tr key={p._id}>
                                <td>{p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString() : 'N/A'}</td>
                                <td>{p.supplier || 'N/A'}</td>
                                <td>{(p.totalAmount || 0).toLocaleString()} Rwf</td>
                                <td>
                                  <span className={`badge bg-${p.status === 'paid' ? 'success' : p.status === 'credit' ? 'warning text-dark' : 'danger'}`}>
                                    {p.status || 'N/A'}
                                  </span>
                                </td>
                                <td>{p.notes || 'N/A'}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockKeeperDashboard; 
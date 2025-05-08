import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChartLine, FaMoneyBillWave, FaReceipt, FaSignOutAlt, FaSearch, FaUser, FaCalendarAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

function CashierDashboard() {
  const navigate = useNavigate();
  // Sale state (updated for multiple items)
  const [sale, setSale] = useState({ items: [{ medicationName: '', quantity: '', unitPrice: '' }], paymentMethod: 'CASH', date: new Date() });
  const [sales, setSales] = useState([]);
  const [saleLoading, setSaleLoading] = useState(false);
  const [saleError, setSaleError] = useState('');

  // Earnings state
  const [earning, setEarning] = useState({ 
    posAmount: '', 
    cashAmount: '', 
    momoAmount: '', 
    date: new Date() 
  });
  const [earnings, setEarnings] = useState([]);
  const [earningLoading, setEarningLoading] = useState(false);
  const [earningError, setEarningError] = useState('');

  // Expenses state
  const [expense, setExpense] = useState({ 
    category: '', 
    amount: '', 
    date: new Date() 
  });
  const [expenses, setExpenses] = useState([]);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [expenseError, setExpenseError] = useState('');

  // Net profit
  const [netProfit, setNetProfit] = useState(null);
  const [profitDate, setProfitDate] = useState(new Date());
  const [profitLoading, setProfitLoading] = useState(false);
  const [profitError, setProfitError] = useState('');

  const API = 'https://pharmacy-system-efz8.onrender.com/cashier';
  const token = localStorage.getItem('token');
  const authHeader = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };

  // Calculate total price for sale
  const totalSalePrice = sale.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice) || 0), 0);

  // Fetch sales
  const fetchSales = async () => {
    setSaleLoading(true); setSaleError('');
    try {
      const res = await fetch(`${API}/get-sales`, { headers: authHeader });
      if (!res.ok) throw new Error('Failed to fetch sales');
      const data = await res.json();
      setSales(data);
    } catch (err) {
      setSaleError(err.message);
    } finally {
      setSaleLoading(false);
    }
  };

  // Fetch earnings
  const fetchEarnings = async (date = '') => {
    setEarningLoading(true); setEarningError('');
    try {
      const url = date ? `${API}/earnings?date=${date}` : `${API}/earnings`;
      const res = await fetch(url, { headers: authHeader });
      if (!res.ok) throw new Error('Failed to fetch earnings');
      const data = await res.json();
      setEarnings(data);
    } catch (err) {
      setEarningError(err.message);
    } finally {
      setEarningLoading(false);
    }
  };

  // Fetch expenses
  const fetchExpenses = async (date = '') => {
    setExpenseLoading(true); setExpenseError('');
    try {
      const url = date ? `${API}/expenses?date=${date}` : `${API}/expenses`;
      const res = await fetch(url, { headers: authHeader });
      if (!res.ok) throw new Error('Failed to fetch expenses');
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      setExpenseError(err.message);
    } finally {
      setExpenseLoading(false);
    }
  };

  // Fetch net profit
  const fetchNetProfit = async (date) => {
    setProfitLoading(true); setProfitError('');
    try {
      const res = await fetch(`${API}/net-profit?date=${date}`, { headers: authHeader });
      if (!res.ok) throw new Error('Failed to fetch net profit');
      const data = await res.json();
      setNetProfit(data.netProfit || data);
    } catch (err) {
      setProfitError(err.message);
    } finally {
      setProfitLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
    fetchEarnings();
    fetchExpenses();
  }, []);

  // Add Sale (updated for multiple items)
  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    setSaleError('');
    try {
      const res = await fetch(`${API}/create-sale`, {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify({
          items: sale.items.map(item => ({
            medicationName: item.medicationName,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice)
          })),
          totalPrice: totalSalePrice,
          paymentMethod: sale.paymentMethod,
          date: sale.date
        })
      });
      if (!res.ok) throw new Error('Failed to add sale');
      setSale({ items: [{ medicationName: '', quantity: '', unitPrice: '' }], paymentMethod: 'CASH', date: new Date() });
      fetchSales();
    } catch (err) {
      setSaleError(err.message);
    }
  };

  // Add/Remove sale items
  const handleSaleItemChange = (idx, field, value) => {
    const updated = sale.items.map((item, i) => i === idx ? { ...item, [field]: value } : item);
    setSale({ ...sale, items: updated });
  };
  const addSaleItem = () => setSale({ ...sale, items: [...sale.items, { medicationName: '', quantity: '', unitPrice: '' }] });
  const removeSaleItem = (idx) => setSale({ ...sale, items: sale.items.filter((_, i) => i !== idx) });

  // Add Earning
  const handleEarningSubmit = async (e) => {
    e.preventDefault();
    setEarningError('');
    try {
      const res = await fetch(`${API}/earning`, {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify({
          ...earning,
          posAmount: Number(earning.posAmount),
          cashAmount: Number(earning.cashAmount),
          momoAmount: Number(earning.momoAmount),
          date: earning.date.toISOString()
        })
      });
      if (!res.ok) throw new Error('Failed to add earning');
      setEarning({ posAmount: '', cashAmount: '', momoAmount: '', date: new Date() });
      fetchEarnings();
    } catch (err) {
      setEarningError(err.message);
    }
  };

  // Add Expense
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setExpenseError('');
    try {
      const res = await fetch(`${API}/expense`, {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify({
          ...expense,
          amount: Number(expense.amount),
          date: expense.date.toISOString()
        })
      });
      if (!res.ok) throw new Error('Failed to add expense');
      setExpense({ category: '', amount: '', date: new Date() });
      fetchExpenses();
    } catch (err) {
      setExpenseError(err.message);
    }
  };

  // Handle net profit fetch
  const handleProfitFetch = (e) => {
    e.preventDefault();
    if (profitDate) fetchNetProfit(profitDate.toISOString());
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

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
              <FaReceipt className="me-2" /> Sales
            </a>
          </li>
          <li className="nav-item mb-3">
            <a className="nav-link text-white d-flex align-items-center" href="#" style={{ borderRadius: '8px', padding: '10px 15px' }}>
              <FaMoneyBillWave className="me-2" /> Earnings
            </a>
          </li>
          <li className="nav-item mb-3">
            <a className="nav-link text-white d-flex align-items-center" href="#" style={{ borderRadius: '8px', padding: '10px 15px' }}>
              <FaMoneyBillWave className="me-2" /> Expenses
            </a>
          </li>
          <li className="nav-item mb-3">
            <a className="nav-link text-white d-flex align-items-center" href="#" style={{ borderRadius: '8px', padding: '10px 15px' }}>
              <FaChartLine className="me-2" /> Net Profit
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
          <h5 className="mb-0 fw-bold">Cashier Dashboard</h5>
          <div className="d-flex align-items-center">
            <div className="position-relative me-3">
              <FaSearch className="position-absolute" style={{ top: '50%', left: '10px', transform: 'translateY(-50%)', color: '#6c757d' }} />
              <input 
                className="form-control ps-4" 
                type="search" 
                placeholder="Search" 
                style={{ width: 250, borderRadius: '20px', border: '1px solid #dee2e6' }} 
              />
            </div>
            <div className="d-flex align-items-center bg-light rounded-pill px-3 py-2">
              <FaUser className="me-2 text-primary" />
              <span className="fw-bold">{localStorage.getItem('username')}</span>
            </div>
          </div>
        </div>

        <div className="p-4" style={{ width: 1430 }}>
          <div className="row g-4">
            {/* Earnings Form */}
            <div className="col-md-4" style={{ width: 600 }}>
              <div className="card shadow-sm border-0 rounded-3 mb-4">
                <div className="card-body p-4">
                  <h6 className="card-title mb-4 fw-bold">Add Earning</h6>
                  <form onSubmit={handleEarningSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-medium">POS Amount</label>
                      <input 
                        type="number" 
                        className="form-control rounded-2" 
                        value={earning.posAmount} 
                        onChange={e => setEarning({ ...earning, posAmount: e.target.value })}
                        style={{ border: '1px solid #dee2e6' }}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium">CASH Amount</label>
                      <input 
                        type="number" 
                        className="form-control rounded-2" 
                        value={earning.cashAmount} 
                        onChange={e => setEarning({ ...earning, cashAmount: e.target.value })}
                        style={{ border: '1px solid #dee2e6' }}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium">MOMO Amount</label>
                      <input 
                        type="number" 
                        className="form-control rounded-2" 
                        value={earning.momoAmount} 
                        onChange={e => setEarning({ ...earning, momoAmount: e.target.value })}
                        style={{ border: '1px solid #dee2e6' }}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium">Date</label>
                      <div className="position-relative">
                        <DatePicker
                          selected={earning.date}
                          onChange={(date) => setEarning({ ...earning, date })}
                          className="form-control rounded-2 ps-4"
                          dateFormat="MMMM d, yyyy"
                          style={{ border: '1px solid #dee2e6' }}
                        />
                        <FaCalendarAlt 
                          className="position-absolute" 
                          style={{ 
                            top: '50%', 
                            left: '10px', 
                            transform: 'translateY(-50%)', 
                            color: '#6c757d',
                            pointerEvents: 'none'
                          }} 
                        />
                      </div>
                    </div>
                    {earningError && <div className="alert alert-danger py-2 rounded-2">{earningError}</div>}
                    <button 
                      type="submit" 
                      className="btn btn-primary mt-3 w-100 rounded-2" 
                      disabled={earningLoading}
                      style={{ padding: '10px' }}
                    >
                      {earningLoading ? 'Adding...' : 'Add Earning'}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Expenses Form */}
            <div className="col-md-4" style={{ width: 600 }}>
              <div className="card shadow-sm border-0 rounded-3 mb-4">
                <div className="card-body p-4">
                  <h6 className="card-title mb-4 fw-bold">Add Expense</h6>
                  <form onSubmit={handleExpenseSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-medium">Category</label>
                      <input 
                        type="text" 
                        className="form-control rounded-2" 
                        value={expense.category} 
                        onChange={e => setExpense({ ...expense, category: e.target.value })}
                        style={{ border: '1px solid #dee2e6' }}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium">Amount</label>
                      <input 
                        type="number" 
                        className="form-control rounded-2" 
                        value={expense.amount} 
                        onChange={e => setExpense({ ...expense, amount: e.target.value })}
                        style={{ border: '1px solid #dee2e6' }}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium">Date</label>
                      <div className="position-relative">
                        <DatePicker
                          selected={expense.date}
                          onChange={(date) => setExpense({ ...expense, date })}
                          className="form-control rounded-2 ps-4"
                          dateFormat="MMMM d, yyyy"
                          style={{ border: '1px solid #dee2e6' }}
                        />
                        <FaCalendarAlt 
                          className="position-absolute" 
                          style={{ 
                            top: '50%', 
                            left: '10px', 
                            transform: 'translateY(-50%)', 
                            color: '#6c757d',
                            pointerEvents: 'none'
                          }} 
                        />
                      </div>
                    </div>
                    {expenseError && <div className="alert alert-danger py-2 rounded-2">{expenseError}</div>}
                    <button 
                      type="submit" 
                      className="btn btn-primary mt-3 w-100 rounded-2" 
                      disabled={expenseLoading}
                      style={{ padding: '10px' }}
                    >
                      {expenseLoading ? 'Adding...' : 'Add Expense'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Tables Section */}
          <div className="row g-4 mt-2" style={{ width: 1430 }}>
            {/* Earnings Table */}
            <div className="col-md-4" style={{ width: 600 }}>
              <div className="card shadow-sm border-0 rounded-3 mb-4">
                <div className="card-body p-4">
                  <h6 className="card-title mb-4 fw-bold">Earnings</h6>
                  {earningLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : earningError ? (
                    <div className="alert alert-danger py-2 rounded-2">{earningError}</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>POS</th>
                            <th>CASH</th>
                            <th>MOMO</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {earnings.map((e, idx) => (
                            <tr key={e._id || idx}>
                              <td>{e.posAmount} Rwf</td>
                              <td>{e.cashAmount} Rwf</td>
                              <td>{e.momoAmount} Rwf</td>
                              <td>{e.date ? new Date(e.date).toLocaleDateString() : ''}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Expenses Table */}
            <div className="col-md-4" style={{ width: 600 }}>
              <div className="card shadow-sm border-0 rounded-3 mb-4">
                <div className="card-body p-4">
                  <h6 className="card-title mb-4 fw-bold">Expenses</h6>
                  {expenseLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : expenseError ? (
                    <div className="alert alert-danger py-2 rounded-2">{expenseError}</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expenses.map((ex, idx) => (
                            <tr key={ex._id || idx}>
                              <td>{ex.category}</td>
                              <td>{ex.amount} Rwf</td>
                              <td>{ex.date ? new Date(ex.date).toLocaleDateString() : ''}</td>
                            </tr>
                          ))}
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

export default CashierDashboard; 
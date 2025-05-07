import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CashierDashboard() {
  const navigate = useNavigate();
  // Sale state (updated for multiple items)
  const [sale, setSale] = useState({ items: [{ medicationName: '', quantity: '', unitPrice: '' }], paymentMethod: 'CASH', date: '' });
  const [sales, setSales] = useState([]);
  const [saleLoading, setSaleLoading] = useState(false);
  const [saleError, setSaleError] = useState('');

  // Earnings state
  const [earning, setEarning] = useState({ posAmount: '', cashAmount: '', momoAmount: '', date: '' });
  const [earnings, setEarnings] = useState([]);
  const [earningLoading, setEarningLoading] = useState(false);
  const [earningError, setEarningError] = useState('');

  // Expenses state
  const [expense, setExpense] = useState({ category: '', amount: '', date: '' });
  const [expenses, setExpenses] = useState([]);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [expenseError, setExpenseError] = useState('');

  // Net profit
  const [netProfit, setNetProfit] = useState(null);
  const [profitDate, setProfitDate] = useState('');
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
      setNetProfit(data.netProfit || data); // handle both {netProfit: ...} and direct value
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
      setSale({ items: [{ medicationName: '', quantity: '', unitPrice: '' }], paymentMethod: 'CASH', date: '' });
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
          momoAmount: Number(earning.momoAmount)
        })
      });
      if (!res.ok) throw new Error('Failed to add earning');
      setEarning({ posAmount: '', cashAmount: '', momoAmount: '', date: '' });
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
          amount: Number(expense.amount)
        })
      });
      if (!res.ok) throw new Error('Failed to add expense');
      setExpense({ category: '', amount: '', date: '' });
      fetchExpenses();
    } catch (err) {
      setExpenseError(err.message);
    }
  };

  // Handle net profit fetch
  const handleProfitFetch = (e) => {
    e.preventDefault();
    if (profitDate) fetchNetProfit(profitDate);
  };

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
          <li className="nav-item mb-2"><a className="nav-link text-white" href="#">Sales</a></li>
          <li className="nav-item mb-2"><a className="nav-link text-white" href="#">Earnings</a></li>
          <li className="nav-item mb-2"><a className="nav-link text-white" href="#">Expenses</a></li>
          <li className="nav-item mb-2"><a className="nav-link text-white" href="#">Net Profit</a></li>
          <li className="nav-item mb-2"><button className="nav-link text-white btn btn-link p-0" style={{textAlign:'left'}} onClick={handleLogout}>Logout</button></li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        {/* Top Bar */}
        <div className="d-flex justify-content-between align-items-center p-3 bg-white shadow-sm" style={{ minWidth: 0 }}>
          <h5 className="mb-0">Cashier Dashboard</h5>
          <div className="d-flex align-items-center">
            <input className="form-control me-2" type="search" placeholder="Search" style={{ width: 200 }} />
            <span className="fw-bold" style={{ fontSize: 16 }}>{localStorage.getItem('username')}</span>
          </div>
        </div>

        <div className="w-100 px-4 mt-4" style={{ maxWidth: '100%' }}>
          <div className="row g-4">
            {/* Sale Form (multiple items) */}
            <div className="col-md-4">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h6 className="card-title mb-3">Add Sale</h6>
                  <form onSubmit={handleSaleSubmit}>
                    {sale.items.map((item, idx) => (
                      <div className="row mb-2" key={idx}>
                        <div className="col-5">
                          <input type="text" className="form-control" placeholder="Medication Name" value={item.medicationName} onChange={e => handleSaleItemChange(idx, 'medicationName', e.target.value)} />
                        </div>
                        <div className="col-3">
                          <input type="number" className="form-control" placeholder="Qty" value={item.quantity} onChange={e => handleSaleItemChange(idx, 'quantity', e.target.value)} />
                        </div>
                        <div className="col-3">
                          <input type="number" className="form-control" placeholder="Unit Price" value={item.unitPrice} onChange={e => handleSaleItemChange(idx, 'unitPrice', e.target.value)} />
                        </div>
                        <div className="col-1 d-flex align-items-center">
                          {sale.items.length > 1 && <button type="button" className="btn btn-danger btn-sm" onClick={() => removeSaleItem(idx)}>-</button>}
                        </div>
                      </div>
                    ))}
                    <button type="button" className="btn btn-secondary btn-sm mb-2" onClick={addSaleItem}>+ Add Item</button>
                    <div className="mb-2">
                      <label className="form-label">Payment Method</label>
                      <select className="form-select" value={sale.paymentMethod} onChange={e => setSale({ ...sale, paymentMethod: e.target.value })}>
                        <option value="CASH">CASH</option>
                        <option value="POS">POS</option>
                        <option value="MOMO">MOMO</option>
                      </select>
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Date</label>
                      <input type="date" className="form-control" value={sale.date} onChange={e => setSale({ ...sale, date: e.target.value })} />
                    </div>
                    <div className="mb-2">
                      <strong>Total Price: </strong>{totalSalePrice} Rwf
                    </div>
                    {saleError && <div className="alert alert-danger py-1">{saleError}</div>}
                    <button type="submit" className="btn btn-primary mt-2 w-100" disabled={saleLoading}>Add Sale</button>
                  </form>
                </div>
              </div>
            </div>
            {/* Earnings Form */}
            <div className="col-md-4">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h6 className="card-title mb-3">Add Earning</h6>
                  <form onSubmit={handleEarningSubmit}>
                    <div className="mb-2">
                      <label className="form-label">POS Amount</label>
                      <input type="number" className="form-control" value={earning.posAmount} onChange={e => setEarning({ ...earning, posAmount: e.target.value })} />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">CASH Amount</label>
                      <input type="number" className="form-control" value={earning.cashAmount} onChange={e => setEarning({ ...earning, cashAmount: e.target.value })} />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">MOMO Amount</label>
                      <input type="number" className="form-control" value={earning.momoAmount} onChange={e => setEarning({ ...earning, momoAmount: e.target.value })} />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Date</label>
                      <input type="date" className="form-control" value={earning.date} onChange={e => setEarning({ ...earning, date: e.target.value })} />
                    </div>
                    {earningError && <div className="alert alert-danger py-1">{earningError}</div>}
                    <button type="submit" className="btn btn-primary mt-2 w-100" disabled={earningLoading}>Add Earning</button>
                  </form>
                </div>
              </div>
            </div>
            {/* Expenses Form */}
            <div className="col-md-4">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h6 className="card-title mb-3">Add Expense</h6>
                  <form onSubmit={handleExpenseSubmit}>
                    <div className="mb-2">
                      <label className="form-label">Category</label>
                      <input type="text" className="form-control" value={expense.category} onChange={e => setExpense({ ...expense, category: e.target.value })} />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Amount</label>
                      <input type="number" className="form-control" value={expense.amount} onChange={e => setExpense({ ...expense, amount: e.target.value })} />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Date</label>
                      <input type="date" className="form-control" value={expense.date} onChange={e => setExpense({ ...expense, date: e.target.value })} />
                    </div>
                    {expenseError && <div className="alert alert-danger py-1">{expenseError}</div>}
                    <button type="submit" className="btn btn-primary mt-2 w-100" disabled={expenseLoading}>Add Expense</button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Net Profit Stat Card */}
          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h6 className="card-title mb-3">Net Profit</h6>
                  <form onSubmit={handleProfitFetch} className="d-flex align-items-end">
                    <div className="me-2">
                      <label className="form-label">Date</label>
                      <input type="date" className="form-control" value={profitDate} onChange={e => setProfitDate(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-info">Fetch</button>
                  </form>
                  {profitLoading ? <div>Loading...</div> : profitError ? <div className="alert alert-danger py-1 mt-2">{profitError}</div> : netProfit !== null && (
                    <div className="mt-3">
                      <h2 className="text-primary">{netProfit} Rwf</h2>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tables for Sales, Earnings, Expenses */}
          <div className="row g-4">
            {/* Sales Table (updated) */}
            <div className="col-md-4">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h6 className="card-title mb-3">Sales</h6>
                  {saleLoading ? <div>Loading...</div> : saleError ? <div className="alert alert-danger py-1">{saleError}</div> : (
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Total Price</th>
                        <th>Payment Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((s) => (
                        <tr key={s._id}>
                          <td>{s.date ? new Date(s.date).toLocaleDateString() : ''}</td>
                          <td>
                            <ul className="mb-0 ps-3">
                              {s.items.map((item, idx) => (
                                <li key={idx}>
                                  {item.medicationName} x{item.quantity} @ {item.unitPrice} Rwf
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td>{s.totalPrice} Rwf</td>
                          <td>{s.paymentMethod}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  )}
                </div>
              </div>
            </div>
            {/* Earnings Table */}
            <div className="col-md-4">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h6 className="card-title mb-3">Earnings</h6>
                  {earningLoading ? <div>Loading...</div> : earningError ? <div className="alert alert-danger py-1">{earningError}</div> : (
                  <table className="table table-sm">
                    <thead>
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
                  )}
                </div>
              </div>
            </div>
            {/* Expenses Table */}
            <div className="col-md-4">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h6 className="card-title mb-3">Expenses</h6>
                  {expenseLoading ? <div>Loading...</div> : expenseError ? <div className="alert alert-danger py-1">{expenseError}</div> : (
                  <table className="table table-sm">
                    <thead>
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
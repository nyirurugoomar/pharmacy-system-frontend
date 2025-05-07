import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function PharmacistDashboard() {
  const navigate = useNavigate();
  // Medicine state
  const [medicine, setMedicine] = useState({ name: '', stock: '', price: '', description: '', available: true });
  const [medicines, setMedicines] = useState([]);
  const [updateStock, setUpdateStock] = useState({ name: '', stock: '' });
  const [medLoading, setMedLoading] = useState(false);
  const [medError, setMedError] = useState('');

  // Insurance record state
  const [insuranceRecord, setInsuranceRecord] = useState({ insuranceCompany: '', clientCount: '', date: '' });
  const [insuranceRecords, setInsuranceRecords] = useState([]);
  const [insRecLoading, setInsRecLoading] = useState(false);
  const [insRecError, setInsRecError] = useState('');

  // Insurance payment state (updated fields)
  const [insurancePayment, setInsurancePayment] = useState({ insuranceCompany: '', amount: '', status: 'Paid', date: '' });
  const [insurancePayments, setInsurancePayments] = useState([]);
  const [insPayLoading, setInsPayLoading] = useState(false);
  const [insPayError, setInsPayError] = useState('');

  const API = 'https://pharmacy-system-efz8.onrender.com/pharmacist';
  const token = localStorage.getItem('token');
  const authHeader = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };

  // Fetch all medicines
  const fetchMedicines = async () => {
    setMedLoading(true); setMedError('');
    try {
      const res = await fetch(`${API}/all-medicine`, { headers: authHeader });
      if (!res.ok) throw new Error('Failed to fetch medicines');
      const data = await res.json();
      setMedicines(data);
    } catch (err) {
      setMedError(err.message);
    } finally {
      setMedLoading(false);
    }
  };

  // Fetch insurance records
  const fetchInsuranceRecords = async () => {
    setInsRecLoading(true); setInsRecError('');
    try {
      const res = await fetch(`${API}/insurance-records`, { headers: authHeader });
      if (!res.ok) throw new Error('Failed to fetch insurance records');
      const data = await res.json();
      setInsuranceRecords(data);
    } catch (err) {
      setInsRecError(err.message);
    } finally {
      setInsRecLoading(false);
    }
  };

  // Fetch insurance payments
  const fetchInsurancePayments = async () => {
    setInsPayLoading(true); setInsPayError('');
    try {
      const res = await fetch(`${API}/insurance-payments`, { headers: authHeader });
      if (!res.ok) throw new Error('Failed to fetch insurance payments');
      const data = await res.json();
      setInsurancePayments(data);
    } catch (err) {
      setInsPayError(err.message);
    } finally {
      setInsPayLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
    fetchInsuranceRecords();
    fetchInsurancePayments();
    // eslint-disable-next-line
  }, []);

  // Add Medicine
  const handleMedicineSubmit = async (e) => {
    e.preventDefault();
    setMedError('');
    try {
      const res = await fetch(`${API}/create-medicine`, {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify({
          ...medicine,
          stock: Number(medicine.stock),
          price: Number(medicine.price),
        })
      });
      if (!res.ok) throw new Error('Failed to add medicine');
      setMedicine({ name: '', stock: '', price: '', description: '', available: true });
      fetchMedicines();
    } catch (err) {
      setMedError(err.message);
    }
  };

  // Update Stock
  const handleUpdateStock = async (e) => {
    e.preventDefault();
    setMedError('');
    try {
      const res = await fetch(`${API}/update-stock/${updateStock.name}`, {
        method: 'PUT',
        headers: authHeader,
        body: JSON.stringify({ quantity: Number(updateStock.stock) })
      });
      if (!res.ok) throw new Error('Failed to update stock');
      setUpdateStock({ name: '', stock: '' });
      fetchMedicines();
    } catch (err) {
      setMedError(err.message);
    }
  };

  // Add Insurance Record
  const handleInsuranceRecordSubmit = async (e) => {
    e.preventDefault();
    setInsRecError('');
    try {
      const res = await fetch(`${API}/insurance-record`, {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify({
          ...insuranceRecord,
          clientCount: Number(insuranceRecord.clientCount)
        })
      });
      if (!res.ok) throw new Error('Failed to add insurance record');
      setInsuranceRecord({ insuranceCompany: '', clientCount: '', date: '' });
      fetchInsuranceRecords();
    } catch (err) {
      setInsRecError(err.message);
    }
  };

  // Add Insurance Payment (updated fields)
  const handleInsurancePaymentSubmit = async (e) => {
    e.preventDefault();
    setInsPayError('');
    try {
      const res = await fetch(`${API}/insurance-payment`, {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify({
          ...insurancePayment,
          amount: Number(insurancePayment.amount)
        })
      });
      if (!res.ok) throw new Error('Failed to add insurance payment');
      setInsurancePayment({ insuranceCompany: '', amount: '', status: 'Paid', date: '' });
      fetchInsurancePayments();
    } catch (err) {
      setInsPayError(err.message);
    }
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
          <li className="nav-item mb-2"><a className="nav-link text-white" href="#">Medicines</a></li>
          <li className="nav-item mb-2"><a className="nav-link text-white" href="#">Insurance</a></li>
          <li className="nav-item mb-2"><button className="nav-link text-white btn btn-link p-0" style={{textAlign:'left'}} onClick={handleLogout}>Logout</button></li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        {/* Top Bar */}
        <div className="d-flex justify-content-between align-items-center p-3 bg-white shadow-sm" style={{ minWidth: 0 }}>
          <h5 className="mb-0">Pharmacist Dashboard</h5>
          <div className="d-flex align-items-center">
            <input className="form-control me-2" type="search" placeholder="Search" style={{ width: 200 }} />
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" className="rounded-circle" width={40} height={40} />
          </div>
        </div>

        <div className="w-100 px-4 mt-4" style={{ maxWidth: '100%' }}>
          <div className="row g-4">
            {/* Add Medicine */}
            <div className="col-md-6">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h6 className="card-title mb-3">Add Medicine</h6>
                  <form onSubmit={handleMedicineSubmit}>
                    <div className="mb-2">
                      <label className="form-label">Name</label>
                      <input type="text" className="form-control" value={medicine.name} onChange={e => setMedicine({ ...medicine, name: e.target.value })} />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Stock</label>
                      <input type="number" className="form-control" value={medicine.stock} onChange={e => setMedicine({ ...medicine, stock: e.target.value })} />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Price</label>
                      <input type="number" className="form-control" value={medicine.price} onChange={e => setMedicine({ ...medicine, price: e.target.value })} />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Description</label>
                      <input type="text" className="form-control" value={medicine.description} onChange={e => setMedicine({ ...medicine, description: e.target.value })} />
                    </div>
                    <div className="mb-2 form-check">
                      <input type="checkbox" className="form-check-input" id="availableCheck" checked={medicine.available} onChange={e => setMedicine({ ...medicine, available: e.target.checked })} />
                      <label className="form-check-label" htmlFor="availableCheck">Available</label>
                    </div>
                    {medError && <div className="alert alert-danger py-1">{medError}</div>}
                    <button type="submit" className="btn btn-primary mt-2 w-100" disabled={medLoading}>Add Medicine</button>
                  </form>
                </div>
              </div>
            </div>
            {/* Update Stock */}
            <div className="col-md-6">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h6 className="card-title mb-3">Update Stock</h6>
                  <form onSubmit={handleUpdateStock} className="row g-2 align-items-end">
                    <div className="col-7">
                      <label className="form-label">Medicine Name</label>
                      <input type="text" className="form-control" value={updateStock.name} onChange={e => setUpdateStock({ ...updateStock, name: e.target.value })} />
                    </div>
                    <div className="col-3">
                      <label className="form-label">Stock</label>
                      <input type="number" className="form-control" value={updateStock.stock} onChange={e => setUpdateStock({ ...updateStock, stock: e.target.value })} />
                    </div>
                    <div className="col-2">
                      <button type="submit" className="btn btn-warning w-100" disabled={medLoading}>Update</button>
                    </div>
                  </form>
                  {medError && <div className="alert alert-danger py-1 mt-2">{medError}</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Medicines Table */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h6 className="card-title mb-3">All Medicines</h6>
                  {medLoading ? <div>Loading...</div> : medError ? <div className="alert alert-danger py-1">{medError}</div> : (
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Stock</th>
                        <th>Price</th>
                        <th>Description</th>
                        <th>Available</th>
                        <th>Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicines.map((m) => (
                        <tr key={m._id}>
                          <td>{m.name}</td>
                          <td>{m.stock}</td>
                          <td>{m.price} Rwf</td>
                          <td>{m.description}</td>
                          <td>{m.available ? 'Yes' : 'No'}</td>
                          <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Insurance Records and Payments */}
          <div className="row g-4">
            {/* Add Insurance Record */}
            <div className="col-md-6">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h6 className="card-title mb-3">Add Insurance Record</h6>
                  <form onSubmit={handleInsuranceRecordSubmit}>
                    <div className="mb-2">
                      <label className="form-label">Insurance Company</label>
                      <input type="text" className="form-control" value={insuranceRecord.insuranceCompany} onChange={e => setInsuranceRecord({ ...insuranceRecord, insuranceCompany: e.target.value })} />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Client Count</label>
                      <input type="number" className="form-control" value={insuranceRecord.clientCount} onChange={e => setInsuranceRecord({ ...insuranceRecord, clientCount: e.target.value })} />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Date</label>
                      <input type="date" className="form-control" value={insuranceRecord.date} onChange={e => setInsuranceRecord({ ...insuranceRecord, date: e.target.value })} />
                    </div>
                    {insRecError && <div className="alert alert-danger py-1">{insRecError}</div>}
                    <button type="submit" className="btn btn-primary mt-2 w-100" disabled={insRecLoading}>Add Record</button>
                  </form>
                </div>
              </div>
            </div>
            {/* Add Insurance Payment */}
            <div className="col-md-6">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h6 className="card-title mb-3">Add Insurance Payment</h6>
                  <form onSubmit={handleInsurancePaymentSubmit}>
                    <div className="mb-2">
                      <label className="form-label">Insurance Company</label>
                      <input type="text" className="form-control" value={insurancePayment.insuranceCompany} onChange={e => setInsurancePayment({ ...insurancePayment, insuranceCompany: e.target.value })} />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Amount</label>
                      <input type="number" className="form-control" value={insurancePayment.amount} onChange={e => setInsurancePayment({ ...insurancePayment, amount: e.target.value })} />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={insurancePayment.status} onChange={e => setInsurancePayment({ ...insurancePayment, status: e.target.value })}>
                        <option value="Paid">Paid</option>
                        <option value="Not Paid">Not Paid</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Date</label>
                      <input type="date" className="form-control" value={insurancePayment.date} onChange={e => setInsurancePayment({ ...insurancePayment, date: e.target.value })} />
                    </div>
                    {insPayError && <div className="alert alert-danger py-1">{insPayError}</div>}
                    <button type="submit" className="btn btn-primary mt-2 w-100" disabled={insPayLoading}>Add Payment</button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Insurance Records Table */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h6 className="card-title mb-3">Insurance Records</h6>
                  {insRecLoading ? <div>Loading...</div> : insRecError ? <div className="alert alert-danger py-1">{insRecError}</div> : (
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Insurance Company</th>
                        <th>Client Count</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {insuranceRecords.map((rec) => (
                        <tr key={rec._id}>
                          <td>{rec.insuranceCompany}</td>
                          <td>{rec.clientCount}</td>
                          <td>{new Date(rec.date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  )}
                </div>
              </div>
            </div>
            {/* Insurance Payments Table */}
            <div className="col-md-6">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h6 className="card-title mb-3">Insurance Payments</h6>
                  {insPayLoading ? <div>Loading...</div> : insPayError ? <div className="alert alert-danger py-1">{insPayError}</div> : (
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Insurance Company</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {insurancePayments.map((pay) => (
                        <tr key={pay._id}>
                          <td>{pay.insuranceCompany}</td>
                          <td>${pay.amount}</td>
                          <td>{pay.status}</td>
                          <td>{new Date(pay.date).toLocaleDateString()}</td>
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

export default PharmacistDashboard; 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('https://pharmacy-system-efz8.onrender.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok && data.access_token && data.user) {
        localStorage.setItem('token', data.access_token);
        // Redirect based on user role from backend
        const userRole = data.user.role;
        if (userRole === 'cashier') navigate('/cashier');
        else if (userRole === 'pharmacist') navigate('/pharmacist');
        else if (userRole === 'stock-keeper') navigate('/stock-keeper');
        else if (userRole === 'admin') navigate('/admin');
        else navigate('/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh',width: 1340, display: 'flex', alignItems: 'stretch', background: 'linear-gradient(90deg, #f4f6fa 60%, #e9ecef 100%)' }}>
      {/* Left: Login Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div style={{ width: 350, maxWidth: '90%' }}>
          <h2 className="mb-2" style={{ fontWeight: 700 }}>Welcome Back!</h2>
          <div className="mb-4 text-muted">Please enter your login details below</div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input type="text" className="form-control" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span></span>
              
            </div>
            {error && <div className="alert alert-danger py-1">{error}</div>}
            <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          
        </div>
      </div>
      {/* Right: Pharmacy Illustration */}
      <div style={{
        flex: 1,
        background: '#181a20',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: 32,
        borderBottomLeftRadius: 32,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <img
          src="https://media.istockphoto.com/id/1135284188/photo/if-you-need-its-here.jpg?s=612x612&w=0&k=20&c=2yfZHUqTEGW4-5r4Sc4pzWKx0DtubpdbTkX3h_w1AJg="
          alt="Pharmacy"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1,
            borderTopLeftRadius: 32,
            borderBottomLeftRadius: 32
          }}
        />
        <div style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(24,26,32,0.55)'
        }}>
          <h3 style={{ fontWeight: 600 }}>Manage your Pharmacy Anywhere</h3>
          
        </div>
      </div>
    </div>
  );
}

export default Login; 
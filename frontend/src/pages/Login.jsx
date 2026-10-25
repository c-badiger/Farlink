import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowRight, Shield, Wheat, User, Store } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await login({ identifier, password });
      if (res.success && res.user) {
        const from = location.state?.from?.pathname;
        if (from) {
          navigate(from, { replace: true });
        } else if (res.user.role === 'farmer') {
          navigate('/farmer/dashboard');
        } else if (res.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/buyer/dashboard');
        }
      } else {
        setError(res.message || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to authentication service.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (email) => {
    setIdentifier(email);
    setPassword('Password@123');
  };

  return (
    <div style={{ padding: '3.5rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
        <div className="card" style={{ padding: '2.25rem', backgroundColor: '#ffffff' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
              {t('login')}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Access your Farmer, Buyer, or Administrator portal
            </p>
          </div>

          {error && (
            <div style={{ backgroundColor: 'var(--danger-soft)', color: 'var(--danger)', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address or Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  placeholder="e.g. basavaraj.farmer@farmersgranary.test"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginTop: '0.5rem' }}
            >
              {loading ? 'Authenticating...' : t('login')}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-earth)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem', textAlign: 'center' }}>
              ⚡ 1-Click Demonstration Accounts
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@farmersgranary.test')}
                className="btn btn-outline btn-sm"
                style={{ justifyContent: 'flex-start', fontSize: '0.78rem' }}
              >
                <Shield size={14} color="var(--secondary)" /> Admin Panel
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('ramesh.farmer@farmersgranary.test')}
                className="btn btn-outline btn-sm"
                style={{ justifyContent: 'flex-start', fontSize: '0.78rem' }}
              >
                <Wheat size={14} color="var(--primary)" /> Farmer (Mandya)
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('basavaraj.farmer@farmersgranary.test')}
                className="btn btn-outline btn-sm"
                style={{ justifyContent: 'flex-start', fontSize: '0.78rem' }}
              >
                <Wheat size={14} color="var(--primary)" /> Farmer (Dharwad)
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('anand.buyer@farmersgranary.test')}
                className="btn btn-outline btn-sm"
                style={{ justifyContent: 'flex-start', fontSize: '0.78rem' }}
              >
                <User size={14} /> Consumer Buyer
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('mysore.traders@farmersgranary.test')}
                className="btn btn-outline btn-sm"
                style={{ gridColumn: 'span 2', justifyContent: 'center', fontSize: '0.78rem' }}
              >
                <Store size={14} color="var(--accent-earth)" /> Kaveri Wholesale Trader (Mysuru)
              </button>
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Demo Password: <code>Password@123</code>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Don't have an account yet?{' '}
            <Link to="/register" style={{ fontWeight: 700, color: 'var(--primary)' }}>
              {t('register')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

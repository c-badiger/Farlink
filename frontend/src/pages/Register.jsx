import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, ShoppingBag, AlertCircle, CheckCircle, Wheat, Store, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const { t } = useLanguage();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('farmer'); // 'farmer' or 'buyer'
  const [buyerType, setBuyerType] = useState('individual'); // 'individual', 'retailer', 'wholesaler'

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    preferred_language: 'en',
    // Farmer fields
    farm_name: '',
    experience_years: '5',
    district: 'Mandya',
    taluk: '',
    village: '',
    pincode: '',
    farm_size_acres: '3',
    primary_crops: '',
    bio: '',
    // Buyer fields
    business_name: '',
    gst_number: '',
    trade_license: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const karnatakaDistricts = [
    'Bagalkote', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban',
    'Bidar', 'Chamarajanagar', 'Chikkaballapura', 'Chikkamagaluru', 'Chitradurga',
    'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan',
    'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal',
    'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga',
    'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura', 'Yadgir'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        role,
        buyer_type: role === 'buyer' ? buyerType : null
      };

      const res = await register(payload);
      if (res.success && res.user) {
        if (role === 'farmer') {
          navigate('/farmer/dashboard');
        } else {
          navigate('/buyer/dashboard');
        }
      } else {
        setError(res.message || 'Registration failed. Please check your details.');
      }
    } catch (err) {
      setError(err.message || 'Failed to communicate with registration service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '680px' }}>
        <div className="card" style={{ padding: '2.5rem', backgroundColor: '#ffffff' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
              Join Farmer's Online Granary
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Direct agricultural trade across Karnataka's farming communities
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <button
              type="button"
              onClick={() => setRole('farmer')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '2px solid',
                borderColor: role === 'farmer' ? 'var(--primary)' : 'var(--border-subtle)',
                backgroundColor: role === 'farmer' ? 'var(--primary-soft)' : '#ffffff',
                color: role === 'farmer' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Wheat size={20} />
              <span>I am a Farmer / Producer</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('buyer')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '2px solid',
                borderColor: role === 'buyer' ? 'var(--secondary)' : 'var(--border-subtle)',
                backgroundColor: role === 'buyer' ? 'var(--secondary-soft)' : '#ffffff',
                color: role === 'buyer' ? 'var(--secondary)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <ShoppingBag size={20} />
              <span>I am a Buyer (Consumer / Mandi)</span>
            </button>
          </div>

          {error && (
            <div style={{ backgroundColor: 'var(--danger-soft)', color: 'var(--danger)', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* General Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  name="full_name"
                  placeholder="e.g. Ramesh Gowda"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  required
                  name="email"
                  placeholder="e.g. ramesh@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">10-Digit Mobile Number *</label>
                <input
                  type="tel"
                  required
                  name="phone"
                  placeholder="e.g. 9845012345"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password * (Min 6 chars)</label>
                <input
                  type="password"
                  required
                  name="password"
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* Buyer Specific Fields */}
            {role === 'buyer' && (
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '1rem' }}>
                  Buyer Category
                </h3>

                <div className="form-group">
                  <label className="form-label">Account Type</label>
                  <select
                    value={buyerType}
                    onChange={(e) => setBuyerType(e.target.value)}
                    className="form-select"
                  >
                    <option value="individual">Individual Consumer / Household</option>
                    <option value="retailer">Local Retail Grocery Store</option>
                    <option value="wholesaler">Mandi Bulk Wholesaler / Trader</option>
                  </select>
                </div>

                {(buyerType === 'retailer' || buyerType === 'wholesaler') && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Business / Firm Name</label>
                      <input
                        type="text"
                        name="business_name"
                        placeholder="e.g. Kaveri Agro Traders"
                        value={formData.business_name}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">GST Number (Optional)</label>
                      <input
                        type="text"
                        name="gst_number"
                        placeholder="29AAAAA0000A1Z5"
                        value={formData.gst_number}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Farmer Specific Fields */}
            {role === 'farmer' && (
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem' }}>
                  Farm Landholding & Location (Karnataka)
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Farm / Holding Name *</label>
                    <input
                      type="text"
                      required
                      name="farm_name"
                      placeholder="e.g. Kaveri Basin Organic Farm"
                      value={formData.farm_name}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Karnataka District *</label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      {karnatakaDistricts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Taluk *</label>
                    <input
                      type="text"
                      required
                      name="taluk"
                      placeholder="e.g. Srirangapatna / Navalgund"
                      value={formData.taluk}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Village *</label>
                    <input
                      type="text"
                      required
                      name="village"
                      placeholder="e.g. Ganjam / Morab"
                      value={formData.village}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      placeholder="e.g. 571477"
                      value={formData.pincode}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Holding Size (Acres)</label>
                    <input
                      type="number"
                      step="0.5"
                      name="farm_size_acres"
                      value={formData.farm_size_acres}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Primary Crops Grown</label>
                  <input
                    type="text"
                    name="primary_crops"
                    placeholder="e.g. Sona Masoori Rice, Ragi, Foxtail Millet, Byadgi Chilli"
                    value={formData.primary_crops}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '1.5rem' }}
            >
              {loading ? 'Creating Account...' : `Register as ${role === 'farmer' ? 'Farmer' : 'Buyer'}`}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary)' }}>
              {t('login')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

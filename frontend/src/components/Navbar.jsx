import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Sprout, ShoppingBag, Globe, User, LogOut, ChevronDown, Shield, Wheat } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'farmer') return '/farmer/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/buyer/dashboard';
  };

  const getDashboardLabel = () => {
    if (!user) return t('dashboard');
    if (user.role === 'farmer') return t('farmer_dashboard');
    if (user.role === 'admin') return t('admin_panel');
    return t('buyer_dashboard');
  };

  return (
    <>
      {/* Demonstration Pilot Notice Banner */}
      <div className="demo-banner">
        <span>🌾 <strong>{t('demo_disclaimer_title')}:</strong> {t('demo_disclaimer_text')}</span>
      </div>

      <header className="navbar-header">
        <div className="container navbar-inner">
          {/* Brand Logo */}
          <Link to="/" className="brand-logo">
            <Sprout size={28} />
            <div>
              <div>{t('brand_name')}</div>
              <span className="brand-sub">{t('tagline')}</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav>
            <ul className="nav-links">
              <li>
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  {t('home')}
                </NavLink>
              </li>
              <li>
                <NavLink to="/marketplace" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  {t('marketplace')}
                </NavLink>
              </li>
              <li>
                <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  {t('about')}
                </NavLink>
              </li>
              <li>
                <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  {t('contact')}
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="nav-actions">
            {/* Language Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', padding: '2px' }}>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                style={{
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  background: language === 'en' ? 'var(--primary)' : 'transparent',
                  color: language === 'en' ? '#ffffff' : 'var(--text-muted)'
                }}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('kn')}
                style={{
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  background: language === 'kn' ? 'var(--primary)' : 'transparent',
                  color: language === 'kn' ? '#ffffff' : 'var(--text-muted)'
                }}
              >
                ಕನ್ನಡ
              </button>
            </div>

            {/* Shopping Cart Button */}
            <Link to="/cart" className="btn-icon" style={{ position: 'relative' }} title={t('cart')}>
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    backgroundColor: 'var(--secondary)',
                    color: '#ffffff',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #ffffff'
                  }}
                >
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Dropdown or Login Buttons */}
            {isAuthenticated ? (
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="btn btn-outline btn-sm"
                  style={{ gap: '8px' }}
                >
                  <User size={16} />
                  <span>{user.full_name?.split(' ')[0]}</span>
                  <span className="badge badge-district" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>
                    {user.role}
                  </span>
                  <ChevronDown size={14} />
                </button>

                {dropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '110%',
                      width: '220px',
                      backgroundColor: '#ffffff',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      border: '1px solid var(--border-subtle)',
                      padding: '8px 0',
                      zIndex: 200
                    }}
                  >
                    <div style={{ padding: '8px 16px', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.full_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                    </div>

                    <Link
                      to={getDashboardLink()}
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        fontSize: '0.875rem',
                        color: 'var(--primary)',
                        fontWeight: 600
                      }}
                    >
                      <Wheat size={16} />
                      {getDashboardLabel()}
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 16px',
                          fontSize: '0.875rem',
                          color: 'var(--secondary)',
                          fontWeight: 600
                        }}
                      >
                        <Shield size={16} />
                        {t('admin_panel')}
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 16px',
                        fontSize: '0.875rem',
                        color: 'var(--danger)',
                        fontWeight: 600,
                        borderTop: '1px solid #f1f5f9'
                      }}
                    >
                      <LogOut size={16} />
                      {t('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link to="/login" className="btn btn-outline btn-sm">
                  {t('login')}
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  {t('register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;

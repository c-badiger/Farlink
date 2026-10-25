import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Heart, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer style={{ backgroundColor: '#132e22', color: '#e2e8f0', paddingTop: '3.5rem', paddingBottom: '2rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ffffff', fontWeight: 800, fontSize: '1.25rem', marginBottom: '1rem' }}>
              <Sprout size={28} color="var(--secondary)" />
              <span>{t('brand_name')}</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              {t('hero_subtitle')}
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
              <ShieldCheck size={16} color="#34d399" />
              <span>Karnataka Bhoomi RTC Verification Support</span>
            </div>
          </div>

          {/* Districts Covered */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Karnataka Focus Regions
            </h4>
            <ul style={{ listStyle: 'none', fontSize: '0.875rem', color: '#94a3b8', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <li>Mandya (ಮಂಡ್ಯ)</li>
              <li>Dharwad (ಧಾರವಾಡ)</li>
              <li>Mysuru (ಮೈಸೂರು)</li>
              <li>Uttara Kannada (ಉತ್ತರ ಕನ್ನಡ)</li>
              <li>Kalaburagi (ಕಲಬುರಗಿ)</li>
              <li>Haveri / Byadgi (ಹಾವೇರಿ)</li>
              <li>Chikkamagaluru (ಚಿಕ್ಕಮಗಳೂರು)</li>
              <li>Belagavi (ಬೆಳಗಾವಿ)</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Marketplace Navigation
            </h4>
            <ul style={{ listStyle: 'none', fontSize: '0.875rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li><Link to="/marketplace" style={{ transition: 'color 0.2s' }}>{t('marketplace')}</Link></li>
              <li><Link to="/about" style={{ transition: 'color 0.2s' }}>{t('about')}</Link></li>
              <li><Link to="/contact" style={{ transition: 'color 0.2s' }}>{t('contact')}</Link></li>
              <li><Link to="/register" style={{ transition: 'color 0.2s' }}>{t('join_as_farmer')}</Link></li>
              <li><Link to="/login" style={{ transition: 'color 0.2s' }}>{t('login')}</Link></li>
            </ul>
          </div>

          {/* Contact & Transparency */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Karnataka Agri Desk
            </h4>
            <div style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="var(--secondary)" />
                <span>APMC Yard Junction, Karnataka, India</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} color="var(--secondary)" />
                <span>Kisan Helpline: 1800-425-3553 (Pilot)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} color="var(--secondary)" />
                <span>support@farmersgranary.test</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
          <div>
            © {new Date().getFullYear()} Farmer's Online Granary (ರೈತರ ಆನ್‌ಲೈನ್ ಗ್ರಾನರಿ). Pilot Agricultural Initiative.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Built for Karnataka Growers & Consumers with Direct Farm Transparency
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

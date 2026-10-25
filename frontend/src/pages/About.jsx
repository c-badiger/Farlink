import React from 'react';
import { Sprout, ShieldCheck, Scale, Users, MapPin, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const About = () => {
  const { t } = useLanguage();

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="badge badge-district" style={{ marginBottom: '0.75rem' }}>
            Our Karnataka Agri Mission
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
            Empowering Karnataka Farmers with Direct Market Access
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Bridging the gap between agricultural producers across Karnataka's 31 districts and households, retailers, and wholesale traders.
          </p>
        </div>

        {/* Pilot Transparency Notice */}
        <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fde047', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '3rem', display: 'flex', gap: '1rem' }}>
          <AlertCircle size={24} color="#854d0e" style={{ flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#854d0e', marginBottom: '0.35rem' }}>
              Transparency & Pilot Demonstration Disclosure
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#713f12', lineHeight: 1.6 }}>
              Farmer's Online Granary operates as a full-stack digital marketplace prototype. All sample farmer profiles, listings, price histories, reviews, and test statistics are simulated demonstration records designed to validate authentic agricultural workflows. Seller-declared organic and natural claims are clearly logged and never falsely represented as third-party government certifications.
            </p>
          </div>
        </div>

        {/* Pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginBottom: '3.5rem' }}>
          <div className="card">
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Scale size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary)' }}>
              Fair Farm-Gate Pricing
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Eliminating intermediaries gives growers the price realization they deserve while delivering transparent market rates to consumers and mandis.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--secondary-soft)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--secondary-hover)' }}>
              Bhoomi RTC Verification
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Growers submit government RTC (Record of Rights, Tenancy and Crops) survey numbers for administrative review before receiving official verification.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0369a1' }}>
              Regional & Bilingual
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Full Kannada interface tailored for local taluks, APMC mandis, and village communities with intuitive navigation for non-technical users.
            </p>
          </div>
        </div>

        {/* Karnataka Regional Context */}
        <div className="card" style={{ padding: '2.5rem', backgroundColor: '#ffffff' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
            Connecting Karnataka's Agro-Climatic Zones
          </h2>
          <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '1rem' }}>
            From the fertile Cauvery basin in Mandya growing world-renowned Sona Masoori rice and sugarcane jaggery, to the black cotton drylands of Dharwad producing indigenous Foxtail Millets (Navane) and Byadgi chillies, to the pristine Western Ghats hills of Sirsi and Coorg known for bold black pepper and green cardamom — Farmer's Online Granary connects consumers directly to the source.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-earth)', fontWeight: 600, fontSize: '0.9rem' }}>
            <MapPin size={18} /> Primary operating regions: Mandya, Dharwad, Uttara Kannada, Mysuru, Haveri, Kalaburagi, and Bengaluru.
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

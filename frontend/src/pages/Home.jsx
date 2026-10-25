import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  ArrowRight,
  ShieldCheck,
  Percent,
  Languages,
  Truck,
  MapPin,
  TrendingUp,
  Wheat,
  Search
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';

export const Home = () => {
  const { t, getLocalized } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes, distRes] = await Promise.all([
          api.getCategories(),
          api.getProducts({ limit: 8, sort: 'newest' }),
          api.getDistricts()
        ]);

        if (catRes.success) setCategories(catRes.categories || []);
        if (prodRes.success) setFeaturedProducts(prodRes.products || []);
        if (distRes.success) setDistricts(distRes.districts || []);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* 1. Hero Section */}
      <section
        style={{
          position: 'relative',
          background: 'linear-gradient(rgba(19, 46, 34, 0.88), rgba(27, 67, 50, 0.94)), url("https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80") center/cover no-repeat',
          color: '#ffffff',
          padding: '5rem 0 6rem 0'
        }}
      >
        <div className="container" style={{ textAlign: 'center', maxWidth: '860px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '1.5rem'
            }}
          >
            <ShieldCheck size={16} color="#34d399" />
            <span>Karnataka Direct Farm Marketplace • ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲದ ನೇರ ಕೃಷಿ ವಹಿವಾಟು</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
              fontWeight: 800,
              lineHeight: 1.18,
              letterSpacing: '-0.025em',
              marginBottom: '1.25rem',
              color: '#ffffff'
            }}
          >
            {t('hero_title')}
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: '#e2e8f0',
              lineHeight: 1.6,
              marginBottom: '2.5rem',
              maxWidth: '750px',
              margin: '0 auto 2.5rem auto'
            }}
          >
            {t('hero_subtitle')}
          </p>

          {/* Quick Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = `/marketplace?search=${encodeURIComponent(searchQuery)}`;
            }}
            style={{
              display: 'flex',
              maxWidth: '650px',
              margin: '0 auto 2.5rem auto',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              padding: '6px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '12px', color: 'var(--text-muted)' }}>
              <Search size={20} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                padding: '12px 14px',
                fontSize: '0.95rem',
                color: 'var(--text-main)',
                backgroundColor: 'transparent'
              }}
            />
            <button type="submit" className="btn btn-secondary">
              {t('marketplace')}
            </button>
          </form>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/marketplace" className="btn btn-primary" style={{ padding: '0.8rem 1.75rem', fontSize: '1rem' }}>
              <Wheat size={18} />
              {t('browse_produce')}
            </Link>
            <Link to="/register" className="btn btn-outline" style={{ padding: '0.8rem 1.75rem', fontSize: '1rem', color: '#ffffff', borderColor: '#ffffff' }}>
              <Sprout size={18} />
              {t('join_as_farmer')}
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Key Pillars of Trust */}
      <section style={{ padding: '4rem 0', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
              {t('why_granary')}
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              Designed specifically for Karnataka agricultural communities, mandis, and direct buyers.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {/* Pillar 1 */}
            <div className="card card-hover" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                <Percent size={28} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {t('reason_1_title')}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {t('reason_1_desc')}
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="card card-hover" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--secondary-soft)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                <ShieldCheck size={28} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {t('reason_2_title')}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {t('reason_2_desc')}
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="card card-hover" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                <Languages size={28} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {t('reason_3_title')}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {t('reason_3_desc')}
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="card card-hover" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                <Truck size={28} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {t('reason_4_title')}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {t('reason_4_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Karnataka District Discovery Banner */}
      <section style={{ padding: '3.5rem 0', backgroundColor: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
            <div>
              <span className="badge badge-district" style={{ marginBottom: '0.5rem' }}>
                <MapPin size={12} /> {t('karnataka_focus')}
              </span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                {t('karnataka_focus')}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {t('karnataka_sub')}
              </p>
            </div>
            <Link to="/marketplace" className="btn btn-outline btn-sm">
              View All Districts <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {districts.map((d) => (
              <Link
                key={d.district}
                to={`/marketplace?district=${encodeURIComponent(d.district)}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  padding: '8px 16px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <MapPin size={14} color="var(--primary)" />
                <span>{d.district}</span>
                <span style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', borderRadius: 'var(--radius-full)', padding: '2px 8px', fontSize: '0.75rem' }}>
                  {d.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Agricultural Categories */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
              {t('featured_categories')}
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              Browse regional crops categorized by traditional harvest types.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {categories.map((cat) => {
              const name = getLocalized(cat, 'name');
              return (
                <Link
                  key={cat.id}
                  to={`/marketplace?category=${cat.slug}`}
                  className="card card-hover"
                  style={{
                    padding: '1.5rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textDecoration: 'none'
                  }}
                >
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem'
                    }}
                  >
                    <Wheat size={26} />
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    {name}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    {cat.description || `${cat.product_count || 0} items`}
                  </p>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {t('explore_category')} <ArrowRight size={13} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Latest Harvest Listings */}
      <section style={{ padding: '4.5rem 0', backgroundColor: 'var(--bg-main)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
            <div>
              <span className="badge badge-district" style={{ marginBottom: '0.5rem' }}>
                Direct Farm Arrivals
              </span>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)' }}>
                {t('direct_farm_produce')}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Handpicked recent produce batches directly listed by Karnataka farmers.
              </p>
            </div>
            <Link to="/marketplace" className="btn btn-outline">
              {t('view_all_produce')} <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              Loading fresh harvests from Karnataka granaries...
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>No produce listings currently available.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;

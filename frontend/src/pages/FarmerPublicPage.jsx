import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Award, Wheat, Phone, ShieldCheck, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import VerificationBadge from '../components/VerificationBadge';
import ProductCard from '../components/ProductCard';

export const FarmerPublicPage = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFarmer = async () => {
      setLoading(true);
      try {
        const res = await api.getFarmerPublic(id);
        if (res.success && res.farmer) {
          setFarmer(res.farmer);
        } else {
          setError('Farmer profile could not be found.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load farmer profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchFarmer();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading grower profile...
      </div>
    );
  }

  if (error || !farmer) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Profile Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
          <Link to="/marketplace" className="btn btn-primary">Back to Marketplace</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0 4rem 0' }}>
      <div className="container">
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/marketplace" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
            <ChevronLeft size={16} /> Back to Marketplace
          </Link>
        </div>

        {/* Farmer Header Card */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {farmer.farm_name}
                </h1>
                <VerificationBadge status={farmer.verification_status} size="md" />
              </div>

              <div style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 600, marginBottom: '0.75rem' }}>
                Farmer: {farmer.full_name}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.875rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={15} color="var(--primary)" />
                  {farmer.village}, {farmer.taluk}, {farmer.district}, Karnataka
                </span>
                <span>•</span>
                <span>Experience: <strong>{farmer.experience_years} Years</strong></span>
                {farmer.farm_size_acres > 0 && (
                  <>
                    <span>•</span>
                    <span>Landholding: <strong>{farmer.farm_size_acres} Acres</strong></span>
                  </>
                )}
              </div>

              {farmer.bio && (
                <p style={{ color: 'var(--text-main)', fontSize: '0.925rem', lineHeight: 1.6, maxWidth: '750px', marginBottom: '1rem' }}>
                  {farmer.bio}
                </p>
              )}

              {farmer.primary_crops && (
                <div style={{ fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Primary Crops:</span>{' '}
                  <strong>{farmer.primary_crops}</strong>
                </div>
              )}
            </div>

            <div style={{ textAlign: 'right', backgroundColor: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', minWidth: '180px' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                {farmer.rating?.average_rating > 0 ? Number(farmer.rating.average_rating).toFixed(1) : 'New'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {farmer.rating?.total_reviews || 0} Customer Reviews
              </div>
            </div>
          </div>
        </div>

        {/* Farmer's Active Produce Listings */}
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem' }}>
            Active Produce from {farmer.farm_name} ({farmer.products?.length || 0})
          </h2>

          {farmer.products && farmer.products.length > 0 ? (
            <div className="product-grid">
              {farmer.products.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={{
                    ...prod,
                    farmer_id: farmer.id,
                    farmer_name: farmer.full_name,
                    farm_name: farmer.farm_name,
                    location_district: farmer.district,
                    location_taluk: farmer.taluk,
                    verification_status: farmer.verification_status
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>No active produce listings currently published by this grower.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerPublicPage;

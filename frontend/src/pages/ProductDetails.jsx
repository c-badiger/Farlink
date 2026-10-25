import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  ShieldCheck,
  TrendingUp,
  ShoppingCart,
  Check,
  Star,
  Info,
  ChevronLeft,
  Truck,
  Award
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import VerificationBadge from '../components/VerificationBadge';

export const ProductDetails = () => {
  const { id } = useParams();
  const { language, t, getLocalized } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { addToCart, items } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await api.getProductById(id);
        if (res.success && res.product) {
          setProduct(res.product);
          setQuantity(Number(res.product.min_order_quantity) || 1);
        } else {
          setError('Product listing could not be found.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load harvest details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading harvest listing details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Produce Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
          <Link to="/marketplace" className="btn btn-primary">Back to Marketplace</Link>
        </div>
      </div>
    );
  }

  const title = getLocalized(product, 'title');
  const subTitle = language === 'kn' ? product.title_en : product.title_kn;
  const minQty = Number(product.min_order_quantity) || 1;
  const maxQty = Number(product.available_quantity) || 1;
  const subtotal = (quantity * Number(product.price_per_unit)).toFixed(2);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  return (
    <div style={{ padding: '2rem 0 4rem 0' }}>
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/marketplace" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
            <ChevronLeft size={16} /> Back to Marketplace
          </Link>
        </div>

        {/* Main Product Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          {/* Left: Product Media */}
          <div>
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-subtle)', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-sm)' }}>
              <img
                src={product.image_url || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80'}
                alt={title}
                style={{ width: '100%', height: '380px', objectFit: 'cover' }}
              />
            </div>

            {/* Seller Declared Farming Method Transparency Box */}
            <div style={{ marginTop: '1.25rem', backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', gap: '12px' }}>
              <Info size={20} color="#92400e" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.85rem', color: '#92400e', lineHeight: 1.5 }}>
                <strong>Cultivation Declaration:</strong> This harvest is declared as <strong>{product.farming_method}</strong> by the grower. In accordance with Karnataka agricultural marketplace standards, seller-declared practices are transparently logged.
              </div>
            </div>
          </div>

          {/* Right: Produce Details & Action */}
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge badge-category">{getLocalized(product, 'category_name')}</span>
              <span className="badge badge-grade">{product.quality_grade}</span>
              <VerificationBadge status={product.verification_status} />
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.25, marginBottom: '0.25rem' }}>
              {title}
            </h1>
            {subTitle && <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{subTitle}</div>}

            {/* Price Box */}
            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
                ₹{Number(product.price_per_unit).toLocaleString('en-IN')}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>per {product.unit}</span>
            </div>

            {/* Produce Description */}
            <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              {product.description}
            </p>

            {/* Farm Origin Details Card */}
            <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', backgroundColor: '#ffffff' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} /> Farm Origin & Grower Profile
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Farm:</span>{' '}
                  <Link to={`/farmers/${product.farmer_id}`} style={{ fontWeight: 700, color: 'var(--primary)', textDecoration: 'underline' }}>
                    {product.farm_name}
                  </Link>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Grower:</span> <strong>{product.farmer_name}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>District:</span> <strong>{product.location_district}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Taluk & Village:</span> {product.location_taluk}, {product.location_village}
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Harvest Date:</span> {new Date(product.harvest_date).toLocaleDateString()}
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Available Stock:</span> <strong>{product.available_quantity} {product.unit}</strong>
                </div>
              </div>
            </div>

            {/* Quantity Selector & Add to Cart */}
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Order Quantity ({product.unit}):
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(minQty, quantity - 1))}
                      className="btn-icon"
                      style={{ width: '36px', height: '36px' }}
                      disabled={quantity <= minQty}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={minQty}
                      max={maxQty}
                      value={quantity}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= minQty && val <= maxQty) setQuantity(val);
                      }}
                      style={{
                        width: '80px',
                        textAlign: 'center',
                        padding: '6px',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 700
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                      className="btn-icon"
                      style={{ width: '36px', height: '36px' }}
                      disabled={quantity >= maxQty}
                    >
                      +
                    </button>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Min: {minQty} {product.unit} | Max: {maxQty} {product.unit}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Subtotal:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                    ₹{Number(subtotal).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
              >
                {addedToast ? (
                  <>
                    <Check size={18} /> {t('added_to_cart')}
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} /> {t('add_to_cart')}
                  </>
                )}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem', justifyContent: 'center' }}>
                <Truck size={14} color="var(--primary)" />
                <span>Cash on Delivery / Direct Farm Settlement</span>
              </div>
            </div>
          </div>
        </div>

        {/* Price History Section */}
        <section style={{ marginBottom: '3rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} />
              {t('price_history')}
            </h2>

            {product.price_history && product.price_history.length > 0 ? (
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Previous Rate</th>
                      <th>Updated Rate</th>
                      <th>Adjustment Factor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.price_history.map((ph, idx) => (
                      <tr key={idx}>
                        <td>{new Date(ph.changed_at).toLocaleDateString()}</td>
                        <td>₹{ph.old_price} / {product.unit}</td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{ph.new_price} / {product.unit}</td>
                        <td>{ph.change_reason || 'Periodic farm gate revision'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No past price revisions recorded for this harvest batch. Current rate is initial farm gate rate.
              </p>
            )}
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section>
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={20} color="var(--secondary)" />
              Customer Reviews ({product.reviews?.length || 0})
            </h2>

            {product.reviews && product.reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {product.reviews.map((rev) => (
                  <div key={rev.id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{rev.buyer_name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(rev.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '2px', marginBottom: '6px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < rev.rating ? 'var(--secondary)' : 'none'} color="var(--secondary)" />
                      ))}
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {t('no_reviews_yet')} Only verified buyers with completed deliveries may post reviews.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetails;

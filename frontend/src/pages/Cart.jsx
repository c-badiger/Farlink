import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Truck, MapPin, CheckCircle, AlertCircle, Wheat, Plus, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

export const Cart = () => {
  const { t, getLocalized } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const { items, updateQuantity, removeFromCart, clearCart, cartTotal, cartByFarmer } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [customAddress, setCustomAddress] = useState({
    recipient_name: '',
    recipient_phone: '',
    address_line1: '',
    village_or_town: '',
    taluk: '',
    district: 'Mandya',
    pincode: '',
    save_address: true
  });
  const [buyerNotes, setBuyerNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Fetch saved delivery addresses if logged in
  useEffect(() => {
    if (isAuthenticated) {
      const loadAddresses = async () => {
        try {
          const res = await api.getAddresses();
          if (res.success && res.addresses?.length > 0) {
            setAddresses(res.addresses);
            const defaultAddr = res.addresses.find((a) => a.is_default) || res.addresses[0];
            setSelectedAddressId(defaultAddr.id);
          } else {
            setUseCustomAddress(true);
          }
        } catch (err) {
          console.warn('Could not load saved addresses:', err);
          setUseCustomAddress(true);
        }
      };
      loadAddresses();
    } else {
      setUseCustomAddress(true);
    }
  }, [isAuthenticated]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    if (!useCustomAddress && !selectedAddressId) {
      setError('Please select a delivery address.');
      return;
    }

    if (useCustomAddress) {
      if (!customAddress.recipient_name || !customAddress.address_line1 || !customAddress.district || !customAddress.pincode) {
        setError('Please complete all required delivery address fields.');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        items: items.map((it) => ({
          productId: it.product.id,
          quantity: it.quantity
        })),
        delivery_address_id: useCustomAddress ? null : selectedAddressId,
        custom_address: useCustomAddress ? customAddress : null,
        payment_method: 'cash_on_delivery',
        buyer_notes: buyerNotes || null
      };

      const res = await api.createOrder(payload);
      if (res.success) {
        clearCart();
        setOrderSuccess(res.orders);
      } else {
        setError(res.message || 'Order could not be processed.');
      }
    } catch (err) {
      setError(err.message || 'Server error during order checkout.');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div style={{ padding: '4rem 0 6rem 0' }}>
        <div className="container" style={{ maxWidth: '640px', textAlign: 'center' }}>
          <div className="card" style={{ padding: '3rem 2rem', backgroundColor: '#ffffff' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--success-soft)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <CheckCircle size={36} />
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.75rem' }}>
              Order Confirmed Successfully!
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Your order has been directly submitted to the growers. They have been notified to prepare the harvest. Payment will be collected via <strong>Cash on Delivery</strong> upon arrival.
            </p>

            <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '2rem', textAlign: 'left' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                Generated Order Codes:
              </h4>
              {orderSuccess.map((ord, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '4px 0', borderBottom: '1px dashed var(--border-subtle)' }}>
                  <span>Order: <strong>{ord.orderCode}</strong></span>
                  <span style={{ fontWeight: 700 }}>₹{ord.totalAmount}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/buyer/dashboard" className="btn btn-primary">
                View in My Orders <ArrowRight size={16} />
              </Link>
              <Link to="/marketplace" className="btn btn-outline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: '4rem 0 6rem 0' }}>
        <div className="container" style={{ maxWidth: '540px', textAlign: 'center' }}>
          <div className="card" style={{ padding: '3.5rem 2rem' }}>
            <ShoppingBag size={56} color="var(--border-subtle)" style={{ margin: '0 auto 1rem auto' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary)' }}>
              {t('cart_empty')}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Support local Karnataka agriculture by exploring freshly harvested grains, millets, spices, and produce.
            </p>
            <Link to="/marketplace" className="btn btn-primary">
              <Wheat size={18} />
              {t('start_shopping')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 0 5rem 0' }}>
      <div className="container">
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '2rem' }}>
          {t('your_cart')} ({items.length} produce types)
        </h1>

        {error && (
          <div style={{ backgroundColor: 'var(--danger-soft)', color: 'var(--danger)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
          {/* Left: Items grouped by farm */}
          <div>
            {cartByFarmer.map((group) => (
              <div key={group.farmerId} className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                  <Wheat size={18} color="var(--primary)" />
                  <div>
                    <strong style={{ fontSize: '1rem', color: 'var(--primary)' }}>{group.farmName || group.farmerName}</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                      Location: {group.district}, Karnataka
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {group.items.map((it) => {
                    const title = getLocalized(it.product, 'title');
                    const minQty = Number(it.product.min_order_quantity) || 1;
                    const maxQty = Number(it.product.available_quantity) || 999;
                    const itemTotal = (it.quantity * Number(it.product.price_per_unit)).toFixed(2);

                    return (
                      <div key={it.product.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                        <img
                          src={it.product.image_url || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=200&q=80'}
                          alt={title}
                          style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                        />

                        <div style={{ flex: 1 }}>
                          <Link to={`/products/${it.product.id}`} style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                            {title}
                          </Link>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            ₹{it.product.price_per_unit} / {it.product.unit} • Min order: {minQty} {it.product.unit}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                            <button
                              type="button"
                              onClick={() => updateQuantity(it.product.id, it.quantity - 1)}
                              className="btn-icon"
                              style={{ width: '28px', height: '28px' }}
                              disabled={it.quantity <= minQty}
                            >
                              -
                            </button>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', minWidth: '40px', textAlign: 'center' }}>
                              {it.quantity} {it.product.unit}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(it.product.id, it.quantity + 1)}
                              className="btn-icon"
                              style={{ width: '28px', height: '28px' }}
                              disabled={it.quantity >= maxQty}
                            >
                              +
                            </button>

                            <button
                              type="button"
                              onClick={() => removeFromCart(it.product.id)}
                              style={{ color: 'var(--danger)', marginLeft: 'auto', padding: '4px' }}
                              title="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', minWidth: '80px' }}>
                          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary)' }}>
                            ₹{Number(itemTotal).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right: Checkout & Address Details */}
          <div>
            <div className="card" style={{ padding: '1.75rem', backgroundColor: '#ffffff', position: 'sticky', top: '5.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.25rem' }}>
                {t('order_summary')}
              </h2>

              <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Estimated Harvest Total:</span>
                  <span style={{ fontWeight: 700 }}>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Direct Shipping:</span>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>Direct Farm Dispatch</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, marginTop: '0.75rem', color: 'var(--primary)' }}>
                  <span>Total Amount:</span>
                  <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Delivery Address Section */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} /> {t('delivery_address')}
                </label>

                {addresses.length > 0 && !useCustomAddress ? (
                  <div>
                    {addresses.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => setSelectedAddressId(a.id)}
                        style={{
                          border: '1.5px solid',
                          borderColor: selectedAddressId === a.id ? 'var(--primary)' : 'var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '10px 12px',
                          marginBottom: '8px',
                          cursor: 'pointer',
                          backgroundColor: selectedAddressId === a.id ? 'var(--primary-soft)' : '#ffffff',
                          fontSize: '0.85rem'
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>{a.recipient_name} ({a.title})</div>
                        <div style={{ color: 'var(--text-muted)' }}>
                          {a.address_line1}, {a.village_or_town}, {a.district} - {a.pincode}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setUseCustomAddress(true)}
                      style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginTop: '4px' }}
                    >
                      + Enter a different address
                    </button>
                  </div>
                ) : (
                  <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <div className="form-group" style={{ marginBottom: '8px' }}>
                      <input
                        type="text"
                        placeholder="Recipient Full Name *"
                        value={customAddress.recipient_name}
                        onChange={(e) => setCustomAddress({ ...customAddress, recipient_name: e.target.value })}
                        className="form-input"
                        style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '8px' }}>
                      <input
                        type="tel"
                        placeholder="Recipient Phone Number"
                        value={customAddress.recipient_phone}
                        onChange={(e) => setCustomAddress({ ...customAddress, recipient_phone: e.target.value })}
                        className="form-input"
                        style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '8px' }}>
                      <input
                        type="text"
                        placeholder="Address Line / Street *"
                        value={customAddress.address_line1}
                        onChange={(e) => setCustomAddress({ ...customAddress, address_line1: e.target.value })}
                        className="form-input"
                        style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="text"
                        placeholder="Village / Town"
                        value={customAddress.village_or_town}
                        onChange={(e) => setCustomAddress({ ...customAddress, village_or_town: e.target.value })}
                        className="form-input"
                        style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                      />
                      <input
                        type="text"
                        placeholder="Pincode *"
                        value={customAddress.pincode}
                        onChange={(e) => setCustomAddress({ ...customAddress, pincode: e.target.value })}
                        className="form-input"
                        style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                      />
                    </div>

                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setUseCustomAddress(false)}
                        style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}
                      >
                        ← Select from saved addresses
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Special Delivery Instructions */}
              <div className="form-group">
                <label className="form-label">Delivery Notes for Farmer</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Unloading bay instructions or preferred delivery time..."
                  value={buyerNotes}
                  onChange={(e) => setBuyerNotes(e.target.value)}
                  className="form-textarea"
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              {/* Payment Method Badge */}
              <div style={{ backgroundColor: 'var(--secondary-soft)', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={18} />
                <span><strong>Payment:</strong> Cash on Delivery (Pay upon harvest inspection)</span>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
              >
                {loading ? 'Processing Order...' : t('place_order')}
              </button>

              {!isAuthenticated && (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>
                  You will be prompted to log in or register to confirm this order.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

import React, { useState, useEffect } from 'react';
import {
  Package,
  MapPin,
  Star,
  LifeBuoy,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Truck,
  Clock,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const BuyerDashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'addresses', 'complaints'
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Add Address Modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    title: 'Home',
    recipient_name: user?.full_name || '',
    recipient_phone: user?.phone || '',
    address_line1: '',
    address_line2: '',
    village_or_town: '',
    taluk: '',
    district: 'Bengaluru Urban',
    pincode: '',
    is_default: false
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordRes, addrRes, compRes] = await Promise.all([
        api.getMyBuyerOrders(),
        api.getAddresses(),
        api.getMyComplaints()
      ]);

      if (ordRes.success) setOrders(ordRes.orders || []);
      if (addrRes.success) setAddresses(addrRes.addresses || []);
      if (compRes.success) setComplaints(compRes.complaints || []);
    } catch (err) {
      console.error('Failed to load buyer portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await api.updateOrderStatus(orderId, {
        order_status: 'cancelled',
        cancellation_reason: 'Cancelled by buyer before confirmation'
      });
      if (res.success) {
        setActionMsg('Order cancelled successfully.');
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Error cancelling order');
    }
  };

  const openReviewModal = (ord, it) => {
    setReviewOrder(ord);
    setReviewProduct(it);
    setRating(5);
    setComment('');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.submitReview({
        order_id: reviewOrder.id,
        product_id: reviewProduct.product_id,
        rating,
        comment
      });
      if (res.success) {
        setActionMsg('Review submitted successfully! Thank you for supporting the farmer.');
        setShowReviewModal(false);
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Error submitting review');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addAddress(newAddr);
      if (res.success) {
        setActionMsg('Delivery address saved successfully.');
        setShowAddressModal(false);
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Error saving address');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this delivery address?')) return;
    try {
      const res = await api.deleteAddress(id);
      if (res.success) {
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Error deleting address');
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>
            {t('buyer_dashboard')}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Welcome, <strong>{user?.full_name}</strong> ({user?.buyer_type || 'Consumer'}) • Direct farm orders and delivery tracking
          </p>
        </div>

        {actionMsg && (
          <div style={{ backgroundColor: 'var(--success-soft)', color: 'var(--success)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600 }}>{actionMsg}</span>
            <button onClick={() => setActionMsg(null)} style={{ fontWeight: 700, color: 'var(--success)' }}>✕</button>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs-header">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          >
            <Package size={16} style={{ display: 'inline', marginRight: '6px' }} />
            My Harvest Orders ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            className={`tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
          >
            <MapPin size={16} style={{ display: 'inline', marginRight: '6px' }} />
            Saved Delivery Addresses ({addresses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('complaints')}
            className={`tab-btn ${activeTab === 'complaints' ? 'active' : ''}`}
          >
            <LifeBuoy size={16} style={{ display: 'inline', marginRight: '6px' }} />
            My Support Tickets ({complaints.length})
          </button>
        </div>

        {/* TAB 1: ORDERS */}
        {activeTab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>You have not placed any farm orders yet.</p>
                <a href="/marketplace" className="btn btn-primary">Browse Karnataka Produce</a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {orders.map((ord) => (
                  <div key={ord.id} className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>
                            {ord.order_code}
                          </span>
                          <span className="badge badge-grade">{ord.order_status}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Ordered from: <strong>{ord.farm_name}</strong> ({ord.farmer_name}, {ord.farm_district}) • {new Date(ord.created_at).toLocaleString()}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
                          ₹{Number(ord.total_amount).toLocaleString('en-IN')}
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {ord.payment_method} ({ord.payment_status})
                        </span>
                      </div>
                    </div>

                    {/* Address Snapshot */}
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '1rem', backgroundColor: 'var(--bg-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
                      <strong>Delivering to:</strong> {ord.delivery_address_snapshot}
                    </div>

                    {/* Items */}
                    <div style={{ marginBottom: '1rem' }}>
                      {ord.items?.map((it) => (
                        <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', padding: '6px 0', borderBottom: '1px dashed #f1f5f9' }}>
                          <div>
                            <strong>{it.product_title_snapshot}</strong> × {it.quantity} {it.unit}
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                              (@ ₹{it.unit_price}/{it.unit})
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontWeight: 700 }}>₹{it.subtotal}</span>

                            {/* Review Button for Delivered Orders */}
                            {ord.order_status === 'delivered' && (
                              it.existing_review_id ? (
                                <span style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <Check size={12} /> Reviewed
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => openReviewModal(ord, it)}
                                  className="btn btn-outline btn-sm"
                                  style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                                >
                                  <Star size={12} /> {t('write_review')}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Cancellation */}
                    {ord.order_status === 'placed' && (
                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => handleCancelOrder(ord.id)}
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--danger)', borderColor: 'var(--danger-soft)' }}
                        >
                          Cancel Order
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ADDRESSES */}
        {activeTab === 'addresses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Saved Karnataka Delivery Locations</h2>
              <button
                type="button"
                onClick={() => setShowAddressModal(true)}
                className="btn btn-primary btn-sm"
              >
                <Plus size={16} /> Add New Address
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {addresses.map((a) => (
                <div key={a.id} className="card" style={{ padding: '1.25rem', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="badge badge-district">{a.title}</span>
                    {a.is_default && <span className="badge badge-verified">Default</span>}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>
                    {a.recipient_name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                    {a.address_line1} {a.address_line2 && `, ${a.address_line2}`}<br />
                    {a.village_or_town}, {a.taluk}, {a.district} - {a.pincode}<br />
                    Phone: {a.recipient_phone}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteAddress(a.id)}
                    style={{ color: 'var(--danger)', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Trash2 size={13} /> Delete Address
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: COMPLAINTS */}
        {activeTab === 'complaints' && (
          <div>
            {complaints.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>No support grievance tickets submitted.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {complaints.map((c) => (
                  <div key={c.id} className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>{c.ticket_number}</span>
                      <span className="badge badge-grade">{c.status}</span>
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem' }}>{c.subject}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>{c.description}</p>
                    {c.resolution_notes && (
                      <div style={{ backgroundColor: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--primary)' }}>
                        <strong>Resolution Note:</strong> {c.resolution_notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REVIEW MODAL */}
        {showReviewModal && reviewProduct && (
          <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                Write Purchase Review
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Review for <strong>{reviewProduct.product_title_snapshot}</strong>
              </p>

              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label className="form-label">Rating (1 to 5 Stars)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        style={{ padding: '4px', cursor: 'pointer' }}
                      >
                        <Star
                          size={28}
                          fill={star <= rating ? 'var(--secondary)' : 'none'}
                          color="var(--secondary)"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Review Comment *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe harvest quality, freshness, packing, and overall satisfaction..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="form-textarea"
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                  <button type="button" onClick={() => setShowReviewModal(false)} className="btn btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADDRESS MODAL */}
        {showAddressModal && (
          <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
                Add New Delivery Address
              </h3>

              <form onSubmit={handleAddAddress}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Title / Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Home / Warehouse / Retail Store"
                      value={newAddr.title}
                      onChange={(e) => setNewAddr({ ...newAddr, title: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Recipient Name *</label>
                    <input
                      type="text"
                      required
                      value={newAddr.recipient_name}
                      onChange={(e) => setNewAddr({ ...newAddr, recipient_name: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={newAddr.recipient_phone}
                      onChange={(e) => setNewAddr({ ...newAddr, recipient_phone: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Karnataka District *</label>
                    <input
                      type="text"
                      required
                      value={newAddr.district}
                      onChange={(e) => setNewAddr({ ...newAddr, district: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="House / Building No, Cross Road"
                    value={newAddr.address_line1}
                    onChange={(e) => setNewAddr({ ...newAddr, address_line1: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Village / Town *</label>
                    <input
                      type="text"
                      required
                      value={newAddr.village_or_town}
                      onChange={(e) => setNewAddr({ ...newAddr, village_or_town: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pincode *</label>
                    <input
                      type="text"
                      required
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                  <button type="button" onClick={() => setShowAddressModal(false)} className="btn btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;

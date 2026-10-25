import React, { useState, useEffect } from 'react';
import {
  Wheat,
  Plus,
  Package,
  TrendingUp,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Edit2,
  Eye,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import VerificationBadge from '../components/VerificationBadge';

export const FarmerDashboard = () => {
  const { t, getLocalized } = useLanguage();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('listings'); // 'listings', 'orders', 'verification', 'analytics'
  const [stats, setStats] = useState(null);
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);

  // New Produce Form Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState({
    category_id: '1',
    title_en: '',
    title_kn: '',
    description: '',
    unit: 'kg',
    price_per_unit: '',
    available_quantity: '',
    min_order_quantity: '1',
    quality_grade: 'Grade A (Premium)',
    farming_method: 'Seller-Declared Organic',
    harvest_date: new Date().toISOString().slice(0, 10),
    location_district: user?.district || 'Mandya',
    location_taluk: user?.taluk || 'Srirangapatna',
    location_village: user?.village || 'Ganjam',
    image_url: '',
    price_change_reason: ''
  });

  // Verification Form
  const [verifData, setVerifData] = useState({
    document_type: 'Pahani RTC Document',
    document_number: '',
    submitted_notes: ''
  });

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, listRes, ordRes, catRes] = await Promise.all([
        api.getFarmerStats(),
        api.getMyListings(),
        api.getMyFarmerOrders(),
        api.getCategories()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (listRes.success) setListings(listRes.listings || []);
      if (ordRes.success) setOrders(ordRes.orders || []);
      if (catRes.success) setCategories(catRes.categories || []);
    } catch (err) {
      console.error('Failed to load farmer portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editProduct) {
        const res = await api.updateProduct(editProduct.id, formData);
        if (res.success) {
          setActionMsg('Produce listing updated successfully!');
          setShowAddModal(false);
          setEditProduct(null);
          loadDashboardData();
        }
      } else {
        const res = await api.createProduct(formData);
        if (res.success) {
          setActionMsg('New produce listed successfully on the marketplace!');
          setShowAddModal(false);
          loadDashboardData();
        }
      }
    } catch (err) {
      alert(err.message || 'Error saving produce listing');
    }
  };

  const handleStatusChange = async (productId, status) => {
    try {
      const res = await api.updateProductStatus(productId, status);
      if (res.success) {
        loadDashboardData();
      }
    } catch (err) {
      alert(err.message || 'Error updating status');
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await api.updateOrderStatus(orderId, { order_status: newStatus });
      if (res.success) {
        setActionMsg(`Order status updated to ${newStatus}`);
        loadDashboardData();
      }
    } catch (err) {
      alert(err.message || 'Error updating order status');
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.submitVerification(verifData);
      if (res.success) {
        setActionMsg('Land records submitted for administrative review!');
        loadDashboardData();
      }
    } catch (err) {
      alert(err.message || 'Error submitting verification documents');
    }
  };

  const openEditModal = (p) => {
    setEditProduct(p);
    setFormData({
      category_id: p.category_id,
      title_en: p.title_en,
      title_kn: p.title_kn,
      description: p.description,
      unit: p.unit,
      price_per_unit: p.price_per_unit,
      available_quantity: p.available_quantity,
      min_order_quantity: p.min_order_quantity,
      quality_grade: p.quality_grade,
      farming_method: p.farming_method,
      harvest_date: p.harvest_date?.slice(0, 10),
      location_district: p.location_district,
      location_taluk: p.location_taluk,
      location_village: p.location_village,
      image_url: p.image_url || '',
      price_change_reason: ''
    });
    setShowAddModal(true);
  };

  return (
    <div style={{ padding: '2.5rem 0 5rem 0' }}>
      <div className="container">
        {/* Welcome Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.25rem' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
                {user?.farm_name || 'Farmer Portal'}
              </h1>
              <VerificationBadge status={stats?.verification_status || 'unverified'} size="md" />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Grower: <strong>{user?.full_name}</strong> • Location: {user?.village}, {user?.taluk}, {user?.district}, Karnataka
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditProduct(null);
              setShowAddModal(true);
            }}
            className="btn btn-primary"
          >
            <Plus size={18} /> {t('add_new_listing')}
          </button>
        </div>

        {/* Action Flash Message */}
        {actionMsg && (
          <div style={{ backgroundColor: 'var(--success-soft)', color: 'var(--success)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600 }}>{actionMsg}</span>
            <button onClick={() => setActionMsg(null)} style={{ fontWeight: 700, color: 'var(--success)' }}>✕</button>
          </div>
        )}

        {/* Metric Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>
              Active Produce Listed
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
              {stats?.products?.active_products || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Total varieties: {stats?.products?.total_products || 0}
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>
              Pending New Orders
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)' }}>
              {stats?.orders?.pending_orders || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Total orders: {stats?.orders?.total_orders || 0}
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>
              Settled Harvest Sales
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)' }}>
              ₹{Number(stats?.orders?.total_revenue || 0).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Direct cash-on-delivery settlement
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>
              Land Records Status
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <VerificationBadge status={stats?.verification_status || 'unverified'} size="md" />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Bhoomi RTC Pahani review
            </div>
          </div>
        </div>

        {/* Tabs Header */}
        <div className="tabs-header">
          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
          >
            <Wheat size={16} style={{ display: 'inline', marginRight: '6px' }} />
            My Produce Listings ({listings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          >
            <Package size={16} style={{ display: 'inline', marginRight: '6px' }} />
            Received Orders ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('verification')}
            className={`tab-btn ${activeTab === 'verification' ? 'active' : ''}`}
          >
            <ShieldCheck size={16} style={{ display: 'inline', marginRight: '6px' }} />
            Land Records & Verification
          </button>
        </div>

        {/* TAB 1: LISTINGS */}
        {activeTab === 'listings' && (
          <div>
            {listings.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <Wheat size={48} color="var(--border-subtle)" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Produce Listed Yet</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Begin selling directly to consumers and mandi traders by adding your first harvest batch.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="btn btn-primary"
                >
                  <Plus size={16} /> Add Your First Produce
                </button>
              </div>
            ) : (
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Harvest Variety</th>
                      <th>Category</th>
                      <th>Unit Price</th>
                      <th>Stock Available</th>
                      <th>Min Order</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{p.title_en}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.title_kn}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-earth)' }}>{p.farming_method}</div>
                        </td>
                        <td>{p.category_name_en}</td>
                        <td>
                          <strong>₹{p.price_per_unit}</strong> / {p.unit}
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: p.available_quantity <= 5 ? 'var(--danger)' : 'var(--text-main)' }}>
                            {p.available_quantity} {p.unit}
                          </span>
                        </td>
                        <td>{p.min_order_quantity} {p.unit}</td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: p.status === 'active' ? 'var(--success-soft)' : '#f1f5f9',
                              color: p.status === 'active' ? 'var(--success)' : '#64748b'
                            }}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => openEditModal(p)}
                              className="btn btn-outline btn-sm"
                              title="Edit Details & Price"
                            >
                              <Edit2 size={13} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(p.id, p.status === 'active' ? 'inactive' : 'active')}
                              className="btn btn-outline btn-sm"
                            >
                              {p.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ORDERS */}
        {activeTab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>No orders received yet for your produce.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                          Placed on: {new Date(ord.created_at).toLocaleString()} • Buyer: <strong>{ord.buyer_name}</strong> ({ord.buyer_phone})
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                          ₹{Number(ord.total_amount).toLocaleString('en-IN')}
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Payment: {ord.payment_method} ({ord.payment_status})
                        </span>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '1rem', backgroundColor: 'var(--bg-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
                      <strong>Delivery Destination:</strong> {ord.delivery_address_snapshot}
                      {ord.buyer_notes && (
                        <div style={{ marginTop: '4px', fontStyle: 'italic', color: 'var(--accent-earth)' }}>
                          Note: "{ord.buyer_notes}"
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                        Produce Ordered:
                      </h4>
                      {ord.items?.map((it) => (
                        <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '4px 0' }}>
                          <span>{it.product_title_snapshot} × {it.quantity} {it.unit}</span>
                          <span style={{ fontWeight: 600 }}>₹{it.subtotal}</span>
                        </div>
                      ))}
                    </div>

                    {/* Order Fulfillment Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        Update Fulfillment:
                      </span>
                      {ord.order_status === 'placed' && (
                        <button
                          type="button"
                          onClick={() => handleOrderStatusUpdate(ord.id, 'confirmed')}
                          className="btn btn-primary btn-sm"
                        >
                          Confirm Harvest
                        </button>
                      )}
                      {ord.order_status === 'confirmed' && (
                        <button
                          type="button"
                          onClick={() => handleOrderStatusUpdate(ord.id, 'harvesting_packed')}
                          className="btn btn-primary btn-sm"
                        >
                          Packed & Ready
                        </button>
                      )}
                      {ord.order_status === 'harvesting_packed' && (
                        <button
                          type="button"
                          onClick={() => handleOrderStatusUpdate(ord.id, 'in_transit')}
                          className="btn btn-primary btn-sm"
                        >
                          Dispatched / In Transit
                        </button>
                      )}
                      {ord.order_status === 'in_transit' && (
                        <button
                          type="button"
                          onClick={() => handleOrderStatusUpdate(ord.id, 'delivered')}
                          className="btn btn-secondary btn-sm"
                        >
                          Mark Delivered & Paid
                        </button>
                      )}
                      {ord.order_status !== 'delivered' && ord.order_status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => handleOrderStatusUpdate(ord.id, 'cancelled')}
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--danger)', marginLeft: 'auto' }}
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: VERIFICATION */}
        {activeTab === 'verification' && (
          <div style={{ maxWidth: '650px' }}>
            <div className="card" style={{ padding: '2rem', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <ShieldCheck size={28} color="var(--primary)" />
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
                  Karnataka Bhoomi RTC Land Record Verification
                </h2>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                To earn the <strong>Verified Farmer</strong> badge on all your marketplace listings, please submit your Karnataka revenue survey / Bhoomi RTC Pahani record or Kisan ID details for administrative review.
              </p>

              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Current Account Verification:</span>
                <VerificationBadge status={stats?.verification_status || 'unverified'} size="md" />
              </div>

              <form onSubmit={handleVerificationSubmit}>
                <div className="form-group">
                  <label className="form-label">Document Proof Type</label>
                  <select
                    value={verifData.document_type}
                    onChange={(e) => setVerifData({ ...verifData, document_type: e.target.value })}
                    className="form-select"
                  >
                    <option value="Pahani RTC Document">Karnataka Revenue Bhoomi Pahani (RTC)</option>
                    <option value="Kisan Credit Card / Farmer ID">Kisan Credit Card / Registered Farmer ID</option>
                    <option value="Aadhaar Card / Land Survey Deed">Aadhaar Card with Survey Land Deed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Survey / RTC / Document Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RTC-MDY-2024-8841 or Survey No. 142/2"
                    value={verifData.document_number}
                    onChange={(e) => setVerifData({ ...verifData, document_number: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Survey Land Notes & Details</label>
                  <textarea
                    rows={3}
                    placeholder="Specify village survey number, acre holding, or Bhoomi acknowledgment details..."
                    value={verifData.submitted_notes}
                    onChange={(e) => setVerifData({ ...verifData, submitted_notes: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
                  Submit Land Documents for Verification
                </button>
              </form>
            </div>
          </div>
        )}

        {/* PRODUCE MODAL (ADD / EDIT) */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {editProduct ? 'Edit Produce Listing' : 'List New Harvest Batch'}
                </h3>
                <button onClick={() => setShowAddModal(false)} style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>✕</button>
              </div>

              <form onSubmit={handleProductSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">English Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Organic Sona Masoori Rice"
                      value={formData.title_en}
                      onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Kannada Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="ಉದಾ. ಸಾವಯವ ಸೋನಾ ಮಸೂರಿ ಅಕ್ಕಿ"
                      value={formData.title_kn}
                      onChange={(e) => setFormData({ ...formData, title_kn: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="form-select"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name_en} ({c.name_kn})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Measure Unit *</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="form-select"
                    >
                      <option value="kg">Kilogram (kg)</option>
                      <option value="quintal">Quintal (100 kg)</option>
                      <option value="bag_50kg">Bag (50 kg)</option>
                      <option value="box">Box</option>
                      <option value="piece">Piece</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Price per Unit (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 5400"
                      value={formData.price_per_unit}
                      onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Available Quantity *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="e.g. 40"
                      value={formData.available_quantity}
                      onChange={(e) => setFormData({ ...formData, available_quantity: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Min Order Quantity *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={formData.min_order_quantity}
                      onChange={(e) => setFormData({ ...formData, min_order_quantity: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Harvest Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.harvest_date}
                      onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Quality Grade</label>
                    <select
                      value={formData.quality_grade}
                      onChange={(e) => setFormData({ ...formData, quality_grade: e.target.value })}
                      className="form-select"
                    >
                      <option value="Grade A (Premium)">Grade A (Premium)</option>
                      <option value="Grade B (Standard)">Grade B (Standard)</option>
                      <option value="Grade C (Fair)">Grade C (Fair)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cultivation Method</label>
                    <select
                      value={formData.farming_method}
                      onChange={(e) => setFormData({ ...formData, farming_method: e.target.value })}
                      className="form-select"
                    >
                      <option value="Seller-Declared Organic">Seller-Declared Organic</option>
                      <option value="Natural / ZBNF">Natural / ZBNF</option>
                      <option value="Traditional Conventional">Traditional Conventional</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe flavor, grain aging, seed source, sun-drying method..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Product Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="form-input"
                  />
                </div>

                {editProduct && (
                  <div className="form-group">
                    <label className="form-label">Price Adjustment Reason (Logged to Price History)</label>
                    <input
                      type="text"
                      placeholder="e.g. Post-harvest seasonal market correction"
                      value={formData.price_change_reason}
                      onChange={(e) => setFormData({ ...formData, price_change_reason: e.target.value })}
                      className="form-input"
                    />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editProduct ? 'Save Updates' : 'Publish Harvest'}
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

export default FarmerDashboard;

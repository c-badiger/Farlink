import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  ShieldCheck,
  Package,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Wheat,
  LifeBuoy
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import VerificationBadge from '../components/VerificationBadge';

export const AdminDashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'verifications', 'users', 'complaints'
  const [stats, setStats] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [complaintsList, setComplaintsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);

  // Review Verification Modal
  const [selectedVerif, setSelectedVerif] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Complaint Resolution Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, verifRes, usersRes, compRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminVerifications(),
        api.getAdminUsers(),
        api.getAdminComplaints()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (verifRes.success) setVerifications(verifRes.verifications || []);
      if (usersRes.success) setUsersList(usersRes.users || []);
      if (compRes.success) setComplaintsList(compRes.complaints || []);
    } catch (err) {
      console.error('Failed to load administrative portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleReviewVerification = async (status) => {
    try {
      const res = await api.reviewVerification(selectedVerif.id, {
        status,
        admin_notes: adminNotes
      });
      if (res.success) {
        setActionMsg(`Farmer verification status set to ${status}. Notification sent.`);
        setSelectedVerif(null);
        setAdminNotes('');
        loadAdminData();
      }
    } catch (err) {
      alert(err.message || 'Error processing verification');
    }
  };

  const handleUserStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await api.updateUserStatus(userId, newStatus);
      if (res.success) {
        setActionMsg(`User status updated to ${newStatus}`);
        loadAdminData();
      }
    } catch (err) {
      alert(err.message || 'Error updating user');
    }
  };

  const handleResolveComplaint = async (status) => {
    try {
      const res = await api.resolveComplaint(selectedComplaint.id, {
        status,
        resolution_notes: resolutionNotes
      });
      if (res.success) {
        setActionMsg(`Complaint ticket marked as ${status}`);
        setSelectedComplaint(null);
        setResolutionNotes('');
        loadAdminData();
      }
    } catch (err) {
      alert(err.message || 'Error updating ticket');
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--secondary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
              Karnataka Granary Administration Panel
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Real-time platform governance, land record verification, and database auditing
            </p>
          </div>
        </div>

        {actionMsg && (
          <div style={{ backgroundColor: 'var(--success-soft)', color: 'var(--success)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600 }}>{actionMsg}</span>
            <button onClick={() => setActionMsg(null)} style={{ fontWeight: 700, color: 'var(--success)' }}>✕</button>
          </div>
        )}

        {/* Live Database Metrics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Users Registered
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
              {stats?.users?.total_users || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {stats?.users?.total_farmers || 0} Farmers • {stats?.users?.total_buyers || 0} Buyers
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Verified Farmers (RTC)
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>
              {stats?.verifications?.verified_farmers || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 600 }}>
              {stats?.verifications?.pending_verifications || 0} Pending Verification
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Active Produce Listings
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
              {stats?.products?.active_listings || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Across 31 Karnataka districts
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Marketplace Trade Volume
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)', marginTop: '4px' }}>
              ₹{Number(stats?.orders?.total_trade_volume || 0).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Total Orders: {stats?.orders?.total_orders || 0}
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Open Grievances
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: stats?.complaints?.unresolved_complaints > 0 ? 'var(--danger)' : 'var(--text-muted)', marginTop: '4px' }}>
              {stats?.complaints?.unresolved_complaints || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Total filed: {stats?.complaints?.total_complaints || 0}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-header">
          <button
            type="button"
            onClick={() => setActiveTab('verifications')}
            className={`tab-btn ${activeTab === 'verifications' ? 'active' : ''}`}
          >
            <ShieldCheck size={16} style={{ display: 'inline', marginRight: '6px' }} />
            Farmer Verifications ({verifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          >
            <Users size={16} style={{ display: 'inline', marginRight: '6px' }} />
            User Accounts ({usersList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('complaints')}
            className={`tab-btn ${activeTab === 'complaints' ? 'active' : ''}`}
          >
            <LifeBuoy size={16} style={{ display: 'inline', marginRight: '6px' }} />
            Grievances & Complaints ({complaintsList.length})
          </button>
        </div>

        {/* TAB 1: VERIFICATIONS */}
        {activeTab === 'verifications' && (
          <div>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Farmer & Farm Holding</th>
                    <th>Karnataka Location</th>
                    <th>Document Proof Type</th>
                    <th>Survey / RTC Document No.</th>
                    <th>Status</th>
                    <th>Review Action</th>
                  </tr>
                </thead>
                <tbody>
                  {verifications.map((v) => (
                    <tr key={v.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{v.farmer_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>{v.farm_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.farmer_phone} • {v.farmer_email}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{v.village}, {v.taluk}</div>
                        <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--primary)' }}>{v.district} ({v.farm_size_acres} Acres)</div>
                      </td>
                      <td>{v.document_type}</td>
                      <td>
                        <code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.85rem' }}>
                          {v.document_number}
                        </code>
                        {v.submitted_notes && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                            "{v.submitted_notes}"
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: v.status === 'approved' ? 'var(--success-soft)' : v.status === 'rejected' ? 'var(--danger-soft)' : 'var(--warning-soft)',
                            color: v.status === 'approved' ? 'var(--success)' : v.status === 'rejected' ? 'var(--danger)' : 'var(--warning)'
                          }}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td>
                        {v.status === 'pending' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedVerif(v);
                              setAdminNotes('');
                            }}
                            className="btn btn-primary btn-sm"
                          >
                            Review & Verify
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Reviewed by Admin #{v.reviewed_by}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: USERS */}
        {activeTab === 'users' && (
          <div>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User ID & Name</th>
                    <th>Email & Contact</th>
                    <th>Role</th>
                    <th>Account Context</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <strong>#{u.id} {u.full_name}</strong>
                      </td>
                      <td>
                        <div>{u.email}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.phone}</div>
                      </td>
                      <td>
                        <span className="badge badge-district">{u.role}</span>
                      </td>
                      <td>
                        {u.role === 'farmer' && (
                          <div style={{ fontSize: '0.85rem' }}>
                            {u.farm_name} ({u.district})
                          </div>
                        )}
                        {u.role === 'buyer' && (
                          <div style={{ fontSize: '0.85rem' }}>
                            {u.buyer_type} {u.business_name && `• ${u.business_name}`}
                          </div>
                        )}
                        {u.role === 'admin' && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600 }}>
                            System Administrator
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: u.status === 'active' ? 'var(--success-soft)' : 'var(--danger-soft)',
                            color: u.status === 'active' ? 'var(--success)' : 'var(--danger)'
                          }}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td>
                        {u.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleUserStatusToggle(u.id, u.status)}
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: COMPLAINTS */}
        {activeTab === 'complaints' && (
          <div>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ticket No</th>
                    <th>Complainant</th>
                    <th>Category</th>
                    <th>Subject & Description</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaintsList.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <code style={{ fontWeight: 700, color: 'var(--primary)' }}>{c.ticket_number}</code>
                        {c.order_code && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Order: {c.order_code}</div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{c.complainant_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.complainant_phone} ({c.complainant_role})</div>
                      </td>
                      <td>{c.category}</td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{c.subject}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.description}</div>
                        {c.resolution_notes && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '4px' }}>
                            <strong>Resolved:</strong> {c.resolution_notes}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-grade">{c.status}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedComplaint(c);
                            setResolutionNotes(c.resolution_notes || '');
                          }}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.75rem' }}
                        >
                          Investigate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VERIFICATION REVIEW MODAL */}
        {selectedVerif && (
          <div className="modal-overlay" onClick={() => setSelectedVerif(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                Review Farmer Landholding Proof
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Farmer: <strong>{selectedVerif.farmer_name}</strong> • Farm: <strong>{selectedVerif.farm_name}</strong>
              </p>

              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                <div><strong>Proof Document:</strong> {selectedVerif.document_type}</div>
                <div><strong>Document / Survey Number:</strong> <code>{selectedVerif.document_number}</code></div>
                <div><strong>Location:</strong> {selectedVerif.village}, {selectedVerif.taluk}, {selectedVerif.district}</div>
                {selectedVerif.submitted_notes && (
                  <div style={{ marginTop: '6px' }}><strong>Farmer Notes:</strong> "{selectedVerif.submitted_notes}"</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Administrative Review Notes</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Verified against Karnataka Bhoomi revenue survey portal records."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleReviewVerification('rejected')}
                  className="btn btn-outline"
                  style={{ color: 'var(--danger)', borderColor: 'var(--danger-soft)' }}
                >
                  <XCircle size={16} /> Reject Submission
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewVerification('approved')}
                  className="btn btn-primary"
                >
                  <CheckCircle size={16} /> Approve & Grant Verified Badge
                </button>
              </div>
            </div>
          </div>
        )}

        {/* COMPLAINT RESOLUTION MODAL */}
        {selectedComplaint && (
          <div className="modal-overlay" onClick={() => setSelectedComplaint(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                Manage Grievance Ticket ({selectedComplaint.ticket_number})
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Subject: <strong>{selectedComplaint.subject}</strong>
              </p>

              <div className="form-group">
                <label className="form-label">Resolution / Action Notes</label>
                <textarea
                  rows={3}
                  placeholder="Enter actions taken with farmer or buyer to resolve..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => handleResolveComplaint('investigating')}
                  className="btn btn-outline btn-sm"
                >
                  Mark In-Investigation
                </button>
                <button
                  type="button"
                  onClick={() => handleResolveComplaint('resolved')}
                  className="btn btn-primary btn-sm"
                >
                  Mark Resolved
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="btn btn-outline btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

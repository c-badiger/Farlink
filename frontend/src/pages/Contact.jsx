import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const Contact = () => {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('quality_issue');
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please log in to submit an official grievance ticket.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.createComplaint({
        subject,
        description,
        category
      });

      if (res.success) {
        setSubmittedTicket(res.ticketNumber);
        setSubject('');
        setDescription('');
      } else {
        setError(res.message || 'Failed to submit complaint.');
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to grievance server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.75rem' }}>
            {t('contact')} & Grievance Desk
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Have a question about a Karnataka harvest, farmer verification, or an active order? Reach our support desk.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
          {/* Contact Info */}
          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1.25rem' }}>
                State Support Desk
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>Karnataka Office:</strong>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      APMC Main Yard, Ring Road Junction, Karnataka - 570025
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--secondary-soft)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>Farmer & Buyer Helpline:</strong>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      1800-425-3553 (Pilot Support, Mon-Sat 9AM-6PM)
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>Official Email:</strong>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      support@farmersgranary.test
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Demonstration Support Note
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Grievance tickets submitted here are logged into the database complaints register and can be reviewed in real time via the Administrator Dashboard.
              </p>
            </div>
          </div>

          {/* Grievance Ticket Form */}
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>
              Register a Grievance Ticket
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Dispute a quality issue, order mismatch, or inquiry directly with granary administrators.
            </p>

            {submittedTicket ? (
              <div style={{ backgroundColor: 'var(--success-soft)', border: '1px solid #86efac', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center' }}>
                <CheckCircle size={36} color="var(--success)" style={{ margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ color: 'var(--success)', fontWeight: 700, marginBottom: '0.5rem' }}>Ticket Created Successfully</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '1rem' }}>
                  Your complaint reference number is: <strong>{submittedTicket}</strong>
                </p>
                <button type="button" onClick={() => setSubmittedTicket(null)} className="btn btn-primary btn-sm">
                  Submit Another Ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div style={{ backgroundColor: 'var(--danger-soft)', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} /> {error}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-select"
                  >
                    <option value="quality_issue">Quality / Freshness Issue</option>
                    <option value="delivery_delay">Delivery or Dispatch Delay</option>
                    <option value="quantity_mismatch">Quantity or Weight Mismatch</option>
                    <option value="payment_issue">Cash on Delivery Dispute</option>
                    <option value="other">General Platform Inquiry</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Brief summary of your inquiry or issue"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Description</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide relevant harvest details, order code, or inquiry specifics..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="form-textarea"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.75rem' }}
                >
                  <Send size={16} />
                  {loading ? 'Submitting Ticket...' : 'Submit Grievance Ticket'}
                </button>

                {!isAuthenticated && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.75rem', textAlign: 'center' }}>
                    * You must be logged in to link your ticket with your account profile.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

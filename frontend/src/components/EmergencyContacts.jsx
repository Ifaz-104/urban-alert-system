// frontend/src/components/EmergencyContacts.jsx
import { useState, useEffect } from 'react';
import './EmergencyContacts.css';

function EmergencyContacts({ isOpen, onClose }) {
  const [contacts, setContacts] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (isOpen) {
      fetchContacts();
    }
  }, [isOpen, selectedType]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      const url =
        selectedType === 'all'
          ? `${apiURL}/api/emergency-contacts`
          : `${apiURL}/api/emergency-contacts/type/${selectedType}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch emergency contacts');
      }

      const data = await response.json();
      setContacts(data.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const callContact = (phoneNumber) => {
    // Open phone dialer
    window.location.href = `tel:${phoneNumber}`;
  };

  const messageContact = (phoneNumber) => {
    // Open SMS
    window.location.href = `sms:${phoneNumber}`;
  };

  const emailContact = (email) => {
    // Open email
    window.location.href = `mailto:${email}`;
  };

  const openWebsite = (url) => {
    window.open(url, '_blank');
  };

  const contactTypes = [
    { id: 'all', label: 'All Contacts', icon: '📞' },
    { id: 'police', label: 'Police', icon: '🚔' },
    { id: 'fire', label: 'Fire Department', icon: '🚒' },
    { id: 'medical', label: 'Medical/Ambulance', icon: '🚑' },
    { id: 'disaster', label: 'Disaster Relief', icon: '⚠️' },
    { id: 'custom', label: 'Other Services', icon: '📱' },
  ];

  if (!isOpen) {
    return null;
  }

  return (
    <div className="emergency-contacts-modal-overlay" onClick={onClose}>
      <div className="emergency-contacts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="emergency-contacts-header">
          <h2>🚨 Emergency Contacts</h2>
          <button className="emergency-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="emergency-contacts-filters">
          {contactTypes.map((type) => (
            <button
              key={type.id}
              className={`filter-btn ${selectedType === type.id ? 'active' : ''}`}
              onClick={() => setSelectedType(type.id)}
            >
              <span className="filter-icon">{type.icon}</span>
              <span className="filter-label">{type.label}</span>
            </button>
          ))}
        </div>

        <div className="emergency-contacts-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading emergency contacts...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>⚠️ {error}</p>
              <button onClick={fetchContacts} className="retry-btn">
                Retry
              </button>
            </div>
          ) : contacts.length === 0 ? (
            <div className="empty-state">
              <p>No emergency contacts found</p>
            </div>
          ) : (
            <div className="contacts-list">
              {contacts.map((contact) => (
                <div key={contact._id} className="contact-card">
                  <div className="contact-header">
                    <div className="contact-icon">{contact.icon}</div>
                    <div className="contact-info">
                      <h3 className="contact-name">{contact.name}</h3>
                      <p className="contact-type">{contact.type.toUpperCase()}</p>
                    </div>
                  </div>

                  {contact.description && (
                    <p className="contact-description">{contact.description}</p>
                  )}

                  <div className="contact-details">
                    {contact.phone && contact.phone.length > 0 && (
                      <div className="detail-item">
                        <span className="detail-label">Phone:</span>
                        <span className="detail-value">{contact.phone[0]}</span>
                      </div>
                    )}

                    {contact.alternatePhone && (
                      <div className="detail-item">
                        <span className="detail-label">Alt:</span>
                        <span className="detail-value">{contact.alternatePhone}</span>
                      </div>
                    )}

                    {contact.email && (
                      <div className="detail-item">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{contact.email}</span>
                      </div>
                    )}

                    {!contact.available24x7 && contact.operatingHours && (
                      <div className="detail-item">
                        <span className="detail-label">Hours:</span>
                        <span className="detail-value">
                          {contact.operatingHours.open} - {contact.operatingHours.close}
                        </span>
                      </div>
                    )}

                    {contact.available24x7 && (
                      <div className="detail-item availability">
                        <span className="badge badge-24x7">24/7</span>
                      </div>
                    )}
                  </div>

                  <div className="contact-actions">
                    {contact.phone && contact.phone[0] && (
                      <>
                        <button
                          className="action-btn call-btn"
                          onClick={() => callContact(contact.phone[0])}
                          title="Call"
                        >
                          📞 Call
                        </button>
                        <button
                          className="action-btn message-btn"
                          onClick={() => messageContact(contact.phone[0])}
                          title="Message"
                        >
                          💬 Message
                        </button>
                      </>
                    )}

                    {contact.email && (
                      <button
                        className="action-btn email-btn"
                        onClick={() => emailContact(contact.email)}
                        title="Email"
                      >
                        ✉️ Email
                      </button>
                    )}

                    {contact.website && (
                      <button
                        className="action-btn web-btn"
                        onClick={() => openWebsite(contact.website)}
                        title="Visit Website"
                      >
                        🌐 Website
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="emergency-contacts-footer">
          <p className="footer-note">
            💡 Tip: You can save this page to your home screen for quick access in emergencies
          </p>
        </div>
      </div>
    </div>
  );
}

export default EmergencyContacts;

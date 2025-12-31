// frontend/src/components/EmergencyContactShortcuts.jsx
import { useState, useEffect } from 'react';
import { emergencyContactsAPI } from '../services/api';
import AddCustomContact from './AddCustomContact';
import './EmergencyContactShortcuts.css';

function EmergencyContactShortcuts({ user }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [country, setCountry] = useState('Global'); // Default, can be detected from user location

  useEffect(() => {
    fetchEmergencyContacts();
  }, [country]);

  const fetchEmergencyContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await emergencyContactsAPI.getAllContacts({ country });
      const allContacts = response.data.data || [];

      // If user is logged in, fetch their custom contacts from protected endpoint
      let customContacts = [];
      if (user) {
        try {
          const customResp = await emergencyContactsAPI.getCustomContacts();
          customContacts = customResp.data.data || [];
        } catch (err) {
          // If fetching custom contacts fails, fall back to filtering allContacts
          console.warn('Failed to fetch protected custom contacts, falling back:', err);
          customContacts = allContacts.filter(c => c.userId && c.type === 'custom');
        }
      } else {
        customContacts = allContacts.filter(c => c.userId && c.type === 'custom');
      }

      // Get the primary contact for each service type
      const primaryContacts = {
        police: allContacts.find(c => c.type === 'police' && !c.userId) || null,
        medical: allContacts.find(c => c.type === 'medical' && !c.userId) || null,
        fire: allContacts.find(c => c.type === 'fire' && !c.userId) || null,
        disaster: allContacts.find(c => c.type === 'disaster' && !c.userId) || null,
      };

      setContacts({
        primary: primaryContacts,
        custom: customContacts,
      });
    } catch (err) {
      console.error('Error fetching emergency contacts:', err);
      setError('Failed to load emergency contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phoneNumber, serviceName) => {
    if (!phoneNumber) {
      alert(`No phone number available for ${serviceName}`);
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Call ${serviceName}?\n\nPhone: ${phoneNumber}\n\nClick OK to call.`
    );

    if (confirmed) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const handleCustomContactAdded = () => {
    fetchEmergencyContacts();
    setShowAddModal(false);
  };

  const handleDeleteCustomContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      await emergencyContactsAPI.deleteCustomContact(contactId);
      fetchEmergencyContacts();
    } catch (err) {
      alert('Failed to delete contact');
      console.error(err);
    }
  };

  const emergencyServices = [
    {
      key: 'police',
      label: 'Police',
      icon: '🚔',
      color: '#2196F3',
      contact: contacts.primary?.police,
    },
    {
      key: 'medical',
      label: 'Ambulance',
      icon: '🚑',
      color: '#F44336',
      contact: contacts.primary?.medical,
    },
    {
      key: 'fire',
      label: 'Fire Service',
      icon: '🚒',
      color: '#FF5722',
      contact: contacts.primary?.fire,
    },
    {
      key: 'disaster',
      label: 'Disaster Management',
      icon: '⚠️',
      color: '#FF9800',
      contact: contacts.primary?.disaster,
    },
  ];

  return (
    <div className="emergency-shortcuts-container">
      <div className="emergency-shortcuts-header">
        <h2>🚨 Emergency Contacts</h2>
        <p className="subtitle">Quick access to emergency services</p>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading emergency contacts...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>⚠️ {error}</p>
          <button onClick={fetchEmergencyContacts} className="retry-btn">
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="emergency-buttons-grid">
            {emergencyServices.map((service) => {
              // Handle phone number extraction (can be array or string)
              let phoneNumber = 'N/A';
              if (service.contact?.phone) {
                if (Array.isArray(service.contact.phone) && service.contact.phone.length > 0) {
                  phoneNumber = service.contact.phone[0];
                } else if (typeof service.contact.phone === 'string') {
                  phoneNumber = service.contact.phone;
                }
              }
              
              return (
                <button
                  key={service.key}
                  className="emergency-button"
                  style={{ '--button-color': service.color }}
                  onClick={() => handleCall(phoneNumber, service.label)}
                  disabled={!service.contact || phoneNumber === 'N/A'}
                >
                  <div className="button-icon">{service.icon}</div>
                  <div className="button-content">
                    <div className="button-label">{service.label}</div>
                    <div className="button-number">{phoneNumber}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Contacts Section */}
          {user && (
            <div className="custom-contacts-section">
              <div className="custom-contacts-header">
                <h3>📱 My Contacts</h3>
                <button
                  className="add-contact-btn"
                  onClick={() => setShowAddModal(true)}
                >
                  + Add Contact
                </button>
              </div>

              {contacts.custom && contacts.custom.length > 0 ? (
                <div className="custom-contacts-grid">
                  {contacts.custom.map((contact) => {
                    // Handle phone number extraction
                    let phoneNumber = 'N/A';
                    if (contact.phone) {
                      if (Array.isArray(contact.phone) && contact.phone.length > 0) {
                        phoneNumber = contact.phone[0];
                      } else if (typeof contact.phone === 'string') {
                        phoneNumber = contact.phone;
                      }
                    }
                    
                    return (
                      <div key={contact._id} className="custom-contact-card">
                        <div className="custom-contact-icon">{contact.icon || '📞'}</div>
                        <div className="custom-contact-info">
                          <div className="custom-contact-name">{contact.name}</div>
                          <div className="custom-contact-number">{phoneNumber}</div>
                        </div>
                        <div className="custom-contact-actions">
                          <button
                            className="call-custom-btn"
                            onClick={() => handleCall(phoneNumber, contact.name)}
                            title="Call"
                            disabled={phoneNumber === 'N/A'}
                          >
                            📞
                          </button>
                          <button
                            className="delete-custom-btn"
                            onClick={() => handleDeleteCustomContact(contact._id)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-custom-contacts">
                  <p>No custom contacts yet. Add family or friends for quick access.</p>
                </div>
              )}
            </div>
          )}

          {!user && (
            <div className="login-prompt">
              <p>💡 <a href="/login">Login</a> to add custom emergency contacts (family, friends)</p>
            </div>
          )}
        </>
      )}

      {showAddModal && (
        <AddCustomContact
          user={user}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleCustomContactAdded}
        />
      )}
    </div>
  );
}

export default EmergencyContactShortcuts;


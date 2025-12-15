// frontend/src/components/EmergencySOS.jsx
import { useState } from 'react';
import './EmergencySOS.css';
import EmergencyContacts from './EmergencyContacts';

function EmergencySOS() {
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <>
      <div className="emergency-sos-container">
        <button
          className="emergency-sos-btn"
          onClick={() => setIsContactsOpen(true)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          title="Emergency Contacts"
        >
          <span className="sos-icon">🚨</span>
          <span className="sos-text">SOS</span>
        </button>

        {showTooltip && (
          <div className="sos-tooltip">
            Quick access to emergency contacts
          </div>
        )}
      </div>

      <EmergencyContacts isOpen={isContactsOpen} onClose={() => setIsContactsOpen(false)} />
    </>
  );
}

export default EmergencySOS;

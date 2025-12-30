// frontend/src/components/AddCustomContact.jsx
import { useState } from 'react';
import { emergencyContactsAPI } from '../services/api';
import './AddCustomContact.css';

function AddCustomContact({ user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    icon: '📞',
    type: 'custom',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Please enter a name');
      return;
    }

    if (!formData.phone.trim()) {
      setError('Please enter a phone number');
      return;
    }

    // Basic phone validation
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    try {
      setLoading(true);
      await emergencyContactsAPI.createCustomContact({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        icon: formData.icon,
        type: formData.type,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error creating custom contact:', err);
      setError(err.response?.data?.message || 'Failed to add contact');
    } finally {
      setLoading(false);
    }
  };

  const iconOptions = ['📞', '👨', '👩', '👪', '👨‍👩‍👧', '👨‍👩‍👧‍👦', '👴', '👵', '👦', '👧', '💼', '🏠'];

  return (
    <div className="add-custom-contact-overlay" onClick={onClose}>
      <div className="add-custom-contact-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Custom Emergency Contact</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-contact-form">
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Contact Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Mom, Dad, Friend"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g., +1234567890"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="icon">Icon</label>
            <div className="icon-selector">
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                  onClick={() => setFormData((prev) => ({ ...prev, icon }))}
                  disabled={loading}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCustomContact;


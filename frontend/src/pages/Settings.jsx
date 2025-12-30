// frontend/src/pages/Settings.jsx
import { useState, useEffect } from 'react';
import { userPreferencesAPI } from '../services/api';
import './Settings.css';

function Settings({ user }) {
  const [preferences, setPreferences] = useState({
    accident: true,
    fire: true,
    flood: true,
    crime: true,
    pollution: true,
    earthquake: true,
    cyclone: true,
    other: true,
    method: 'push',
    enabled: true,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userPreferencesAPI.getPreferences();
      
      if (response.data.success && response.data.data) {
        // Merge with defaults to ensure all fields exist
        setPreferences((prev) => ({
          ...prev,
          ...response.data.data,
        }));
      }
    } catch (err) {
      console.error('Error fetching preferences:', err);
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSuccess(false);
  };

  const handleMethodChange = (method) => {
    setPreferences((prev) => ({
      ...prev,
      method,
    }));
    setSuccess(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      await userPreferencesAPI.updatePreferences(preferences);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError(err.response?.data?.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const categoryLabels = {
    accident: { icon: '🚗', label: 'Accidents' },
    fire: { icon: '🔥', label: 'Fire' },
    flood: { icon: '💧', label: 'Flood' },
    crime: { icon: '🚨', label: 'Crime' },
    pollution: { icon: '💨', label: 'Pollution' },
    earthquake: { icon: '🌍', label: 'Earthquake' },
    cyclone: { icon: '🌀', label: 'Cyclone' },
    other: { icon: '⚠️', label: 'Other' },
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>⚙️ Notification Settings</h1>
        <p>Customize which alerts you want to receive</p>
      </div>

      {error && (
        <div className="alert alert-error">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          ✅ Preferences saved successfully!
        </div>
      )}

      <div className="settings-content">
        {/* Master Toggle */}
        <div className="settings-section">
          <div className="section-header">
            <h2>Notification Status</h2>
          </div>
          <div className="toggle-item">
            <div className="toggle-info">
              <span className="toggle-label">Enable All Notifications</span>
              <span className="toggle-description">
                Turn off to disable all notifications
              </span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.enabled}
                onChange={() => handleToggle('enabled')}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Category Preferences */}
        <div className="settings-section">
          <div className="section-header">
            <h2>Alert Categories</h2>
            <p className="section-description">
              Choose which types of alerts you want to receive
            </p>
          </div>
          <div className="category-grid">
            {Object.entries(categoryLabels).map(([key, { icon, label }]) => (
              <div key={key} className="category-item">
                <div className="category-info">
                  <span className="category-icon">{icon}</span>
                  <span className="category-label">{label}</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences[key]}
                    onChange={() => handleToggle(key)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Method */}
        <div className="settings-section">
          <div className="section-header">
            <h2>Notification Method</h2>
            <p className="section-description">
              Choose how you want to receive notifications
            </p>
          </div>
          <div className="method-options">
            <label className={`method-option ${preferences.method === 'push' ? 'active' : ''}`}>
              <input
                type="radio"
                name="method"
                value="push"
                checked={preferences.method === 'push'}
                onChange={() => handleMethodChange('push')}
                disabled={!preferences.enabled}
              />
              <div className="method-content">
                <span className="method-icon">🔔</span>
                <span className="method-label">Push Notifications</span>
                <span className="method-description">Browser notifications</span>
              </div>
            </label>

            <label className={`method-option ${preferences.method === 'email' ? 'active' : ''}`}>
              <input
                type="radio"
                name="method"
                value="email"
                checked={preferences.method === 'email'}
                onChange={() => handleMethodChange('email')}
                disabled={!preferences.enabled}
              />
              <div className="method-content">
                <span className="method-icon">✉️</span>
                <span className="method-label">Email</span>
                <span className="method-description">Email notifications</span>
              </div>
            </label>

            <label className={`method-option ${preferences.method === 'sms' ? 'active' : ''}`}>
              <input
                type="radio"
                name="method"
                value="sms"
                checked={preferences.method === 'sms'}
                onChange={() => handleMethodChange('sms')}
                disabled={!preferences.enabled}
              />
              <div className="method-content">
                <span className="method-icon">📱</span>
                <span className="method-label">SMS</span>
                <span className="method-description">Text messages</span>
              </div>
            </label>

            <label className={`method-option ${preferences.method === 'all' ? 'active' : ''}`}>
              <input
                type="radio"
                name="method"
                value="all"
                checked={preferences.method === 'all'}
                onChange={() => handleMethodChange('all')}
                disabled={!preferences.enabled}
              />
              <div className="method-content">
                <span className="method-icon">🔔✉️📱</span>
                <span className="method-label">All Methods</span>
                <span className="method-description">Push, Email & SMS</span>
              </div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="settings-actions">
          <button
            className="save-btn"
            onClick={handleSave}
            disabled={saving || !preferences.enabled}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;


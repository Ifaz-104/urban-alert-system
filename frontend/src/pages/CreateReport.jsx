// frontend/src/pages/CreateReport.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportAPI } from '../services/api';
import MapLocationPicker from '../components/MapLocationPicker';
import './CreateReport.css';

export default function CreateReport() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'accident',
    severity: 'medium',
    address: '',
    city: '',
    latitude: null,
    longitude: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = ['accident', 'fire', 'flood', 'crime', 'pollution', 'earthquake', 'cyclone', 'other'];
  const severities = ['low', 'medium', 'high', 'critical'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✨ Handle location selection from map picker
  const handleLocationSelect = (location) => {
    if (location) {
      setFormData((prev) => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || prev.address,
        city: prev.city,
      }));
    } else {
      // Clear location
      setFormData((prev) => ({
        ...prev,
        latitude: null,
        longitude: null,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.category) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Create report with location data
      const response = await reportAPI.createReport({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        severity: formData.severity,
        address: formData.address,
        city: formData.city,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });

      setSuccess(
        `Report created successfully! You earned ${response.data.pointsAwarded} points!`
      );

      // Redirect to home after 2 seconds
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-report-container">
      <div className="create-report-card">
        <h2>📍 Report a Hazard</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* TITLE INPUT */}
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Pothole on Main Street"
              maxLength={100}
            />
          </div>

          {/* DESCRIPTION INPUT */}
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Provide detailed information about the hazard..."
              rows={5}
              maxLength={1000}
            />
          </div>

          {/* CATEGORY & SEVERITY ROW */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="severity">Severity</label>
              <select
                id="severity"
                name="severity"
                value={formData.severity}
                onChange={handleChange}
              >
                {severities.map((sev) => (
                  <option key={sev} value={sev}>
                    {sev.charAt(0).toUpperCase() + sev.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ADDRESS & CITY FIELDS - Now before the map */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="address">Address (Optional)</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">City (Optional)</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City name"
              />
            </div>
          </div>

          {/* ✨ MAP LOCATION PICKER */}
          <div className="form-group">
            <label>📍 Select Incident Location on Map</label>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-12)' }}>
              Click on the map to select the exact location, or use the "Use My Current Location" button
            </p>
            <MapLocationPicker
              onLocationSelect={handleLocationSelect}
              defaultLocation={
                formData.latitude && formData.longitude
                  ? {
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                  }
                  : null
              }
            />
          </div>

          {/* COORDINATES DISPLAY (Read-only) */}
          {formData.latitude && formData.longitude && (
            <div className="coordinates-display">
              <p>
                <strong>📍 Selected Location:</strong>
              </p>
              <p>
                Latitude: <code>{formData.latitude.toFixed(6)}</code>
              </p>
              <p>
                Longitude: <code>{formData.longitude.toFixed(6)}</code>
              </p>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`btn-submit ${loading ? 'loading' : ''}`}
          >
            {loading ? 'Creating Report...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}

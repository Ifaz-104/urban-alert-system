// frontend/src/pages/CreateReport.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportAPI } from '../services/api';
import './CreateReport.css';

export default function CreateReport() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'accident',
    severity: 'medium',
    location: '',
    latitude: '',
    longitude: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = ['accident', 'fire', 'flood', 'crime', 'pollution', 'other'];
  const severities = ['low', 'medium', 'high', 'critical'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await reportAPI.createReport(formData);
      setSuccess(`Report created successfully! You earned ${response.data.pointsAwarded} points!`);
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
        <h2>📝 Report a Hazard</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Pothole on Main Street"
              maxLength="100"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Provide detailed information about the hazard..."
              rows="5"
              maxLength="1000"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} required>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Severity *</label>
              <select name="severity" value={formData.severity} onChange={handleChange} required>
                {severities.map((sev) => (
                  <option key={sev} value={sev}>
                    {sev.charAt(0).toUpperCase() + sev.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="e.g., 123 Main Street, Downtown"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Latitude (Optional)</label>
              <input
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="e.g., 40.7128"
                step="any"
              />
            </div>

            <div className="form-group">
              <label>Longitude (Optional)</label>
              <input
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="e.g., -74.0060"
                step="any"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Creating Report...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
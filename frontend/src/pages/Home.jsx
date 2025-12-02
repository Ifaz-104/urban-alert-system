// frontend/src/pages/Home.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportAPI } from '../services/api';
import './Home.css';

export default function Home({ user }) {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    severity: '',
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.getAllReports(filters);
      setReports(response.data.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    fetchReports();
  };

  const getCategoryIcon = (category) => {
    const icons = {
      accident: '🚗',
      fire: '🔥',
      flood: '💧',
      crime: '🚨',
      pollution: '💨',
      earthquake: '🌍',
      cyclone: '🌀',
      other: '⚠️',
    };
    return icons[category] || '📍';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: '#4caf50',
      medium: '#ff9800',
      high: '#ff5722',
      critical: '#f44336',
    };
    return colors[severity] || '#999';
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>🚨 Urban Health & Safety Alert System</h1>
        <p>Help keep your community safe by reporting hazards and receiving real-time alerts</p>
        {!user && (
          <button onClick={() => navigate('/register')} className="cta-button">
            Get Started Now
          </button>
        )}
      </div>

      <div className="filters-section">
        <h3>Filter Reports</h3>
        <div className="filters">
          <select name="category" value={filters.category} onChange={handleFilterChange}>
            <option value="">All Categories</option>
            <option value="accident">Accident</option>
            <option value="fire">Fire</option>
            <option value="flood">Flood</option>
            <option value="crime">Crime</option>
            <option value="pollution">Pollution</option>
            <option value="earthquake">Earthquake</option>
            <option value="cyclone">Cyclone</option>
            <option value="other">Other</option>
          </select>

          <select name="severity" value={filters.severity} onChange={handleFilterChange}>
            <option value="">All Severity Levels</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <button onClick={applyFilters} className="filter-btn">
            Apply Filters
          </button>
        </div>
      </div>

      <div className="reports-section">
        <h2>Recent Reports ({reports.length})</h2>

        {loading ? (
          <div className="loading">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="no-reports">
            <p>No reports found. Be the first to report!</p>
          </div>
        ) : (
          <div className="reports-grid">
            {reports.map((report) => (
              <div
                key={report._id}
                className="report-card"
                onClick={() => navigate(`/report/${report._id}`)}
              >
                <div className="report-header">
                  <span className="category-icon">{getCategoryIcon(report.category)}</span>
                  <span
                    className="severity-badge"
                    style={{ backgroundColor: getSeverityColor(report.severity) }}
                  >
                    {report.severity.toUpperCase()}
                  </span>
                </div>

                <h3>{report.title}</h3>
                <p className="report-description">{report.description.substring(0, 100)}...</p>

                <div className="report-info">
                  <span>📍 {report.address || report.city || 'Unknown Location'}</span>
                  <span>👤 {report.userId.username}</span>
                </div>

                <div className="report-footer">
                  <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  <span>💬 {report.comments.length} comments</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
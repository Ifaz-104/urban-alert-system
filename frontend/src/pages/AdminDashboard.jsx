// frontend/src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import './AdminDashboard.css';

function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    page: 1,
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertData, setAlertData] = useState({ radius: 10, message: '' });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchStats();
    fetchReports();
  }, [user, filters]);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load dashboard statistics');
    }
  };

  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      const response = await adminAPI.getAllReports(filters);
      if (response.data.success) {
        setReports(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports');
    } finally {
      setReportsLoading(false);
      setLoading(false);
    }
  };

  const handleVerify = async (reportId) => {
    if (!window.confirm('Are you sure you want to verify this report?')) {
      return;
    }

    try {
      await adminAPI.verifyReport(reportId);
      fetchReports();
      fetchStats();
      alert('Report verified successfully!');
    } catch (err) {
      alert('Failed to verify report');
      console.error(err);
    }
  };

  const handleReject = async (reportId) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (!reason) {
      return;
    }

    try {
      await adminAPI.rejectReport(reportId, reason);
      fetchReports();
      fetchStats();
      alert('Report rejected successfully!');
    } catch (err) {
      alert('Failed to reject report');
      console.error(err);
    }
  };

  const handleSendAlert = async () => {
    if (!selectedReport) return;

    try {
      const response = await adminAPI.sendMassAlert({
        reportId: selectedReport._id,
        radius: alertData.radius * 1000, // Convert km to meters
        message: alertData.message,
      });

      if (response.data.success) {
        alert(`Alert sent to ${response.data.data.usersNotified} users!`);
        setShowAlertModal(false);
        setSelectedReport(null);
        setAlertData({ radius: 10, message: '' });
      }
    } catch (err) {
      alert('Failed to send alert');
      console.error(err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1, // Reset to first page when filter changes
    }));
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

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'Pending', class: 'badge-pending' },
      verified: { label: 'Verified', class: 'badge-verified' },
      rejected: { label: 'Rejected', class: 'badge-rejected' },
      resolved: { label: 'Resolved', class: 'badge-resolved' },
    };
    return badges[status] || { label: status, class: '' };
  };

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <h1>🛡️ Admin Dashboard</h1>
        <p>Monitor, verify, and manage hazard reports</p>
      </div>

      {error && (
        <div className="alert alert-error">
          ⚠️ {error}
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card stat-primary">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalReportsToday}</div>
              <div className="stat-label">Reports Today</div>
            </div>
          </div>

          <div className="stat-card stat-warning">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-value">{stats.pendingVerifications}</div>
              <div className="stat-label">Pending Verification</div>
            </div>
          </div>

          <div className="stat-card stat-success">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.verifiedHazards}</div>
              <div className="stat-label">Verified Hazards</div>
            </div>
          </div>

          <div className="stat-card stat-info">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">{stats.activeUsers}</div>
              <div className="stat-label">Active Users</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <h2>Reports Management</h2>
        <div className="filters">
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="filter-select"
          >
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
        </div>
      </div>

      {/* Reports Table/Cards */}
      <div className="reports-section">
        {reportsLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="empty-state">
            <p>No reports found</p>
          </div>
        ) : (
          <div className="reports-grid">
            {reports.map((report) => {
              const statusBadge = getStatusBadge(report.status);
              return (
                <div key={report._id} className="report-card-admin">
                  <div className="report-header-admin">
                    <div className="report-category">
                      <span className="category-icon">{getCategoryIcon(report.category)}</span>
                      <span className="category-label">{report.category.toUpperCase()}</span>
                    </div>
                    <span className={`status-badge ${statusBadge.class}`}>
                      {statusBadge.label}
                    </span>
                  </div>

                  <h3 className="report-title">{report.title}</h3>
                  <p className="report-description">{report.description}</p>

                  <div className="report-details">
                    <div className="detail-item">
                      <span className="detail-label">👤 User:</span>
                      <span className="detail-value">{report.userId?.username || 'Unknown'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">📍 Location:</span>
                      <span className="detail-value">
                        {report.locationName || report.address || 'Not specified'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">📅 Date:</span>
                      <span className="detail-value">
                        {new Date(report.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {report.verifiedBy && (
                      <div className="detail-item">
                        <span className="detail-label">✅ Verified by:</span>
                        <span className="detail-value">{report.verifiedBy?.username}</span>
                      </div>
                    )}
                  </div>

                  {report.mediaUrls && report.mediaUrls.length > 0 && (
                    <div className="report-media">
                      <span className="media-label">📷 Photos:</span>
                      <div className="media-grid">
                        {report.mediaUrls.slice(0, 3).map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Report ${idx + 1}`}
                            className="media-thumbnail"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="report-actions">
                    {report.status === 'pending' && (
                      <>
                        <button
                          className="btn-verify"
                          onClick={() => handleVerify(report._id)}
                        >
                          ✅ Verify
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleReject(report._id)}
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}
                    {report.status === 'verified' && (
                      <button
                        className="btn-alert"
                        onClick={() => {
                          setSelectedReport(report);
                          setShowAlertModal(true);
                        }}
                      >
                        📢 Send Alert
                      </button>
                    )}
                    <button
                      className="btn-view"
                      onClick={() => navigate(`/reports/${report._id}`)}
                    >
                      👁️ View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Send Alert Modal */}
      {showAlertModal && selectedReport && (
        <div className="modal-overlay" onClick={() => setShowAlertModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📢 Send Mass Alert</h2>
              <button className="modal-close" onClick={() => setShowAlertModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-info">
                Send alert to users within radius of:{' '}
                <strong>{selectedReport.locationName || selectedReport.address}</strong>
              </p>
              <div className="form-group">
                <label>Radius (km)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={alertData.radius}
                  onChange={(e) =>
                    setAlertData({ ...alertData, radius: parseInt(e.target.value) })
                  }
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Custom Message (optional)</label>
                <textarea
                  value={alertData.message}
                  onChange={(e) => setAlertData({ ...alertData, message: e.target.value })}
                  className="form-textarea"
                  placeholder="Leave empty to use default message"
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowAlertModal(false)}>
                Cancel
              </button>
              <button className="btn-send" onClick={handleSendAlert}>
                Send Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;


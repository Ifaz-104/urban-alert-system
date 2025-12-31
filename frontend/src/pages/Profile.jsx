// frontend/src/pages/Profile.jsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, uploadAPI } from '../services/api';
import BadgeDisplay from '../components/BadgeDisplay';
import './Profile.css';

export default function Profile({ user }) {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    bio: '',
    profilePhoto: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);

      const [profileRes, reportsRes, activityRes] = await Promise.all([
        userAPI.getProfile(user.id),
        userAPI.getReports(user.id),
        userAPI.getActivity(user.id),
      ]);

      if (profileRes.data.success) {
        setProfile(profileRes.data.data.user);
        setStats(profileRes.data.data.stats);
        setEditData({
          username: profileRes.data.data.user.username || '',
          bio: profileRes.data.data.user.bio || '',
          profilePhoto: profileRes.data.data.user.profilePhoto || '',
        });
      }
      if (reportsRes.data.success) {
        setReports(reportsRes.data.data || []);
      }
      if (activityRes.data.success) {
        setActivity(activityRes.data.data || []);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSaving(true);
      const response = await uploadAPI.uploadFiles([file]);
      if (response.data.success && response.data.data?.files?.length) {
        const fileInfo = response.data.data.files[0];
        setEditData((prev) => ({
          ...prev,
          profilePhoto: fileInfo.url,
        }));
      }
    } catch (err) {
      console.error('Error uploading profile photo:', err);
      alert('Failed to upload profile photo');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const res = await userAPI.updateProfile(user.id, {
        username: editData.username,
        bio: editData.bio,
        profilePhoto: editData.profilePhoto,
      });

      if (res.data.success) {
        setProfile(res.data.data);
        setIsEditing(false);

        // Update stored user so Navbar reflects changes
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            const updated = {
              ...parsed,
              username: res.data.data.username,
              profilePhoto: res.data.data.profilePhoto,
            };
            sessionStorage.setItem('user', JSON.stringify(updated));
          } catch {
            // ignore parse errors
          }
        }
        // Reload to propagate changes to App state
        window.location.reload();
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      alert(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const reportsByCategory = useMemo(() => {
    if (!stats?.reportsByCategory) return [];
    const entries = Object.entries(stats.reportsByCategory);
    if (entries.length === 0) return [];
    const max = Math.max(...entries.map(([, count]) => count || 0)) || 1;
    return entries.map(([category, count]) => ({
      category,
      count,
      height: (count / max) * 100,
    }));
  }, [stats]);

  const reportsByMonth = useMemo(() => {
    if (!stats?.reportsByMonth) return [];
    return stats.reportsByMonth;
  }, [stats]);

  const formatDate = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString();
  };

  const formatDateTime = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString();
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="profile-error">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="profile-container">
      <div className="profile-header-card">
        <div className="profile-main-info">
          <div className="profile-avatar">
            {profile.profilePhoto ? (
              <img src={profile.profilePhoto} alt={profile.username} />
            ) : (
              <span>{profile.username.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="profile-text">
            <h1>{profile.username}</h1>
            <p className="profile-email">{profile.email}</p>
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            <p className="profile-join-date">
              Joined on {formatDate(profile.joinDate)}
            </p>
          </div>
        </div>
        <div className="profile-stats-summary">
          <div className="profile-stat">
            <div className="profile-stat-value">{stats?.totalPoints || 0}</div>
            <div className="profile-stat-label">Total Points</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">{stats?.totalReports || 0}</div>
            <div className="profile-stat-label">Reports Submitted</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">{profile.badges?.length || 0}</div>
            <div className="profile-stat-label">Badges Earned</div>
          </div>
          <button
            className="profile-edit-btn"
            onClick={() => setIsEditing((prev) => !prev)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="profile-edit-card">
          <h2>Edit Profile</h2>
          <div className="profile-edit-grid">
            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                name="username"
                value={editData.username}
                onChange={handleEditChange}
                maxLength={50}
              />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={editData.bio}
                onChange={handleEditChange}
                maxLength={500}
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Profile Photo URL</label>
              <input
                type="text"
                name="profilePhoto"
                value={editData.profilePhoto}
                onChange={handleEditChange}
              />
            </div>
            <div className="form-group">
              <label>Or Upload Photo</label>
              <input type="file" accept="image/*" onChange={handleUploadPhoto} />
            </div>
          </div>
          <div className="profile-edit-actions">
            <button
              className="save-btn"
              onClick={handleSaveProfile}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      <div className="profile-content-grid">
        <div className="profile-section">
          <h2>🏅 Badges</h2>
          <BadgeDisplay
            badges={profile.badges || []}
            size="medium"
            showDescription={true}
          />
        </div>

        <div className="profile-section">
          <h2>📊 Reports by Category</h2>
          {reportsByCategory.length === 0 ? (
            <p className="profile-empty-text">No reports yet.</p>
          ) : (
            <div className="bar-chart">
              {reportsByCategory.map((item) => (
                <div key={item.category} className="bar-chart-item">
                  <div
                    className="bar-chart-bar"
                    style={{ height: `${item.height || 5}%` }}
                    title={`${item.category}: ${item.count}`}
                  />
                  <span className="bar-chart-label">{item.category}</span>
                  <span className="bar-chart-count">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="profile-section">
          <h2>📈 Activity Over Time</h2>
          {reportsByMonth.length === 0 ? (
            <p className="profile-empty-text">No activity yet.</p>
          ) : (
            <div className="line-chart">
              <svg viewBox="0 0 100 50" preserveAspectRatio="none">
                {(() => {
                  const maxCount =
                    Math.max(...reportsByMonth.map((m) => m.count || 0)) || 1;
                  const points = reportsByMonth.map((m, index) => {
                    const x =
                      (reportsByMonth.length === 1
                        ? 50
                        : (index / (reportsByMonth.length - 1)) * 100);
                    const y = 50 - (m.count / maxCount) * 40 - 5;
                    return `${x},${y}`;
                  });
                  return (
                    <>
                      <polyline
                        fill="none"
                        stroke="#667eea"
                        strokeWidth="2"
                        points={points.join(' ')}
                      />
                      {reportsByMonth.map((m, index) => {
                        const x =
                          (reportsByMonth.length === 1
                            ? 50
                            : (index / (reportsByMonth.length - 1)) * 100);
                        const y = 50 - (m.count / maxCount) * 40 - 5;
                        return (
                          <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="1.5"
                            fill="#667eea"
                          />
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
              <div className="line-chart-labels">
                {reportsByMonth.map((m, index) => (
                  <span key={index}>
                    {m.month}/{String(m.year).slice(2)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="profile-section">
          <h2>📝 Your Reports</h2>
          {reports.length === 0 ? (
            <p className="profile-empty-text">
              You have not submitted any reports yet.
            </p>
          ) : (
            <div className="reports-list">
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="report-item"
                  onClick={() => navigate(`/reports/${report._id}`)}
                >
                  <div className="report-main">
                    <h3>{report.title}</h3>
                    <p className="report-meta">
                      <span className={`badge badge-${report.severity}`}>
                        {report.severity}
                      </span>
                      <span className="badge badge-category">
                        {report.category}
                      </span>
                      <span className="report-date">
                        {formatDate(report.createdAt)}
                      </span>
                    </p>
                  </div>
                  <div className="report-status">
                    <span className={`status-pill status-${report.status}`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="profile-section">
          <h2>🕒 Recent Activity</h2>
          {activity.length === 0 ? (
            <p className="profile-empty-text">
              No recent activity yet. Start contributing to see your timeline here.
            </p>
          ) : (
            <div className="activity-timeline">
              {activity.map((item) => (
                <div key={item._id} className="activity-item">
                  <div className="activity-dot" />
                  <div className="activity-content">
                    <div className="activity-header">
                      <span className="activity-action">
                        {item.action.replace(/_/g, ' ')}
                      </span>
                      <span className="activity-time">
                        {formatDateTime(item.timestamp || item.createdAt)}
                      </span>
                    </div>
                    {item.details && (
                      <p className="activity-details">{item.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



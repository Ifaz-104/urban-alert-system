// frontend/src/pages/ReportDetails.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon } from 'leaflet';
import { reportAPI } from '../services/api';
import 'leaflet/dist/leaflet.css';
import './ReportDetails.css';

// Custom marker icon for incident location
const incidentIcon = new Icon({
    iconUrl: `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 40">
      <circle cx="15" cy="15" r="12" fill="#23FF5722" />
      <path d="M15 25 L10 32 L20 32 Z" fill="#23FF5722" />
    </svg>
  `)}`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
});

export default function ReportDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userVote, setUserVote] = useState(null); // 'upvote', 'downvote', or null
    const [votingLoading, setVotingLoading] = useState(false);

    // Get current user from sessionStorage
    const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchReportDetails();
    }, [id]);

    const fetchReportDetails = async () => {
        try {
            setLoading(true);
            const response = await reportAPI.getReportById(id);
            const reportData = response.data.data;
            setReport(reportData);

            // Check if current user has voted
            if (currentUser.id) {
                if (reportData.upvotedBy?.includes(currentUser.id)) {
                    setUserVote('upvote');
                } else if (reportData.downvotedBy?.includes(currentUser.id)) {
                    setUserVote('downvote');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch report details');
        } finally {
            setLoading(false);
        }
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

    const handleUpvote = async () => {
        if (!currentUser.id) {
            alert('Please login to vote');
            navigate('/login');
            return;
        }

        try {
            setVotingLoading(true);
            const response = await reportAPI.upvoteReport(id);

            // Update local state
            setReport(prev => ({
                ...prev,
                upvotes: response.data.data.upvotes,
                downvotes: response.data.data.downvotes,
            }));

            setUserVote(response.data.data.userVote);
        } catch (err) {
            console.error('Error upvoting:', err);
            alert(err.response?.data?.message || 'Failed to upvote');
        } finally {
            setVotingLoading(false);
        }
    };

    const handleDownvote = async () => {
        if (!currentUser.id) {
            alert('Please login to vote');
            navigate('/login');
            return;
        }

        try {
            setVotingLoading(true);
            const response = await reportAPI.downvoteReport(id);

            // Update local state
            setReport(prev => ({
                ...prev,
                upvotes: response.data.data.upvotes,
                downvotes: response.data.data.downvotes,
            }));

            setUserVote(response.data.data.userVote);
        } catch (err) {
            console.error('Error downvoting:', err);
            alert(err.response?.data?.message || 'Failed to downvote');
        } finally {
            setVotingLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="report-details-container">
                <div className="loading">Loading report details...</div>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="report-details-container">
                <div className="error-message">{error || 'Report not found'}</div>
                <button onClick={() => navigate('/')} className="btn btn--primary">
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="report-details-container">
            <div className="report-details-header">
                <button onClick={() => navigate('/')} className="back-button">
                    ← Back to Reports
                </button>
            </div>

            <div className="report-details-content">
                {/* Left Panel - Report Information */}
                <div className="report-info-panel">
                    <div className="report-title-section">
                        <div className="category-badge">
                            <span className="category-icon-large">{getCategoryIcon(report.category)}</span>
                            <span className="category-name">{report.category.charAt(0).toUpperCase() + report.category.slice(1)}</span>
                        </div>
                        <span
                            className="severity-badge-large"
                            style={{ backgroundColor: getSeverityColor(report.severity) }}
                        >
                            {report.severity.toUpperCase()}
                        </span>
                    </div>

                    <h1>{report.title}</h1>

                    <div className="report-meta">
                        <div className="meta-item">
                            <span className="meta-label">📅 Reported on:</span>
                            <span className="meta-value">{new Date(report.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">👤 Reported by:</span>
                            <span className="meta-value">{report.userId.username}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">📍 Location:</span>
                            <span className="meta-value">{report.address || report.city || 'Unknown Location'}</span>
                        </div>
                        {report.latitude && report.longitude && (
                            <div className="meta-item">
                                <span className="meta-label">🗺️ Coordinates:</span>
                                <span className="meta-value">
                                    {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="report-description-section">
                        <h3>Description</h3>
                        <p>{report.description}</p>
                    </div>

                    {/* Media Gallery Section */}
                    {report.mediaUrls && report.mediaUrls.length > 0 && (
                        <div className="media-gallery-section">
                            <h3>📸 Media Attachments ({report.mediaUrls.length})</h3>
                            <div className="media-gallery-grid">
                                {report.mediaUrls.map((url, index) => {
                                    const isVideo = url.includes('.mp4') || url.includes('.mpeg') || url.includes('.mov') || url.includes('.avi');
                                    return (
                                        <div key={index} className="media-gallery-item">
                                            {isVideo ? (
                                                <video
                                                    controls
                                                    width="100%"
                                                    height="auto"
                                                    style={{ borderRadius: '6px' }}
                                                >
                                                    <source src={`http://localhost:5000${url}`} type="video/mp4" />
                                                    Your browser does not support the video tag.
                                                </video>
                                            ) : (
                                                <img src={`http://localhost:5000${url}`} alt={`Report media ${index}`} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Voting Section */}
                    <div className="voting-section">
                        <h3>Community Feedback</h3>
                        <div className="voting-buttons">
                            <button
                                className={`vote-btn upvote-btn ${userVote === 'upvote' ? 'active' : ''}`}
                                onClick={handleUpvote}
                                disabled={votingLoading}
                            >
                                <span className="vote-icon">👍</span>
                                <span className="vote-count">{report.upvotes || 0}</span>
                                <span className="vote-label">Upvote</span>
                            </button>

                            <button
                                className={`vote-btn downvote-btn ${userVote === 'downvote' ? 'active' : ''}`}
                                onClick={handleDownvote}
                                disabled={votingLoading}
                            >
                                <span className="vote-icon">👎</span>
                                <span className="vote-count">{report.downvotes || 0}</span>
                                <span className="vote-label">Downvote</span>
                            </button>
                        </div>
                    </div>

                    <div className="report-stats">
                        <div className="stat-item">
                            <span className="stat-value">{report.comments.length}</span>
                            <span className="stat-label">Comments</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{report.status}</span>
                            <span className="stat-label">Status</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Map */}
                <div className="report-map-panel">
                    <h3>Incident Location</h3>
                    {report.latitude && report.longitude ? (
                        <div className="map-container">
                            <MapContainer
                                center={[report.latitude, report.longitude]}
                                zoom={15}
                                style={{ height: '500px', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; OpenStreetMap contributors'
                                />

                                {/* Incident location marker */}
                                <Marker
                                    position={[report.latitude, report.longitude]}
                                    icon={incidentIcon}
                                >
                                    <Popup>
                                        <div className="map-popup">
                                            <h4>{report.title}</h4>
                                            <p><strong>Category:</strong> {report.category}</p>
                                            <p><strong>Severity:</strong> {report.severity}</p>
                                            {report.address && <p><strong>Address:</strong> {report.address}</p>}
                                        </div>
                                    </Popup>
                                </Marker>

                                {/* Radius circle around incident */}
                                <Circle
                                    center={[report.latitude, report.longitude]}
                                    radius={100}
                                    color="#ff5722"
                                    fillColor="#ff5722"
                                    fillOpacity={0.1}
                                />
                            </MapContainer>
                        </div>
                    ) : (
                        <div className="no-location">
                            <p>📍 No location data available for this report</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

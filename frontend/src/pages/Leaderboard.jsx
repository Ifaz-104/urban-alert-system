// frontend/src/pages/Leaderboard.jsx
import { useState, useEffect } from 'react';
import { leaderboardAPI } from '../services/api';
import BadgeDisplay from '../components/BadgeDisplay';
import './Leaderboard.css';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [period, setPeriod] = useState('all-time');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await leaderboardAPI.getLeaderboard({ period, limit: 20 });
      if (response.data.success) {
        setLeaderboard(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankClass = (rank) => {
    if (rank === 1) return 'rank-first';
    if (rank === 2) return 'rank-second';
    if (rank === 3) return 'rank-third';
    return '';
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1>🏆 Leaderboard</h1>
        <p>Top contributors to community safety</p>
      </div>

      <div className="period-selector">
        <button
          className={period === 'week' ? 'active' : ''}
          onClick={() => setPeriod('week')}
        >
          This Week
        </button>
        <button
          className={period === 'month' ? 'active' : ''}
          onClick={() => setPeriod('month')}
        >
          This Month
        </button>
        <button
          className={period === 'all-time' ? 'active' : ''}
          onClick={() => setPeriod('all-time')}
        >
          All Time
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading leaderboard...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : leaderboard.length === 0 ? (
        <div className="no-data">No data available for this period</div>
      ) : (
        <div className="leaderboard-list">
          {leaderboard.map((user) => (
            <div key={user.userId} className={`leaderboard-item ${getRankClass(user.rank)}`}>
              <div className="rank-section">
                <span className="rank-icon">{getRankIcon(user.rank)}</span>
                <span className="rank-number">{user.rank}</span>
              </div>
              
              <div className="user-section">
                <div className="user-info">
                  <div className="user-avatar">
                    {user.profilePhoto ? (
                      <img src={user.profilePhoto} alt={user.username} />
                    ) : (
                      <span>{user.username.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="user-details">
                    <h3>{user.username}</h3>
                    <div className="user-stats">
                      <span>{user.totalReports} reports</span>
                    </div>
                  </div>
                </div>
                
                <div className="badges-section">
                  <BadgeDisplay badges={user.badges} size="small" />
                </div>
              </div>

              <div className="points-section">
                <div className="points-value">{user.points.toLocaleString()}</div>
                <div className="points-label">
                  {period === 'all-time' ? 'Total Points' : 'Points Earned'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


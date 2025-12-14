// frontend/src/components/Navbar.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import './Navbar.css';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <h1 className="nav-title" onClick={() => navigate('/')}>
          🚨 Urban Alert
        </h1>
        <div className="nav-links">
          {location.pathname !== '/login' && (
            <button onClick={() => navigate('/')} className="nav-btn">
              Home
            </button>
          )}
          {user ? (
            <>
              <button onClick={() => navigate('/create-report')} className="nav-btn btn-primary">
                Report Hazard
              </button>
              <span className="user-info">
                {user.username} ({user.points || 0} pts)
              </span>
              <NotificationBell user={user} />
              <button onClick={handleLogout} className="nav-btn btn-danger">
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="nav-btn">
                Login
              </button>
              <button onClick={() => navigate('/register')} className="nav-btn btn-primary">
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
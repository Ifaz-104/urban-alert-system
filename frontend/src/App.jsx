// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import EmergencySOS from './components/EmergencySOS';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateReport from './pages/CreateReport';
import ReportDetails from './pages/ReportDetails';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (using sessionStorage for session-only persistence)
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        sessionStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <EmergencySOS />
      <Routes>
        {/* Redirect root to login if not authenticated, else go to Home */}
        <Route path="/" element={user ? <Home user={user} /> : <Navigate to="/login" />} />

        {/* Login page: if already logged in, redirect to Home */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />

        {/* Register page: if already logged in, redirect to Home */}
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

        {/* Protected Create Report route */}
        <Route path="/create-report" element={user ? <CreateReport /> : <Navigate to="/login" />} />

        {/* Protected Settings route */}
        <Route path="/settings" element={user ? <Settings user={user} /> : <Navigate to="/login" />} />

        {/* Protected Profile route */}
        <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />

        {/* Leaderboard route */}
        <Route path="/leaderboard" element={<Leaderboard />} />

        {/* Protected Admin Dashboard route */}
        <Route
          path="/admin"
          element={
            user && user.role === 'admin' ? (
              <AdminDashboard user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Report Details route */}
        <Route path="/reports/:id" element={<ReportDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
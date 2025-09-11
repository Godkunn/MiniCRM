import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (['/login', '/register'].includes(location.pathname)) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/dashboard" className="logo">
          <span className="logo-icon">🚀</span>
          Mini CRM
        </Link>
        <nav className="nav">
          <Link to="/dashboard" className="nav-link">
            Dashboard
          </Link>
          <Link to="/customers" className="nav-link">
            Customers
          </Link>
        </nav>
        <div className="user-menu">
          <span className="welcome-text">Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
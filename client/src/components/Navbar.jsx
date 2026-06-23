import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = [
  { to: '/dashboard',    label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/budgets',      label: 'Budgets' },
  { to: '/upload',       label: 'Upload CSV' },
  { to: '/settings',     label: 'Settings' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <>
      <nav className="navbar">
        <Link to="/dashboard" className="navbar-brand">
          💰 FinTracker
        </Link>

        <div className="navbar-links">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="navbar-right">
          <span className="navbar-user">Hi, {user?.name}</span>
          <ThemeToggle />
          <div className="navbar-avatar" title={user?.name}>{initials}</div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile nav */}
      <div className={`mobile-nav${menuOpen ? ' open' : ''}`}>
        {NAV_LINKS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </NavLink>
        ))}
        <div style={{ display: 'flex', gap: 10, marginTop: 8, alignItems: 'center' }}>
          <ThemeToggle />
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
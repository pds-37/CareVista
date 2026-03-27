import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const navItems = [
  { label: 'Find Doctors', to: '/doctors' },
  { label: 'Services', to: '/departments' },
  { label: 'Health Tools', to: '/about' },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const dashboardLink =
    user?.role === 'admin'
      ? '/care-desk'
      : user?.role === 'doctor'
        ? '/portal/doctor'
        : '/portal/patient';
  const welcomeName = user?.name?.split(' ')[0] || 'Guest';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMenuOpen(false);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-topbar">
        <div className="container navbar-topbar-inner">
          <span>Your Trusted Partner in Health. Check-ups, Treatment, and Care.</span>
          <span>Call Us: +91-987-654-3210</span>
        </div>
      </div>

      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand" aria-label="HealthNexus home">
          <span className="navbar-brand-text">HEALTHNEXUS</span>
        </Link>

        <nav className="navbar-links" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `navbar-link ${isActive ? 'active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="navbar-session">
              <span className="navbar-role-badge">{user?.role || 'member'}</span>
              <span className="navbar-welcome">Welcome, {welcomeName}!</span>
              <Link to={dashboardLink} className="btn btn-secondary btn-small navbar-cta">
                Dashboard
              </Link>
              <button
                type="button"
                className="btn btn-ghost btn-small navbar-auth-button"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="navbar-link navbar-auth-link">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-secondary btn-small navbar-cta">
                Create Account
              </Link>
            </>
          )}
          <button
            type="button"
            className={`navbar-toggle ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen((current) => !current)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={`navbar-mobile ${menuOpen ? 'open' : ''}`}>
        <div className="container navbar-mobile-menu">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `navbar-mobile-link ${isActive ? 'active' : ''}`}
          >
            Home
          </NavLink>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `navbar-mobile-link ${isActive ? 'active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Link to="/appointments" className="btn btn-primary btn-small navbar-mobile-cta">
            Book Appointment
          </Link>
          {isAuthenticated ? (
            <>
              <Link to={dashboardLink} className="btn btn-secondary btn-small navbar-mobile-cta">
                Dashboard
              </Link>
              <button
                type="button"
                className="btn btn-ghost btn-small navbar-mobile-cta"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-mobile-link">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-secondary btn-small navbar-mobile-cta">
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;

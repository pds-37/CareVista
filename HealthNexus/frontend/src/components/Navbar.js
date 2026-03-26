import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Departments', to: '/departments' },
  { label: 'Doctors', to: '/doctors' },
  { label: 'About', to: '/about' },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const portalLabel =
    user?.role === 'admin'
      ? 'Admin Panel'
      : user?.role === 'doctor'
        ? 'Doctor Dashboard'
        : 'My Portal';

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
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand" aria-label="CareVista home">
          <span className="navbar-brand-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="presentation">
              <path
                d="M9.75 3.5h4.5v5.75H20v4.5h-5.75v5.75h-4.5v-5.75H4v-4.5h5.75V3.5Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className="navbar-brand-text">CareVista</span>
        </Link>

        <nav className="navbar-links" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `navbar-link ${isActive ? 'active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-actions">
          <Link to="/appointments" className="btn btn-primary navbar-cta">
            Book Appointment
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/portal" className="btn btn-secondary navbar-cta">
                {portalLabel}
              </Link>
              <button type="button" className="navbar-link navbar-auth-link" onClick={logout}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link navbar-auth-link">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-secondary navbar-cta">
                Join CareVista
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
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `navbar-mobile-link ${isActive ? 'active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Link to="/appointments" className="btn btn-primary navbar-mobile-cta">
            Book Appointment
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/portal" className="btn btn-secondary navbar-mobile-cta">
                {portalLabel}
              </Link>
              <button
                type="button"
                className="navbar-mobile-link"
                onClick={logout}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-mobile-link">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-secondary navbar-mobile-cta">
                Join CareVista
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;

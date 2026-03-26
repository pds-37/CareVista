import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const navigationLinks = [
  { label: 'Home', to: '/' },
  { label: 'Departments', to: '/departments' },
  { label: 'Doctors', to: '/doctors' },
  { label: 'Appointments', to: '/appointments' },
  { label: 'Care Desk', to: '/care-desk' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <>
      <div className="topline">
        <div className="container topline-inner">
          <span>24 / 7 emergency intake: +91 44 4000 2400</span>
          <span>Outpatient hours: Mon to Sat, 8:00 AM to 8:00 PM</span>
        </div>
      </div>

      <header className="navbar-shell">
        <div className="container navbar-inner">
          <Link className="brand-mark" to="/">
            <span className="brand-icon">HN</span>
            <span>
              <strong>HealthNexus</strong>
              <small>Advanced Care Network</small>
            </span>
          </Link>

          <button
            aria-expanded={isOpen}
            aria-label="Toggle navigation"
            className="menu-toggle"
            onClick={() => setIsOpen((current) => !current)}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={`nav-links ${isOpen ? 'open' : ''}`}>
            {navigationLinks.map((link) => (
              <NavLink
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end={link.to === '/'}
                key={link.to}
                to={link.to}
              >
                {link.label}
              </NavLink>
            ))}

            <Link className="btn btn-primary btn-sm nav-cta" to="/appointments">
              Book visit
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Navbar;

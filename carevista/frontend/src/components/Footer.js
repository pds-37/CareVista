import { Link } from 'react-router-dom';

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'Departments', to: '/departments' },
  { label: 'Doctors', to: '/doctors' },
  { label: 'Book Appointment', to: '/appointments' },
  { label: 'Contact', to: '/contact' },
  { label: 'About', to: '/about' },
];

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer-main">
        <div className="site-footer-column">
          <div className="site-footer-brand">
            <span className="navbar-brand-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="presentation">
                <path
                  d="M9.75 3.5h4.5v5.75H20v4.5h-5.75v5.75h-4.5v-5.75H4v-4.5h5.75V3.5Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="navbar-brand-text">CareVista</span>
          </div>
          <p>
            Advanced medicine delivered with warmth, clarity, and respect for
            every patient journey.
          </p>
          <p className="site-footer-copy">
            CareVista serves families with integrated specialty care, diagnostics,
            and urgent support.
          </p>
        </div>

        <div className="site-footer-column">
          <h3>Quick Links</h3>
          <div className="site-footer-links">
            {quickLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="site-footer-column">
          <h3>Contact</h3>
          <ul className="site-footer-contact">
            <li>42 Wellness Ave, Meditown</li>
            <li>+1 (800) 273-8255</li>
            <li>hello@carevista.health</li>
            <li>Open daily, 24/7 emergency coverage</li>
          </ul>
        </div>
      </div>
      <div className="site-footer-bottom">
        <div className="container">
          <p>Copyright 2024 CareVista Medical Center. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

import { Link } from 'react-router-dom';

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/departments' },
  { label: 'Find Doctors', to: '/doctors' },
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
            <span className="navbar-brand-text">HEALTHNEXUS</span>
          </div>
          <p>
            Smarter appointment booking, clearer patient routing, and accessible
            digital care support for every visit.
          </p>
          <p className="site-footer-copy">
            HealthNexus connects patients, specialists, and care teams through a
            cleaner online care experience.
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
            <li>42 Wellness Avenue, Meditown</li>
            <li>+91-987-654-3210</li>
            <li>support@healthnexus.health</li>
            <li>Open daily, 24/7 emergency coverage</li>
          </ul>
        </div>
      </div>
      <div className="site-footer-bottom">
        <div className="container">
          <p>Copyright 2026 HealthNexus. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

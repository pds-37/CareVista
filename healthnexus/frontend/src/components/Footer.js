import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <span className="section-eyebrow">HealthNexus</span>
          <h2>Hospital care with a calmer digital front door.</h2>
          <p>
            Designed to help patients, families, and hospital teams move through care with more confidence and less friction.
          </p>
        </div>

        <div>
          <strong>Explore</strong>
          <div className="footer-links">
            <Link to="/departments">Departments</Link>
            <Link to="/doctors">Doctors</Link>
            <Link to="/appointments">Appointments</Link>
            <Link to="/care-desk">Care Desk</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>

        <div>
          <strong>Visit</strong>
          <div className="footer-links">
            <span>88 Care Circle, Chennai, Tamil Nadu 600028</span>
            <span>Mon to Sat, 8:00 AM to 8:00 PM</span>
            <span>Emergency available 24 / 7</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

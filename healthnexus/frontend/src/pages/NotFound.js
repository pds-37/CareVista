import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <main className="not-found">
      <div className="container not-found-card">
        <span className="section-eyebrow">404</span>
        <h1>This page is not part of the current care path.</h1>
        <p>The link may be outdated, or the page might have moved during the rebuild.</p>
        <Link className="btn btn-primary" to="/">
          Return to home
        </Link>
      </div>
    </main>
  );
};

export default NotFound;

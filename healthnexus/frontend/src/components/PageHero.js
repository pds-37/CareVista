import React from 'react';

const PageHero = ({ eyebrow, title, description, panelTitle, panelItems = [] }) => {
  return (
    <section className="page-hero">
      <div className="container page-hero-grid">
        <div className="page-hero-copy">
          <span className="section-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        <aside className="page-hero-panel">
          <h2>{panelTitle}</h2>
          <div className="page-hero-panel-list">
            {panelItems.map((item) => (
              <div className="page-hero-panel-item" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
};

export default PageHero;

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const FALLBACK_NOTICE =
  'Live updates are temporarily unavailable. Showing the HealthNexus service overview.';

const fallbackOverview = {
  departments: [
    {
      id: 'fallback-dept-cardiology',
      name: 'Cardiology',
      icon: 'CV',
      shortDescription:
        'Heart screening, diagnostics, and specialist follow-up for acute and preventive care.',
    },
    {
      id: 'fallback-dept-neurology',
      name: 'Neurology',
      icon: 'NE',
      shortDescription:
        'Consultation and treatment planning for migraine, stroke, and nerve-related conditions.',
    },
    {
      id: 'fallback-dept-orthopedics',
      name: 'Orthopedics',
      icon: 'OR',
      shortDescription:
        'Joint, bone, and mobility care with imaging, recovery planning, and surgical review.',
    },
    {
      id: 'fallback-dept-pediatrics',
      name: 'Pediatrics',
      icon: 'PD',
      shortDescription:
        'Child-focused care for routine visits, vaccination support, and acute concerns.',
    },
    {
      id: 'fallback-dept-radiology',
      name: 'Radiology',
      icon: 'RA',
      shortDescription:
        'Fast imaging support for diagnostics, specialist referrals, and follow-up procedures.',
    },
    {
      id: 'fallback-dept-general-medicine',
      name: 'General Medicine',
      icon: 'GM',
      shortDescription:
        'Primary consultation, first-line assessment, and care routing across core specialties.',
    },
  ],
};

const mergeOverviewWithFallback = (data = {}) => ({
  departments:
    Array.isArray(data.departments) && data.departments.length > 0
      ? data.departments
      : fallbackOverview.departments,
});

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" role="presentation" aria-hidden="true">
      <path
        d="M10.5 4a6.5 6.5 0 1 1 0 13a6.5 6.5 0 0 1 0-13Zm0 2a4.5 4.5 0 1 0 0 9a4.5 4.5 0 0 0 0-9Zm5.96 10.54l3.5 3.5l-1.42 1.42l-3.5-3.5l1.42-1.42Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ShortcutIcon({ type }) {
  if (type === 'doctor') {
    return (
      <svg viewBox="0 0 24 24" role="presentation" aria-hidden="true">
        <path
          d="M18 3a1 1 0 0 1 1 1v2h1a2 2 0 0 1 2 2v4h-2V8h-1v2h-2V8h-2a2 2 0 0 1-2-2V5H7v1a2 2 0 0 1-2 2H4v4H2V8a2 2 0 0 1 2-2h1V4a1 1 0 0 1 1-1h12Zm-3 2v1h2V5h-2Zm-8 0v1h4V5H7Zm5 7a5 5 0 1 1 0 10a5 5 0 0 1 0-10Zm0 2a1 1 0 0 0-1 1v1h-1a1 1 0 1 0 0 2h1v1a1 1 0 1 0 2 0v-1h1a1 1 0 1 0 0-2h-1v-1a1 1 0 0 0-1-1Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (type === 'checkup') {
    return (
      <svg viewBox="0 0 24 24" role="presentation" aria-hidden="true">
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5A4.5 4.5 0 0 1 6.5 4A5 5 0 0 1 12 7.09A5 5 0 0 1 17.5 4A4.5 4.5 0 0 1 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Zm3.32-10.85h-1.7l-1.27 2.54l-2.07-4.14l-1.08 1.6H7.18v2h3.08l.73-1.08L13 15.56l1.56-3.06h.76v-2Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" role="presentation" aria-hidden="true">
      <path
        d="M5 5a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v1h1a2 2 0 0 1 2 2v3a7 7 0 0 1-7 7h-1v2h2v2H8v-2h2v-2H9a7 7 0 0 1-7-7V8a2 2 0 0 1 2-2h1V5Zm2 0v1h10V5a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1Zm-1 3H4v3a5 5 0 0 0 5 5h6a5 5 0 0 0 5-5V8h-2v2H6V8Zm8 3a2 2 0 1 1 0 4a2 2 0 0 1 0-4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Home() {
  const [overview, setOverview] = useState(() => mergeOverviewWithFallback());
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const loadOverview = async () => {
      try {
        setError('');
        const { data } = await api.get('/site/overview');

        if (mounted) {
          setOverview(mergeOverviewWithFallback(data));
        }
      } catch (err) {
        if (mounted) {
          setError(FALLBACK_NOTICE);
          setOverview(mergeOverviewWithFallback());
        }
      }
    };

    loadOverview();

    return () => {
      mounted = false;
    };
  }, []);

  const shortcutCards = useMemo(
    () => [
      { key: 'doctor', title: 'Find a Doctor', to: '/doctors', icon: 'doctor' },
      {
        key: 'checkup',
        title: 'Health Check-up',
        to: '/appointments',
        icon: 'checkup',
      },
      { key: 'medicine', title: 'Medicine', to: '/contact', icon: 'medicine' },
    ],
    []
  );

  const departmentCards = useMemo(
    () => overview.departments.slice(0, 6),
    [overview.departments]
  );
  const featuredDepartment = departmentCards[0];
  const secondaryDepartments = departmentCards.slice(1);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmedQuery = searchQuery.trim();

    navigate(
      trimmedQuery ? `/doctors?search=${encodeURIComponent(trimmedQuery)}` : '/doctors'
    );
  };

  return (
    <>
      <section className="home-landing">
        <div className="container">
          {error ? (
            <div className="home-status-badge landing-status-badge" role="status" aria-live="polite">
              {error}
            </div>
          ) : null}
          <div className="landing-hero-panel">
            <div className="landing-hero">
              <div className="landing-hero-copy">
                <span className="landing-eyebrow">HealthNexus</span>
                <h1>Schedule Your Appointment Online</h1>
                <p>
                  Your Health is Our Priority. Find top doctors and services near you.
                </p>

                <form className="landing-search-form" onSubmit={handleSearchSubmit}>
                  <label className="sr-only" htmlFor="landing-doctor-search">
                    Search for doctor or specialty
                  </label>
                  <div className="landing-search-field">
                    <span className="landing-search-icon">
                      <SearchIcon />
                    </span>
                    <input
                      id="landing-doctor-search"
                      type="search"
                      className="landing-search-input"
                      placeholder="Search for Doctor or Specialty"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary landing-search-submit">
                    Book an Appointment
                  </button>
                </form>
              </div>
            </div>

            <div className="landing-shortcut-grid">
              {shortcutCards.map((card) => (
                <Link to={card.to} className="landing-shortcut-card" key={card.key}>
                  <span className="landing-shortcut-icon" aria-hidden="true">
                    <ShortcutIcon type={card.icon} />
                  </span>
                  <strong>{card.title}</strong>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section landing-specialties-section">
        <div className="container">
          <div className="landing-section-heading">
            <div>
              <h2 className="landing-section-title">Specialities &amp; Procedures</h2>
              <p>
                Browse the core departments patients use most often when booking care online.
              </p>
            </div>
            <Link to="/departments" className="landing-section-link">
              View all services
            </Link>
          </div>

          <div className="landing-specialties-layout">
            {featuredDepartment ? (
              <article className="landing-feature-panel">
                <div className="landing-feature-visual" aria-hidden="true">
                  <div className="landing-feature-orb" />
                  <div className="landing-feature-card">
                    <span>{featuredDepartment.icon || 'HN'}</span>
                    <strong>{featuredDepartment.name}</strong>
                  </div>
                </div>

                <div className="landing-feature-copy">
                  <span className="landing-feature-kicker">Popular specialty</span>
                  <h3>{featuredDepartment.name}</h3>
                  <p>{featuredDepartment.shortDescription}</p>
                  <Link to="/departments" className="btn btn-primary btn-small landing-feature-action">
                    Explore Services
                  </Link>
                </div>
              </article>
            ) : null}

            <div className="landing-specialty-list">
              {secondaryDepartments.map((department) => (
                <article className="landing-specialty-card" key={department.id || department._id}>
                  <div className="landing-specialty-icon">{department.icon || 'HN'}</div>
                  <div className="landing-specialty-body">
                    <span className="landing-specialty-eyebrow">Department</span>
                    <h3>{department.name}</h3>
                    <p>{department.shortDescription}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;

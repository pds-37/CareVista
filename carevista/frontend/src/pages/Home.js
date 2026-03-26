import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const getInitials = (name) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

function Home() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadOverview = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await api.get('/site/overview');

        if (mounted) {
          setOverview(data);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.error ||
              'Unable to load CareVista right now. Please try again shortly.'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOverview();

    return () => {
      mounted = false;
    };
  }, []);

  const featuredDoctors = useMemo(
    () => overview?.featuredDoctors || [],
    [overview]
  );

  if (loading) {
    return (
      <section className="section section-centered">
        <div className="loading-spinner" aria-label="Loading homepage content" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="section">
        <div className="container">
          <div className="alert-error">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="home-hero">
        <div className="container home-hero-content">
          <div className="home-hero-copy">
            <span className="eyebrow">Trusted Multispecialty Care</span>
            <h1>{overview.hero.headline}</h1>
            <p>{overview.hero.subheadline}</p>
            <div className="hero-actions">
              <Link to="/appointments" className="btn btn-primary">
                {overview.hero.ctaText}
              </Link>
              <Link to="/departments" className="btn btn-outline btn-light">
                Our Departments
              </Link>
            </div>
          </div>
          <div className="home-hero-card card">
            <p className="hero-card-label">Today at CareVista</p>
            <h2>Coordinated care from consultation to recovery.</h2>
            <ul className="hero-checklist">
              <li>Same-week specialist appointments</li>
              <li>Modern imaging and diagnostics onsite</li>
              <li>Round-the-clock emergency response</li>
            </ul>
          </div>
        </div>
        <svg
          className="hero-cross"
          viewBox="0 0 160 160"
          aria-hidden="true"
          role="presentation"
        >
          <path
            fill="currentColor"
            d="M60 12h40v48h48v40h-48v48H60v-48H12V60h48z"
          />
        </svg>
      </section>

      <section className="stats-strip">
        <div className="container stats-grid">
          {overview.stats.map((stat) => (
            <article className="stats-card" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <h2 className="section-title">Our Specialties</h2>
            <p>
              Comprehensive departments built around the most common and complex
              care needs of modern families.
            </p>
          </div>
          <div className="grid-3">
            {overview.departments.map((department) => (
              <article className="card department-preview-card" key={department.id}>
                <span className="department-icon" aria-hidden="true">
                  {department.icon}
                </span>
                <h3>{department.name}</h3>
                <p>{department.shortDescription}</p>
                <Link to="/departments" className="text-link">
                  Learn more ->
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-heading">
            <h2 className="section-title">Meet Our Physicians</h2>
            <p>
              Experienced department leaders focused on evidence-based treatment
              and clear communication.
            </p>
          </div>
          <div className="grid-3">
            {featuredDoctors.map((doctor) => (
              <article className="card doctor-card" key={doctor.id}>
                <div className="doctor-card-header">
                  {doctor.imageUrl ? (
                    <img
                      src={doctor.imageUrl}
                      alt={doctor.name}
                      className="doctor-avatar-image"
                    />
                  ) : (
                    <div className="doctor-avatar">{getInitials(doctor.name)}</div>
                  )}
                  <div>
                    <h3>{doctor.name}</h3>
                    <p className="doctor-specialty">{doctor.specialty}</p>
                  </div>
                </div>
                <span className="department-pill">{doctor.department}</span>
                <p className="doctor-bio line-clamp-2">{doctor.bio}</p>
                <div className="doctor-rating-row">
                  <span aria-label={`Rated ${doctor.rating || 4.8} out of 5`}>
                    ⭐ {doctor.rating || 4.8}
                  </span>
                  <span>{doctor.reviewCount || 100}+ reviews</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section testimonials-section">
        <div className="container">
          <div className="section-heading">
            <h2 className="section-title">Patient Stories</h2>
            <p>
              People remember how clinical care made them feel. These stories
              reflect the standard CareVista works to uphold every day.
            </p>
          </div>
          <div className="grid-2">
            {overview.testimonials.map((testimonial) => (
              <article className="card testimonial-card" key={testimonial.name}>
                <span className="testimonial-quote" aria-hidden="true">
                  "
                </span>
                <p>{testimonial.quote}</p>
                <footer>
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.role}</span>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container faq-layout">
          <div>
            <div className="section-heading section-heading-left">
              <h2 className="section-title">Frequently Asked Questions</h2>
              <p>
                Practical answers to help patients prepare for appointments,
                records, and first visits.
              </p>
            </div>
            <div className="faq-list">
              {overview.faq.map((item, index) => {
                const isOpen = openFaq === index;

                return (
                  <article
                    className={`faq-item ${isOpen ? 'open' : ''}`}
                    key={item.question}
                  >
                    <button
                      type="button"
                      className="faq-trigger"
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      aria-expanded={isOpen}
                    >
                      <span>{item.question}</span>
                      <span aria-hidden="true">{isOpen ? '-' : '+'}</span>
                    </button>
                    {isOpen && <p className="faq-answer">{item.answer}</p>}
                  </article>
                );
              })}
            </div>
          </div>
          <aside className="card about-snippet-card">
            <span className="eyebrow">About CareVista</span>
            <h3>{overview.aboutSnippet.title}</h3>
            <p>{overview.aboutSnippet.body}</p>
            <Link to="/about" className="btn btn-secondary">
              Learn About Us
            </Link>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-banner">
            <div>
              <span className="eyebrow eyebrow-light">Start Your Care Plan</span>
              <h2>Ready to feel better?</h2>
              <p>
                Book a consultation with the department that best matches your
                needs and we will guide the next step.
              </p>
            </div>
            <Link to="/appointments" className="btn btn-primary btn-on-dark">
              Schedule Your Visit Today
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;

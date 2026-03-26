import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DepartmentCard from '../components/DepartmentCard';
import DoctorCard from '../components/DoctorCard';
import LoadingSpinner from '../components/LoadingSpinner';
import SectionHeader from '../components/SectionHeader';
import api from '../utils/api';

const Home = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadOverview = async () => {
      try {
        const response = await api.get('/site/overview');
        if (mounted) {
          setOverview(response.data.data);
        }
      } catch (error) {
        if (mounted) {
          setOverview(null);
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

  if (loading) {
    return (
      <main className="page-section">
        <div className="container">
          <LoadingSpinner text="Preparing your care dashboard..." />
        </div>
      </main>
    );
  }

  if (!overview) {
    return (
      <main className="page-section">
        <div className="container support-card">
          <span className="section-eyebrow">Temporarily unavailable</span>
          <h1>We could not load the hospital overview.</h1>
          <p>Please refresh the page or try again once the API is available.</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="hero-eyebrow">{overview.hero.eyebrow}</span>
            <h1>{overview.hero.title}</h1>
            <p>{overview.hero.description}</p>

            <div className="hero-actions">
              <Link className="btn btn-primary btn-lg" to={overview.hero.primaryCta.href}>
                {overview.hero.primaryCta.label}
              </Link>
              <Link className="btn btn-secondary btn-lg" to={overview.hero.secondaryCta.href}>
                {overview.hero.secondaryCta.label}
              </Link>
            </div>

            <div className="hero-proof">
              {overview.highlights.map((item) => (
                <article className="hero-proof-card" key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="hero-panel">
            <div className="hero-panel-card hero-panel-card-primary">
              <span className="section-eyebrow">Fast facts</span>
              <h2>Built for reassurance from first click to follow-up.</h2>
              <div className="hero-panel-list">
                <div>
                  <span>Emergency line</span>
                  <strong>{overview.quickFacts.emergencyPhone}</strong>
                </div>
                <div>
                  <span>Outpatient hours</span>
                  <strong>{overview.quickFacts.outpatientHours}</strong>
                </div>
                <div>
                  <span>Location</span>
                  <strong>{overview.quickFacts.address}</strong>
                </div>
              </div>
            </div>

            <div className="hero-panel-card hero-panel-card-soft">
              <span className="section-eyebrow">Visit flow</span>
              <p>
                Submit a request, get matched with the right team, and receive guidance before arrival.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="stats-strip">
        <div className="container stats-grid">
          {overview.stats.map((item) => (
            <article className="stat-card" key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <SectionHeader
            description="Every department and interface element was shaped to feel professional, fresh, and easier to navigate during stressful moments."
            eyebrow="Design Direction"
            title="Hospital colors that feel calm, clear, and trustworthy"
          />

          <div className="highlights-grid">
            {overview.highlights.map((item) => (
              <article className="highlight-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section page-section-tint">
        <div className="container">
          <SectionHeader
            action={
              <Link className="btn btn-secondary btn-sm" to="/departments">
                View all departments
              </Link>
            }
            description="Core specialties, faster triage cues, and clearer department information make it easier to choose the right care path."
            eyebrow="Departments"
            title="A care network organized around hospital reality"
          />

          <div className="department-grid">
            {overview.departments.map((department) => (
              <DepartmentCard department={department} key={department._id} />
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <SectionHeader
            description="A simple step-by-step path lowers uncertainty and gives patients a clearer sense of what happens next."
            eyebrow="Care Journey"
            title="What the patient experience looks like"
          />

          <div className="journey-grid">
            {overview.careJourney.map((item) => (
              <article className="journey-card" key={item.step}>
                <span>{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section page-section-tint">
        <div className="container">
          <SectionHeader
            action={
              <Link className="btn btn-secondary btn-sm" to="/doctors">
                Meet all specialists
              </Link>
            }
            description="Featured specialists combine experience, communication, and department alignment for smoother referrals and follow-ups."
            eyebrow="Doctors"
            title="Trusted specialists across the network"
          />

          <div className="doctor-grid">
            {overview.featuredDoctors.map((doctor) => (
              <DoctorCard doctor={doctor} key={doctor._id} />
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container testimonial-layout">
          <div>
            <SectionHeader
              description="Families remember how care felt, not just how it was scheduled. We designed this experience with that in mind."
              eyebrow="Patient Voice"
              title="What people value most"
            />
          </div>

          <div className="testimonial-grid">
            {overview.testimonials.map((testimonial) => (
              <article className="testimonial-card" key={testimonial.name}>
                <p>"{testimonial.quote}"</p>
                <strong>{testimonial.name}</strong>
                <span>{testimonial.role}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section page-section-tint">
        <div className="container">
          <SectionHeader
            description="Straight answers for first-time visits, family coordination, and preferred doctor requests."
            eyebrow="FAQ"
            title="Helpful details before you arrive"
          />

          <div className="faq-grid">
            {overview.faqs.map((item) => (
              <article className="faq-card" key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="cta-band">
            <div>
              <span className="section-eyebrow">Ready to begin?</span>
              <h2>Start with the right department and let the care desk handle the next step.</h2>
            </div>
            <div className="cta-actions">
              <Link className="btn btn-primary" to="/appointments">
                Request appointment
              </Link>
              <Link className="btn btn-secondary" to="/contact">
                Contact support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;

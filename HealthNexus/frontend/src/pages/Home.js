import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const FALLBACK_NOTICE =
  'Live updates are temporarily unavailable. Showing CareVista overview information.';

const fallbackOverview = {
  hero: {
    headline: 'World-Class Care, Closer to Home',
    subheadline:
      'CareVista brings together expert physicians, advanced diagnostics, and compassionate nursing under one roof so every patient feels seen, heard, and healed.',
    ctaText: 'Book an Appointment',
    ctaLink: '/appointments',
  },
  stats: [
    { label: 'Years of Service', value: '25+' },
    { label: 'Expert Physicians', value: '120+' },
    { label: 'Patients Treated', value: '50,000+' },
    { label: 'Departments', value: '6' },
  ],
  departments: [
    {
      id: 'fallback-dept-cardiology',
      name: 'Cardiology',
      icon: 'CV',
      shortDescription:
        'Comprehensive heart and vascular care with preventive and acute services.',
    },
    {
      id: 'fallback-dept-neurology',
      name: 'Neurology',
      icon: 'NE',
      shortDescription:
        'Specialist care for the brain, spine, nerves, and stroke recovery.',
    },
    {
      id: 'fallback-dept-orthopedics',
      name: 'Orthopedics',
      icon: 'OR',
      shortDescription:
        'Bone, joint, and mobility care for injuries and chronic pain.',
    },
    {
      id: 'fallback-dept-pediatrics',
      name: 'Pediatrics',
      icon: 'PD',
      shortDescription:
        'Compassionate pediatric care from infancy through adolescence.',
    },
    {
      id: 'fallback-dept-oncology',
      name: 'Oncology',
      icon: 'ON',
      shortDescription:
        'Integrated cancer diagnosis, treatment planning, and support services.',
    },
    {
      id: 'fallback-dept-emergency',
      name: 'Emergency Medicine',
      icon: 'ER',
      shortDescription:
        '24/7 emergency evaluation, stabilization, and urgent care routing.',
    },
  ],
  featuredDoctors: [
    {
      id: 'fallback-doc-sarah-mitchell',
      name: 'Dr. Sarah Mitchell',
      specialty: 'Interventional Cardiology',
      department: 'Cardiology',
      imageUrl: '',
      bio: 'Dr. Mitchell leads the Cardiology service with a strong focus on prevention, early intervention, and recovery planning for patients living with complex cardiovascular conditions.',
      rating: 4.9,
      reviewCount: 214,
    },
    {
      id: 'fallback-doc-james-okafor',
      name: 'Dr. James Okafor',
      specialty: 'Clinical Neurology',
      department: 'Neurology',
      imageUrl: '',
      bio: 'Dr. Okafor is known for clear neurological evaluations, thoughtful diagnostic planning, and careful communication with patients managing chronic neurological symptoms.',
      rating: 4.8,
      reviewCount: 186,
    },
    {
      id: 'fallback-doc-priya-sharma',
      name: 'Dr. Priya Sharma',
      specialty: 'Orthopedic Surgery',
      department: 'Orthopedics',
      imageUrl: '',
      bio: 'Dr. Sharma combines surgical precision with rehabilitation-first planning, helping patients recover strength, confidence, and long-term mobility after injury or chronic pain.',
      rating: 4.9,
      reviewCount: 201,
    },
    {
      id: 'fallback-doc-carlos-reyes',
      name: 'Dr. Carlos Reyes',
      specialty: 'General Pediatrics',
      department: 'Pediatrics',
      imageUrl: '',
      bio: 'Dr. Reyes provides calm, family-centered pediatric care with particular strength in preventive visits, developmental milestones, and acute same-day child consultations.',
      rating: 4.8,
      reviewCount: 233,
    },
    {
      id: 'fallback-doc-emily-chen',
      name: 'Dr. Emily Chen',
      specialty: 'Medical Oncology',
      department: 'Oncology',
      imageUrl: '',
      bio: 'Dr. Chen leads the Oncology department with an emphasis on multidisciplinary planning, compassionate patient education, and continuity through treatment and survivorship.',
      rating: 5,
      reviewCount: 167,
    },
    {
      id: 'fallback-doc-marcus-webb',
      name: 'Dr. Marcus Webb',
      specialty: 'Emergency Medicine',
      department: 'Emergency Medicine',
      imageUrl: '',
      bio: 'Dr. Webb oversees rapid triage and emergency stabilization with a disciplined, team-based approach that keeps urgent patients moving quickly toward the right level of care.',
      rating: 4.7,
      reviewCount: 145,
    },
  ],
  testimonials: [
    {
      name: 'Ava Richardson',
      role: 'Patient',
      quote:
        'From the moment I walked in, the staff treated me with patience and respect. My cardiology follow-up felt organized, calm, and far less stressful than I expected.',
    },
    {
      name: 'Michael Torres',
      role: 'Caregiver',
      quote:
        'CareVista helped our family navigate oncology appointments with real clarity. We always knew who to call, what came next, and how to prepare.',
    },
    {
      name: 'Nina Patel',
      role: 'Patient',
      quote:
        'The orthopedic team took my pain seriously and built a recovery plan that fit my daily routine. I felt supported, not rushed, throughout the process.',
    },
    {
      name: 'Daniel Brooks',
      role: 'Caregiver',
      quote:
        'Our pediatric visit was thoughtful from start to finish. The doctor spoke directly to our child in a reassuring way and made the whole family feel at ease.',
    },
  ],
  faq: [
    {
      question: 'How do I request an appointment at CareVista?',
      answer:
        'You can submit an appointment request online through the Book Appointment page. Our care team reviews requests promptly and contacts you to confirm the best available slot.',
    },
    {
      question: 'Can I choose a specific doctor when booking?',
      answer:
        'Yes. You can select a department first and then choose an available physician in that specialty. If your preferred doctor is unavailable, the care desk will suggest the closest alternative.',
    },
    {
      question: 'Do you accept same-day visits?',
      answer:
        'Same-day appointments may be available depending on the department and urgency of the concern. Emergency cases should go directly to Emergency Medicine or call ahead if possible.',
    },
    {
      question: 'What should I bring to my first visit?',
      answer:
        'Please bring a photo ID, insurance information if applicable, a current medication list, and any prior reports or imaging relevant to your concern.',
    },
    {
      question: 'How does the care-desk dashboard work?',
      answer:
        'The care-desk view is an internal operational screen that allows staff to review incoming appointments and contact messages, track status changes, and keep response times organized.',
    },
    {
      question: 'Will someone respond to my contact form message?',
      answer:
        'Yes. Contact requests are sent directly to the care desk. For urgent medical concerns, call the hospital directly rather than waiting for an online reply.',
    },
  ],
  aboutSnippet: {
    title: 'Our Mission',
    body:
      'CareVista was founded on the belief that exceptional healthcare is a right, not a privilege. We combine clinical excellence, operational clarity, and genuine compassion so patients and families can move through care with confidence.',
  },
};

const getInitials = (name) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const mergeOverviewWithFallback = (data = {}) => ({
  hero: {
    ...fallbackOverview.hero,
    ...(data.hero || {}),
  },
  stats:
    Array.isArray(data.stats) && data.stats.length > 0
      ? data.stats
      : fallbackOverview.stats,
  departments:
    Array.isArray(data.departments) && data.departments.length > 0
      ? data.departments
      : fallbackOverview.departments,
  featuredDoctors:
    Array.isArray(data.featuredDoctors) && data.featuredDoctors.length > 0
      ? data.featuredDoctors
      : fallbackOverview.featuredDoctors,
  testimonials:
    Array.isArray(data.testimonials) && data.testimonials.length > 0
      ? data.testimonials
      : fallbackOverview.testimonials,
  faq:
    Array.isArray(data.faq) && data.faq.length > 0 ? data.faq : fallbackOverview.faq,
  aboutSnippet: {
    ...fallbackOverview.aboutSnippet,
    ...(data.aboutSnippet || {}),
  },
});

function Home() {
  const [overview, setOverview] = useState(() => mergeOverviewWithFallback());
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState(0);

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

  return (
    <>
      <section className="home-hero">
        <div className="container home-hero-content">
          <div className="home-hero-copy">
            <span className="eyebrow">Trusted Multispecialty Care</span>
            <h1>{overview.hero.headline}</h1>
            <p>{overview.hero.subheadline}</p>
            {error ? (
              <div className="home-status-badge" role="status" aria-live="polite">
                {error}
              </div>
            ) : null}
            <div className="hero-actions">
              <Link
                to={overview.hero.ctaLink || '/appointments'}
                className="btn btn-primary"
              >
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
            {overview.featuredDoctors.map((doctor) => (
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
                    Rating {doctor.rating || 4.8}
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

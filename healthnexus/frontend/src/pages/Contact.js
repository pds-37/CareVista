import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHero from '../components/PageHero';
import SectionHeader from '../components/SectionHeader';
import api from '../utils/api';

const initialState = {
  fullName: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

const Contact = () => {
  const [overview, setOverview] = useState(null);
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/site/contact', formData);
      toast.success('Your message has been sent to the care desk.');
      setFormData(initialState);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to send your message right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <PageHero
        description="Reach the care desk for appointment help, department guidance, preventive package questions, or follow-up support."
        eyebrow="Contact"
        panelItems={[
          { label: 'Emergency line', value: '+91 44 4000 2400' },
          { label: 'Care desk hours', value: '8:00 AM - 8:00 PM' },
          { label: 'Location', value: 'Chennai' },
        ]}
        panelTitle="Need support fast?"
        title="Talk to the team behind the patient journey."
      />

      <section className="page-section">
        <div className="container split-layout">
          <div className="form-panel">
            <SectionHeader
              description="Tell us what you need and we will route the conversation to the right team."
              eyebrow="Message the care desk"
              title="Send a support request"
            />

            <form className="appointment-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  Full name
                  <input
                    name="fullName"
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    type="text"
                    value={formData.fullName}
                  />
                </label>

                <label>
                  Email
                  <input
                    name="email"
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                    type="email"
                    value={formData.email}
                  />
                </label>

                <label>
                  Phone
                  <input
                    name="phone"
                    onChange={handleChange}
                    placeholder="+91"
                    type="tel"
                    value={formData.phone}
                  />
                </label>

                <label>
                  Subject
                  <input
                    name="subject"
                    onChange={handleChange}
                    placeholder="What can we help with?"
                    required
                    type="text"
                    value={formData.subject}
                  />
                </label>
              </div>

              <label>
                Message
                <textarea
                  name="message"
                  onChange={handleChange}
                  placeholder="Share your question, appointment need, or the context we should know."
                  required
                  rows="5"
                  value={formData.message}
                />
              </label>

              <button className="btn btn-primary btn-lg" disabled={submitting} type="submit">
                {submitting ? 'Sending message...' : 'Send message'}
              </button>
            </form>
          </div>

          <aside className="side-panel">
            {loading ? (
              <LoadingSpinner text="Loading contact details..." />
            ) : (
              <>
                <SectionHeader
                  description="For emergencies, call immediately. For routine queries, our team responds during care desk hours."
                  eyebrow="Hospital Details"
                  title="Reach us directly"
                />

                <div className="benefit-list">
                  <article className="benefit-card">
                    <strong>Emergency</strong>
                    <p>{overview?.quickFacts?.emergencyPhone || '+91 44 4000 2400'}</p>
                  </article>
                  <article className="benefit-card">
                    <strong>Outpatient hours</strong>
                    <p>{overview?.quickFacts?.outpatientHours || 'Mon to Sat, 8:00 AM to 8:00 PM'}</p>
                  </article>
                  <article className="benefit-card">
                    <strong>Address</strong>
                    <p>{overview?.quickFacts?.address || '88 Care Circle, Chennai, Tamil Nadu 600028'}</p>
                  </article>
                </div>
              </>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
};

export default Contact;

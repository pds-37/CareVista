import { useState } from 'react';
import api from '../api';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialFormState = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

function Contact() {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const validate = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'Please enter your full name.';
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Please enter your email address.';
    } else if (!emailPattern.test(formData.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.subject.trim()) {
      nextErrors.subject = 'Please add a subject line.';
    }

    if (!formData.message.trim()) {
      nextErrors.message = 'Please share how we can help.';
    } else if (formData.message.trim().length < 30) {
      nextErrors.message =
        'Please provide at least 30 characters so the team has enough context.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      await api.post('/site/contact', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      setSuccessMessage(`Thanks, ${formData.name.trim()}! We'll be in touch.`);
      setFormData(initialFormState);
      setErrors({});
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'We could not send your message right now. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow eyebrow-light">Care Team Support</span>
          <h1>Contact HealthNexus</h1>
          <p>
            Reach out for scheduling questions, records guidance, referrals, or
            general patient support.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-layout">
          <aside className="card contact-info-card">
            <h2>How to Reach Us</h2>
            <div className="contact-info-list">
              <div>
                <span>Address</span>
                <strong>42 Wellness Ave, Meditown</strong>
              </div>
              <div>
                <span>Phone</span>
                <strong>+1 (800) 273-8255</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>hello@healthnexus.health</strong>
              </div>
              <div>
                <span>Hours</span>
                <strong>Mon-Sat 8:00 AM-8:00 PM, Emergency 24/7</strong>
              </div>
            </div>
          </aside>

          <div className="card contact-form-card">
            <h2>Send a Message</h2>
            {successMessage && <div className="alert-success">{successMessage}</div>}
            {error && <div className="alert-error">{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="field-error">{errors.email}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="subject">
                  Subject
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  className="form-input"
                  value={formData.subject}
                  onChange={handleChange}
                />
                {errors.subject && <p className="field-error">{errors.subject}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  className="form-textarea"
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                />
                {errors.message && <p className="field-error">{errors.message}</p>}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span className="button-loading">
                    <span className="button-spinner" aria-hidden="true" />
                    Sending Message
                  </span>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default Contact;

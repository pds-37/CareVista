import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate replace to="/portal" />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');
      await register(formData);
      navigate('/portal', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow eyebrow-light">Patient Onboarding</span>
          <h1>Create your CareVista account</h1>
          <p>
            Register once to book appointments, review statuses, and keep your
            healthcare history in one place.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container auth-layout">
          <div className="card auth-card">
            <h2>Patient Registration</h2>
            <p className="form-intro">
              Doctor and admin accounts are provisioned internally. Patient
              registration is available here.
            </p>

            {error ? <div className="alert-error">{error}</div> : null}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="register-name">
                  Full Name
                </label>
                <input
                  id="register-name"
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="register-email">
                  Email Address
                </label>
                <input
                  id="register-email"
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="register-phone">
                  Phone Number
                </label>
                <input
                  id="register-phone"
                  type="tel"
                  className="form-input"
                  value={formData.phone}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="register-password">
                  Password
                </label>
                <input
                  id="register-password"
                  type="password"
                  className="form-input"
                  value={formData.password}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                />
              </div>

              <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          </div>

          <aside className="card auth-side-card">
            <span className="eyebrow">After Signup</span>
            <h3>What you unlock</h3>
            <ul className="feature-list">
              <li>Appointment booking tied to your patient account.</li>
              <li>A personal dashboard with appointment history.</li>
              <li>Faster future visits with prefilled patient details.</li>
            </ul>
            <p className="auth-side-copy">
              Already registered? Use your account to continue.
            </p>
            <Link to="/login" className="btn btn-secondary">
              Sign In Instead
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}

export default Register;

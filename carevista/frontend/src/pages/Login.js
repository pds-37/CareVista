import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const nextPath = location.state?.from || '/portal';

  if (isAuthenticated) {
    return <Navigate replace to="/portal" />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');
      await login(formData);
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to sign in right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow eyebrow-light">Secure Access</span>
          <h1>Sign in to CareVista</h1>
          <p>
            Access your patient history, doctor workflow, or admin controls from
            one secure login.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container auth-layout">
          <div className="card auth-card">
            <h2>Welcome back</h2>
            <p className="form-intro">
              Sign in with the account connected to your CareVista role.
            </p>

            {error ? <div className="alert-error">{error}</div> : null}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">
                  Email Address
                </label>
                <input
                  id="login-email"
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
                <label className="form-label" htmlFor="login-password">
                  Password
                </label>
                <input
                  id="login-password"
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
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>

          <aside className="card auth-side-card">
            <span className="eyebrow">Portal Access</span>
            <h3>Built for every role</h3>
            <ul className="feature-list">
              <li>Patients can track appointment history and status.</li>
              <li>Doctors can review schedules and assigned patients.</li>
              <li>Admins can monitor users, doctors, departments, and intake.</li>
            </ul>
            <p className="auth-side-copy">
              If your database was seeded, these demo accounts are available:
            </p>
            <ul className="feature-list">
              <li>Admin: admin@carevista.health / Admin123!</li>
              <li>Doctor: dr.sarah.mitchell@carevista.health / Doctor123!</li>
              <li>Patient: olivia.bennett@example.com / Patient123!</li>
            </ul>
            <p className="auth-side-copy">
              New patient here? Create an account to manage future appointments.
            </p>
            <Link to="/register" className="btn btn-secondary">
              Create Patient Account
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}

export default Login;

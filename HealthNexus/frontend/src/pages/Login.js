import { useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getPortalPathForRole, roleOptions } from '../auth/roleConfig';

const demoCredentials = {
  patient: 'Use your registered patient email and password.',
  doctor: 'Use the doctor account provisioned for your profile.',
  admin: 'Use the administrator account created for your system.',
};

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, user } = useAuth();
  const [formData, setFormData] = useState({
    role: 'patient',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedRole = useMemo(
    () => roleOptions.find((option) => option.key === formData.role) || roleOptions[0],
    [formData.role]
  );

  if (isAuthenticated) {
    return <Navigate replace to={getPortalPathForRole(user?.role)} />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');
      const signedInUser = await login(formData);
      navigate(location.state?.from || getPortalPathForRole(signedInUser.role), {
        replace: true,
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to sign in right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="page-hero page-hero-soft">
        <div className="container">
          <span className="eyebrow">Role-Aware Access</span>
          <h1>Sign in to HealthNexus</h1>
          <p>
            Choose your role first so we can take you to the right workspace the
            moment you sign in.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container auth-shell">
          <div className="role-selector">
            {roleOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                className={`role-option-card ${
                  formData.role === option.key ? 'active' : ''
                }`}
                onClick={() =>
                  setFormData((current) => ({
                    ...current,
                    role: option.key,
                  }))
                }
              >
                <span className="role-option-label">{option.label}</span>
                <strong>{option.title}</strong>
                <p>{option.description}</p>
              </button>
            ))}
          </div>

          <div className="auth-layout auth-layout-wide">
            <div className="card auth-card auth-card-emphasis">
              <span className="eyebrow">{selectedRole.eyebrow}</span>
              <h2>{selectedRole.label} Login</h2>
              <p className="form-intro">
                Enter the credentials for your {selectedRole.label.toLowerCase()} account.
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
                  {loading ? 'Signing in...' : `Continue as ${selectedRole.label}`}
                </button>
              </form>
            </div>

            <aside className="card auth-side-card auth-info-card">
              <span className="eyebrow">Selected Workspace</span>
              <h3>{selectedRole.title}</h3>
              <p className="auth-side-copy">{selectedRole.description}</p>

              <div className="auth-highlight-panel">
                <strong>What happens next</strong>
                <ul className="feature-list">
                  {formData.role === 'patient' ? (
                    <>
                      <li>You land in the patient portal after login.</li>
                      <li>Your appointment history and status become available immediately.</li>
                      <li>You can book and track future visits from the same account.</li>
                    </>
                  ) : null}
                  {formData.role === 'doctor' ? (
                    <>
                      <li>You land in the doctor dashboard after login.</li>
                      <li>You can review assigned appointments and schedule settings.</li>
                      <li>Your doctor profile stays linked to the same account.</li>
                    </>
                  ) : null}
                  {formData.role === 'admin' ? (
                    <>
                      <li>You land in the admin control center after login.</li>
                      <li>You can review users, doctors, departments, and messages.</li>
                      <li>All operational tools stay inside the admin workspace.</li>
                    </>
                  ) : null}
                </ul>
              </div>

              <p className="auth-side-copy">{demoCredentials[formData.role]}</p>

              {formData.role === 'admin' ? (
                <Link to="/contact" className="btn btn-secondary">
                  Contact Support
                </Link>
              ) : (
                <Link to="/register" className="btn btn-secondary">
                  Need an account?
                </Link>
              )}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

export default Login;

import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../auth/AuthContext';
import { fallbackDepartments } from '../content/careFallback';
import { getPortalPathForRole, roleOptions } from '../auth/roleConfig';

const registrationRoles = roleOptions.filter((option) => option.key !== 'admin');

function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, register, user } = useAuth();
  const [departments, setDepartments] = useState(fallbackDepartments);
  const [departmentsNotice, setDepartmentsNotice] = useState('');
  const [formData, setFormData] = useState({
    role: 'patient',
    name: '',
    email: '',
    phone: '',
    password: '',
    department: '',
    specialty: '',
    consultationMode: 'In-person and virtual',
    bio: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedRole = useMemo(
    () => roleOptions.find((option) => option.key === formData.role) || roleOptions[0],
    [formData.role]
  );

  useEffect(() => {
    let mounted = true;

    const loadDepartments = async () => {
      try {
        setDepartmentsNotice('');
        const { data } = await api.get('/site/departments');

        if (mounted && Array.isArray(data.departments) && data.departments.length > 0) {
          setDepartments(data.departments);
        }
      } catch (err) {
        if (mounted) {
          setDepartmentsNotice(
            err.response?.data?.error ||
              'Live department options are temporarily unavailable. Showing the current fallback list.'
          );
        }
      }
    };

    loadDepartments();

    return () => {
      mounted = false;
    };
  }, []);

  if (isAuthenticated) {
    return <Navigate replace to={getPortalPathForRole(user?.role)} />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.role === 'admin') {
      return;
    }

    try {
      setLoading(true);
      setError('');
      const createdUser = await register(formData);
      navigate(getPortalPathForRole(createdUser.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="page-hero page-hero-soft">
        <div className="container">
          <span className="eyebrow">Role-Based Signup</span>
          <h1>Create your HealthNexus account</h1>
          <p>
            Pick your workspace first, then we will tailor the onboarding flow to
            the kind of account you need.
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

          {formData.role === 'admin' ? (
            <div className="auth-layout auth-layout-wide">
              <div className="card auth-card auth-card-emphasis">
                <span className="eyebrow">Admin Provisioning</span>
                <h2>Admin accounts are managed internally</h2>
                <p className="form-intro">
                  For security, administrator access is created by an existing system owner.
                </p>
                <ul className="feature-list">
                  <li>Use the Login page if you already have an admin account.</li>
                  <li>Ask the current administrator to provision access if needed.</li>
                  <li>Admin access opens the full system oversight dashboard.</li>
                </ul>
                <div className="hero-actions">
                  <Link to="/login" className="btn btn-primary">
                    Go to Admin Login
                  </Link>
                  <Link to="/contact" className="btn btn-secondary">
                    Contact Support
                  </Link>
                </div>
              </div>

              <aside className="card auth-side-card auth-info-card">
                <span className="eyebrow">Why restricted?</span>
                <h3>Administrative access controls the whole system</h3>
                <p className="auth-side-copy">
                  Admin accounts can create doctor profiles, manage users, update departments,
                  and review every appointment and message in the platform.
                </p>
                <div className="auth-highlight-panel">
                  <strong>Recommended path</strong>
                  <ul className="feature-list">
                    <li>Sign in if your admin account already exists.</li>
                    <li>Otherwise request access from the system owner.</li>
                    <li>Keep admin access limited to operational staff.</li>
                  </ul>
                </div>
              </aside>
            </div>
          ) : (
            <div className="auth-layout auth-layout-wide">
              <div className="card auth-card auth-card-emphasis">
                <span className="eyebrow">{selectedRole.eyebrow}</span>
                <h2>{selectedRole.label} Registration</h2>
                <p className="form-intro">
                  {formData.role === 'patient'
                    ? 'Create your patient account to book visits and track them later.'
                    : 'Create your doctor account to access your professional dashboard and schedule workspace.'}
                </p>

                {departmentsNotice && formData.role === 'doctor' ? (
                  <div className="alert-error">{departmentsNotice}</div>
                ) : null}
                {error ? <div className="alert-error">{error}</div> : null}

                <form onSubmit={handleSubmit}>
                  <div className="grid-2">
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
                  </div>

                  <div className="grid-2">
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
                  </div>

                  {formData.role === 'doctor' ? (
                    <>
                      <div className="grid-2">
                        <div className="form-group">
                          <label className="form-label" htmlFor="register-department">
                            Department
                          </label>
                          <select
                            id="register-department"
                            className="form-select"
                            value={formData.department}
                            onChange={(event) =>
                              setFormData((current) => ({
                                ...current,
                                department: event.target.value,
                              }))
                            }
                          >
                            <option value="">Select a department</option>
                            {departments.map((department) => (
                              <option key={department._id} value={department.name}>
                                {department.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label" htmlFor="register-specialty">
                            Specialty
                          </label>
                          <input
                            id="register-specialty"
                            type="text"
                            className="form-input"
                            value={formData.specialty}
                            onChange={(event) =>
                              setFormData((current) => ({
                                ...current,
                                specialty: event.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="register-consultation-mode">
                          Consultation Mode
                        </label>
                        <input
                          id="register-consultation-mode"
                          type="text"
                          className="form-input"
                          value={formData.consultationMode}
                          onChange={(event) =>
                            setFormData((current) => ({
                              ...current,
                              consultationMode: event.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="register-bio">
                          Professional Bio
                        </label>
                        <textarea
                          id="register-bio"
                          className="form-textarea"
                          rows="4"
                          value={formData.bio}
                          onChange={(event) =>
                            setFormData((current) => ({
                              ...current,
                              bio: event.target.value,
                            }))
                          }
                        />
                      </div>
                    </>
                  ) : null}

                  <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                    {loading ? 'Creating account...' : `Create ${selectedRole.label} Account`}
                  </button>
                </form>
              </div>

              <aside className="card auth-side-card auth-info-card">
                <span className="eyebrow">Selected Onboarding</span>
                <h3>{selectedRole.title}</h3>
                <p className="auth-side-copy">{selectedRole.description}</p>

                <div className="auth-highlight-panel">
                  <strong>Included in this signup</strong>
                  <ul className="feature-list">
                    {registrationRoles.map((role) =>
                      role.key === formData.role ? (
                        <li key={role.key}>
                          {role.key === 'patient'
                            ? 'A patient account linked to bookings, status tracking, and your visit history.'
                            : 'A doctor account linked to a doctor profile, schedule settings, and the clinician dashboard.'}
                        </li>
                      ) : null
                    )}
                    <li>Your role determines the workspace you see after signup.</li>
                    <li>You can still switch roles later by signing into the correct account.</li>
                  </ul>
                </div>

                <p className="auth-side-copy">
                  Already have access? Go straight to the role-aware login page.
                </p>
                <Link to="/login" className="btn btn-secondary">
                  Sign In Instead
                </Link>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Register;

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../auth/AuthContext';
import { getPortalPathForRole } from '../auth/roleConfig';
import { fallbackDepartments, fallbackDoctors } from '../content/careFallback';

const initialFormState = {
  patientPhone: '',
  department: '',
  doctor: '',
  preferredDate: '',
  preferredTime: '',
  reason: '',
};

function BookAppointment() {
  const { isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState(initialFormState);
  const [departments, setDepartments] = useState(fallbackDepartments);
  const [doctors, setDoctors] = useState(fallbackDoctors);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState('');
  const [optionsNotice, setOptionsNotice] = useState('');

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData((current) => ({
      ...current,
      patientPhone: user.phone || current.patientPhone,
    }));
  }, [user]);

  useEffect(() => {
    let mounted = true;

    const loadOptions = async () => {
      try {
        setOptionsNotice('');
        const [departmentResponse, doctorResponse] = await Promise.all([
          api.get('/site/departments'),
          api.get('/site/doctors'),
        ]);

        if (
          mounted &&
          Array.isArray(departmentResponse.data.departments) &&
          departmentResponse.data.departments.length > 0
        ) {
          setDepartments(departmentResponse.data.departments);
        }

        if (
          mounted &&
          Array.isArray(doctorResponse.data.doctors) &&
          doctorResponse.data.doctors.length > 0
        ) {
          setDoctors(doctorResponse.data.doctors);
        }
      } catch (err) {
        if (mounted) {
          setOptionsNotice(
            err.response?.data?.error ||
              'Live appointment options are temporarily unavailable. Showing static department and doctor details.'
          );
        }
      }
    };

    loadOptions();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!formData.department) {
      setFilteredDoctors([]);
      if (formData.doctor) {
        setFormData((current) => ({ ...current, doctor: '' }));
      }
      return;
    }

    const nextDoctors = doctors.filter(
      (doctor) => doctor.department === formData.department
    );

    setFilteredDoctors(nextDoctors);

    if (formData.doctor && !nextDoctors.some((doctor) => doctor.name === formData.doctor)) {
      setFormData((current) => ({ ...current, doctor: '' }));
    }
  }, [doctors, formData.department, formData.doctor]);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const validate = () => {
    const nextErrors = {};

    if (!formData.patientPhone.trim()) {
      nextErrors.patientPhone = 'Please enter your phone number.';
    }

    if (!formData.department) {
      nextErrors.department = 'Please choose a department.';
    }

    if (!formData.doctor) {
      nextErrors.doctor = 'Please choose a preferred doctor.';
    }

    if (!formData.preferredDate) {
      nextErrors.preferredDate = 'Please choose a preferred date.';
    }

    if (!formData.preferredTime) {
      nextErrors.preferredTime = 'Please choose a preferred time.';
    }

    if (!formData.reason.trim()) {
      nextErrors.reason = 'Please describe the reason for your visit.';
    } else if (formData.reason.trim().length < 20) {
      nextErrors.reason =
        'Please provide at least 20 characters so the care team can triage accurately.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: '',
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { data } = await api.post('/site/appointments', {
        ...formData,
        patientPhone: formData.patientPhone.trim(),
        reason: formData.reason.trim(),
      });

      setSubmitted(data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'We could not submit your appointment request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      ...initialFormState,
      patientPhone: user?.phone || '',
    });
    setErrors({});
    setError('');
    setSubmitted(null);
  };

  if (submitted) {
    return (
      <section className="section appointment-success-section">
        <div className="container">
          <div className="appointment-success card">
            <div className="success-checkmark" aria-hidden="true">
              &#10003;
            </div>
            <h1>Appointment Requested!</h1>
            <p>
              Your request has been sent to the HealthNexus scheduling team. You
              can monitor the status from your patient portal.
            </p>
            <div className="success-summary">
              <div>
                <span>Patient</span>
                <strong>{submitted.patientName}</strong>
              </div>
              <div>
                <span>Department</span>
                <strong>{submitted.department}</strong>
              </div>
              <div>
                <span>Doctor</span>
                <strong>{submitted.doctor}</strong>
              </div>
              <div>
                <span>Visit Window</span>
                <strong>
                  {submitted.preferredDate} - {submitted.preferredTime}
                </strong>
              </div>
            </div>
            <div className="hero-actions">
              <button type="button" className="btn btn-primary" onClick={resetForm}>
                Book Another
              </button>
              <Link to="/portal/patient" className="btn btn-secondary">
                Open Patient Portal
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!isAuthenticated || user?.role !== 'patient') {
    return (
      <>
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow eyebrow-light">Appointment Center</span>
          <h1>Book an Appointment</h1>
          <p>
              Patient booking is now tied to a secure HealthNexus account so you
              can track requests and appointment history afterward.
          </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="card empty-state">
              <span className="empty-state-icon" aria-hidden="true">
                AC
              </span>
              <h2>
                {isAuthenticated
                  ? 'This booking flow is reserved for patient accounts.'
                  : 'Sign in as a patient to continue.'}
              </h2>
              <p>
                {isAuthenticated
                  ? `You are currently signed in as a ${user?.role}. Switch to a patient account to book and track appointments from the patient portal.`
                  : 'Your patient account stores appointment history, request status, and future booking details securely.'}
              </p>
              <div className="hero-actions">
                {isAuthenticated ? (
                  <Link to={getPortalPathForRole(user?.role)} className="btn btn-primary">
                    Open My Dashboard
                  </Link>
                ) : (
                  <Link to="/login" className="btn btn-primary">
                    Sign In
                  </Link>
                )}
                <Link to="/register" className="btn btn-secondary">
                  Create Patient Account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow eyebrow-light">Appointment Center</span>
          <h1>Book an Appointment</h1>
          <p>
            Submit your preferred department, doctor, and visit window. Your
            request will appear in your patient portal after submission.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container appointment-layout">
          <div className="appointment-form-column">
            <div className="card appointment-form-card">
              <h2>Request Your Visit</h2>
              <p className="form-intro">
                Your HealthNexus account is linked to this booking automatically.
              </p>

              <form onSubmit={handleSubmit} noValidate>
                {optionsNotice ? <div className="alert-error">{optionsNotice}</div> : null}
                {error ? <div className="alert-error">{error}</div> : null}

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="patient-account-name">
                      Patient Name
                    </label>
                    <input
                      id="patient-account-name"
                      type="text"
                      className="form-input"
                      value={user.name}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="patient-account-email">
                      Account Email
                    </label>
                    <input
                      id="patient-account-email"
                      type="email"
                      className="form-input"
                      value={user.email}
                      disabled
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="patientPhone">
                    Phone Number
                  </label>
                  <input
                    id="patientPhone"
                    name="patientPhone"
                    type="tel"
                    className="form-input"
                    value={formData.patientPhone}
                    onChange={handleChange}
                  />
                  {errors.patientPhone ? (
                    <p className="field-error">{errors.patientPhone}</p>
                  ) : null}
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="department">
                      Department
                    </label>
                    <select
                      id="department"
                      name="department"
                      className="form-select"
                      value={formData.department}
                      onChange={handleChange}
                    >
                      <option value="">Select a department</option>
                      {departments.map((department) => (
                        <option key={department._id} value={department.name}>
                          {department.name}
                        </option>
                      ))}
                    </select>
                    {errors.department ? (
                      <p className="field-error">{errors.department}</p>
                    ) : null}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="doctor">
                      Preferred Doctor
                    </label>
                    <select
                      id="doctor"
                      name="doctor"
                      className="form-select"
                      value={formData.doctor}
                      onChange={handleChange}
                      disabled={!formData.department}
                    >
                      <option value="">
                        {formData.department
                          ? 'Select a doctor'
                          : 'Choose a department first'}
                      </option>
                      {filteredDoctors.map((doctor) => (
                        <option key={doctor._id} value={doctor.name}>
                          {doctor.name}
                        </option>
                      ))}
                    </select>
                    {errors.doctor ? <p className="field-error">{errors.doctor}</p> : null}
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="preferredDate">
                      Preferred Date
                    </label>
                    <input
                      id="preferredDate"
                      name="preferredDate"
                      type="date"
                      min={today}
                      className="form-input"
                      value={formData.preferredDate}
                      onChange={handleChange}
                    />
                    {errors.preferredDate ? (
                      <p className="field-error">{errors.preferredDate}</p>
                    ) : null}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="preferredTime">
                      Preferred Time
                    </label>
                    <select
                      id="preferredTime"
                      name="preferredTime"
                      className="form-select"
                      value={formData.preferredTime}
                      onChange={handleChange}
                    >
                      <option value="">Select a time window</option>
                      <option value="Morning 9-12">Morning 9-12</option>
                      <option value="Afternoon 12-5">Afternoon 12-5</option>
                      <option value="Evening 5-8">Evening 5-8</option>
                    </select>
                    {errors.preferredTime ? (
                      <p className="field-error">{errors.preferredTime}</p>
                    ) : null}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reason">
                    Reason for Visit
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    className="form-textarea"
                    rows="5"
                    value={formData.reason}
                    onChange={handleChange}
                  />
                  {errors.reason ? <p className="field-error">{errors.reason}</p> : null}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary full-width"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="button-loading">
                      <span className="button-spinner" aria-hidden="true" />
                      Submitting Request
                    </span>
                  ) : (
                    'Submit Appointment Request'
                  )}
                </button>
              </form>
            </div>
          </div>

          <aside className="card expectation-card">
            <span className="eyebrow">What to Expect</span>
            <h3>Three simple steps</h3>
            <ol className="expectation-steps">
              <li>
                <strong>Submit Request</strong>
                <p>
                  Choose the department, physician, and preferred visit window.
                </p>
              </li>
              <li>
                <strong>Portal Tracking</strong>
                <p>
                  Monitor status updates from your patient dashboard after submission.
                </p>
              </li>
              <li>
                <strong>Your Appointment</strong>
                <p>
                  Arrive a few minutes early and our care team will guide the rest.
                </p>
              </li>
            </ol>
          </aside>
        </div>
      </section>
    </>
  );
}

export default BookAppointment;

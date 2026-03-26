import { useEffect, useMemo, useState } from 'react';
import api from '../api';

const initialFormState = {
  patientName: '',
  patientEmail: '',
  patientPhone: '',
  department: '',
  doctor: '',
  preferredDate: '',
  preferredTime: '',
  reason: '',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function BookAppointment() {
  const [formData, setFormData] = useState(initialFormState);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadOptions = async () => {
      try {
        setPageLoading(true);
        const [departmentResponse, doctorResponse] = await Promise.all([
          api.get('/site/departments'),
          api.get('/site/doctors'),
        ]);

        if (mounted) {
          setDepartments(departmentResponse.data.departments || []);
          setDoctors(doctorResponse.data.doctors || []);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.error ||
              'Unable to load appointment options right now.'
          );
        }
      } finally {
        if (mounted) {
          setPageLoading(false);
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

    if (!formData.patientName.trim()) {
      nextErrors.patientName = 'Please enter your full name.';
    }

    if (!formData.patientEmail.trim()) {
      nextErrors.patientEmail = 'Please enter your email address.';
    } else if (!emailPattern.test(formData.patientEmail.trim())) {
      nextErrors.patientEmail = 'Please enter a valid email address.';
    }

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
        patientName: formData.patientName.trim(),
        patientEmail: formData.patientEmail.trim(),
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
    setFormData(initialFormState);
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
              Your request has been sent to the CareVista scheduling team. A care
              coordinator will review the details and follow up shortly.
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
            <button type="button" className="btn btn-primary" onClick={resetForm}>
              Book Another
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow eyebrow-light">Appointment Center</span>
          <h1>Book an Appointment</h1>
          <p>
            Share your symptoms, preferred doctor, and visit window. Our team
            will confirm the best available slot.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container appointment-layout">
          <div className="appointment-form-column">
            <div className="card appointment-form-card">
              <h2>Request Your Visit</h2>
              <p className="form-intro">
                All fields are required so the scheduling team can triage your
                request accurately.
              </p>

              {pageLoading ? (
                <div className="section-centered">
                  <div
                    className="loading-spinner"
                    aria-label="Loading appointment form"
                  />
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  {error && <div className="alert-error">{error}</div>}

                  <div className="form-group">
                    <label className="form-label" htmlFor="patientName">
                      Patient Full Name
                    </label>
                    <input
                      id="patientName"
                      name="patientName"
                      type="text"
                      className="form-input"
                      value={formData.patientName}
                      onChange={handleChange}
                    />
                    {errors.patientName && (
                      <p className="field-error">{errors.patientName}</p>
                    )}
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label" htmlFor="patientEmail">
                        Email Address
                      </label>
                      <input
                        id="patientEmail"
                        name="patientEmail"
                        type="email"
                        className="form-input"
                        value={formData.patientEmail}
                        onChange={handleChange}
                      />
                      {errors.patientEmail && (
                        <p className="field-error">{errors.patientEmail}</p>
                      )}
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
                      {errors.patientPhone && (
                        <p className="field-error">{errors.patientPhone}</p>
                      )}
                    </div>
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
                      {errors.department && (
                        <p className="field-error">{errors.department}</p>
                      )}
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
                      {errors.doctor && (
                        <p className="field-error">{errors.doctor}</p>
                      )}
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
                      {errors.preferredDate && (
                        <p className="field-error">{errors.preferredDate}</p>
                      )}
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
                      {errors.preferredTime && (
                        <p className="field-error">{errors.preferredTime}</p>
                      )}
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
                    {errors.reason && (
                      <p className="field-error">{errors.reason}</p>
                    )}
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
              )}
            </div>
          </div>

          <aside className="card expectation-card">
            <span className="eyebrow">What to Expect</span>
            <h3>Three simple steps</h3>
            <ol className="expectation-steps">
              <li>
                <strong>Submit Request</strong>
                <p>
                  Tell us what care you need and when you would like to be seen.
                </p>
              </li>
              <li>
                <strong>Confirmation Call</strong>
                <p>
                  A scheduling specialist confirms the best doctor and time slot.
                </p>
              </li>
              <li>
                <strong>Your Appointment</strong>
                <p>
                  Arrive a few minutes early and our team will guide the rest.
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

import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHero from '../components/PageHero';
import SectionHeader from '../components/SectionHeader';
import api from '../utils/api';

const initialFormState = {
  fullName: '',
  email: '',
  phone: '',
  patientType: 'new',
  department: '',
  doctor: '',
  preferredDate: '',
  preferredTimeSlot: '',
  reason: '',
  notes: '',
};

const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadOptions = async () => {
      try {
        const [departmentsResponse, doctorsResponse] = await Promise.all([
          api.get('/site/departments'),
          api.get('/site/doctors'),
        ]);

        if (!mounted) {
          return;
        }

        const nextDepartments = departmentsResponse.data.data || [];
        const nextDoctors = doctorsResponse.data.data || [];
        const preselectedDepartment = searchParams.get('department') || '';

        setDepartments(nextDepartments);
        setDoctors(nextDoctors);
        setFormData((current) => ({
          ...current,
          department: preselectedDepartment,
        }));
      } catch (error) {
        if (mounted) {
          toast.error('Unable to load appointment options right now.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOptions();

    return () => {
      mounted = false;
    };
  }, [searchParams]);

  const filteredDoctors = doctors.filter((doctor) => {
    if (!formData.department) {
      return true;
    }

    return doctor.department?.slug === formData.department;
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === 'department' ? { doctor: '' } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/site/appointments', formData);
      toast.success('Appointment request submitted. We will contact you shortly.');
      setFormData((current) => ({
        ...initialFormState,
        department: current.department,
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to submit your request right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <PageHero
        description="Send your preferred department, doctor, and time window. Our coordination team will confirm the appointment and share next steps."
        eyebrow="Appointments"
        panelItems={[
          { label: 'Same-day review', value: 'Available' },
          { label: 'Desk response target', value: 'Under 30 min' },
          { label: 'Emergency hotline', value: '+91 44 4000 2400' },
        ]}
        panelTitle="Before you submit"
        title="A calmer booking flow for families, follow-ups, and first visits."
      />

      <section className="page-section">
        <div className="container split-layout">
          <div className="form-panel">
            <SectionHeader
              description="Share the essential details and we will match you with the right clinical team."
              eyebrow="Request Form"
              title="Book your hospital visit"
            />

            {loading ? (
              <LoadingSpinner text="Loading appointment form..." />
            ) : (
              <form className="appointment-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                  <label>
                    Full name
                    <input
                      name="fullName"
                      onChange={handleChange}
                      placeholder="Patient name"
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
                      required
                      type="tel"
                      value={formData.phone}
                    />
                  </label>

                  <label>
                    Patient type
                    <select name="patientType" onChange={handleChange} value={formData.patientType}>
                      <option value="new">New patient</option>
                      <option value="returning">Returning patient</option>
                      <option value="corporate">Corporate / wellness</option>
                    </select>
                  </label>

                  <label>
                    Department
                    <select name="department" onChange={handleChange} required value={formData.department}>
                      <option value="">Select department</option>
                      {departments.map((department) => (
                        <option key={department._id} value={department.slug}>
                          {department.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Preferred doctor
                    <select name="doctor" onChange={handleChange} value={formData.doctor}>
                      <option value="">Any available specialist</option>
                      {filteredDoctors.map((doctor) => (
                        <option key={doctor._id} value={doctor.slug}>
                          {doctor.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Preferred date
                    <input
                      min={new Date().toISOString().slice(0, 10)}
                      name="preferredDate"
                      onChange={handleChange}
                      required
                      type="date"
                      value={formData.preferredDate}
                    />
                  </label>

                  <label>
                    Preferred time
                    <select
                      name="preferredTimeSlot"
                      onChange={handleChange}
                      required
                      value={formData.preferredTimeSlot}
                    >
                      <option value="">Choose a time window</option>
                      <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM</option>
                      <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                      <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM</option>
                      <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                      <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                    </select>
                  </label>
                </div>

                <label>
                  Reason for visit
                  <textarea
                    name="reason"
                    onChange={handleChange}
                    placeholder="Briefly describe symptoms, follow-up needs, or the care you need."
                    required
                    rows="4"
                    value={formData.reason}
                  />
                </label>

                <label>
                  Additional notes
                  <textarea
                    name="notes"
                    onChange={handleChange}
                    placeholder="Previous reports, medications, accessibility needs, or anything else you want the desk to know."
                    rows="3"
                    value={formData.notes}
                  />
                </label>

                <button className="btn btn-primary btn-lg" disabled={submitting} type="submit">
                  {submitting ? 'Submitting request...' : 'Submit appointment request'}
                </button>
              </form>
            )}
          </div>

          <aside className="side-panel">
            <SectionHeader
              description="We designed the flow to feel informative and calm, especially for families coordinating care across departments."
              eyebrow="Why this works"
              title="Built for better visit planning"
            />

            <div className="benefit-list">
              <article className="benefit-card">
                <strong>Coordinated follow-up</strong>
                <p>Our desk confirms the right specialist, slot, and preparation notes before your visit.</p>
              </article>
              <article className="benefit-card">
                <strong>Department-aware scheduling</strong>
                <p>Doctor choices adjust to the selected specialty so the booking stays clinically relevant.</p>
              </article>
              <article className="benefit-card">
                <strong>Family-friendly communication</strong>
                <p>Share context upfront so the team can prepare reports, referrals, and support on arrival.</p>
              </article>
            </div>

            <div className="info-box">
              <strong>Need urgent help?</strong>
              <p>
                For emergencies, call the hotline immediately instead of waiting for online confirmation.
              </p>
              <Link className="text-link" to="/contact">
                View emergency and contact details
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default BookAppointment;

import { useEffect, useMemo, useState } from 'react';
import api from '../api';
import { useAuth } from '../auth/AuthContext';

const appointmentStatusOptions = ['pending', 'confirmed', 'cancelled'];
const messageStatusOptions = ['unread', 'read', 'resolved'];

const statMeta = {
  totalUsers: { label: 'Users', tone: 'default' },
  patientUsers: { label: 'Patients', tone: 'default' },
  doctorUsers: { label: 'Doctor Accounts', tone: 'default' },
  adminUsers: { label: 'Admins', tone: 'default' },
  totalDoctors: { label: 'Doctors', tone: 'default' },
  activeDoctors: { label: 'Available Doctors', tone: 'confirmed' },
  totalDepartments: { label: 'Departments', tone: 'default' },
  activeDepartments: { label: 'Active Departments', tone: 'confirmed' },
  totalAppointments: { label: 'Appointments', tone: 'pending' },
  totalMessages: { label: 'Messages', tone: 'unread' },
};

const initialDoctorForm = {
  name: '',
  specialty: '',
  department: '',
  experience: '',
  phone: '',
  accountEmail: '',
  temporaryPassword: 'Doctor123!',
  consultationMode: 'In-person and virtual',
  qualifications: '',
  languages: '',
  bio: '',
  notes: '',
  available: true,
};

const initialDepartmentForm = {
  name: '',
  icon: '',
  shortDescription: '',
  description: '',
  services: '',
  headDoctor: '',
  available: true,
};

function CareDesk() {
  const { user } = useAuth();
  const [overview, setOverview] = useState({
    stats: {},
    users: [],
    doctors: [],
    departments: [],
    appointments: [],
    messages: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointmentDrafts, setAppointmentDrafts] = useState({});
  const [messageDrafts, setMessageDrafts] = useState({});
  const [userDrafts, setUserDrafts] = useState({});
  const [doctorDrafts, setDoctorDrafts] = useState({});
  const [departmentDrafts, setDepartmentDrafts] = useState({});
  const [doctorForm, setDoctorForm] = useState(initialDoctorForm);
  const [departmentForm, setDepartmentForm] = useState(initialDepartmentForm);
  const [updatingRows, setUpdatingRows] = useState({});
  const [creatingDoctor, setCreatingDoctor] = useState(false);
  const [creatingDepartment, setCreatingDepartment] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadOverview = async () => {
      try {
        const { data } = await api.get('/portal/admin/overview');

        if (mounted) {
          setOverview(data);
          setError('');
        }
      } catch (err) {
        if (mounted) {
          setError(err.response?.data?.error || 'Unable to load the admin dashboard.');
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

  const refreshOverview = async () => {
    const { data } = await api.get('/portal/admin/overview');
    setOverview(data);
    return data;
  };

  const orderedStats = useMemo(
    () => Object.entries(overview.stats || {}).filter(([key]) => statMeta[key]),
    [overview.stats]
  );

  const updateAppointmentStatus = async (id) => {
    try {
      setUpdatingRows((current) => ({ ...current, [id]: true }));
      const { data } = await api.patch(`/portal/admin/appointments/${id}`, {
        status: appointmentDrafts[id],
      });

      setOverview((current) => ({
        ...current,
        appointments: current.appointments.map((appointment) =>
          appointment._id === id ? data : appointment
        ),
      }));
      setError('');
      setNotice('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update appointment status.');
    } finally {
      setUpdatingRows((current) => ({ ...current, [id]: false }));
    }
  };

  const updateMessageStatus = async (id) => {
    try {
      setUpdatingRows((current) => ({ ...current, [id]: true }));
      const { data } = await api.patch(`/portal/admin/messages/${id}`, {
        status: messageDrafts[id],
      });

      setOverview((current) => ({
        ...current,
        messages: current.messages.map((message) =>
          message._id === id ? data : message
        ),
      }));
      setError('');
      setNotice('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update message status.');
    } finally {
      setUpdatingRows((current) => ({ ...current, [id]: false }));
    }
  };

  const updateUserAccess = async (id) => {
    try {
      const currentUser = overview.users.find((portalUser) => portalUser.id === id);
      const nextActive =
        typeof userDrafts[id] === 'boolean' ? userDrafts[id] : currentUser?.active;

      setUpdatingRows((current) => ({ ...current, [id]: true }));
      const { data } = await api.patch(`/portal/admin/users/${id}`, {
        active: nextActive,
      });

      setOverview((current) => ({
        ...current,
        users: current.users.map((portalUser) => (portalUser.id === id ? data : portalUser)),
      }));
      setError('');
      setNotice('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update user access.');
    } finally {
      setUpdatingRows((current) => ({ ...current, [id]: false }));
    }
  };

  const updateDoctorAvailability = async (id) => {
    try {
      setUpdatingRows((current) => ({ ...current, [id]: true }));
      await api.patch(`/portal/admin/doctors/${id}`, {
        available: doctorDrafts[id],
      });
      await refreshOverview();
      setError('');
      setNotice('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update doctor availability.');
    } finally {
      setUpdatingRows((current) => ({ ...current, [id]: false }));
    }
  };

  const updateDepartmentAvailability = async (id) => {
    try {
      setUpdatingRows((current) => ({ ...current, [id]: true }));
      await api.patch(`/portal/admin/departments/${id}`, {
        available: departmentDrafts[id],
      });
      await refreshOverview();
      setError('');
      setNotice('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update department availability.');
    } finally {
      setUpdatingRows((current) => ({ ...current, [id]: false }));
    }
  };

  const createDoctor = async (event) => {
    event.preventDefault();

    try {
      setCreatingDoctor(true);
      const { data } = await api.post('/portal/admin/doctors', {
        ...doctorForm,
        experience: Number(doctorForm.experience || 0),
      });

      await refreshOverview();
      setDoctorForm(initialDoctorForm);
      setError('');
      setNotice(
        `Doctor account created: ${data.credentials.email} / ${data.credentials.temporaryPassword}`
      );
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create the doctor profile.');
    } finally {
      setCreatingDoctor(false);
    }
  };

  const createDepartment = async (event) => {
    event.preventDefault();

    try {
      setCreatingDepartment(true);
      const { data } = await api.post('/portal/admin/departments', departmentForm);

      await refreshOverview();
      setDepartmentForm(initialDepartmentForm);
      setError('');
      setNotice(`Department created: ${data.name}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create the department.');
    } finally {
      setCreatingDepartment(false);
    }
  };

  return (
    <div className="care-desk-page">
      <section className="page-hero care-desk-hero">
        <div className="container">
          <span className="eyebrow eyebrow-light">Admin Dashboard</span>
          <h1>System Oversight</h1>
          <p>
            Monitor users, doctors, services, appointments, and inbound patient
            messages from one control center.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container portal-stack">
          {error ? <div className="alert-error">{error}</div> : null}
          {notice ? <div className="alert-success">{notice}</div> : null}

          {loading ? (
            <div className="section-centered">
              <div className="loading-spinner" aria-label="Loading admin dashboard" />
            </div>
          ) : (
            <>
              <div className="grid-4">
                {orderedStats.map(([key, value]) => (
                  <article className={`card metric-card tone-${statMeta[key].tone}`} key={key}>
                    <span>{statMeta[key].label}</span>
                    <strong>{value}</strong>
                  </article>
                ))}
              </div>

              <div className="care-desk-tabs">
                {[
                  ['appointments', 'Appointments'],
                  ['messages', 'Messages'],
                  ['users', 'Users'],
                  ['doctors', 'Doctors'],
                  ['departments', 'Departments'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`tab-button ${activeTab === key ? 'active' : ''}`}
                    onClick={() => setActiveTab(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {activeTab === 'appointments' ? (
                <div className="table-card card">
                  <div className="table-scroll">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Patient</th>
                          <th>Department</th>
                          <th>Doctor</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overview.appointments.map((appointment) => (
                          <tr key={appointment._id}>
                            <td>
                              <div className="table-stack">
                                <span>{appointment.patientName}</span>
                                <span>{appointment.patientEmail}</span>
                              </div>
                            </td>
                            <td>{appointment.department}</td>
                            <td>{appointment.doctor}</td>
                            <td>
                              <div className="table-stack">
                                <span>{appointment.preferredDate}</span>
                                <span>{appointment.preferredTime}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`badge badge-${appointment.status}`}>
                                {appointment.status}
                              </span>
                            </td>
                            <td>
                              <div className="table-action-group">
                                <select
                                  className="form-select table-select"
                                  value={appointmentDrafts[appointment._id] || appointment.status}
                                  onChange={(event) =>
                                    setAppointmentDrafts((current) => ({
                                      ...current,
                                      [appointment._id]: event.target.value,
                                    }))
                                  }
                                >
                                  {appointmentStatusOptions.map((status) => (
                                    <option key={status} value={status}>
                                      {status}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-small"
                                  disabled={Boolean(updatingRows[appointment._id])}
                                  onClick={() => updateAppointmentStatus(appointment._id)}
                                >
                                  {updatingRows[appointment._id] ? 'Updating...' : 'Update'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              {activeTab === 'messages' ? (
                <div className="table-card card">
                  <div className="table-scroll">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Subject</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overview.messages.map((message) => (
                          <tr key={message._id}>
                            <td>{message.name}</td>
                            <td>{message.email}</td>
                            <td>{message.subject}</td>
                            <td>
                              <span className={`badge badge-${message.status}`}>
                                {message.status}
                              </span>
                            </td>
                            <td>
                              <div className="table-action-group">
                                <select
                                  className="form-select table-select"
                                  value={messageDrafts[message._id] || message.status}
                                  onChange={(event) =>
                                    setMessageDrafts((current) => ({
                                      ...current,
                                      [message._id]: event.target.value,
                                    }))
                                  }
                                >
                                  {messageStatusOptions.map((status) => (
                                    <option key={status} value={status}>
                                      {status}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-small"
                                  disabled={Boolean(updatingRows[message._id])}
                                  onClick={() => updateMessageStatus(message._id)}
                                >
                                  {updatingRows[message._id] ? 'Updating...' : 'Update'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
              {activeTab === 'users' ? (
                <div className="table-card card">
                  <div className="table-scroll">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Access</th>
                          <th>Department</th>
                          <th>Phone</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overview.users.map((portalUser) => {
                          const nextActive =
                            typeof userDrafts[portalUser.id] === 'boolean'
                              ? userDrafts[portalUser.id]
                              : portalUser.active;
                          const isSelfDisableAttempt =
                            portalUser.id === user?.id && nextActive === false;

                          return (
                            <tr key={portalUser.id}>
                              <td>{portalUser.name}</td>
                              <td>{portalUser.email}</td>
                              <td>
                                <span className="badge badge-read">{portalUser.role}</span>
                              </td>
                              <td>
                                <span
                                  className={`badge ${
                                    portalUser.active ? 'badge-confirmed' : 'badge-cancelled'
                                  }`}
                                >
                                  {portalUser.active ? 'active' : 'disabled'}
                                </span>
                              </td>
                              <td>{portalUser.department || '-'}</td>
                              <td>{portalUser.phone || '-'}</td>
                              <td>
                                <div className="table-action-group">
                                  <select
                                    className="form-select table-select"
                                    value={String(nextActive)}
                                    onChange={(event) =>
                                      setUserDrafts((current) => ({
                                        ...current,
                                        [portalUser.id]: event.target.value === 'true',
                                      }))
                                    }
                                  >
                                    <option value="true">Active</option>
                                    <option value="false">Disabled</option>
                                  </select>
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-small"
                                    disabled={
                                      Boolean(updatingRows[portalUser.id]) || isSelfDisableAttempt
                                    }
                                    onClick={() => updateUserAccess(portalUser.id)}
                                  >
                                    {updatingRows[portalUser.id] ? 'Saving...' : 'Save'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
              {activeTab === 'doctors' ? (
                <>
                  <div className="card">
                    <div className="portal-section-header">
                      <div>
                        <span className="eyebrow">Doctor Registry</span>
                        <h2>Create Doctor Account</h2>
                      </div>
                    </div>
                    <p className="form-intro">
                      Creating a doctor here also provisions a linked login for the doctor portal.
                    </p>

                    <form onSubmit={createDoctor}>
                      <div className="grid-2">
                        <div className="form-group">
                          <label className="form-label" htmlFor="doctor-name">
                            Doctor Name
                          </label>
                          <input
                            id="doctor-name"
                            type="text"
                            className="form-input"
                            value={doctorForm.name}
                            onChange={(event) =>
                              setDoctorForm((current) => ({
                                ...current,
                                name: event.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" htmlFor="doctor-specialty">
                            Specialty
                          </label>
                          <input
                            id="doctor-specialty"
                            type="text"
                            className="form-input"
                            value={doctorForm.specialty}
                            onChange={(event) =>
                              setDoctorForm((current) => ({
                                ...current,
                                specialty: event.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="grid-2">
                        <div className="form-group">
                          <label className="form-label" htmlFor="doctor-department">
                            Department
                          </label>
                          <input
                            id="doctor-department"
                            type="text"
                            className="form-input"
                            value={doctorForm.department}
                            onChange={(event) =>
                              setDoctorForm((current) => ({
                                ...current,
                                department: event.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" htmlFor="doctor-experience">
                            Experience (Years)
                          </label>
                          <input
                            id="doctor-experience"
                            type="number"
                            min="0"
                            className="form-input"
                            value={doctorForm.experience}
                            onChange={(event) =>
                              setDoctorForm((current) => ({
                                ...current,
                                experience: event.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="grid-2">
                        <div className="form-group">
                          <label className="form-label" htmlFor="doctor-phone">
                            Contact Phone
                          </label>
                          <input
                            id="doctor-phone"
                            type="tel"
                            className="form-input"
                            value={doctorForm.phone}
                            onChange={(event) =>
                              setDoctorForm((current) => ({
                                ...current,
                                phone: event.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" htmlFor="doctor-mode">
                            Consultation Mode
                          </label>
                          <input
                            id="doctor-mode"
                            type="text"
                            className="form-input"
                            value={doctorForm.consultationMode}
                            onChange={(event) =>
                              setDoctorForm((current) => ({
                                ...current,
                                consultationMode: event.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="grid-2">
                        <div className="form-group">
                          <label className="form-label" htmlFor="doctor-qualifications">
                            Qualifications
                          </label>
                          <input
                            id="doctor-qualifications"
                            type="text"
                            className="form-input"
                            placeholder="Comma separated"
                            value={doctorForm.qualifications}
                            onChange={(event) =>
                              setDoctorForm((current) => ({
                                ...current,
                                qualifications: event.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" htmlFor="doctor-languages">
                            Languages
                          </label>
                          <input
                            id="doctor-languages"
                            type="text"
                            className="form-input"
                            placeholder="Comma separated"
                            value={doctorForm.languages}
                            onChange={(event) =>
                              setDoctorForm((current) => ({
                                ...current,
                                languages: event.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="grid-2">
                        <div className="form-group">
                          <label className="form-label" htmlFor="doctor-account-email">
                            Account Email
                          </label>
                          <input
                            id="doctor-account-email"
                            type="email"
                            className="form-input"
                            placeholder="Leave blank to auto-generate"
                            value={doctorForm.accountEmail}
                            onChange={(event) =>
                              setDoctorForm((current) => ({
                                ...current,
                                accountEmail: event.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" htmlFor="doctor-password">
                            Temporary Password
                          </label>
                          <input
                            id="doctor-password"
                            type="text"
                            className="form-input"
                            value={doctorForm.temporaryPassword}
                            onChange={(event) =>
                              setDoctorForm((current) => ({
                                ...current,
                                temporaryPassword: event.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="doctor-bio">
                          Professional Bio
                        </label>
                        <textarea
                          id="doctor-bio"
                          className="form-textarea"
                          rows="4"
                          value={doctorForm.bio}
                          onChange={(event) =>
                            setDoctorForm((current) => ({
                              ...current,
                              bio: event.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="doctor-notes">
                          Schedule Notes
                        </label>
                        <textarea
                          id="doctor-notes"
                          className="form-textarea"
                          rows="3"
                          value={doctorForm.notes}
                          onChange={(event) =>
                            setDoctorForm((current) => ({
                              ...current,
                              notes: event.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="table-action-group">
                        <select
                          className="form-select"
                          value={String(doctorForm.available)}
                          onChange={(event) =>
                            setDoctorForm((current) => ({
                              ...current,
                              available: event.target.value === 'true',
                            }))
                          }
                        >
                          <option value="true">Available</option>
                          <option value="false">Unavailable</option>
                        </select>
                        <button
                          type="submit"
                          className="btn btn-primary btn-small"
                          disabled={creatingDoctor}
                        >
                          {creatingDoctor ? 'Creating...' : 'Create Doctor'}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="grid-3">
                    {overview.doctors.map((doctor) => {
                      const linkedUser = overview.users.find(
                        (portalUser) => portalUser.doctorId === doctor._id
                      );

                      return (
                        <article className="card doctor-directory-card" key={doctor._id}>
                          <h3>{doctor.name}</h3>
                          <p className="doctor-specialty">{doctor.specialty}</p>
                          <span className="department-pill">{doctor.department}</span>
                          <div className="doctor-meta-list">
                            <p>{doctor.experience} years experience</p>
                            <p>{doctor.schedule?.consultationMode || 'In-person and virtual'}</p>
                            <p>{linkedUser?.email || 'Doctor login not linked yet'}</p>
                          </div>
                          <div className="table-action-group">
                            <select
                              className="form-select"
                              value={String(
                                typeof doctorDrafts[doctor._id] === 'boolean'
                                  ? doctorDrafts[doctor._id]
                                  : doctor.available
                              )}
                              onChange={(event) =>
                                setDoctorDrafts((current) => ({
                                  ...current,
                                  [doctor._id]: event.target.value === 'true',
                                }))
                              }
                            >
                              <option value="true">Available</option>
                              <option value="false">Unavailable</option>
                            </select>
                            <button
                              type="button"
                              className="btn btn-secondary btn-small"
                              disabled={Boolean(updatingRows[doctor._id])}
                              onClick={() => updateDoctorAvailability(doctor._id)}
                            >
                              {updatingRows[doctor._id] ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </>
              ) : null}
              {activeTab === 'departments' ? (
                <>
                  <div className="card">
                    <div className="portal-section-header">
                      <div>
                        <span className="eyebrow">Service Registry</span>
                        <h2>Create Department</h2>
                      </div>
                    </div>
                    <p className="form-intro">
                      New departments added here appear in the public department directory after
                      redeploy or live refresh.
                    </p>

                    <form onSubmit={createDepartment}>
                      <div className="grid-2">
                        <div className="form-group">
                          <label className="form-label" htmlFor="department-name">
                            Department Name
                          </label>
                          <input
                            id="department-name"
                            type="text"
                            className="form-input"
                            value={departmentForm.name}
                            onChange={(event) =>
                              setDepartmentForm((current) => ({
                                ...current,
                                name: event.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" htmlFor="department-icon">
                            Icon
                          </label>
                          <input
                            id="department-icon"
                            type="text"
                            className="form-input"
                            placeholder="Example: +"
                            value={departmentForm.icon}
                            onChange={(event) =>
                              setDepartmentForm((current) => ({
                                ...current,
                                icon: event.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="grid-2">
                        <div className="form-group">
                          <label className="form-label" htmlFor="department-head-doctor">
                            Head Doctor
                          </label>
                          <input
                            id="department-head-doctor"
                            type="text"
                            className="form-input"
                            value={departmentForm.headDoctor}
                            onChange={(event) =>
                              setDepartmentForm((current) => ({
                                ...current,
                                headDoctor: event.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" htmlFor="department-services">
                            Services
                          </label>
                          <input
                            id="department-services"
                            type="text"
                            className="form-input"
                            placeholder="Comma separated"
                            value={departmentForm.services}
                            onChange={(event) =>
                              setDepartmentForm((current) => ({
                                ...current,
                                services: event.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="department-short-description">
                          Short Description
                        </label>
                        <textarea
                          id="department-short-description"
                          className="form-textarea"
                          rows="3"
                          value={departmentForm.shortDescription}
                          onChange={(event) =>
                            setDepartmentForm((current) => ({
                              ...current,
                              shortDescription: event.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="department-description">
                          Full Description
                        </label>
                        <textarea
                          id="department-description"
                          className="form-textarea"
                          rows="4"
                          value={departmentForm.description}
                          onChange={(event) =>
                            setDepartmentForm((current) => ({
                              ...current,
                              description: event.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="table-action-group">
                        <select
                          className="form-select"
                          value={String(departmentForm.available)}
                          onChange={(event) =>
                            setDepartmentForm((current) => ({
                              ...current,
                              available: event.target.value === 'true',
                            }))
                          }
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                        <button
                          type="submit"
                          className="btn btn-primary btn-small"
                          disabled={creatingDepartment}
                        >
                          {creatingDepartment ? 'Creating...' : 'Create Department'}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="grid-3">
                    {overview.departments.map((department) => (
                      <article className="card department-card" key={department._id}>
                        <div className="department-card-icon">{department.icon}</div>
                        <h2>{department.name}</h2>
                        <p>{department.shortDescription}</p>
                        <div className="doctor-meta-list">
                          <p>{department.headDoctor || 'Head doctor not assigned'}</p>
                          <p>{department.services?.length || 0} listed services</p>
                        </div>
                        <div className="table-action-group">
                          <select
                            className="form-select"
                            value={String(
                              typeof departmentDrafts[department._id] === 'boolean'
                                ? departmentDrafts[department._id]
                                : department.available
                            )}
                            onChange={(event) =>
                              setDepartmentDrafts((current) => ({
                                ...current,
                                [department._id]: event.target.value === 'true',
                              }))
                            }
                          >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                          <button
                            type="button"
                            className="btn btn-secondary btn-small"
                            disabled={Boolean(updatingRows[department._id])}
                            onClick={() => updateDepartmentAvailability(department._id)}
                          >
                            {updatingRows[department._id] ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              ) : null}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default CareDesk;

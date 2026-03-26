import { useEffect, useMemo, useState } from 'react';
import api from '../api';

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const appointmentStatusOptions = ['pending', 'confirmed', 'cancelled'];
const statMeta = {
  totalAppointments: { label: 'Assigned Appointments', tone: 'default' },
  pending: { label: 'Pending', tone: 'pending' },
  confirmed: { label: 'Confirmed', tone: 'confirmed' },
  cancelled: { label: 'Cancelled', tone: 'cancelled' },
};

const defaultOverview = {
  doctor: {
    schedule: {
      weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '09:00',
      endTime: '17:00',
      slotDurationMinutes: 30,
      consultationMode: 'In-person and virtual',
      notes: '',
    },
  },
  appointments: [],
  patients: [],
  stats: {
    totalAppointments: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
  },
};

function DoctorPortal() {
  const [overview, setOverview] = useState(defaultOverview);
  const [scheduleDraft, setScheduleDraft] = useState(defaultOverview.doctor.schedule);
  const [appointmentDrafts, setAppointmentDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadOverview = async () => {
      try {
        const { data } = await api.get('/portal/doctor/overview');

        if (mounted) {
          setOverview(data);
          setScheduleDraft(data.doctor.schedule);
          setError('');
        }
      } catch (err) {
        if (mounted) {
          setError(err.response?.data?.error || 'Unable to load the doctor portal.');
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

  const patientCount = useMemo(() => overview.patients.length, [overview.patients.length]);

  const toggleWeekday = (day) => {
    setScheduleDraft((current) => ({
      ...current,
      weekdays: current.weekdays.includes(day)
        ? current.weekdays.filter((item) => item !== day)
        : [...current.weekdays, day],
    }));
  };

  const saveSchedule = async () => {
    try {
      setSavingSchedule(true);
      const { data } = await api.patch('/portal/doctor/schedule', scheduleDraft);

      setOverview((current) => ({
        ...current,
        doctor: data.doctor,
      }));
      setScheduleDraft(data.doctor.schedule);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to save your schedule.');
    } finally {
      setSavingSchedule(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId) => {
    try {
      setUpdatingId(appointmentId);
      const nextStatus =
        appointmentDrafts[appointmentId] ||
        overview.appointments.find((item) => item._id === appointmentId)?.status;

      const { data } = await api.patch(`/portal/doctor/appointments/${appointmentId}`, {
        status: nextStatus,
      });

      const nextAppointments = overview.appointments.map((appointment) =>
        appointment._id === appointmentId ? data : appointment
      );

      setOverview((current) => ({
        ...current,
        appointments: nextAppointments,
        stats: {
          totalAppointments: nextAppointments.length,
          pending: nextAppointments.filter((item) => item.status === 'pending').length,
          confirmed: nextAppointments.filter((item) => item.status === 'confirmed').length,
          cancelled: nextAppointments.filter((item) => item.status === 'cancelled').length,
        },
      }));
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update this appointment.');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow eyebrow-light">Doctor Dashboard</span>
          <h1>{overview.doctor.name || 'Doctor Portal'}</h1>
          <p>
            Manage your clinic schedule, review patient requests, and keep
            appointment statuses up to date.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container portal-stack">
          {error ? <div className="alert-error">{error}</div> : null}

          {loading ? (
            <div className="section-centered">
              <div className="loading-spinner" aria-label="Loading doctor portal" />
            </div>
          ) : (
            <>
              <div className="grid-4">
                {Object.entries(overview.stats).map(([key, value]) => (
                  <article className={`card metric-card tone-${statMeta[key].tone}`} key={key}>
                    <span>{statMeta[key].label}</span>
                    <strong>{value}</strong>
                  </article>
                ))}
              </div>

              <div className="portal-layout">
                <div className="card">
                  <div className="portal-section-header">
                    <div>
                      <span className="eyebrow">Schedule Control</span>
                      <h2>Clinic Availability</h2>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-small"
                      disabled={savingSchedule}
                      onClick={saveSchedule}
                    >
                      {savingSchedule ? 'Saving...' : 'Save Schedule'}
                    </button>
                  </div>

                  <div className="schedule-day-grid">
                    {weekdays.map((day) => (
                      <label className="schedule-day" key={day}>
                        <input
                          type="checkbox"
                          checked={scheduleDraft.weekdays.includes(day)}
                          onChange={() => toggleWeekday(day)}
                        />
                        <span>{day}</span>
                      </label>
                    ))}
                  </div>

                  <div className="grid-3">
                    <div className="form-group">
                      <label className="form-label" htmlFor="doctor-start-time">
                        Start Time
                      </label>
                      <input
                        id="doctor-start-time"
                        type="time"
                        className="form-input"
                        value={scheduleDraft.startTime}
                        onChange={(event) =>
                          setScheduleDraft((current) => ({
                            ...current,
                            startTime: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="doctor-end-time">
                        End Time
                      </label>
                      <input
                        id="doctor-end-time"
                        type="time"
                        className="form-input"
                        value={scheduleDraft.endTime}
                        onChange={(event) =>
                          setScheduleDraft((current) => ({
                            ...current,
                            endTime: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="slot-duration">
                        Slot Duration (mins)
                      </label>
                      <input
                        id="slot-duration"
                        type="number"
                        min="10"
                        className="form-input"
                        value={scheduleDraft.slotDurationMinutes}
                        onChange={(event) =>
                          setScheduleDraft((current) => ({
                            ...current,
                            slotDurationMinutes: Number(event.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="consultation-mode">
                      Consultation Mode
                    </label>
                    <input
                      id="consultation-mode"
                      type="text"
                      className="form-input"
                      value={scheduleDraft.consultationMode}
                      onChange={(event) =>
                        setScheduleDraft((current) => ({
                          ...current,
                          consultationMode: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="schedule-notes">
                      Schedule Notes
                    </label>
                    <textarea
                      id="schedule-notes"
                      className="form-textarea"
                      rows="4"
                      value={scheduleDraft.notes}
                      onChange={(event) =>
                        setScheduleDraft((current) => ({
                          ...current,
                          notes: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <aside className="card portal-side-card">
                  <span className="eyebrow">Patient Load</span>
                  <h3>{patientCount} active patients</h3>
                  <div className="portal-mini-list">
                    {overview.patients.slice(0, 6).map((patient) => (
                      <div key={patient.email || patient.name}>
                        <strong>{patient.name}</strong>
                        <span>{patient.email}</span>
                      </div>
                    ))}
                  </div>
                </aside>
              </div>

              <div className="table-card card">
                <h2>Assigned Appointments</h2>

                {overview.appointments.length === 0 ? (
                  <div className="empty-state">
                    <h2>No appointments assigned</h2>
                    <p>Your upcoming patient requests will appear here.</p>
                  </div>
                ) : (
                  <div className="table-scroll">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Patient</th>
                          <th>Department</th>
                          <th>Date &amp; Time</th>
                          <th>Reason</th>
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
                            <td>
                              <div className="table-stack">
                                <span>{appointment.preferredDate}</span>
                                <span>{appointment.preferredTime}</span>
                              </div>
                            </td>
                            <td className="table-clamp">{appointment.reason}</td>
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
                                  disabled={updatingId === appointment._id}
                                  onClick={() => updateAppointmentStatus(appointment._id)}
                                >
                                  {updatingId === appointment._id ? 'Updating...' : 'Update'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default DoctorPortal;

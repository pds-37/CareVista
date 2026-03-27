import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../auth/AuthContext';

const statMeta = {
  totalAppointments: { label: 'Total Requests', tone: 'default' },
  pending: { label: 'Pending', tone: 'pending' },
  confirmed: { label: 'Confirmed', tone: 'confirmed' },
  cancelled: { label: 'Cancelled', tone: 'cancelled' },
};

function PatientPortal() {
  const { user } = useAuth();
  const [overview, setOverview] = useState({
    appointments: [],
    stats: {
      totalAppointments: 0,
      pending: 0,
      confirmed: 0,
      cancelled: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadOverview = async () => {
      try {
        const { data } = await api.get('/portal/patient/overview');

        if (mounted) {
          setOverview(data);
          setError('');
        }
      } catch (err) {
        if (mounted) {
          setError(err.response?.data?.error || 'Unable to load your patient portal.');
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

  const cancelAppointment = async (appointmentId) => {
    try {
      setUpdatingId(appointmentId);
      const { data } = await api.patch(`/portal/patient/appointments/${appointmentId}/cancel`, {
        notes: 'Cancelled by patient from portal.',
      });

      setOverview((current) => {
        const appointments = current.appointments.map((appointment) =>
          appointment._id === appointmentId ? data : appointment
        );

        return {
          appointments,
          stats: {
            totalAppointments: appointments.length,
            pending: appointments.filter((item) => item.status === 'pending').length,
            confirmed: appointments.filter((item) => item.status === 'confirmed').length,
            cancelled: appointments.filter((item) => item.status === 'cancelled').length,
          },
        };
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to cancel this appointment.');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow eyebrow-light">Patient Dashboard</span>
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'Patient'}</h1>
          <p>
            Track appointment requests, review outcomes, and keep your HealthNexus
            history organized in one place.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container portal-stack">
          {error ? <div className="alert-error">{error}</div> : null}

          {loading ? (
            <div className="section-centered">
              <div className="loading-spinner" aria-label="Loading patient portal" />
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
                <div className="table-card card">
                  <h2>Appointment History</h2>

                  {overview.appointments.length === 0 ? (
                    <div className="empty-state">
                      <h2>No appointments yet</h2>
                      <p>Your future HealthNexus visits will appear here.</p>
                    </div>
                  ) : (
                    <div className="table-scroll">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Department</th>
                            <th>Doctor</th>
                            <th>Date</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {overview.appointments.map((appointment) => (
                            <tr key={appointment._id}>
                              <td>{appointment.department}</td>
                              <td>{appointment.doctor}</td>
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
                                {appointment.status === 'cancelled' ? (
                                  <span className="table-muted">Cancelled</span>
                                ) : (
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-small"
                                    disabled={updatingId === appointment._id}
                                    onClick={() => cancelAppointment(appointment._id)}
                                  >
                                    {updatingId === appointment._id ? 'Cancelling...' : 'Cancel'}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <aside className="card portal-side-card">
                  <span className="eyebrow">Patient Profile</span>
                  <h3>{user?.name}</h3>
                  <div className="contact-info-list">
                    <div>
                      <span>Email</span>
                      <strong>{user?.email}</strong>
                    </div>
                    <div>
                      <span>Phone</span>
                      <strong>{user?.phone || 'Not provided'}</strong>
                    </div>
                    <div>
                      <span>Access Level</span>
                      <strong>{user?.role}</strong>
                    </div>
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default PatientPortal;

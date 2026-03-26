import { useEffect, useMemo, useState } from 'react';
import api from '../api';

const appointmentStatusOptions = ['pending', 'confirmed', 'cancelled'];
const messageStatusOptions = ['unread', 'read', 'resolved'];

const statMeta = {
  totalAppointments: { label: 'Total Appointments', tone: 'default' },
  pending: { label: 'Pending', tone: 'pending' },
  confirmed: { label: 'Confirmed', tone: 'confirmed' },
  cancelled: { label: 'Cancelled', tone: 'cancelled' },
  totalMessages: { label: 'Total Messages', tone: 'default' },
  unread: { label: 'Unread Messages', tone: 'unread' },
};

const buildStats = (appointments, messages) => ({
  totalAppointments: appointments.length,
  pending: appointments.filter((item) => item.status === 'pending').length,
  confirmed: appointments.filter((item) => item.status === 'confirmed').length,
  cancelled: appointments.filter((item) => item.status === 'cancelled').length,
  totalMessages: messages.length,
  unread: messages.filter((item) => item.status === 'unread').length,
});

const formatDateTime = (dateValue) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateValue));

function CareDesk() {
  const [overview, setOverview] = useState({
    appointments: [],
    messages: [],
    stats: buildStats([], []),
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointmentDrafts, setAppointmentDrafts] = useState({});
  const [messageDrafts, setMessageDrafts] = useState({});
  const [updatingRows, setUpdatingRows] = useState({});
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc',
  });

  useEffect(() => {
    let intervalId;
    let mounted = true;

    const loadOverview = async () => {
      try {
        const { data } = await api.get('/site/care-desk/overview');

        if (!mounted) {
          return;
        }

        const appointments = data.appointments || [];
        const messages = data.messages || [];

        setOverview({
          appointments,
          messages,
          stats: data.stats || buildStats(appointments, messages),
        });
        setError('');
      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.error ||
              'Unable to load the care-desk overview right now.'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOverview();
    intervalId = setInterval(loadOverview, 60000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const sortedAppointments = useMemo(() => {
    const appointments = [...overview.appointments];
    const { key, direction } = sortConfig;

    appointments.sort((first, second) => {
      let firstValue = first[key];
      let secondValue = second[key];

      if (key === 'createdAt' || key === 'preferredDate') {
        firstValue = new Date(firstValue).getTime();
        secondValue = new Date(secondValue).getTime();
      } else {
        firstValue = String(firstValue || '').toLowerCase();
        secondValue = String(secondValue || '').toLowerCase();
      }

      if (firstValue < secondValue) {
        return direction === 'asc' ? -1 : 1;
      }

      if (firstValue > secondValue) {
        return direction === 'asc' ? 1 : -1;
      }

      return 0;
    });

    return appointments;
  }, [overview.appointments, sortConfig]);

  const sortedMessages = useMemo(
    () =>
      [...overview.messages].sort(
        (first, second) =>
          new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
      ),
    [overview.messages]
  );

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const updateOverviewState = (appointments, messages) => {
    setOverview({
      appointments,
      messages,
      stats: buildStats(appointments, messages),
    });
  };

  const updateAppointmentStatus = async (id) => {
    const status = appointmentDrafts[id];

    if (!status) {
      return;
    }

    try {
      setUpdatingRows((current) => ({ ...current, [id]: true }));
      const { data } = await api.patch(`/site/care-desk/appointments/${id}`, {
        status,
      });

      const nextAppointments = overview.appointments.map((appointment) =>
        appointment._id === id ? data : appointment
      );

      updateOverviewState(nextAppointments, overview.messages);
      setError('');
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Unable to update appointment status right now.'
      );
    } finally {
      setUpdatingRows((current) => ({ ...current, [id]: false }));
    }
  };

  const updateMessageStatus = async (id) => {
    const status = messageDrafts[id];

    if (!status) {
      return;
    }

    try {
      setUpdatingRows((current) => ({ ...current, [id]: true }));
      const { data } = await api.patch(`/site/care-desk/messages/${id}`, {
        status,
      });

      const nextMessages = overview.messages.map((message) =>
        message._id === id ? data : message
      );

      updateOverviewState(overview.appointments, nextMessages);
      setError('');
    } catch (err) {
      setError(
        err.response?.data?.error || 'Unable to update message status right now.'
      );
    } finally {
      setUpdatingRows((current) => ({ ...current, [id]: false }));
    }
  };

  return (
    <div className="care-desk-page">
      <section className="page-hero care-desk-hero">
        <div className="container">
          <span className="eyebrow eyebrow-light">Operations Dashboard</span>
          <h1>Care Desk</h1>
          <p>
            Review incoming appointment requests and patient messages without
            leaving the dashboard.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {error && <div className="alert-error">{error}</div>}

          {loading ? (
            <div className="section-centered">
              <div
                className="loading-spinner"
                aria-label="Loading care desk overview"
              />
            </div>
          ) : (
            <>
              <div className="grid-3 stats-dashboard-grid">
                {Object.entries(overview.stats).map(([key, value]) => (
                  <article
                    className={`card metric-card tone-${statMeta[key].tone}`}
                    key={key}
                  >
                    <span>{statMeta[key].label}</span>
                    <strong>{value}</strong>
                  </article>
                ))}
              </div>

              <div className="care-desk-tabs">
                <button
                  type="button"
                  className={`tab-button ${
                    activeTab === 'appointments' ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab('appointments')}
                >
                  Appointments
                </button>
                <button
                  type="button"
                  className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
                  onClick={() => setActiveTab('messages')}
                >
                  Messages
                </button>
              </div>

              {activeTab === 'appointments' ? (
                <div className="table-card card">
                  {sortedAppointments.length === 0 ? (
                    <div className="empty-state">
                      <h2>All clear!</h2>
                      <p>No appointment requests are waiting right now.</p>
                    </div>
                  ) : (
                    <div className="table-scroll">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>
                              <button type="button" onClick={() => handleSort('patientName')}>
                                Patient Name
                              </button>
                            </th>
                            <th>Contact</th>
                            <th>
                              <button type="button" onClick={() => handleSort('department')}>
                                Department
                              </button>
                            </th>
                            <th>
                              <button type="button" onClick={() => handleSort('doctor')}>
                                Doctor
                              </button>
                            </th>
                            <th>
                              <button type="button" onClick={() => handleSort('preferredDate')}>
                                Date &amp; Time
                              </button>
                            </th>
                            <th>Reason</th>
                            <th>
                              <button type="button" onClick={() => handleSort('status')}>
                                Status
                              </button>
                            </th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedAppointments.map((appointment) => (
                            <tr key={appointment._id}>
                              <td>{appointment.patientName}</td>
                              <td>
                                <div className="table-stack">
                                  <span>{appointment.patientEmail}</span>
                                  <span>{appointment.patientPhone}</span>
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
                                    value={
                                      appointmentDrafts[appointment._id] ||
                                      appointment.status
                                    }
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
                                    onClick={() =>
                                      updateAppointmentStatus(appointment._id)
                                    }
                                  >
                                    {updatingRows[appointment._id]
                                      ? 'Updating...'
                                      : 'Update'}
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
              ) : (
                <div className="table-card card">
                  {sortedMessages.length === 0 ? (
                    <div className="empty-state">
                      <h2>All clear!</h2>
                      <p>No new patient messages are waiting right now.</p>
                    </div>
                  ) : (
                    <div className="table-scroll">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Subject</th>
                            <th>Message</th>
                            <th>Status</th>
                            <th>Received</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedMessages.map((message) => (
                            <tr key={message._id}>
                              <td>{message.name}</td>
                              <td>{message.email}</td>
                              <td>{message.subject}</td>
                              <td className="table-clamp">{message.message}</td>
                              <td>
                                <span className={`badge badge-${message.status}`}>
                                  {message.status}
                                </span>
                              </td>
                              <td>{formatDateTime(message.createdAt)}</td>
                              <td>
                                <div className="table-action-group">
                                  <select
                                    className="form-select table-select"
                                    value={
                                      messageDrafts[message._id] || message.status
                                    }
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
                                    {updatingRows[message._id]
                                      ? 'Updating...'
                                      : 'Update'}
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
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default CareDesk;

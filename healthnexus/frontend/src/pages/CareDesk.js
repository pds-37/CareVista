import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHero from '../components/PageHero';
import SectionHeader from '../components/SectionHeader';
import StatusBadge from '../components/StatusBadge';
import api from '../utils/api';

const appointmentStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
const messageStatuses = ['new', 'in-progress', 'closed'];

const formatDate = (value) => {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const CareDesk = () => {
  const [deskData, setDeskData] = useState({
    appointments: [],
    departmentLoad: [],
    messages: [],
    metrics: [],
  });
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState('');

  const loadDeskData = async () => {
    try {
      const response = await api.get('/site/care-desk/overview');
      setDeskData(response.data.data);
    } catch (error) {
      toast.error('Unable to load the care-desk dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeskData();
  }, []);

  const handleAppointmentStatusChange = async (appointmentId, status) => {
    setBusyKey(`appointment-${appointmentId}`);

    try {
      await api.patch(`/site/care-desk/appointments/${appointmentId}`, { status });
      await loadDeskData();
      toast.success('Appointment status updated.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update appointment status.');
    } finally {
      setBusyKey('');
    }
  };

  const handleMessageStatusChange = async (messageId, status) => {
    setBusyKey(`message-${messageId}`);

    try {
      await api.patch(`/site/care-desk/messages/${messageId}`, { status });
      await loadDeskData();
      toast.success('Message status updated.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update message status.');
    } finally {
      setBusyKey('');
    }
  };

  return (
    <main>
      <PageHero
        description="Internal operations view for reviewing new requests, confirming visits, and closing the loop on care-desk communication."
        eyebrow="Care Desk"
        panelItems={[
          { label: 'Appointment queue', value: 'Live' },
          { label: 'Message inbox', value: 'Live' },
          { label: 'Status actions', value: 'Enabled' },
        ]}
        panelTitle="Operational tools"
        title="Manage the patient intake queue after submission."
      />

      <section className="page-section">
        <div className="container">
          {loading ? (
            <LoadingSpinner text="Loading care-desk dashboard..." />
          ) : (
            <>
              <div className="stats-grid">
                {deskData.metrics.map((metric) => (
                  <article className="stat-card" key={metric.label}>
                    <strong>{metric.value}</strong>
                    <span>{metric.label}</span>
                  </article>
                ))}
              </div>

              <div className="desk-columns">
                <div className="desk-column">
                  <SectionHeader
                    description="Confirm, complete, or cancel appointment requests directly from the queue."
                    eyebrow="Appointments"
                    title="Latest appointment requests"
                  />

                  <div className="queue-list">
                    {deskData.appointments.map((appointment) => (
                      <article className="queue-card" key={appointment._id}>
                        <div className="queue-card-head">
                          <div>
                            <h3>{appointment.fullName}</h3>
                            <p>{appointment.reason}</p>
                          </div>
                          <StatusBadge value={appointment.status} />
                        </div>

                        <div className="queue-meta">
                          <span>Department: {appointment.department?.name}</span>
                          <span>Doctor: {appointment.doctor?.name || 'Any available specialist'}</span>
                          <span>Preferred date: {formatDate(appointment.preferredDate)}</span>
                          <span>Time window: {appointment.preferredTimeSlot}</span>
                          <span>Patient type: {appointment.patientType}</span>
                          <span>Contact: {appointment.phone}</span>
                        </div>

                        {appointment.notes ? (
                          <div className="queue-note">
                            <strong>Notes</strong>
                            <p>{appointment.notes}</p>
                          </div>
                        ) : null}

                        <label className="status-control">
                          Update status
                          <select
                            disabled={busyKey === `appointment-${appointment._id}`}
                            onChange={(event) =>
                              handleAppointmentStatusChange(appointment._id, event.target.value)
                            }
                            value={appointment.status}
                          >
                            {appointmentStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </label>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="desk-column">
                  <SectionHeader
                    description="Track inbound support requests and move them through the inbox."
                    eyebrow="Messages"
                    title="Care-desk inbox"
                  />

                  <div className="queue-list">
                    {deskData.messages.map((message) => (
                      <article className="queue-card" key={message._id}>
                        <div className="queue-card-head">
                          <div>
                            <h3>{message.subject}</h3>
                            <p>{message.fullName}</p>
                          </div>
                          <StatusBadge value={message.status} />
                        </div>

                        <div className="queue-meta">
                          <span>Email: {message.email}</span>
                          <span>Phone: {message.phone || 'Not provided'}</span>
                        </div>

                        <div className="queue-note">
                          <strong>Message</strong>
                          <p>{message.message}</p>
                        </div>

                        <label className="status-control">
                          Update status
                          <select
                            disabled={busyKey === `message-${message._id}`}
                            onChange={(event) => handleMessageStatusChange(message._id, event.target.value)}
                            value={message.status}
                          >
                            {messageStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </label>
                      </article>
                    ))}
                  </div>
                </div>
              </div>

              <section className="page-section page-section-tight">
                <SectionHeader
                  description="Quick view of incoming request volume by department."
                  eyebrow="Department Load"
                  title="Where the queue is building"
                />

                <div className="load-grid">
                  {deskData.departmentLoad.map((item) => (
                    <article className="load-card" key={item.name}>
                      <div className="load-card-head">
                        <strong>{item.name}</strong>
                        <span>{item.total} total</span>
                      </div>
                      <div className="load-bar-track">
                        <div className="load-bar-fill" style={{ width: `${Math.min(item.total * 18, 100)}%` }} />
                      </div>
                      <p>{item.pending} pending requests awaiting action.</p>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default CareDesk;

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const getInitials = (name) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

function FindDoctors() {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadDepartments = async () => {
      try {
        const { data } = await api.get('/site/departments');
        if (mounted) {
          setDepartments(data.departments || []);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.error ||
              'Unable to load department filters right now.'
          );
        }
      }
    };

    loadDepartments();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let mounted = true;

    const loadDoctors = async () => {
      try {
        setLoading(true);
        setError('');

        const params = {};

        if (selectedDepartment) {
          params.department = selectedDepartment;
        }

        if (debouncedSearch) {
          params.search = debouncedSearch;
        }

        const { data } = await api.get('/site/doctors', { params });

        if (mounted) {
          setDoctors(data.doctors || []);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.error ||
              'Unable to load physicians right now.'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDoctors();

    return () => {
      mounted = false;
    };
  }, [debouncedSearch, selectedDepartment]);

  const resultsLabel = useMemo(() => {
    if (loading) {
      return 'Loading doctors...';
    }

    return `Showing ${doctors.length} doctor${doctors.length === 1 ? '' : 's'}`;
  }, [doctors.length, loading]);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow eyebrow-light">Clinical Directory</span>
          <h1>Find a Doctor</h1>
          <p>
            Filter by specialty or search by physician name to find the right
            clinician for your next visit.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="card filter-bar">
            <div className="form-group">
              <label className="form-label" htmlFor="department-filter">
                Department
              </label>
              <select
                id="department-filter"
                className="form-select"
                value={selectedDepartment}
                onChange={(event) => setSelectedDepartment(event.target.value)}
              >
                <option value="">All departments</option>
                {departments.map((department) => (
                  <option key={department._id} value={department.name}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="doctor-search">
                Search
              </label>
              <input
                id="doctor-search"
                type="search"
                className="form-input"
                placeholder="Search by doctor name or specialty"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
          </div>

          <div className="results-row">
            <p>{resultsLabel}</p>
          </div>

          {error ? (
            <div className="alert-error">{error}</div>
          ) : loading ? (
            <div className="section-centered">
              <div className="loading-spinner" aria-label="Loading doctors" />
            </div>
          ) : doctors.length === 0 ? (
            <div className="empty-state card">
              <span className="empty-state-icon" aria-hidden="true">
                🔎
              </span>
              <h2>No doctors found matching your search.</h2>
              <p>Try removing a filter or using a broader specialty keyword.</p>
            </div>
          ) : (
            <div className="grid-3">
              {doctors.map((doctor) => (
                <article className="card doctor-directory-card" key={doctor._id}>
                  <div className="doctor-avatar large-avatar">
                    {getInitials(doctor.name)}
                  </div>
                  <h3>{doctor.name}</h3>
                  <p className="doctor-specialty">{doctor.specialty}</p>
                  <span className="department-pill">{doctor.department}</span>
                  <div className="doctor-meta-list">
                    <p>
                      <strong>⭐ {doctor.rating}</strong> ({doctor.reviewCount}{' '}
                      reviews)
                    </p>
                    <p>{doctor.experience} years experience</p>
                    <p>Languages: {doctor.languages.join(', ')}</p>
                  </div>
                  <p className="line-clamp-3">{doctor.bio}</p>
                  <Link to="/appointments" className="btn btn-primary full-width">
                    Book Appointment
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default FindDoctors;

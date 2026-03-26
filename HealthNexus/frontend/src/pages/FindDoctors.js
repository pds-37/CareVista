import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { fallbackDepartments, fallbackDoctors } from '../content/careFallback';

const getInitials = (name) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

function FindDoctors() {
  const [departments, setDepartments] = useState(fallbackDepartments);
  const [doctors, setDoctors] = useState(fallbackDoctors);
  const [error, setError] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadDirectory = async () => {
      try {
        setError('');
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
          setError(
            err.response?.data?.error ||
              'Live physician data is temporarily unavailable. Showing the CareVista directory.'
          );
        }
      }
    };

    loadDirectory();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredDoctors = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const matchesDepartment = selectedDepartment
        ? doctor.department === selectedDepartment
        : true;
      const matchesSearch = normalizedSearch
        ? `${doctor.name} ${doctor.specialty}`.toLowerCase().includes(normalizedSearch)
        : true;

      return matchesDepartment && matchesSearch;
    });
  }, [doctors, searchQuery, selectedDepartment]);

  const resultsLabel = useMemo(
    () =>
      `Showing ${filteredDoctors.length} doctor${
        filteredDoctors.length === 1 ? '' : 's'
      }`,
    [filteredDoctors.length]
  );

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

          {error ? <div className="alert-error">{error}</div> : null}

          {filteredDoctors.length === 0 ? (
            <div className="empty-state card">
              <span className="empty-state-icon" aria-hidden="true">
                DR
              </span>
              <h2>No doctors found matching your search.</h2>
              <p>Try removing a filter or using a broader specialty keyword.</p>
            </div>
          ) : (
            <div className="grid-3">
              {filteredDoctors.map((doctor) => (
                <article className="card doctor-directory-card" key={doctor._id}>
                  <div className="doctor-avatar large-avatar">
                    {getInitials(doctor.name)}
                  </div>
                  <h3>{doctor.name}</h3>
                  <p className="doctor-specialty">{doctor.specialty}</p>
                  <span className="department-pill">{doctor.department}</span>
                  <div className="doctor-meta-list">
                    <p>
                      <strong>Rating {doctor.rating}</strong> ({doctor.reviewCount}{' '}
                      reviews)
                    </p>
                    <p>{doctor.experience} years experience</p>
                    <p>Languages: {(doctor.languages || []).join(', ')}</p>
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

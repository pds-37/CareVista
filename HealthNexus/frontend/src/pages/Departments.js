import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { fallbackDepartments } from '../content/careFallback';

function Departments() {
  const [departments, setDepartments] = useState(fallbackDepartments);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadDepartments = async () => {
      try {
        setError('');
        const { data } = await api.get('/site/departments');

        if (mounted && Array.isArray(data.departments) && data.departments.length > 0) {
          setDepartments(data.departments);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.error ||
              'Live department details are temporarily unavailable. Showing HealthNexus specialties.'
          );
        }
      }
    };

    loadDepartments();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow eyebrow-light">Specialized Clinical Services</span>
          <h1>Our Departments</h1>
          <p>
            Explore the specialties that anchor HealthNexus&apos;s coordinated model
            of care, from first evaluation through treatment and recovery.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {error ? <div className="alert-error">{error}</div> : null}

          <div className="grid-3">
            {departments.map((department) => (
              <article className="card department-card" key={department._id}>
                <div className="department-card-icon">{department.icon}</div>
                <h2>{department.name}</h2>
                <p>{department.description}</p>
                <ul className="feature-list">
                  {(department.services || []).map((service) => (
                    <li key={service}>{service}</li>
                  ))}
                </ul>
                <div className="department-card-footer">
                  <p>
                    <strong>Led by {department.headDoctor}</strong>
                  </p>
                  <Link to="/appointments" className="btn btn-secondary">
                    Book in This Department ->
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Departments;

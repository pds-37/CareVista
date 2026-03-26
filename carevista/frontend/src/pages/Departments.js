import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadDepartments = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await api.get('/site/departments');

        if (mounted) {
          setDepartments(data.departments || []);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.error ||
              'Unable to load departments at the moment.'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
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
            Explore the specialties that anchor CareVista&apos;s coordinated model
            of care, from first evaluation through treatment and recovery.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <div className="section-centered">
              <div
                className="loading-spinner"
                aria-label="Loading departments"
              />
            </div>
          ) : error ? (
            <div className="alert-error">{error}</div>
          ) : (
            <div className="grid-3">
              {departments.map((department) => (
                <article className="card department-card" key={department._id}>
                  <div className="department-card-icon">{department.icon}</div>
                  <h2>{department.name}</h2>
                  <p>{department.description}</p>
                  <ul className="feature-list">
                    {department.services.map((service) => (
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
          )}
        </div>
      </section>
    </>
  );
}

export default Departments;

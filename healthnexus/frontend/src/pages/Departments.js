import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DepartmentCard from '../components/DepartmentCard';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHero from '../components/PageHero';
import SectionHeader from '../components/SectionHeader';
import api from '../utils/api';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadDepartments = async () => {
      try {
        const response = await api.get('/site/departments');
        if (mounted) {
          setDepartments(response.data.data || []);
        }
      } catch (error) {
        if (mounted) {
          setDepartments([]);
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
    <main>
      <PageHero
        description="Every department is shaped around faster clinical access, clearer family communication, and a calmer in-hospital experience."
        eyebrow="Clinical Departments"
        panelItems={[
          { label: 'Emergency intake', value: '24 / 7' },
          { label: 'Average response routing', value: '< 12 min' },
          { label: 'Care coordination desk', value: 'Always on' },
        ]}
        panelTitle="Operational snapshot"
        title="Specialties designed to feel organized, responsive, and reassuring."
      />

      <section className="page-section">
        <div className="container">
          <SectionHeader
            description="Choose the care path that best fits the patient need, from acute consults to prevention-led checkups."
            eyebrow="Hospital Services"
            title="Explore our care network"
          />

          {loading ? (
            <LoadingSpinner text="Loading departments..." />
          ) : (
            <div className="department-grid">
              {departments.map((department) => (
                <DepartmentCard department={department} key={department._id} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="page-section page-section-tint">
        <div className="container support-grid">
          <div className="support-card">
            <span className="section-eyebrow">Coordinated Support</span>
            <h2>Need help choosing the right department?</h2>
            <p>
              Our care desk can help route you to the correct specialty before you submit an appointment request.
            </p>
            <Link className="btn btn-primary" to="/contact">
              Contact the care desk
            </Link>
          </div>
          <div className="support-card support-card-soft">
            <span className="section-eyebrow">Visit Planning</span>
            <h2>Prefer to book immediately?</h2>
            <p>
              Share your symptoms, preferred doctor, and time window. We will confirm the next available slot.
            </p>
            <Link className="btn btn-secondary" to="/appointments">
              Start appointment request
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Departments;

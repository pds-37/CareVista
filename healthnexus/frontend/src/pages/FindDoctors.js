import React, { startTransition, useDeferredValue, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DoctorCard from '../components/DoctorCard';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHero from '../components/PageHero';
import SectionHeader from '../components/SectionHeader';
import api from '../utils/api';

const FindDoctors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(searchParams.get('department') || '');
  const [loading, setLoading] = useState(true);

  const deferredSearch = useDeferredValue(searchTerm);

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
      }
    };

    loadDepartments();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadDoctors = async () => {
      setLoading(true);
      try {
        const response = await api.get('/site/doctors', {
          params: {
            department: selectedDepartment || undefined,
            search: deferredSearch || undefined,
          },
        });

        if (mounted) {
          setDoctors(response.data.data || []);
        }
      } catch (error) {
        if (mounted) {
          setDoctors([]);
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
  }, [deferredSearch, selectedDepartment]);

  const handleDepartmentChange = (event) => {
    const { value } = event.target;
    setSelectedDepartment(value);
    setSearchParams(value ? { department: value } : {});
  };

  const handleSearchChange = (event) => {
    const { value } = event.target;
    startTransition(() => {
      setSearchTerm(value);
    });
  };

  return (
    <main>
      <PageHero
        description="Search by specialty, care focus, or department to find the specialist who best matches the visit you need."
        eyebrow="Doctor Directory"
        panelItems={[
          { label: 'Featured specialists', value: 'Top rated' },
          { label: 'Department routing', value: 'Built in' },
          { label: 'Visit requests', value: 'Online' },
        ]}
        panelTitle="How to use this page"
        title="Find a doctor without feeling lost in the hospital maze."
      />

      <section className="page-section">
        <div className="container">
          <SectionHeader
            description="Use the filters to narrow by department or search using symptoms, specialties, and doctor names."
            eyebrow="Search"
            title="Explore the specialist network"
          />

          <div className="filter-bar">
            <label>
              Search
              <input
                onChange={handleSearchChange}
                placeholder="Cardiology, migraine, prevention..."
                type="search"
                value={searchTerm}
              />
            </label>

            <label>
              Department
              <select onChange={handleDepartmentChange} value={selectedDepartment}>
                <option value="">All departments</option>
                {departments.map((department) => (
                  <option key={department._id} value={department.slug}>
                    {department.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading doctors..." />
          ) : doctors.length ? (
            <div className="doctor-grid">
              {doctors.map((doctor) => (
                <DoctorCard doctor={doctor} key={doctor._id} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No doctors matched your search.</h3>
              <p>Try a different specialty or clear the department filter to widen the results.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default FindDoctors;

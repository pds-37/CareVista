import React, { useEffect, useState } from 'react';
import PageHero from '../components/PageHero';
import SectionHeader from '../components/SectionHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';

const About = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadOverview = async () => {
      try {
        const response = await api.get('/site/overview');
        if (mounted) {
          setOverview(response.data.data);
        }
      } catch (error) {
        if (mounted) {
          setOverview(null);
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

  return (
    <main>
      <PageHero
        description="HealthNexus was imagined as a hospital environment that feels confident and efficient without becoming cold or overwhelming."
        eyebrow="About HealthNexus"
        panelItems={[
          { label: 'Core principle', value: 'Clarity' },
          { label: 'Experience goal', value: 'Lower anxiety' },
          { label: 'Operational mindset', value: 'Care first' },
        ]}
        panelTitle="How we think"
        title="A hospital platform built around trust, rhythm, and responsive care."
      />

      <section className="page-section">
        <div className="container">
          {loading ? (
            <LoadingSpinner text="Loading our story..." />
          ) : (
            <>
              <SectionHeader
                description="We combine specialist-led care with a calmer digital layer so patients and families can move through the hospital with better context."
                eyebrow="Our Approach"
                title="Clinical excellence should also feel understandable"
              />

              <div className="narrative-grid">
                <article className="story-card">
                  <h3>Designed for calmer decision-making</h3>
                  <p>
                    From homepage messaging to appointment intake, every part of the experience is written to reduce uncertainty and make next steps obvious.
                  </p>
                </article>
                <article className="story-card">
                  <h3>Built around department coordination</h3>
                  <p>
                    We emphasize routing, preparedness, and continuity so patients spend less energy navigating the system and more energy focusing on recovery.
                  </p>
                </article>
                <article className="story-card">
                  <h3>Hospital-friendly visual language</h3>
                  <p>
                    Teal, slate blue, soft mint, and clean surfaces create a professional environment that feels reliable without appearing sterile or harsh.
                  </p>
                </article>
              </div>

              <div className="timeline-section">
                <SectionHeader
                  description="A simple care journey helps patients know what comes next and why."
                  eyebrow="Patient Journey"
                  title="How the experience flows"
                />
                <div className="timeline-grid">
                  {overview?.careJourney?.map((item) => (
                    <article className="timeline-card" key={item.step}>
                      <span>{item.step}</span>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </article>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default About;

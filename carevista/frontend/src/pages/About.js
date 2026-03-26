function About() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow eyebrow-light">Who We Are</span>
          <h1>About CareVista</h1>
          <p>
            CareVista combines modern medicine with a patient-first culture built
            around dignity, transparency, and clinical excellence.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container mission-layout">
          <div>
            <span className="eyebrow">Our Mission</span>
            <h2>Exceptional healthcare should feel coordinated, human, and safe.</h2>
            <p>
              CareVista was founded to close the gap between advanced treatment
              and compassionate service. We believe patients deserve a care team
              that explains options clearly, responds promptly, and treats every
              concern with seriousness.
            </p>
            <p>
              Our clinicians, nurses, and operations staff work as one connected
              system so patients move from diagnosis to treatment without
              confusion, delay, or fragmented communication.
            </p>
          </div>

          <div className="card mission-image-card">
            <div className="mission-image-placeholder" aria-hidden="true">
              <span>CareVista</span>
              <strong>Integrated Care Campus</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-heading">
            <h2 className="section-title">Our Values</h2>
            <p>
              These principles shape how CareVista makes clinical decisions and
              serves patients across every department.
            </p>
          </div>
          <div className="grid-4">
            <article className="card value-card">
              <span aria-hidden="true">💙</span>
              <h3>Compassion</h3>
              <p>
                We listen closely and treat each patient with empathy, patience,
                and respect. Compassion is part of the clinical standard, not an
                extra.
              </p>
            </article>
            <article className="card value-card">
              <span aria-hidden="true">🏥</span>
              <h3>Excellence</h3>
              <p>
                We pursue strong outcomes through evidence-based medicine,
                careful review, and multidisciplinary collaboration. Good enough
                is not the benchmark.
              </p>
            </article>
            <article className="card value-card">
              <span aria-hidden="true">🧪</span>
              <h3>Innovation</h3>
              <p>
                We adopt technology and new workflows only when they improve
                patient safety, speed, or clarity. Innovation must deliver real
                clinical value.
              </p>
            </article>
            <article className="card value-card">
              <span aria-hidden="true">🛡️</span>
              <h3>Integrity</h3>
              <p>
                We communicate honestly about diagnoses, timelines, and next
                steps. Trust is earned through consistent, transparent action.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <h2 className="section-title">Our Story</h2>
            <p>
              CareVista has grown deliberately, expanding services while keeping
              the patient experience personal and navigable.
            </p>
          </div>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-dot" />
              <div className="card timeline-card">
                <span>1998</span>
                <h3>CareVista is founded</h3>
                <p>
                  A small regional hospital opens with a mission to provide
                  accessible, community-rooted specialty care.
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot" />
              <div className="card timeline-card">
                <span>2005</span>
                <h3>Campus expansion</h3>
                <p>
                  The hospital adds surgical suites, expanded diagnostics, and a
                  larger emergency department to meet rising demand.
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot" />
              <div className="card timeline-card">
                <span>2012</span>
                <h3>Research and innovation center</h3>
                <p>
                  A dedicated center launches to support clinical research,
                  training, and cross-specialty collaboration.
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot" />
              <div className="card timeline-card">
                <span>2020</span>
                <h3>Digital transformation</h3>
                <p>
                  CareVista modernizes patient communications, triage workflows,
                  and care coordination to improve speed and continuity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-banner cta-banner-light">
            <div>
              <span className="eyebrow">Careers</span>
              <h2>Join Our Team</h2>
              <p>
                CareVista is always looking for clinicians, coordinators, and
                support staff who take patient care seriously and work well in
                multidisciplinary teams.
              </p>
            </div>
            <a className="btn btn-primary" href="mailto:careers@carevista.health">
              careers@carevista.health
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

export default About;

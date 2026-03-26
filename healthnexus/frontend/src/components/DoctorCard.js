import React from 'react';

const DoctorCard = ({ doctor }) => {
  const initials = doctor.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('');

  return (
    <article className="doctor-card">
      <div className="doctor-card-top">
        <div
          className="doctor-avatar"
          style={{
            background: `linear-gradient(145deg, ${doctor.avatarColor || '#1c6e74'}, #e4f4f1)`,
          }}
        >
          <span>{initials}</span>
        </div>

        <div className="doctor-rating">
          <strong>{doctor.rating}</strong>
          <span>{doctor.reviewCount} reviews</span>
        </div>
      </div>

      <div className="doctor-copy">
        <span className="doctor-department">{doctor.department?.name}</span>
        <h3>{doctor.name}</h3>
        <p className="doctor-specialty">
          {doctor.specialty} | {doctor.credentials}
        </p>
        <p>{doctor.bio}</p>
      </div>

      <div className="doctor-detail-list">
        <div>
          <span>Experience</span>
          <strong>{doctor.experienceYears} years</strong>
        </div>
        <div>
          <span>Languages</span>
          <strong>{doctor.languages.join(', ')}</strong>
        </div>
      </div>

      <div className="tag-list">
        {doctor.focusAreas.map((item) => (
          <span className="tag" key={item}>
            {item}
          </span>
        ))}
      </div>
    </article>
  );
};

export default DoctorCard;

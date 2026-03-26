import React from 'react';
import { Link } from 'react-router-dom';
import IconBadge from './IconBadge';

const DepartmentCard = ({ department }) => {
  return (
    <article className="department-card">
      <div className="department-card-top">
        <IconBadge name={department.icon} />
        <span className="department-chip">{department.averageWaitTime}</span>
      </div>
      <h3>{department.name}</h3>
      <p>{department.description}</p>

      <div className="department-meta">
        <span>{department.consultationFee}</span>
        <span>{department.availability}</span>
      </div>

      <div className="tag-list">
        {department.keyServices.map((service) => (
          <span className="tag" key={service}>
            {service}
          </span>
        ))}
      </div>

      <div className="department-card-footer">
        <strong>{department.spotlightMetric}</strong>
        <Link className="text-link" to={`/appointments?department=${department.slug}`}>
          Request visit
        </Link>
      </div>
    </article>
  );
};

export default DepartmentCard;

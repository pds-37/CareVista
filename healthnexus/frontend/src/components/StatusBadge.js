import React from 'react';

const labelMap = {
  cancelled: 'Cancelled',
  closed: 'Closed',
  completed: 'Completed',
  confirmed: 'Confirmed',
  'in-progress': 'In Progress',
  new: 'New',
  pending: 'Pending',
};

const StatusBadge = ({ value }) => {
  return <span className={`status-badge status-${value}`}>{labelMap[value] || value}</span>;
};

export default StatusBadge;

import React from 'react';

const iconLabels = {
  Baby: 'PED',
  Bone: 'ORT',
  Brain: 'NEU',
  HeartPulse: 'CAR',
  Lungs: 'PUL',
  ShieldCheck: 'PRE',
};

const IconBadge = ({ name }) => {
  return (
    <span className="icon-badge" aria-hidden="true">
      <span>{iconLabels[name] || 'HN'}</span>
    </span>
  );
};

export default IconBadge;

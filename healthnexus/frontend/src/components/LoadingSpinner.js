import React from 'react';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="loading-state" role="status">
      <span className="spinner" />
      <p>{text}</p>
    </div>
  );
};

export default LoadingSpinner;

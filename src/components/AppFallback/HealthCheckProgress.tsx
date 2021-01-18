import React, { useEffect, useState } from 'react';
import OakSpinner from '../../oakui/OakSpinner';
import './HealthCheckProgress.scss';

const HealthCheckProgress = () => {
  return (
    <div className="health-check-progress">
      <OakSpinner />
    </div>
  );
};

export default HealthCheckProgress;

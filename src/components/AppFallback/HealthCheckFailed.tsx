import React, { useEffect, useState } from 'react';
import Logo from '../Logo';
import './HealthCheckFailed.scss';

const HealthCheckFailed = () => {
  return (
    <div className="health-check-failed">
      <div className="health-check-failed--logo">
        <Logo />
      </div>
      <div className="health-check-failed--message">
        We are working on improving your experience. We will be back soon. Check
        back in few hours.
      </div>
    </div>
  );
};

export default HealthCheckFailed;

import React from 'react';
import './Header.css';

export const Header = () => {
  return (
    <header className="dashboard-header">
      <div className="header-content">
        <div className="header-titles">
          <h1>POSM ROLLOUT TRACKING DASHBOARD</h1>
          <p>UrBox - POSM Deployment Monitoring</p>
        </div>
        <div className="header-logo-placeholder">
          <span className="logo-text">UrBox</span>
        </div>
      </div>
    </header>
  );
};

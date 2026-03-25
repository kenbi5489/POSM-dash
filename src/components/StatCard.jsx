import React from 'react';
import './StatCard.css';

export const StatCard = ({ title, value, icon: Icon, colorClass, isPercentage = false }) => {
  return (
    <div className={`stat-card card ${colorClass}`}>
      <div className="stat-card-content">
        <div className="stat-card-info">
          <h3 className="stat-card-title">{title}</h3>
          <p className="stat-card-value">{value}{isPercentage ? '%' : ''}</p>
        </div>
        <div className="stat-card-icon-wrapper">
          <Icon size={28} />
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Filter, Calendar } from 'lucide-react';
import './FilterBar.css';

export const FilterBar = ({ filters, setFilters, options }) => {
  const handleChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="filter-bar card">
      <div className="filter-group-label">
        <Filter size={18} />
        <span>Filters:</span>
      </div>
      
      <div className="filter-controls">
        <select 
          value={filters.brand} 
          onChange={(e) => handleChange('brand', e.target.value)}
          className="filter-select"
        >
          <option value="All">All Brands</option>
          {options.brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>

        <select 
          value={filters.district} 
          onChange={(e) => handleChange('district', e.target.value)}
          className="filter-select"
        >
          <option value="All">All Districts</option>
          {options.districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select 
          value={filters.city} 
          onChange={(e) => handleChange('city', e.target.value)}
          className="filter-select"
        >
          <option value="All">All Cities</option>
          {options.cities && options.cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select 
          value={filters.pic} 
          onChange={(e) => handleChange('pic', e.target.value)}
          className="filter-select"
        >
          <option value="All">All PICs</option>
          {options.pics && options.pics.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <select 
          value={filters.locationType} 
          onChange={(e) => handleChange('locationType', e.target.value)}
          className="filter-select"
        >
          <option value="All">All Locations</option>
          <option value="Mall">Mall</option>
          <option value="Standalone">Standalone</option>
        </select>

        <div className="date-picker-placeholder">
          <Calendar size={16} />
          <span>All Time</span>
        </div>
      </div>
    </div>
  );
};

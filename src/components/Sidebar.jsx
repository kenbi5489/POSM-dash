import React from 'react';
import { Home, PieChart, Users, Settings, LogOut, Hexagon } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-logo">
        <Hexagon className="logo-icon text-primary" size={32} />
        <span className="text-xl font-bold">NovaDash</span>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li className="active">
            <Home size={20} />
            <span>Dashboard</span>
          </li>
          <li>
            <PieChart size={20} />
            <span>Analytics</span>
          </li>
          <li>
            <Users size={20} />
            <span>Customers</span>
          </li>
          <li>
            <Settings size={20} />
            <span>Settings</span>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

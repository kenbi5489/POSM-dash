import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import StatCard from './StatCard';
import ActivityChart from './ActivityChart';
import { Users, DollarSign, Activity, ArrowUpRight } from 'lucide-react';
import './DashboardLayer.css';

const DashboardLayer = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <div className="welcome-banner glass-panel">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, Admin! 👋</h1>
            <p className="text-muted text-sm mt-1">Here's what's happening with your platform today.</p>
          </div>
          <button className="primary-btn">Generate Report</button>
        </div>

        <div className="widgets-grid mb-6">
          <StatCard title="Total Revenue" value="$45,231.89" icon={<DollarSign />} trend="+20.1%" trendUp={true} />
          <StatCard title="Active Users" value="2,350" icon={<Users />} trend="+15.2%" trendUp={true} />
          <StatCard title="System Health" value="98.5%" icon={<Activity />} trend="-1.5%" trendUp={false} />
          <StatCard title="Conversion Rate" value="4.3%" icon={<ArrowUpRight />} trend="+4.1%" trendUp={true} />
        </div>

        <div className="charts-grid">
           <ActivityChart />
           <div className="recent-activity glass-panel p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="activity-list">
                 {[1,2,3,4].map(i => (
                    <div key={i} className="activity-item">
                       <div className="activity-dot"></div>
                       <div className="activity-text">
                         <p className="text-sm font-medium">New user registered {i}</p>
                         <p className="text-xs text-muted">A few minutes ago</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayer;

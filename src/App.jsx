import React, { useState } from 'react';
import { LayoutDashboard, ShieldCheck } from 'lucide-react';
import './App.css';

// Lazy-import pages to keep bundle splits clean
import OriginalDashboard from './OriginalDashboard';
import { UGPOSMPage }    from './components/UGPOSMPage';

const TABS = [
  { id: 'ug-posm',      label: 'POSM Management', icon: ShieldCheck },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('ug-posm');

  return (
    <div className="dashboard-app flex-col">
      {/* Global tab bar */}
      <div className="global-tab-bar">
        {TABS.map(({ id, label, icon: Icon }) => (
          <div
            key={id}
            id={`tab-${id}`}
            className="global-tab-btn active"
            style={{ cursor: 'default' }}
          >
            <Icon size={15} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Page content */}
      <div style={{ flex: 1 }}>
        <UGPOSMPage />
      </div>
    </div>
  );
}

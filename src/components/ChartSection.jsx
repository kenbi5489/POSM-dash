import React from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import './ChartSection.css';

const POSM_COLORS = {
  'Có POSM (Đầy đủ)': '#4caf50',
  'Có POSM (Thiếu Frame)': '#81c784',
  'KHÔNG POSM (Từ chối)': '#f44336',
  'KHÔNG POSM (Hết chỗ)': '#e57373'
};

const FRAME_COLORS = {
  'Yes': '#2196f3',
  'No': '#bdbdbd'
};

export const ChartSection = ({ data }) => {
  const statusData = React.useMemo(() => {
    const counts = data.reduce((acc, row) => {
      const status = row['POSM_Status (AZ)'] || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  const frameData = React.useMemo(() => {
    const counts = data.reduce((acc, row) => {
      const frame = row['Has_UrBox_Logo (BA)'] === 'Yes' ? 'Yes' : 'No';
      acc[frame] = (acc[frame] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  const brandsData = React.useMemo(() => {
    const counts = data.reduce((acc, row) => {
      const brand = row['Brand (C)'];
      if(brand) {
        acc[brand] = (acc[brand] || 0) + 1;
      }
      return acc;
    }, {});
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([name, count]) => ({ name, count }));
    return sorted.reverse();
  }, [data]);

  const districtData = React.useMemo(() => {
    const counts = data.reduce((acc, row) => {
      const dist = row['District (AX)'];
      if(dist) {
         acc[dist] = (acc[dist] || 0) + 1;
      }
      return acc;
    }, {});
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [data]);

  const mallData = React.useMemo(() => {
    const mallsOnly = data.filter(d => d['Mall_Name (AV)']);
    const grouped = {};
    mallsOnly.forEach(row => {
      const mall = row['Mall_Name (AV)'];
      const status = row['POSM_Status (AZ)'];
      if(!grouped[mall]) grouped[mall] = { name: mall, total: 0 };
      grouped[mall][status] = (grouped[mall][status] || 0) + 1;
      grouped[mall].total += 1;
    });
    return Object.values(grouped).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [data]);

  const staffData = React.useMemo(() => {
    const grouped = {};
    data.forEach(row => {
      const staff = row['Tên nhân viên'];
      if(!staff) return;
      if(!grouped[staff]) grouped[staff] = { name: staff, 'Có evidence': 0, 'Thiếu evidence': 0, total: 0 };
      const hasLink = row['Link 1 (BB+)'] && row['Link 1 (BB+)'].trim() !== '';
      if(hasLink) grouped[staff]['Có evidence'] += 1;
      else grouped[staff]['Thiếu evidence'] += 1;
      grouped[staff].total += 1;
    });
    return Object.values(grouped).sort((a, b) => b.total - a.total);
  }, [data]);

  const allStatuses = Object.keys(POSM_COLORS);

  return (
    <div className="chart-section">
      <div className="chart-row-donuts section-spacing">
        <div className="chart-card card">
          <h3 className="chart-title">Phân bố trạng thái POSM</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={statusData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={100} 
                  label
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={POSM_COLORS[entry.name] || '#9e9e9e'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="chart-card card">
          <h3 className="chart-title">Brands sử dụng Frame</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={frameData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={100} 
                  label
                >
                  {frameData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={FRAME_COLORS[entry.name] || '#9e9e9e'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="chart-row-bars section-spacing">
        <div className="chart-card card">
          <h3 className="chart-title">Top 15 Brands triển khai</h3>
          <div className="chart-container" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brandsData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="url(#colorUv)" radius={[0, 4, 4, 0]}>
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#2196f3" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#1a237e" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card card">
          <h3 className="chart-title">Triển khai theo Quận/Phường</h3>
          <div className="chart-container" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtData} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="url(#colorPv)" radius={[4, 4, 0, 0]}>
                  <defs>
                    <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9c27b0" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#7b1fa2" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="chart-row-bars section-spacing">
        <div className="chart-card card" style={{ width: '100%' }}>
          <h3 className="chart-title">Top 10 Malls theo triển khai POSM</h3>
          <div className="chart-container" style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mallData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                {allStatuses.map(status => (
                  <Bar key={status} dataKey={status} stackId="a" fill={POSM_COLORS[status] || '#9e9e9e'} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="evidence-header">
        <h2>📸 HÌNH ẢNH NGHIỆM THU / EVIDENCE TRACKING</h2>
      </div>

      <div className="chart-row-bars section-spacing">
        <div className="chart-card card" style={{ width: '100%' }}>
          <h3 className="chart-title">Tỷ lệ có evidence theo PIC</h3>
          <div className="chart-container" style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Có evidence" stackId="a" fill="#4caf50" />
                <Bar dataKey="Thiếu evidence" stackId="a" fill="#ff9800" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

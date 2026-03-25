import React, { useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const TEAL  = '#00BCD4';
const PINK  = '#E91E63';
const GRAY  = '#546e7a';

const POSM_COLORS = { 'Có POSM': TEAL, 'KHÔNG POSM': PINK };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1e1e3a', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem', color: '#e8e8f0'
    }}>
      {label && <p style={{ margin: '0 0 6px', color: '#aaa', fontWeight: 700 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ margin: '2px 0', color: p.color || '#fff' }}>
          {p.name}: <strong>{typeof p.value === 'number' && p.name?.includes('%')
            ? `${p.value.toFixed(1)}%`
            : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

const weekSort = (a, b) => {
  const na = parseInt(a.replace('W', '')) || 0;
  const nb = parseInt(b.replace('W', '')) || 0;
  return na - nb;
};

export const UGPOSMCharts = ({ data }) => {
  // ── Pie: POSM overview ───────────────────────────────────────────────────
  const pieData = useMemo(() => {
    const counts = {};
    data.forEach(r => {
      const v = r['UG POSM'] || 'Unknown';
      counts[v] = (counts[v] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  // ── Bar: % Có POSM theo Brand ─────────────────────────────────────────────
  const brandData = useMemo(() => {
    const grouped = {};
    data.forEach(r => {
      const b = r['Brand'];
      if (!b) return;
      if (!grouped[b]) grouped[b] = { total: 0, co: 0 };
      grouped[b].total++;
      if (r['UG POSM'] === 'Có POSM') grouped[b].co++;
    });
    return Object.entries(grouped)
      .map(([name, { total, co }]) => ({
        name,
        '% Có POSM': total > 0 ? parseFloat(((co / total) * 100).toFixed(1)) : 0,
        total
      }))
      .sort((a, b) => b['% Có POSM'] - a['% Có POSM']);
  }, [data]);

  // ── Bar: % Có POSM theo Tuần ─────────────────────────────────────────────
  const weekData = useMemo(() => {
    const grouped = {};
    data.forEach(r => {
      const w = r['W hoàn thành'];
      if (!w) return;
      if (!grouped[w]) grouped[w] = { total: 0, co: 0 };
      grouped[w].total++;
      if (r['UG POSM'] === 'Có POSM') grouped[w].co++;
    });
    return Object.entries(grouped)
      .map(([name, { total, co }]) => ({
        name,
        '% Có POSM': total > 0 ? parseFloat(((co / total) * 100).toFixed(1)) : 0,
        total
      }))
      .sort((a, b) => weekSort(a.name, b.name));
  }, [data]);

  // ── Stacked bar: Mall ─────────────────────────────────────────────────────
  const mallData = useMemo(() => {
    const grouped = {};
    data.forEach(r => {
      const mall = r['Mall_Name'] || 'Khác';
      if (!grouped[mall]) grouped[mall] = { name: mall, 'Có POSM': 0, 'KHÔNG POSM': 0 };
      const status = r['UG POSM'];
      if (status === 'Có POSM' || status === 'KHÔNG POSM') grouped[mall][status]++;
    });
    return Object.values(grouped)
      .map(d => ({ ...d, total: d['Có POSM'] + d['KHÔNG POSM'] }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [data]);

  const axisStyle = { fill: 'rgba(255,255,255,0.5)', fontSize: 11 };

  return (
    <>
      {/* Row 1: Pie + Weekly bar */}
      <div className="ug-chart-grid">
        {/* Pie */}
        <div className="ug-card">
          <h3 className="ug-card-title">
            <span className="dot-teal" /> Tình trạng POSM tổng quan
          </h3>
          <div className="ug-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={POSM_COLORS[entry.name] || GRAY} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '0.78rem', color: '#ccc' }}
                  formatter={(val) => <span style={{ color: '#ccc' }}>{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* % Có POSM theo Tuần */}
        <div className="ug-card">
          <h3 className="ug-card-title">
            <span className="dot-teal" /> % Có POSM theo Tuần
          </h3>
          <div className="ug-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <defs>
                  <linearGradient id="weekGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={TEAL} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={TEAL} stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="% Có POSM" fill="url(#weekGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Brand bar + Mall stacked bar */}
      <div className="ug-chart-grid-full">
        {/* % Có POSM theo Brand */}
        <div className="ug-card">
          <h3 className="ug-card-title">
            <span className="dot-purple" /> % Có POSM theo Brand
          </h3>
          <div className="ug-chart-container-lg">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brandData} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="brandGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#9c27b0" stopOpacity={0.9} />
                    <stop offset="100%" stopColor={TEAL} stopOpacity={0.9} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" horizontal={false} />
                <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                <YAxis dataKey="name" type="category" width={110} tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="% Có POSM" fill="url(#brandGrad)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stacked bar: Mall */}
        <div className="ug-card">
          <h3 className="ug-card-title">
            <span className="dot-pink" /> Phân bổ theo Mall
          </h3>
          <div className="ug-chart-container-lg">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mallData} margin={{ top: 4, right: 16, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                <XAxis dataKey="name" tick={{ ...axisStyle, fontSize: 10 }} angle={-35} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '0.78rem', color: '#ccc', paddingTop: 8 }}
                  formatter={val => <span style={{ color: POSM_COLORS[val] || '#ccc' }}>{val}</span>}
                />
                <Bar dataKey="Có POSM"    stackId="a" fill={TEAL} />
                <Bar dataKey="KHÔNG POSM" stackId="a" fill={PINK} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
};

import React, { useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area
} from 'recharts';

const COLORS = {
  teal: '#00C9A7',
  red: '#FF6B6B',
  gold: '#FFD166',
  gray: '#636E72',
  navy: '#1A2D44'
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1A2D44', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '4px' }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.8rem', color: '#fff', marginBottom: '4px' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: 0, fontSize: '0.75rem', color: entry.color }}>
            {entry.name}: <span style={{ fontWeight: 600 }}>{typeof entry.value === 'number' && entry.name.includes('%') ? `${entry.value.toFixed(1)}%` : entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const UGPOSMChartsPro = ({ data }) => {
  // ── SECTION 3 DATA ────────────────────────────────────────────────────────
  const posmDataAdj = useMemo(() => {
    const hasPosm = data.filter(r => r.POSM_Status === 'Có POSM').length;
    const noPosmAll = data.filter(r => r.POSM_Status === 'KHÔNG POSM').length;
    const policyExempt = data.filter(r => r.isPolicyExempt).length;
    const adjustedNoPosm = Math.max(0, noPosmAll - policyExempt);
    
    return [
      { name: 'Có POSM', value: hasPosm },
      { name: 'KHÔNG POSM (Adj)', value: adjustedNoPosm }
    ];
  }, [data]);

  const frameData = useMemo(() => {
    const counts = data.reduce((acc, r) => {
      const s = r.Frame === 'Yes' ? 'Yes' : 'No';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  const topBrands = useMemo(() => {
    const brands = data.reduce((acc, r) => {
      if (r.Brand) acc[r.Brand] = (acc[r.Brand] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(brands)
      .sort((a,b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }))
      .reverse();
  }, [data]);

  // ── SECTION 4 DATA ────────────────────────────────────────────────────────
  const brandAnalysis = useMemo(() => {
    const grouped = data.reduce((acc, r) => {
      if (!r.Brand) return acc;
      if (!acc[r.Brand]) acc[r.Brand] = { name: r.Brand, has: 0, no: 0, total: 0, policy: 0 };
      acc[r.Brand].total++;
      if (r.POSM_Status === 'Có POSM') acc[r.Brand].has++;
      else if (r.POSM_Status === 'KHÔNG POSM') {
        if (r.isPolicyExempt) acc[r.Brand].policy++;
        else acc[r.Brand].no++;
      }
      return acc;
    }, {});
    return Object.values(grouped)
      .map(b => {
        const adjNo = Math.max(0, b.no);
        const adjTotal = b.has + adjNo;
        return { 
          ...b, 
          adjNo,
          pct: adjTotal > 0 ? (b.has / adjTotal) * 100 : 0 
        };
      })
      .sort((a,b) => b.total - a.total);
  }, [data]);

  // ── SECTION 5 DATA ────────────────────────────────────────────────────────
  const locTypeData = useMemo(() => {
    const counts = data.reduce((acc, r) => {
      const s = r.Location_Type || 'Unknown';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  const topMallsByBrand = useMemo(() => {
    const mallMap = data.reduce((acc, r) => {
      if (!r.Mall_Name || r.Location_Type !== 'Mall') return acc;
      if (!acc[r.Mall_Name]) acc[r.Mall_Name] = new Set();
      acc[r.Mall_Name].add(r.Brand);
      return acc;
    }, {});
    return Object.entries(mallMap)
      .map(([name, brandSet]) => ({ name, value: brandSet.size }))
      .sort((a,b) => b.value - a.value)
      .slice(0, 10);
  }, [data]);

  // ── SECTION 6 DATA ────────────────────────────────────────────────────────
  const weeklyTrend = useMemo(() => {
    const weeks = data.reduce((acc, r) => {
      if (!r.WEEKnum) return acc;
      if (!acc[r.WEEKnum]) acc[r.WEEKnum] = { week: r.WEEKnum, has: 0, no: 0, policy: 0 };
      if (r.POSM_Status === 'Có POSM') acc[r.WEEKnum].has++;
      else if (r.POSM_Status === 'KHÔNG POSM') {
        if (r.isPolicyExempt) acc[r.WEEKnum].policy++;
        else acc[r.WEEKnum].no++;
      }
      return acc;
    }, {});
    return Object.values(weeks).sort((a,b) => {
      const n1 = parseInt(a.week.replace('W',''));
      const n2 = parseInt(b.week.replace('W',''));
      return n1 - n2;
    });
  }, [data]);

  return (
    <div className="analytics-grid" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* SECTION 3: CHARTS ROW (2 Donut + 1 Bar) */}
      <div className="pro-row-3">
        <div className="pro-card">
          <div className="pro-card-title">Tỷ lệ POSM (Đã trừ chính sách)</div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={posmDataAdj} dataKey="value" stroke="none" innerRadius={60} outerRadius={80} paddingAngle={5}>
                  <Cell fill={COLORS.teal} />
                  <Cell fill={COLORS.red} />
                </Pie>
                <ReTooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="pro-card">
          <div className="pro-card-title">Tỷ lệ dùng FRAME</div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={frameData} dataKey="value" stroke="none" innerRadius={60} outerRadius={80} paddingAngle={5}>
                  <Cell fill={COLORS.gold} />
                  <Cell fill={COLORS.gray} />
                </Pie>
                <ReTooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="pro-card">
          <div className="pro-card-title">Top 10 Brand lượt sitecheck</div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topBrands} layout="vertical" margin={{ left: -20, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <ReTooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill={COLORS.teal} radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 4: POSM THEO BRAND (Table + Bar) */}
      <div className="pro-row-2">
        <div className="pro-card" style={{ maxHeight: 400, overflow: 'hidden' }}>
          <div className="pro-card-title">Chi tiết POSM theo Brand</div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            <table className="pro-table">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Có</th>
                  <th>Không</th>
                  <th>% Có</th>
                </tr>
              </thead>
              <tbody>
                {brandAnalysis.slice(0, 15).map(b => (
                  <tr key={b.name}>
                    <td style={{ fontWeight: 600 }}>{b.name}</td>
                    <td>{b.has}</td>
                    <td>{b.no}</td>
                    <td>
                      <span className={`badge-pro ${b.pct >= 90 ? 'badge-green' : b.pct >= 70 ? 'badge-yellow' : 'badge-red'}`}>
                        {b.pct.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pro-card">
          <div className="pro-card-title">POSM Coverage theo Brand (Top 15)</div>
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brandAnalysis.slice(0, 15)} margin={{ top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} angle={-45} textAnchor="end" interval={0} height={60} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                <ReTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                <Bar name="Có POSM" dataKey="has" stackId="a" fill={COLORS.teal} />
                <Bar name="KHÔNG POSM" dataKey="no" stackId="a" fill={COLORS.red} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 5: ĐỊA ĐIỂM (Pie + Bar) */}
      <div className="pro-row-2">
        <div className="pro-card">
          <div className="pro-card-title">Standalone vs Mall</div>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={locTypeData} dataKey="value" innerRadius={0} outerRadius={80}>
                   {locTypeData.map((entry, index) => (
                    <Cell key={index} fill={index === 0 ? COLORS.teal : COLORS.purple} />
                  ))}
                </Pie>
                <ReTooltip content={<CustomTooltip />} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="pro-card">
          <div className="pro-card-title">Top Mall có nhiều Brand nhất</div>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topMallsByBrand} margin={{ bottom: 40 }}>
                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} angle={-30} textAnchor="end" interval={0} height={50} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                <ReTooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill={COLORS.teal} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 6: TREND THEO TUẦN (Line Chart) */}
      <div className="pro-row-full">
        <div className="pro-card">
          <div className="pro-card-title">Số lượt sitecheck theo tuần</div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrend} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <ReTooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" name="Có POSM" dataKey="has" stroke={COLORS.teal} strokeWidth={3} dot={{ fill: COLORS.teal, r: 6 }} label={{ position: 'top', fill: COLORS.teal, fontSize: 10 }} />
                <Line type="monotone" name="KHÔNG POSM" dataKey="no" stroke={COLORS.red} strokeWidth={3} dot={{ fill: COLORS.red, r: 6 }} label={{ position: 'top', fill: COLORS.red, fontSize: 10 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
};

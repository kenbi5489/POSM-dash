import React, { useMemo, useState } from 'react';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 12;

const weekSort = (a, b) => {
  const na = parseInt((a?.['W hoàn thành'] || '').replace('W', '')) || 0;
  const nb = parseInt((b?.['W hoàn thành'] || '').replace('W', '')) || 0;
  return nb - na; // descending
};

export const UGPOSMTable = ({ data }) => {
  const [page, setPage] = useState(1);

  // Only rows where UG POSM = "KHÔNG POSM"
  const tableData = useMemo(() => {
    return data
      .filter(r => r['UG POSM'] === 'KHÔNG POSM')
      .sort(weekSort);
  }, [data]);

  const totalPages = Math.max(1, Math.ceil(tableData.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const slice      = tableData.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleDownload = () => {
    const cols = ['W hoàn thành', 'Brand', 'Mã cv', 'Tên nhân viên', 'Mall_Name', 'Location_Type', 'UG POSM'];
    const header = cols.join(',');
    const rows = tableData.map(r =>
      cols.map(c => `"${String(r[c] || '').replace(/"/g, '""')}"`).join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'UG_KHÔNG_POSM.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ug-card">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:8 }}>
        <h3 className="ug-card-title" style={{ margin:0 }}>
          <span style={{ background:'#E91E63', width:8, height:8, borderRadius:'50%', display:'inline-block' }} />
          &nbsp;Danh sách điểm KHÔNG POSM
          <span style={{ fontSize:'0.75rem', fontWeight:400, color:'rgba(255,255,255,0.4)', marginLeft:10 }}>
            ({tableData.length} điểm)
          </span>
        </h3>
        <button className="ug-btn-download" onClick={handleDownload}>
          <Download size={14} />
          Export CSV
        </button>
      </div>

      <div className="ug-table-wrapper">
        <table className="ug-table">
          <thead>
            <tr>
              {['Tuần', 'Brand', 'Mã CV', 'PIC', 'Mall', 'Loại', 'POSM'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign:'center', padding:24, color:'rgba(255,255,255,0.35)' }}>
                  🎉 Không có điểm nào thiếu POSM
                </td>
              </tr>
            ) : (
              slice.map((row, i) => (
                <tr key={row.id || i}>
                  <td style={{ color:'#4dd0e1', fontWeight:600 }}>{row['W hoàn thành'] || '–'}</td>
                  <td style={{ fontWeight:500, color:'#e8e8f0' }}>{row['Brand'] || '–'}</td>
                  <td style={{ fontFamily:'monospace', fontSize:'0.78rem', color:'#aaa' }}>{row['Mã cv'] || '–'}</td>
                  <td>{row['Tên nhân viên'] || '–'}</td>
                  <td>{row['Mall_Name'] || '–'}</td>
                  <td>
                    <span style={{
                      padding:'2px 8px', borderRadius:12, fontSize:'0.72rem', fontWeight:600,
                      background: row['Location_Type'] === 'Mall' ? 'rgba(0,188,212,0.15)' : 'rgba(156,39,176,0.15)',
                      color: row['Location_Type'] === 'Mall' ? '#4dd0e1' : '#ce93d8',
                      border: `1px solid ${row['Location_Type'] === 'Mall' ? 'rgba(0,188,212,0.3)' : 'rgba(156,39,176,0.3)'}`,
                    }}>
                      {row['Location_Type'] || '–'}
                    </span>
                  </td>
                  <td>
                    <span className="ug-badge ug-badge-pink">KHÔNG POSM</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="ug-table-footer">
        <span>
          {tableData.length > 0
            ? `Hiển thị ${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, tableData.length)} / ${tableData.length}`
            : '0 kết quả'}
        </span>
        <div className="ug-pagination">
          <button disabled={safePage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
            <ChevronLeft size={14} />
          </button>
          <span>Trang {safePage} / {totalPages}</span>
          <button disabled={safePage >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

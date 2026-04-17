import React, { useState } from 'react';
import { Download, ExternalLink, Filter } from 'lucide-react';

export const UGPOSMTablePro = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // Filter: Only show rows where Link 1 exists (per spec)
  const evidenceData = data.filter(r => r['Link 1']);

  const totalPages = Math.ceil(evidenceData.length / pageSize);
  const currentRows = evidenceData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const exportCSV = () => {
    const headers = ['Brand', 'Địa chỉ', 'Tình trạng', 'Frame', 'Mall', 'Week', 'Link 1', 'Link 2', 'Ghi chú'];
    const rows = evidenceData.map(r => [
      r.Brand,
      `"${r['Địa chỉ'] || ''}"`,
      r.POSM_Status,
      r.Frame,
      r.Mall_Name,
      r.WEEKnum,
      r['Link 1'],
      r['Link 2'],
      `"${r.Note || ''}"`
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'UG_Evidence_Audit.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pro-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className="pro-card-title">Hình ảnh nghiệm thu tại cửa hàng ({evidenceData.length} điểm)</div>
        <button className="btn-pro" onClick={exportCSV} style={{ 
          display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--accent-teal)', 
          color: 'var(--bg-navy)', border: 'none', padding: '6px 12px', borderRadius: '4px', 
          fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' 
        }}>
          <Download size={14} /> EXPORT CSV
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="pro-table">
          <thead>
            <tr>
              <th>BRAND</th>
              <th>ĐỊA CHỈ</th>
              <th>STATUS</th>
              <th>FRAME</th>
              <th>MALL</th>
              <th>WEEK</th>
              <th>ẢNH 1</th>
              <th>ẢNH 2</th>
              <th>GHI CHÚ</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((r, i) => (
              <tr key={r.id || i}>
                <td style={{ fontWeight: 700 }}>{r.Brand}</td>
                <td style={{ fontSize: '0.75rem', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {r['Địa chỉ']}
                </td>
                <td>
                  <span className={`badge-pro ${r.POSM_Status === 'Có POSM' ? 'badge-green' : 'badge-red'}`} style={{ color: '#fff', background: r.POSM_Status === 'Có POSM' ? 'var(--accent-teal)' : 'var(--accent-red)' }}>
                    {r.POSM_Status}
                  </span>
                </td>
                <td>
                  <span className={`badge-pro ${r.Frame === 'Yes' ? 'badge-yellow' : ''}`} style={{ border: r.Frame === 'Yes' ? '1px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.1)' }}>
                    {r.Frame}
                  </span>
                </td>
                <td>{r.Mall_Name}</td>
                <td><span className="badge-pro" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>{r.WEEKnum}</span></td>
                <td>
                  {r['Link 1'] && (
                    <a href={r['Link 1']} target="_blank" rel="noreferrer" className="pro-link">
                      <ExternalLink size={14} /> Review
                    </a>
                  )}
                </td>
                <td>
                  {r['Link 2'] && (
                    <a href={r['Link 2']} target="_blank" rel="noreferrer" className="pro-link">
                      <ExternalLink size={14} /> Review
                    </a>
                  )}
                </td>
                <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.Note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px', alignItems: 'center' }}>
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(p => p - 1)}
            style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Prev
          </button>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Page {currentPage} of {totalPages}</span>
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(p => p + 1)}
            style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

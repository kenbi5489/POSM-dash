import React, { useState } from 'react';
import { Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import './DataTable.css';

const Table = ({ title, data, columns, rowLimit, enableSearch, enableDownload }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = React.useMemo(() => {
    if (!enableSearch || !searchTerm) return data;
    const lower = searchTerm.toLowerCase();
    return data.filter(row => 
      columns.some(col => String(row[col.key] || '').toLowerCase().includes(lower))
    );
  }, [data, searchTerm, enableSearch, columns]);

  const totalPages = Math.ceil(filteredData.length / rowLimit);
  const startIndex = (currentPage - 1) * rowLimit;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowLimit);

  const handleDownload = () => {
    const headers = columns.map(c => c.label).join(',');
    const rows = filteredData.map(row => 
      columns.map(c => `"${String(row[c.key] || '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="data-table-container card">
      <div className="data-table-header">
        <h3 className="data-table-title">{title}</h3>
        <div className="data-table-actions">
          {enableSearch && (
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
          {enableDownload && (
            <button className="btn-download" onClick={handleDownload}>
              <Download size={16} />
              <span>Export</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center" style={{ padding: '24px' }}>
                  No data found
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={row.id || idx}>
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row) : (row[col.key] || '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="data-table-footer">
        <div className="table-info">
          Showing {filteredData.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + rowLimit, filteredData.length)} of {filteredData.length} entries
        </div>
        <div className="table-pagination">
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="pagination-btn"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="pagination-page">Page {currentPage} / {totalPages || 1}</span>
          <button 
            disabled={currentPage === totalPages || totalPages === 0} 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="pagination-btn"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const DataTableSection = ({ data }) => {
  const missingEvidenceData = React.useMemo(() => {
    return data.filter(d => 
      d['POSM_Status (AZ)'] && 
      d['POSM_Status (AZ)'].startsWith('Có POSM') && 
      (!d['Link 1 (BB+)'] || d['Link 1 (BB+)'].trim() === '')
    );
  }, [data]);

  const missingCols = [
    { label: 'Timestamp', key: 'Timestamp' },
    { label: 'Brand', key: 'Brand (C)' },
    { label: 'Địa chỉ', key: 'Địa chỉ (D)' },
    { label: 'Tên nhân viên', key: 'Tên nhân viên' },
    { 
      label: 'POSM Status', 
      key: 'POSM_Status (AZ)',
      render: (val) => <span className="status-badge success">{val}</span>
    },
    { label: 'Note', key: 'Note' }
  ];

  const allCols = [
    { label: 'Timestamp', key: 'Timestamp' },
    { label: 'Tên nhân viên', key: 'Tên nhân viên' },
    { label: 'Brand', key: 'Brand (C)' },
    { label: 'Địa chỉ', key: 'Địa chỉ (D)' },
    { label: 'Mall', key: 'Mall_Name (AV)' },
    { label: 'District', key: 'District (AX)' },
    { label: 'Location', key: 'Location_Type (AW)' },
    { 
      label: 'POSM Status', 
      key: 'POSM_Status (AZ)',
      render: (val) => {
        let cls = 'badge-neutral';
        if(val && val.startsWith('Có POSM')) cls = 'success';
        if(val && val.startsWith('KHÔNG POSM')) cls = 'error';
        return <span className={`status-badge ${cls}`}>{val || '-'}</span>;
      }
    },
    { 
      label: 'Has Frame', 
      key: 'Has_UrBox_Logo (BA)',
      render: (val) => val === 'Yes' ? <span className="text-primary font-bold">Yes</span> : 'No'
    },
    { 
      label: 'Evidence', 
      key: 'Link 1 (BB+)',
      render: (val) => val ? <a href={val} target="_blank" rel="noreferrer" className="table-link">View File</a> : <span className="text-missing">Missing</span>
    }
  ];

  return (
    <div className="data-table-section flex-col" style={{ gap: '24px', marginBottom: '24px' }}>
      <Table 
        title="Danh sách task hoàn thành nhưng thiếu file nghiệm thu"
        data={missingEvidenceData}
        columns={missingCols}
        rowLimit={10}
        enableSearch={false}
        enableDownload={true}
      />
      
      <Table 
        title="CHI TIẾT TRIỂN KHAI POSM"
        data={data}
        columns={allCols}
        rowLimit={15}
        enableSearch={true}
        enableDownload={true}
      />
    </div>
  );
};

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { fetchUGData } from '../services/dataService';
import { UGPOSMChartsPro } from './UGPOSMChartsPro';
import { UGPOSMTablePro } from './UGPOSMTablePro';
import { Loader2, Clock, CheckCircle2, XCircle, LayoutDashboard, MapPin, Percent, Image, Search, ChevronDown, CheckSquare, Square } from 'lucide-react';
import './UGPOSMPage.css';

// ── MultiSelect Dropdown Component ──
const MultiSelectDropdown = ({ options, selected, onChange, label = "Selection", showSearch = false, defaultText = "All Selected" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAll = () => {
    if (selected.length === options.length) onChange([]);
    else onChange([...options]);
  };

  const toggleOne = (opt) => {
    if (selected.includes(opt)) onChange(selected.filter(s => s !== opt));
    else onChange([...selected, opt]);
  };

  return (
    <div className="filter-item brand-search-container" ref={dropdownRef}>
      <label>{label}</label>
      <div 
        className="filter-item select" 
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', minHeight: '38px' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
          {selected.length === 0 ? `No ${label} Selected` : 
           selected.length === options.length ? defaultText : `${selected.length} ${label} selected`}
        </span>
        <ChevronDown size={14} />
      </div>

      {isOpen && (
        <div className="brand-dropdown">
          {showSearch && (
            <div className="brand-search-header" onClick={e => e.stopPropagation()}>
              <Search size={14} style={{ position: 'absolute', left: '16px', top: '21px', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder={`Search ${label}...`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', paddingLeft: '30px', background: 'rgba(0,0,0,0.2)' }}
              />
            </div>
          )}
          
          <div className="brand-option" onClick={toggleAll}>
            {selected.length === options.length ? <CheckSquare size={14} /> : <Square size={14} />}
            <strong>Select All</strong>
          </div>
          
          {filteredOptions.map(opt => (
            <div className="brand-option" key={opt} onClick={() => toggleOne(opt)}>
              {selected.includes(opt) ? <CheckSquare size={14} /> : <Square size={14} />}
              <span>{opt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const UGPOSMPage = () => {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  
  const [filters, setFilters] = useState({
    brands: [], // Array for multi-select
    weeks: [],  // Array for multi-select
    locationType: 'All',
    mall: 'All',
    district: 'All',
    city: 'All',
    pic: 'All',
    frame: 'All',
    posmStatus: 'All',
    kpiCategory: 'All'
  });

  useEffect(() => {
    fetchUGData().then(data => {
      setRawData(data);
      setLoading(false);
      setLastUpdated(new Date().toLocaleString());
      // Default: select all brands
      const allBrands = Array.from(new Set(data.map(r => r.Brand).filter(Boolean))).sort();
      const allWeeks = Array.from(new Set(data.map(r => r.WEEKnum).filter(Boolean))).sort();
      setFilters(prev => ({ ...prev, brands: allBrands, weeks: allWeeks }));
    });
  }, []);

  const options = useMemo(() => {
    const brands = new Set(), weeks = new Set(), locs = new Set(), malls = new Set(), dists = new Set(), cities = new Set(), pics = new Set();
    rawData.forEach(row => {
      if (row.Brand) brands.add(row.Brand);
      if (row.WEEKnum) weeks.add(row.WEEKnum);
      if (row.Location_Type) locs.add(row.Location_Type);
      if (row.Mall_Name) malls.add(row.Mall_Name);
      if (row.District) dists.add(row.District);
      if (row.City) cities.add(row.City);
      if (row['Tên nhân viên']) pics.add(row['Tên nhân viên']);
    });
    return {
      brands: Array.from(brands).sort(),
      weeks: Array.from(weeks).sort((a,b) => parseInt(a.replace('W','')) - parseInt(b.replace('W',''))),
      locs: Array.from(locs).sort(),
      malls: Array.from(malls).sort(),
      dists: Array.from(dists).sort(),
      cities: Array.from(cities).sort(),
      pics: Array.from(pics).sort()
    };
  }, [rawData]);

  const filteredData = useMemo(() => {
    return rawData.filter(row => {
      // Multi-select brand and week
      if (filters.brands.length > 0 && !filters.brands.includes(row.Brand)) return false;
      if (filters.weeks.length > 0 && !filters.weeks.includes(row.WEEKnum)) return false;
      
      if (filters.locationType !== 'All' && row.Location_Type !== filters.locationType) return false;
      if (filters.mall !== 'All' && row.Mall_Name !== filters.mall) return false;
      if (filters.district !== 'All' && row.District !== filters.district) return false;
      if (filters.city !== 'All' && row.City !== filters.city) return false;
      if (filters.pic !== 'All' && row['Tên nhân viên'] !== filters.pic) return false;
      if (filters.frame !== 'All' && row.Frame !== filters.frame) return false;
      if (filters.posmStatus !== 'All' && row.POSM_Status !== filters.posmStatus) return false;

      // KPI Category Filter
      if (filters.kpiCategory === 'HasPOSM' && row.POSM_Status !== 'Có POSM') return false;
      if (filters.kpiCategory === 'NoPOSM_Adj' && (row.POSM_Status !== 'KHÔNG POSM' || row.isPolicyExempt)) return false;
      if (filters.kpiCategory === 'PolicyExempt' && !row.isPolicyExempt) return false;
      if (filters.kpiCategory === 'MallsWithPOSM' && !row.mallWithPosm) return false;
      
      return true;
    });
  }, [rawData, filters]);

  // ── KPI Calculations (Section 2) ──
  const kpis = useMemo(() => {
    const total = filteredData.length;
    const hasPosm = filteredData.filter(r => r.POSM_Status === 'Có POSM').length;
    const noPosm = filteredData.filter(r => r.POSM_Status === 'KHÔNG POSM').length;
    const hasFrame = filteredData.filter(r => r.Frame === 'Yes').length;
    const policyExempt = filteredData.filter(r => r.isPolicyExempt).length;
    
    // ADJUSTED LOGIC: Exclude policy exempt from KHÔNG POSM count for rate calculation
    const adjustedNoPosm = Math.max(0, noPosm - policyExempt);
    const posmRateAdjusted = (hasPosm + adjustedNoPosm) > 0 
      ? (hasPosm / (hasPosm + adjustedNoPosm) * 100).toFixed(1) 
      : 0;

    const uniqueMallsWithPosm = new Set(
      filteredData
        .filter(r => r.mallWithPosm)
        .map(r => r.mallWithPosm)
    ).size;

    return { total, hasPosm, noPosm, adjustedNoPosm, posmRateAdjusted, hasFrame, policyExempt, uniqueMallsWithPosm };
  }, [filteredData]);

  const updateFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));

  if (loading) {
    return (
      <div className="ug-page flex-center" style={{ height: '80vh', display:'flex', flexDirection:'column', gap:'1rem', justifyContent:'center', alignItems:'center'}}>
        <Loader2 className="spinner" size={40} color="#00C9A7" />
        <span style={{color:'var(--text-secondary)'}}>Initializing Professional Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="ug-page">
      {/* SECTION Header */}
      <header className="ug-header-professional">
        <div className="ug-header-left">
          <img src="https://urbox.vn/assets/images/logo.png" alt="UrBox" className="ug-logo" onError={(e) => e.target.style.display='none'}/>
          <h1 style={{color: 'white', marginLeft: '10px'}}>POSM MANAGEMENT OVERVIEW</h1>
        </div>
        <div className="ug-header-right">
          <Clock size={12} /> Last updated: {lastUpdated}
        </div>
      </header>

      {/* SECTION 1: Filters Bar (9 filters) */}
      <div className="ug-filter-bar-pro">
        <MultiSelectDropdown 
          label="Brand"
          options={options.brands} 
          selected={filters.brands} 
          onChange={(val) => updateFilter('brands', val)} 
          showSearch={true}
          defaultText="All Brands"
        />
        
        <MultiSelectDropdown 
          label="WEEK"
          options={options.weeks} 
          selected={filters.weeks} 
          onChange={(val) => updateFilter('weeks', val)} 
          showSearch={false}
          defaultText="All Weeks"
        />
        
        <div className="filter-item">
          <label>Tình trạng POSM</label>
          <select value={filters.posmStatus} onChange={e => updateFilter('posmStatus', e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Có POSM">Có POSM</option>
            <option value="KHÔNG POSM">KHÔNG POSM</option>
          </select>
        </div>

        <div className="filter-item">
          <label>Staff (PIC)</label>
          <select value={filters.pic} onChange={e => updateFilter('pic', e.target.value)}>
            <option value="All">All Staffs</option>
            {options.pics.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        <div className="filter-item">
          <label>Frame Use</label>
          <select value={filters.frame} onChange={e => updateFilter('frame', e.target.value)}>
            <option value="All">All</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        {[
          { key: 'locationType', label: 'Loc. Type', options: options.locs },
          { key: 'mall', label: 'Mall Name', options: options.malls },
          { key: 'district', label: 'District', options: options.dists },
          { key: 'city', label: 'City', options: options.cities }
        ].map(f => (
          <div className="filter-item" key={f.key}>
            <label>{f.label}</label>
            <select value={filters[f.key]} onChange={e => updateFilter(f.key, e.target.value)}>
              <option value="All">All {f.options.length > 20 ? '' : f.label + 's'}</option>
              {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        ))}
      </div>

      <main className="ug-main-pro">
        <div className="section-banner banner-teal">POSM Implementation Status</div>
        
        {/* SECTION 2: KPI Scorecards */}
        <div className="kpi-row-pro">
          <div 
            className={`kpi-card-pro bg-navy clickable ${filters.kpiCategory === 'All' ? 'active' : ''}`}
            onClick={() => updateFilter('kpiCategory', 'All')}
          >
            <div className="kpi-card-header">
              <span>Tổng lượt sitecheck</span>
              <LayoutDashboard size={14} color="var(--text-secondary)" />
            </div>
            <div className="kpi-value-pro">{kpis.total.toLocaleString()}</div>
          </div>
          
          <div 
            className={`kpi-card-pro teal clickable ${filters.kpiCategory === 'HasPOSM' ? 'active' : ''}`}
            onClick={() => updateFilter('kpiCategory', filters.kpiCategory === 'HasPOSM' ? 'All' : 'HasPOSM')}
          >
            <div className="kpi-card-header">
              <span>Cửa hàng CÓ POSM</span>
              <CheckCircle2 size={14} color="var(--accent-teal)" />
            </div>
            <div className="kpi-value-pro" style={{color: 'var(--accent-teal)'}}>{kpis.hasPosm.toLocaleString()}</div>
          </div>
 
          <div 
            className={`kpi-card-pro red clickable ${filters.kpiCategory === 'NoPOSM_Adj' ? 'active' : ''}`}
            onClick={() => updateFilter('kpiCategory', filters.kpiCategory === 'NoPOSM_Adj' ? 'All' : 'NoPOSM_Adj')}
          >
            <div className="kpi-card-header">
              <span>KHÔNG POSM (Adjusted)</span>
              <XCircle size={14} color="var(--accent-red)" />
            </div>
            <div className="kpi-value-pro" style={{color: 'var(--accent-red)'}}>{kpis.adjustedNoPosm.toLocaleString()}</div>
            <div style={{fontSize:'0.65rem', color:'rgba(255,255,255,0.4)', marginTop:'4px'}}>* Trừ chính sách cửa hàng</div>
          </div>
 
          <div 
            className={`kpi-card-pro pink adjusted clickable ${filters.kpiCategory === 'HasPOSM' ? 'active' : ''}`}
            onClick={() => updateFilter('kpiCategory', filters.kpiCategory === 'HasPOSM' ? 'All' : 'HasPOSM')}
          >
            <div className="kpi-card-header">
              <span>Tỉ lệ Có POSM (Adj)</span>
              <Percent size={14} color="#FF6B6B" />
            </div>
            <div className="kpi-value-pro" style={{color: '#FF6B6B'}}>{kpis.posmRateAdjusted}%</div>
          </div>
 
          <div 
            className={`kpi-card-pro orange clickable ${filters.kpiCategory === 'PolicyExempt' ? 'active' : ''}`}
            onClick={() => updateFilter('kpiCategory', filters.kpiCategory === 'PolicyExempt' ? 'All' : 'PolicyExempt')}
          >
            <div className="kpi-card-header">
              <span>Chính sách không POSM</span>
              <MapPin size={14} color="var(--accent-orange)" />
            </div>
            <div className="kpi-value-pro" style={{color: 'var(--accent-orange)'}}>{kpis.policyExempt.toLocaleString()}</div>
          </div>
 
          <div 
            className={`kpi-card-pro purple clickable ${filters.kpiCategory === 'MallsWithPOSM' ? 'active' : ''}`}
            onClick={() => updateFilter('kpiCategory', filters.kpiCategory === 'MallsWithPOSM' ? 'All' : 'MallsWithPOSM')}
          >
            <div className="kpi-card-header">
              <span>Mall có POSM</span>
              <Percent size={14} color="var(--accent-purple)" />
            </div>
            <div className="kpi-value-pro" style={{color: 'var(--accent-purple)'}}>{kpis.uniqueMallsWithPosm.toLocaleString()}</div>
          </div>
        </div>

        {/* SECTION 3, 4, 5, 6: Charts Components */}
        <div className="charts-sections-pro">
          <UGPOSMChartsPro data={filteredData} />
        </div>

        <div className="section-banner banner-red" style={{marginTop:'32px'}}>Evidence & Audit Tracking</div>
        
        {/* SECTION 7: Evidence Table */}
        <div className="pro-row-full" style={{marginTop:'24px'}}>
          <UGPOSMTablePro data={filteredData} />
        </div>
      </main>
    </div>
  );
};

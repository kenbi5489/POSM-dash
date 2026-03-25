import React, { useState, useEffect, useMemo } from 'react';
import { Store, XCircle, Image as ImageIcon, Building2, TrendingUp, Loader2 } from 'lucide-react';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { StatCard } from './components/StatCard';
import { ChartSection } from './components/ChartSection';
import { DataTableSection } from './components/DataTable';
import { fetchData } from './services/dataService';

export default function OriginalDashboard() {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    brand: 'All',
    district: 'All',
    city: 'Hồ Chí Minh',
    locationType: 'All',
    pic: 'All'
  });

  useEffect(() => {
    async function loadData() {
      const data = await fetchData();
      setRawData(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const filterOptions = useMemo(() => {
    const brands = new Set();
    const districts = new Set();
    const cities = new Set();
    const pics = new Set();
    rawData.forEach(row => {
      if(row['Brand (C)']) brands.add(row['Brand (C)']);
      if(row['District (AX)']) districts.add(row['District (AX)']);
      if(row['City (AY)']) cities.add(row['City (AY)']);
      if(row['Tên nhân viên']) pics.add(row['Tên nhân viên']);
    });
    return {
      brands: Array.from(brands).sort(),
      districts: Array.from(districts).sort(),
      cities: Array.from(cities).sort(),
      pics: Array.from(pics).sort()
    };
  }, [rawData]);

  const filteredData = useMemo(() => {
    return rawData.filter(row => {
      if (filters.brand !== 'All' && row['Brand (C)'] !== filters.brand) return false;
      if (filters.district !== 'All' && row['District (AX)'] !== filters.district) return false;
      if (filters.city !== 'All' && row['City (AY)'] !== filters.city) return false;
      if (filters.pic !== 'All' && row['Tên nhân viên'] !== filters.pic) return false;
      
      const locType = row['Mall_Name (AV)'] ? 'Mall' : 'Standalone';
      if (filters.locationType !== 'All' && locType !== filters.locationType) return false;
      
      return true;
    });
  }, [rawData, filters]);

  const kpis = useMemo(() => {
    let totalBrands = new Set();
    let totalMalls = new Set();
    let brandsWithPosm = new Set();
    let brandsWithFrame = new Set();
    let brandsWithoutPosm = new Set();
    let storesWithPosm = 0;

    filteredData.forEach(row => {
      const brand = row['Brand (C)'];
      const mall = row['Mall_Name (AV)'];
      const status = row['POSM_Status (AZ)'] || '';
      const hasFrame = row['Has_UrBox_Logo (BA)'] === 'Yes';

      if(brand) totalBrands.add(brand);
      if(mall) totalMalls.add(mall);
      
      if(status.startsWith('Có POSM')) {
         brandsWithPosm.add(brand);
         storesWithPosm++;
      }
      if(status.startsWith('KHÔNG POSM')) {
         brandsWithoutPosm.add(brand);
      }
      if(hasFrame) {
         brandsWithFrame.add(brand);
      }
    });

    const posmRate = filteredData.length > 0 
      ? ((storesWithPosm / filteredData.length) * 100).toFixed(1) 
      : 0;

    return {
      brandsWithPosm: brandsWithPosm.size,
      brandsWithoutPosm: brandsWithoutPosm.size,
      brandsWithFrame: brandsWithFrame.size,
      totalMalls: totalMalls.size,
      posmRate
    };
  }, [filteredData]);

  if (loading) {
    return (
      <div className="loading-screen">
        <Loader2 className="spinner" size={48} />
        <h2>Loading Dashboard Data...</h2>
      </div>
    );
  }

  return (
    <div className="flex-col">
      <Header />
      
      <main className="dashboard-main flex-col">
        <FilterBar filters={filters} setFilters={setFilters} options={filterOptions} />
        
        <div className="kpi-grid section-spacing">
          <StatCard 
            title="Brands/Cửa hàng có POSM" 
            value={kpis.brandsWithPosm} 
            icon={Store} 
            colorClass="green" 
          />
          <StatCard 
            title="Brands không có POSM" 
            value={kpis.brandsWithoutPosm} 
            icon={XCircle} 
            colorClass="red" 
          />
          <StatCard 
            title="Brands có dùng Frame" 
            value={kpis.brandsWithFrame} 
            icon={ImageIcon} 
            colorClass="blue" 
          />
          <StatCard 
            title="Malls có triển khai" 
            value={kpis.totalMalls} 
            icon={Building2} 
            colorClass="purple" 
          />
          <StatCard 
            title="Tỉ lệ có POSM" 
            value={kpis.posmRate} 
            icon={TrendingUp} 
            colorClass="orange" 
            isPercentage={true}
          />
        </div>

        <ChartSection data={filteredData} />
        
        <DataTableSection data={filteredData} />
      </main>
    </div>
  );
}

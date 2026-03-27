import Papa from 'papaparse';
import { mockData } from './mockData';
import { mockDataUG } from './mockDataUG';

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1VdycOwMxhEY62_Ws3QAXYIydvsKftsSh3EEyNdMbrJM/export?format=csv&gid=511717734';
// Use the precise GID provided by the user for "Data nghiệm thu"
const UG_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1VdycOwMxhEY62_Ws3QAXYIydvsKftsSh3EEyNdMbrJM/export?format=csv&gid=511717734';

export const fetchData = async (forceMock = false) => {
  if (forceMock) {
    return mockData;
  }

  try {
    const response = await fetch(SHEET_CSV_URL);
    if (!response.ok) {
      console.warn('Network response was not ok. Falling back to mock data.');
      return mockData;
    }
    const csvText = await response.text();
    
    // Check if it's actually HTML (Google login page) instead of CSV
    if (csvText.trim().startsWith('<')) {
      console.warn('Received HTML instead of CSV (likely auth redirect). Falling back to mock data.');
      return mockData;
    }

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          // Normalize keys to support both older sheet formats and the current format safely
          const normalizedData = results.data.map(row => ({
            ...row,
            'Brand (C)': row['Brand'] || row['Brand (C)'],
            'Địa chỉ (D)': row['Địa chỉ'] || row['Địa chỉ (D)'],
            'Mall_Name (AV)': row['Mall_Name'] || row['Mall_Name (AV)'],
            'Location_Type (AW)': row['Location_Type'] || row['Location_Type (AW)'],
            'District (AX)': row['District'] || row['District (AX)'],
            'City (AY)': row['City'] || row['City (AY)'],
            'POSM_Status (AZ)': row['POSM_Status'] || row['POSM_Status (AZ)'],
            'Has_UrBox_Logo (BA)': row['Has_UrBox_Logo'] || row['Has_UrBox_Logo (BA)'],
            'Link 1 (BB+)': row['Link 1'] || row['Link 1 (BB+)']
          }));

          const firstRow = normalizedData[0];
          if (!firstRow || (!firstRow['Brand (C)'] && !firstRow['Timestamp'])) {
             console.warn('CSV does not match expected format. Falling back to mock data.');
             resolve(mockData);
             return;
          }
          resolve(normalizedData);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          resolve(mockData); // Fallback to mock on parse error
        }
      });
    });
  } catch (error) {
    console.error('Fetch failed, CORS or Auth issue. Falling back to mock data:', error);
    return mockData;
  }
};

// ---------------------------------------------------------------------------
// UG POSM – Data nghiệm thu sheet
// ---------------------------------------------------------------------------
const normalizeUGRow = (row, index) => {
  const get = (key, ...aliases) => {
    for (const k of [key, ...aliases]) {
      if (row[k] !== undefined && row[k] !== null && row[k] !== '') return row[k];
    }
    return null;
  };

  const posmStatusRaw = get('POSM_Status') || get('UG POSM') || '';
  const posmStatus = posmStatusRaw.includes('Có POSM') ? 'Có POSM' : posmStatusRaw.includes('KHÔNG POSM') ? 'KHÔNG POSM' : 'Unknown';
  
  const frameRaw = get('Frame') || 'No';
  const frame = (frameRaw === 'Frame' || frameRaw === 'Yes') ? 'Yes' : 'No';
  const mallName = get('Mall_Name') || '';
  const locType = get('Location_Type') || '';
  const reason = get('Lý do không có POSM') || '';
  const week = get('WEEKnum') || get('W hoàn thành') || '';

  // ── Calculated Fields (as per spec) ──
  const posmBinary = posmStatus === 'Có POSM' ? 1 : 0;
  const frameBinary = frame === 'Yes' ? 1 : 0;
  const isMall = locType === 'Mall' ? 1 : 0;
  const mallWithPosm = (locType === 'Mall' && posmStatus === 'Có POSM') ? mallName : null;
  const isPolicyExempt = reason.includes('Chính sách cửa hàng');

  return {
    id: index + 1,
    Timestamp: get('Timestamp'),
    'Tên nhân viên': get('Tên nhân viên'),
    Brand: get('Brand'),
    'Địa chỉ': get('Địa chỉ'),
    'Hoạt động UrGift': get('Hoạt động UrGift'),
    'Mã cv': get('Mã cv') || `UG-${String(index + 1).padStart(4, '0')}`,
    'UG POSM': posmStatus,
    'POSM_Status': posmStatus,
    'Frame': frame,
    'WEEKnum': week,
    'W hoàn thành': week,
    'Mall_Name': mallName,
    'Location_Type': locType,
    'District': get('District'),
    'City': get('City'),
    'Link 1': get('Link 1'),
    'Link 2': get('Link 2'),
    'Note': get('Ghi chú') || get('Note'),
    'Lý do không có POSM': reason,
    
    // Derived values for analytics
    posmBinary,
    frameBinary,
    isMall,
    mallWithPosm,
    isPolicyExempt,
    Project: get('Project') || 'UrGift'
  };
};

export const fetchUGData = async (forceMock = false) => {
  if (forceMock) return mockDataUG;

  try {
    const response = await fetch(UG_SHEET_CSV_URL);
    if (!response.ok) {
      console.warn('UG sheet not ok – using mock data');
      return mockDataUG;
    }
    const csvText = await response.text();
    if (csvText.trim().startsWith('<')) {
      console.warn('UG sheet returned HTML (auth redirect) – using mock data');
      return mockDataUG;
    }

    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (!results.data || results.data.length === 0) {
            resolve(mockDataUG);
            return;
          }
          const normalized = results.data.map(normalizeUGRow);
          // Sanity-check: if > 80% of rows have null UG POSM, we're on the wrong tab – use mock
          const nullPosmCount = normalized.filter(r => r['UG POSM'] === null).length;
          if (nullPosmCount / normalized.length > 0.8) {
            console.warn('UG sheet data does not match expected schema (wrong gid?) – using mock data');
            resolve(mockDataUG);
            return;
          }
          resolve(normalized);
        },
        error: () => resolve(mockDataUG),
      });
    });
  } catch (e) {
    console.error('fetchUGData failed – using mock data', e);
    return mockDataUG;
  }
};

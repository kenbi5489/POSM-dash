import { addDays, format } from 'date-fns';

const brands = [
  'Highland Coffee', 'Starbucks', 'Guardian', 'innisfree', 'Katinat',
  'Gongcha', 'The Coffee House', 'Phúc Long', 'Circle K', 'Ministop',
  'GS25', 'Watsons', 'Pharmacity', 'Long Châu', 'Haidilao'
];

const malls = [
  '', '', '', '', // Increase chance of standalone
  'Vincom Đồng Khởi', 'Takashimaya', 'Aeon Mall Tân Phú', 'Crescent Mall',
  'Vạn Hạnh Mall', 'Bitexco', 'Landmark 81', 'Giga Mall'
];

const districts = [
  'Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 10',
  'Quận 7', 'Tân Bình', 'Phú Nhuận', 'Thành phố Thủ Đức', 'Bình Thạnh'
];

const staff = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E'];

const statuses = [
  'Có POSM (Đầy đủ)', 'Có POSM (Đầy đủ)', 'Có POSM (Đầy đủ)', // Weight towards completed
  'Có POSM (Thiếu Frame)', 
  'KHÔNG POSM (Từ chối)', 
  'KHÔNG POSM (Hết chỗ)'
];

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomDate = () => {
  const daysAgo = Math.floor(Math.random() * 30);
  const date = addDays(new Date(), -daysAgo);
  return format(date, 'MM/dd/yyyy HH:mm:ss');
};

export const generateMockData = (count = 200) => {
  return Array.from({ length: count }, (_, i) => {
    const mall = pickRandom(malls);
    const locationType = mall ? 'Mall' : 'Standalone';
    const status = pickRandom(statuses);
    const hasPosm = status.startsWith('Có POSM');
    
    // Logic for Evidence
    // If has POSM, 80% chance of having a link
    let link = '';
    if (hasPosm) {
      link = Math.random() > 0.2 ? 'https://storage.googleapis.com/evidence-mock/img.jpg' : '';
    }

    // Has Frame
    let hasFrame = 'No';
    if (status === 'Có POSM (Đầy đủ)') hasFrame = 'Yes';
    if (status === 'Có POSM (Thiếu Frame)') hasFrame = 'No';

    const districtInfo = pickRandom(districts);

    return {
      id: i + 1,
      Timestamp: randomDate(),
      'Tên nhân viên': pickRandom(staff),
      'Brand (C)': pickRandom(brands),
      'Địa chỉ (D)': `${Math.floor(Math.random() * 999) + 1} Đường An Bình, ${districtInfo}, TP.Hồ Chí Minh`,
      'Mall_Name (AV)': mall,
      'Location_Type (AW)': locationType,
      'District (AX)': districtInfo,
      'City (AY)': 'TP.Hồ Chí Minh',
      'POSM_Status (AZ)': status,
      'Has_UrBox_Logo (BA)': hasFrame,
      'Link 1 (BB+)': link,
      Note: Math.random() > 0.9 ? 'Chờ kiểm tra lại' : ''
    };
  });
};

export const mockData = generateMockData(200);

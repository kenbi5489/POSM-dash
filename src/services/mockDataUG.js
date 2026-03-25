// Mock data for "Data nghiệm thu" sheet tab – UG POSM tracking

const brands = [
  'Highland Coffee', 'Starbucks', 'Guardian', 'innisfree', 'Katinat',
  'Gongcha', 'The Coffee House', 'Phúc Long', 'Circle K', 'Pharmacity'
];

const staff = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E'];

const activities = [
  'Site check - Kiểm tra nhân viên cửa hàng',
  'Site check - Kiểm tra nhân viên cửa hàng',
  'Site check - Kiểm tra/Thay POSM',
  'Site check - Kiểm tra/Thay POSM',
  'Card Holder',
  'Training - online (Training tập trung)',
  'Đóng cửa/Hoạt động ngoài giờ hành chính',
];

const ugPosmValues = ['Có POSM', 'Có POSM', 'Có POSM', 'KHÔNG POSM'];
const mallNames = ['Aeon Mall', 'Vincom Đồng Khởi', 'Vạn Hạnh Mall', 'Standalone', 'Standalone', 'Takashimaya', 'Crescent Mall'];

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateRows = (count = 80) => {
  const rows = [];
  for (let i = 0; i < count; i++) {
    const weekNum = Math.floor(i / (count / 6)) + 1; // W1–W6
    const wLabel = `W${weekNum}`;
    const activity = pickRandom(activities);
    const isClosed = activity.includes('Đóng cửa');
    const ugPosm = isClosed ? null : pickRandom(ugPosmValues);
    const mall = pickRandom(mallNames);
    const locType = mall === 'Standalone' ? 'Standalone' : 'Mall';
    const brand = pickRandom(brands);

    rows.push({
      id: i + 1,
      Timestamp: `03/${String(Math.floor(Math.random() * 25) + 1).padStart(2, '0')}/2025 ${String(Math.floor(Math.random() * 10) + 8).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`,
      'Tên nhân viên': pickRandom(staff),
      Brand: brand,
      'Hoạt động UrGift': activity,
      'Quản lý hoặc nhân viên trao đổi': `Nhân viên ${brand}`,
      'Số điện thoại': `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      'Có POSM không?': ugPosm ? 'Có' : (isClosed ? 'N/A' : 'Không'),
      'Mã cv': `UG-${String(i + 1).padStart(4, '0')}`,
      'UG POSM': ugPosm,
      'UG THANH TOÁN': ugPosm === 'Có POSM' ? 'Thanh toán được' : (isClosed ? null : 'Không thanh toán'),
      'UG-MC chính sách không POSM': (ugPosm === null && !isClosed && Math.random() > 0.8) ? 'Theo HĐ miễn trừ' : null,
      'W hoàn thành': wLabel,
      Project: 'UrGift',
      Mall_Name: mall,
      Location_Type: locType,
    });
  }
  return rows;
};

export const mockDataUG = generateRows(80);

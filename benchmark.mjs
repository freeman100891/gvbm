import { performance } from 'perf_hooks';

const BASE_URL = 'http://localhost:3000';

async function measureRequest(name, url, options = {}) {
  const times = [];
  const iterations = 5;

  // Warm-up
  try {
    await fetch(url, options);
  } catch (err) {
    return { name, error: err.message };
  }

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const res = await fetch(url, options);
    const end = performance.now();
    const body = await res.arrayBuffer(); // consume full body
    times.push({
      duration: end - start,
      status: res.status,
      sizeBytes: body.byteLength,
    });
  }

  const durations = times.map((t) => t.duration).sort((a, b) => a - b);
  const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
  const min = durations[0];
  const max = durations[durations.length - 1];
  const p95 = durations[Math.floor(durations.length * 0.95)];
  const sizeKb = (times[0].sizeBytes / 1024).toFixed(2);

  return {
    name,
    status: times[0].status,
    sizeKb: `${sizeKb} KB`,
    minMs: min.toFixed(2),
    avgMs: avg.toFixed(2),
    p95Ms: p95.toFixed(2),
    maxMs: max.toFixed(2),
  };
}

async function runBenchmarks() {
  console.log('========================================================================');
  console.log('🚀 GVBM PLATFORM - KIỂM TRA HIỆU NĂNG TỐC ĐỘ VÀ TẢI TRANG');
  console.log('========================================================================\n');

  console.log('--- 1. KIỂM TRA TỐC ĐỘ TẢI GIAO DIỆN CÁC TRANG (HTML / SSR / RSC) ---');
  const pages = [
    { name: 'Trang Chủ / Tổng Quan (Dashboard)', url: `${BASE_URL}/` },
    { name: 'Danh Sách Lớp Học (/classes)', url: `${BASE_URL}/classes` },
    { name: 'Bảng Điều Khiển Lớp 10A1 (/classes/10A1)', url: `${BASE_URL}/classes/class-10a1-ielts` },
    { name: 'Điểm Danh 1 Chạm (/attendance)', url: `${BASE_URL}/classes/class-10a1-ielts/attendance` },
    { name: 'Đấu Trường Thi Đua (/gamification)', url: `${BASE_URL}/classes/class-10a1-ielts/gamification` },
    { name: 'Bộ Công Cụ Máy Chiếu (/projector)', url: `${BASE_URL}/classes/class-10a1-ielts/projector` },
    { name: 'Tùy Biến Cấp Bậc (/rank-settings)', url: `${BASE_URL}/classes/class-10a1-ielts/rank-settings` },
    { name: 'Đánh Giá & Báo Cáo (/reports)', url: `${BASE_URL}/classes/class-10a1-ielts/reports` },
    { name: 'Sổ Tay Biên Bản Họp (/meetings)', url: `${BASE_URL}/meetings` },
    { name: 'Sao Lưu & Ngoại Tuyến (/settings/backup)', url: `${BASE_URL}/settings/backup` },
  ];

  const pageResults = [];
  for (const p of pages) {
    const result = await measureRequest(p.name, p.url);
    pageResults.push(result);
  }
  console.table(pageResults);

  console.log('\n--- 2. KIỂM TRA TỐC ĐỘ XỬ LÝ CỦA CÁC API ENDPOINTS & DATABASE ---');
  const apis = [
    { name: 'API Lấy Danh Sách Lớp (GET /api/classes)', url: `${BASE_URL}/api/classes` },
    { name: 'API Chi Tiết Lớp + Điểm (GET /api/classes/10A1)', url: `${BASE_URL}/api/classes/class-10a1-ielts` },
    { name: 'API Điểm Danh Ngày (GET /api/attendance)', url: `${BASE_URL}/api/classes/class-10a1-ielts/attendance` },
    { name: 'API Nhận Xét (GET /api/evaluations)', url: `${BASE_URL}/api/classes/class-10a1-ielts/evaluations` },
    { name: 'API Biên Bản Họp (GET /api/meetings)', url: `${BASE_URL}/api/meetings` },
    {
      name: 'API Cộng/Trừ Điểm Thi Đua (POST /api/points)',
      url: `${BASE_URL}/api/classes/class-10a1-ielts/points`,
      options: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: 's-1', pointsChanged: 1, reason: 'Speed benchmark test' }),
      },
    },
    { name: 'API Xuất Excel Danh Bạ (.xlsx)', url: `${BASE_URL}/api/classes/class-10a1-ielts/export-excel?type=contacts` },
    { name: 'API Xuất Excel Thi Đua (.xlsx)', url: `${BASE_URL}/api/classes/class-10a1-ielts/export-excel?type=gamification` },
    { name: 'API Xuất PDF Nhận Xét Học Sinh (.pdf)', url: `${BASE_URL}/api/classes/class-10a1-ielts/export-pdf?studentId=s-1` },
  ];

  const apiResults = [];
  for (const a of apis) {
    const result = await measureRequest(a.name, a.url, a.options);
    apiResults.push(result);
  }
  console.table(apiResults);

  console.log('\n========================================================================');
  console.log('✅ HOÀN THÀNH ĐO ĐẠC HIỆU NĂNG TỐC ĐỘ');
  console.log('========================================================================');
}

runBenchmarks().catch(console.error);

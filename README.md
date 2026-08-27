# 🎓 GVBM - Classroom Management & Gamification Platform for English Teachers

> Nền tảng web hiện đại chuyên biệt dành cho giáo viên giảng dạy nhiều lớp học tiếng Anh, tối ưu hóa luồng thao tác tức thì khi đứng lớp (1-chạm), tích hợp đấu trường thi đua Gamification phân cấp trực quan, bộ công cụ máy chiếu, đánh giá xuất PDF/Excel và hoạt động ngoại tuyến (Offline-First).

---

## 🌟 Điểm Nổi Bật & Tính Năng Cốt Lõi

### 1. ⚡ Điểm Danh 1 Chạm & Quản Lý Lớp Học
- **Vòng lặp 4 trạng thái linh hoạt**: `Có mặt (Xanh lá)` ➔ `Đi trễ (Vàng)` ➔ `Có phép (Xanh dương)` ➔ `Không phép (Đỏ)`.
- **Nút "Tất cả có mặt"**: Hoàn thành điểm danh đầu giờ trong 1 giây.
- **Thống kê chuyên cần thời gian thực** theo từng ngày và tỷ lệ % hiện diện.

### 2. 👑 Đấu Trường Thi Đua Gamification (Dân ➔ Lính ➔ Quan ➔ Vua)
- **4 Cấp bậc thi đua sinh động**:
  - 🌾 **Dân (Villager)**: 0 - 29 pts (Viền xanh lục `#10B981`)
  - 🛡️ **Lính (Soldier)**: 30 - 59 pts (Viền xanh lam `#3B82F6`)
  - 📜 **Quan (Scholar)**: 60 - 89 pts (Viền tím `#A855F7`)
  - 👑 **Vua (King)**: 90+ pts (Viền vàng hoàng gia `#EAB308`)
- **Vinh danh Thăng cấp (Promotion 🎉)**: Hiệu ứng modal phóng đại đàn hồi Framer Motion, pháo hoa rực rỡ toàn màn hình `canvas-confetti`, nhạc kèn lệnh hoàng gia tự tổng hợp qua **Web Audio API**.
- **Hạ cấp (Demotion ⚠️)**: Toast trượt nhẹ nhàng với các câu động viên tiếng Anh (*"Don't give up! Keep climbing!"*), chế độ bảo vệ tâm lý khi chiếu trên màn hình lớn.
- **4 Gói chủ đề tích hợp**: *Cổ điển Đại Việt, Medieval Fantasy, Space Explorer, Academic English* cùng trình tùy biến Theme Builder.

### 3. 📽️ Bộ Công Cụ Máy Chiếu Tương Tác
- 🎲 **Vòng quay gọi tên ngẫu nhiên (Random Picker)**: Hiệu ứng Slot Machine kèm âm thanh quay, bộ lọc chỉ quay học sinh có mặt và chế độ không gọi lặp lại.
- 👥 **Chia nhóm tự động & Cân bằng năng lực (Team Generator)**: Tự động phân bổ đều Vua/Quan vào các nhóm để dẫn dắt thảo luận.
- ⏱️ **Đồng hồ đếm ngược số lớn (Countdown Timer & Stopwatch)**: Đếm ngược làm bài nhóm với chuông reo kết thúc giờ.

### 4. 🧑🎓 Quản Lý Hồ Sơ Học Sinh (Student CRUD & Profile Management)
- Thêm mới, chỉnh sửa thông tin, ghi chú sư phạm (IELTS target, phát âm).
- Thư viện **12 Avatar Emoji vẽ sẵn** + Tải ảnh đại diện cá nhân từ máy tính.
- Nút bấm kết nối **Zalo 1-chạm** với phụ huynh.
- **Chuyển lớp học sinh**: Chuyển đơn lẻ hoặc hàng loạt với tùy chọn bảo lưu điểm hoặc reset về Dân.
- **Đặt lại điểm thi đua (Reset Points)**: Đưa điểm về 0 đầu chu kỳ mới bằng bản ghi bù trừ an toàn.
- **Thanh tác vụ hàng loạt nổi (`StudentBatchToolbar`)**: Xóa, chuyển lớp, đặt lại điểm nhiều học sinh cùng lúc.

### 5. 📊 Wizard Nhập/Xuất Excel & Phiếu Nhận Xét PDF Chuẩn A4
- **Excel Wizard 3 bước**: Kéo thả tệp `.xlsx` ➔ Bảng đối soát và sửa lỗi trực tiếp trên giao diện ➔ Chuẩn hóa và nạp vào CSDL.
- **Xuất Excel đa mẫu với ExcelJS**: Danh bạ liên lạc, Bảng xếp hạng màu có điều kiện, Sổ điểm danh ma trận cả tháng.
- **Xuất Phiếu Kết Quả PDF Khổ A4 (`@react-pdf/renderer`)**: Đầy đủ logo, chuyên cần, danh hiệu, bảng tiêu chí tiếng Anh và khung chữ ký phụ huynh/giáo viên.

### 6. 📋 Sổ Biên Bản Cuộc Họp & 💾 Offline-First (Dexie IndexedDB)
- Ghi chú họp tổ chuyên môn, họp phụ huynh, họp hội đồng kèm danh sách Action Items checklist.
- Cơ sở dữ liệu cục bộ IndexedDB thông qua Dexie với hàng đợi Outbox Pattern tự động đồng bộ khi có mạng.
- Xuất và khôi phục toàn vẹn dữ liệu qua tệp JSON.

---

## 💻 Ngăn Xếp Công Nghệ (Tech Stack)

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React.
- **Animations & Effects**: Framer Motion, Canvas Confetti, Web Audio API procedural sound synthesis.
- **Database & ORM**: Prisma ORM, SQLite / MySQL.
- **Offline Storage**: Dexie.js (IndexedDB Outbox Pattern).
- **Documents & Export**: ExcelJS, `@react-pdf/renderer`, Zod.

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Cài đặt các thư viện phụ thuộc
```bash
npm install
```

### 2. Thiết lập cơ sở dữ liệu
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 3. Khởi chạy máy chủ phát triển
```bash
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:3000`

### 4. Biên dịch bản đóng gói Production
```bash
npm run build
npm run start
```

---

## 📄 Bản Quyền & Giấy Phép
Dự án được xây dựng phục vụ cộng đồng giáo viên và giảng dạy tiếng Anh.
Phát triển bởi **freeman100891**.

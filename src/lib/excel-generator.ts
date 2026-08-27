import ExcelJS from 'exceljs';
import { StudentWithStats, ClassItem, AttendanceItem } from '@/types';

/**
 * Generate Student Contact Directory Excel
 */
export async function generateStudentContactExcel(
  classData: ClassItem,
  students: StudentWithStats[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'GVBM Platform';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Danh Sách Học Sinh');

  // Title block
  worksheet.mergeCells('A1:E1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `DANH SÁCH HỌC SINH - LỚP ${classData.name.toUpperCase()}`;
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E3A8A' }, // Navy blue
  };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 40;

  // Sub-header
  worksheet.mergeCells('A2:E2');
  const subCell = worksheet.getCell('A2');
  subCell.value = `Năm học: ${classData.academicYear} | Sĩ số: ${students.length} học sinh | Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`;
  subCell.font = { name: 'Arial', size: 11, italic: true, color: { argb: 'FF475569' } };
  subCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(2).height = 24;

  // Header Row
  const headerRow = worksheet.getRow(4);
  headerRow.values = ['STT', 'Họ và Tên Học Sinh', 'Họ Tên Phụ Huynh', 'Số Điện Thoại PH', 'Ghi Chú'];
  headerRow.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 28;

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' }, // Primary blue
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'medium' },
      right: { style: 'thin' },
    };
  });

  // Data rows
  students.forEach((student, idx) => {
    const row = worksheet.addRow([
      idx + 1,
      student.fullName,
      student.parentName || '-',
      student.parentPhone || '-',
      student.notes || '',
    ]);

    row.height = 24;
    row.alignment = { vertical: 'middle' };
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };

    // Alternate row zebra styling
    if (idx % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' },
        };
      });
    }

    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
    });
  });

  // Column widths
  worksheet.getColumn(1).width = 8;
  worksheet.getColumn(2).width = 30;
  worksheet.getColumn(3).width = 25;
  worksheet.getColumn(4).width = 18;
  worksheet.getColumn(5).width = 35;

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Generate Gamification Leaderboard Excel with Rank Colors
 */
export async function generateGamificationLeaderboardExcel(
  classData: ClassItem,
  students: StudentWithStats[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'GVBM Platform';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Bảng Xếp Hạng Thi Đua');

  // Title
  worksheet.mergeCells('A1:F1');
  const title = worksheet.getCell('A1');
  title.value = `BẢNG XẾP HẠNG THI ĐUA TIẾNG ANH - LỚP ${classData.name.toUpperCase()}`;
  title.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  title.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF7E22CE' }, // Royal Purple
  };
  title.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 42;

  // Header
  const header = worksheet.getRow(3);
  header.values = ['Hạng', 'Học Sinh', 'Cấp Bậc Hiện Tại', 'Danh Hiệu', 'Tổng Điểm', 'Tỷ Lệ Chuyên Cần'];
  header.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  header.alignment = { horizontal: 'center', vertical: 'middle' };
  header.height = 28;

  header.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF9333EA' },
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'medium' },
      right: { style: 'thin' },
    };
  });

  // Sort students descending by total points
  const sorted = [...students].sort((a, b) => b.totalPoints - a.totalPoints);

  const rankBgColors: Record<string, string> = {
    VUA: 'FFFEF08A', // Gold light
    QUAN: 'FFF3E8FF', // Purple light
    LINH: 'FFDBEAFE', // Blue light
    DAN: 'FFD1FAE5', // Green light
  };

  const rankTextColors: Record<string, string> = {
    VUA: 'FF854D0E',
    QUAN: 'FF6B21A8',
    LINH: 'FF1E40AF',
    DAN: 'FF065F46',
  };

  sorted.forEach((student, idx) => {
    const row = worksheet.addRow([
      idx + 1,
      student.fullName,
      student.currentRank,
      student.rankConfig?.displayName || student.currentRank,
      student.totalPoints,
      `${Math.round(student.attendanceRate ?? 100)}%`,
    ]);

    row.height = 26;
    row.alignment = { vertical: 'middle' };
    row.getCell(1).alignment = { horizontal: 'center' };
    row.getCell(3).alignment = { horizontal: 'center' };
    row.getCell(5).alignment = { horizontal: 'center' };
    row.getCell(6).alignment = { horizontal: 'center' };

    // Conditional rank badge color
    const rankCell = row.getCell(3);
    const colorBg = rankBgColors[student.currentRank] || 'FFFFFFFF';
    const colorText = rankTextColors[student.currentRank] || 'FF000000';

    rankCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: colorBg },
    };
    rankCell.font = { bold: true, color: { argb: colorText } };

    // Points bold
    row.getCell(5).font = { bold: true, size: 12 };

    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
    });
  });

  worksheet.getColumn(1).width = 8;
  worksheet.getColumn(2).width = 28;
  worksheet.getColumn(3).width = 18;
  worksheet.getColumn(4).width = 24;
  worksheet.getColumn(5).width = 14;
  worksheet.getColumn(6).width = 20;

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Generate Monthly Attendance Matrix Excel (P / L / E / A)
 */
export async function generateMonthlyAttendanceExcel(
  classData: ClassItem,
  students: StudentWithStats[],
  month: number,
  year: number,
  attendances: AttendanceItem[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`Điểm Danh T${month}-${year}`);

  // Days in month
  const daysInMonth = new Date(year, month, 0).getDate();

  // Title
  worksheet.mergeCells(1, 1, 1, daysInMonth + 7);
  const title = worksheet.getCell('A1');
  title.value = `BẢNG TỔNG HỢP ĐIỂM DANH THÁNG ${month}/${year} - LỚP ${classData.name.toUpperCase()}`;
  title.font = { name: 'Arial', size: 15, bold: true, color: { argb: 'FFFFFFFF' } };
  title.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F766E' }, // Teal
  };
  title.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 36;

  // Header
  const headers = ['STT', 'Họ và Tên'];
  for (let d = 1; d <= daysInMonth; d++) {
    headers.push(`${d}`);
  }
  headers.push('Có mặt (P)', 'Trễ (L)', 'Phép (E)', 'Vắng (A)', 'Tỷ lệ %');

  const headerRow = worksheet.getRow(3);
  headerRow.values = headers;
  headerRow.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 26;

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0D9488' },
    };
  });

  // Map attendances by `studentId_date`
  const attMap = new Map<string, string>();
  attendances.forEach((att) => {
    // date formatted as YYYY-MM-DD
    const dateStr = typeof att.date === 'string' ? att.date.split('T')[0] : '';
    attMap.set(`${att.studentId}_${dateStr}`, att.status);
  });

  students.forEach((student, sIdx) => {
    let pCount = 0;
    let lCount = 0;
    let eCount = 0;
    let aCount = 0;

    const rowData: any[] = [sIdx + 1, student.fullName];

    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = d < 10 ? `0${d}` : `${d}`;
      const mStr = month < 10 ? `0${month}` : `${month}`;
      const fullDate = `${year}-${mStr}-${dStr}`;
      const status = attMap.get(`${student.id}_${fullDate}`);

      let symbol = '-';
      if (status === 'PRESENT') {
        symbol = 'P';
        pCount++;
      } else if (status === 'LATE') {
        symbol = 'L';
        lCount++;
      } else if (status === 'EXCUSED_ABSENCE') {
        symbol = 'E';
        eCount++;
      } else if (status === 'UNEXCUSED_ABSENCE') {
        symbol = 'A';
        aCount++;
      }

      rowData.push(symbol);
    }

    const totalRecorded = pCount + lCount + eCount + aCount;
    const rate = totalRecorded > 0 ? Math.round(((pCount + lCount) / totalRecorded) * 100) : 100;

    rowData.push(pCount, lCount, eCount, aCount, `${rate}%`);

    const row = worksheet.addRow(rowData);
    row.height = 22;
    row.alignment = { vertical: 'middle' };
    row.getCell(1).alignment = { horizontal: 'center' };

    // Format daily status cells
    for (let c = 3; c <= daysInMonth + 2; c++) {
      const cell = row.getCell(c);
      cell.alignment = { horizontal: 'center' };
      const val = cell.value?.toString();
      if (val === 'P') {
        cell.font = { color: { argb: 'FF16A34A' }, bold: true };
      } else if (val === 'L') {
        cell.font = { color: { argb: 'FFD97706' }, bold: true };
      } else if (val === 'E') {
        cell.font = { color: { argb: 'FF2563EB' }, bold: true };
      } else if (val === 'A') {
        cell.font = { color: { argb: 'FFDC2626' }, bold: true };
      }
    }

    // Summary columns
    for (let c = daysInMonth + 3; c <= daysInMonth + 7; c++) {
      row.getCell(c).alignment = { horizontal: 'center' };
      row.getCell(c).font = { bold: true };
    }
  });

  worksheet.getColumn(1).width = 6;
  worksheet.getColumn(2).width = 26;
  for (let d = 1; d <= daysInMonth; d++) {
    worksheet.getColumn(d + 2).width = 4.5;
  }
  worksheet.getColumn(daysInMonth + 3).width = 12;
  worksheet.getColumn(daysInMonth + 4).width = 10;
  worksheet.getColumn(daysInMonth + 5).width = 10;
  worksheet.getColumn(daysInMonth + 6).width = 10;
  worksheet.getColumn(daysInMonth + 7).width = 12;

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Generate Excel Template for Student Import
 */
export async function generateImportTemplateExcel(): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Danh Sách Nhập Học Sinh');

  const headers = ['Họ và Tên (*)', 'Họ Tên Phụ Huynh', 'Số Điện Thoại Phụ Huynh', 'Ghi Chú'];
  const headerRow = worksheet.getRow(1);
  headerRow.values = headers;
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Sample data rows
  const samples = [
    ['Nguyễn Văn An', 'Nguyễn Văn Bình', '0901234567', 'Thích môn Speaking'],
    ['Trần Thị Bảo Ngọc', 'Trần Hữu Long', '0912345678', 'Học viên chăm chỉ'],
    ['Lê Hoàng Nam', 'Phạm Thị Lan', '0987654321', 'Cần cải thiện Vocab'],
  ];

  samples.forEach((sample) => {
    const row = worksheet.addRow(sample);
    row.height = 24;
    row.alignment = { vertical: 'middle' };
  });

  worksheet.getColumn(1).width = 28;
  worksheet.getColumn(2).width = 26;
  worksheet.getColumn(3).width = 24;
  worksheet.getColumn(4).width = 30;

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

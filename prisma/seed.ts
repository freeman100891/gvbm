import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data for GVBM platform...');

  // Clean existing
  await prisma.pointLog.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.rankConfig.deleteMany();
  await prisma.student.deleteMany();
  await prisma.class.deleteMany();
  await prisma.meetingNote.deleteMany();

  // 1. Create Class
  const mainClass = await prisma.class.create({
    data: {
      id: 'class-10a1-ielts',
      name: '10A1 - IELTS & Communication',
      academicYear: '2026-2027',
      description: 'Lớp chuyên Anh tăng cường giao tiếp và định hướng IELTS 6.5+',
    },
  });

  const secondClass = await prisma.class.create({
    data: {
      id: 'class-grade9-starters',
      name: 'Grade 9B - Young Achievers',
      academicYear: '2026-2027',
      description: 'Lớp củng cố ngữ pháp và phát âm chuẩn bản ngữ',
    },
  });

  // 2. Rank Configs for main class
  await prisma.rankConfig.createMany({
    data: [
      {
        classId: mainClass.id,
        rank: 'DAN',
        displayName: 'Dân (Villager)',
        avatarType: 'EMOJI',
        avatarValue: '🌾',
        frameColor: '#10B981',
        minPoints: 0,
      },
      {
        classId: mainClass.id,
        rank: 'LINH',
        displayName: 'Lính (Soldier)',
        avatarType: 'EMOJI',
        avatarValue: '🛡️',
        frameColor: '#3B82F6',
        minPoints: 30,
      },
      {
        classId: mainClass.id,
        rank: 'QUAN',
        displayName: 'Quan (Scholar)',
        avatarType: 'EMOJI',
        avatarValue: '📜',
        frameColor: '#A855F7',
        minPoints: 60,
      },
      {
        classId: mainClass.id,
        rank: 'VUA',
        displayName: 'Vua (King)',
        avatarType: 'EMOJI',
        avatarValue: '👑',
        frameColor: '#EAB308',
        minPoints: 90,
      },
    ],
  });

  // 3. Students for main class (15 students)
  const studentsData = [
    {
      id: 's-1',
      fullName: 'Trần Gia Hân',
      parentName: 'Trần Quang Hưng',
      parentPhone: '0903112233',
      notes: 'Phát âm tự nhiên, năng nổ trong giờ Speaking',
      targetPoints: 96, // Vua
    },
    {
      id: 's-2',
      fullName: 'Nguyễn Minh Quân',
      parentName: 'Nguyễn Văn Hải',
      parentPhone: '0912445566',
      notes: 'Đội trưởng nhóm debate, từ vựng phong phú',
      targetPoints: 92, // Vua
    },
    {
      id: 's-3',
      fullName: 'Lê Hoàng Bảo Ngọc',
      parentName: 'Lê Thế Bảo',
      parentPhone: '0988776655',
      notes: 'Chăm chỉ, làm bài tập đầy đủ và chuẩn xác',
      targetPoints: 84, // Quan
    },
    {
      id: 's-4',
      fullName: 'Phạm Đức Anh',
      parentName: 'Phạm Văn Thành',
      parentPhone: '0977334455',
      notes: 'Phản xạ nghe nhanh, cần tự tin hơn khi nói trước lớp',
      targetPoints: 76, // Quan
    },
    {
      id: 's-5',
      fullName: 'Vũ Thảo Linh',
      parentName: 'Vũ Đình Toàn',
      parentPhone: '0933221100',
      notes: 'Viết luận mạch lạc, ngữ pháp rất chắc',
      targetPoints: 68, // Quan
    },
    {
      id: 's-6',
      fullName: 'Đỗ Tuấn Khang',
      parentName: 'Đỗ Hữu Trí',
      parentPhone: '0944556677',
      notes: 'Rất tích cực giơ tay xây dựng bài',
      targetPoints: 54, // Linh
    },
    {
      id: 's-7',
      fullName: 'Bùi Phương Mai',
      parentName: 'Bùi Quang Minh',
      parentPhone: '0966889900',
      notes: 'Phát âm chuẩn IPA, giọng đọc truyền cảm',
      targetPoints: 48, // Linh
    },
    {
      id: 's-8',
      fullName: 'Hoàng Quốc Bảo',
      parentName: 'Hoàng Văn Nam',
      parentPhone: '0908123456',
      notes: 'Tiến bộ vượt bậc về phần Nghe hiểu',
      targetPoints: 42, // Linh
    },
    {
      id: 's-9',
      fullName: 'Đặng Thùy Dương',
      parentName: 'Đặng Ngọc Thắng',
      parentPhone: '0919223344',
      notes: 'Lắng nghe tốt, cần mở rộng vốn từ học thuật',
      targetPoints: 36, // Linh
    },
    {
      id: 's-10',
      fullName: 'Ngô Việt Hoàng',
      parentName: 'Ngô Tuấn Kiệt',
      parentPhone: '0981335577',
      notes: 'Đã hoàn thành tốt các bài tập về nhà',
      targetPoints: 31, // Linh
    },
    {
      id: 's-11',
      fullName: 'Lý Diệu Anh',
      parentName: 'Lý Quốc Cường',
      parentPhone: '0938990011',
      notes: 'Hơi rụt rè khi thảo luận nhóm, cần khích lệ',
      targetPoints: 24, // Dan
    },
    {
      id: 's-12',
      fullName: 'Trịnh Thế Vinh',
      parentName: 'Trịnh Văn Long',
      parentPhone: '0947228833',
      notes: 'Hay quên mang tài liệu, đã có chuyển biến tích cực',
      targetPoints: 18, // Dan
    },
    {
      id: 's-13',
      fullName: 'Dương Khánh Linh',
      parentName: 'Dương Văn Tùng',
      parentPhone: '0965114422',
      notes: 'Đang theo học bổ trợ ngữ pháp cơ bản',
      targetPoints: 12, // Dan
    },
    {
      id: 's-14',
      fullName: 'Lâm Quốc Thịnh',
      parentName: 'Lâm Văn Hùng',
      parentPhone: '0902883399',
      notes: 'Cần chú ý không nói tiếng Việt trong giờ học',
      targetPoints: 8, // Dan
    },
    {
      id: 's-15',
      fullName: 'Phan Như Quỳnh',
      parentName: 'Phan Hữu Dũng',
      parentPhone: '0979446688',
      notes: 'Mới chuyển vào lớp, đang bắt nhịp rất tốt',
      targetPoints: 5, // Dan
    },
  ];

  for (const s of studentsData) {
    const student = await prisma.student.create({
      data: {
        id: s.id,
        classId: mainClass.id,
        fullName: s.fullName,
        parentName: s.parentName,
        parentPhone: s.parentPhone,
        notes: s.notes,
      },
    });

    // Create point logs to match targetPoints
    const pointsNeeded = s.targetPoints;
    let accumulated = 0;
    let logCount = 0;

    const reasons = [
      { reason: 'New Vocab Master', points: 1 },
      { reason: 'Good Speaking / Presentation', points: 2 },
      { reason: 'Completed Homework', points: 2 },
      { reason: 'Helpful & Cooperative', points: 1 },
      { reason: 'Active Participation', points: 1 },
      { reason: 'Perfect Pronunciation', points: 2 },
    ];

    while (accumulated < pointsNeeded && logCount < 50) {
      const pick = reasons[logCount % reasons.length];
      const diff = Math.min(pick.points, pointsNeeded - accumulated);
      if (diff <= 0) break;

      const dateOffset = (50 - logCount) * 8; // spread over past days
      const logDate = new Date();
      logDate.setHours(logDate.getHours() - dateOffset);

      await prisma.pointLog.create({
        data: {
          studentId: student.id,
          pointsChanged: diff,
          reason: pick.reason,
          createdAt: logDate,
        },
      });

      accumulated += diff;
      logCount++;
    }
  }

  // 4. Create sample Attendance for last 5 class sessions
  const dates = [
    new Date(Date.now() - 4 * 86400000),
    new Date(Date.now() - 3 * 86400000),
    new Date(Date.now() - 2 * 86400000),
    new Date(Date.now() - 1 * 86400000),
    new Date(),
  ];

  for (let i = 0; i < dates.length; i++) {
    const d = dates[i];
    d.setHours(8, 0, 0, 0);

    for (let sIdx = 0; sIdx < studentsData.length; sIdx++) {
      const s = studentsData[sIdx];
      let status: 'PRESENT' | 'LATE' | 'EXCUSED_ABSENCE' | 'UNEXCUSED_ABSENCE' = 'PRESENT';
      let note: string | null = null;

      if (sIdx === 11 && i === 1) {
        status = 'LATE';
        note = 'Trễ 10 phút do kẹt xe';
      } else if (sIdx === 13 && i === 2) {
        status = 'EXCUSED_ABSENCE';
        note = 'Phụ huynh xin phép qua Zalo';
      } else if (sIdx === 14 && i === 3) {
        status = 'UNEXCUSED_ABSENCE';
      }

      await prisma.attendance.create({
        data: {
          studentId: s.id,
          classId: mainClass.id,
          date: d,
          status,
          note,
        },
      });
    }
  }

  // 5. Create Sample English Evaluations
  await prisma.evaluation.create({
    data: {
      studentId: 's-1',
      classId: mainClass.id,
      period: 'Tháng 09/2026',
      vocabulary: 'Xuất sắc, sử dụng linh hoạt các collocations và phrasal verbs chủ đề Technology & Society.',
      grammar: 'Vững chắc các cấu trúc câu phức (Inversion, Conditional Type 3, Relative Clauses).',
      speaking: 'Phát âm chuẩn giọng Anh-Mỹ, ngữ điệu tự nhiên, phản xạ bài thi IELTS Speaking Part 2 rất tốt.',
      attitude: 'Chuyên cần, tích cực dẫn dắt các hoạt động thảo luận nhóm và hỗ trợ bạn bè.',
      generalComment: 'Em Gia Hân là học sinh tiêu biểu đạt danh hiệu VUA tháng này. Tiếp tục duy trì phong độ xuất sắc này nhé!',
    },
  });

  await prisma.evaluation.create({
    data: {
      studentId: 's-3',
      classId: mainClass.id,
      period: 'Tháng 09/2026',
      vocabulary: 'Khá tốt, cần mở rộng thêm các từ đồng nghĩa (Synonyms) để tránh lặp từ khi nói.',
      grammar: 'Nắm chắc các thì cơ bản và nâng cao, không mắc lỗi chia động từ.',
      speaking: 'Trôi chảy, cần nhấn đúng trọng âm câu (Sentence stress) để bài nói thêm sinh động.',
      attitude: 'Ngoan ngoãn, làm bài tập đầy đủ, đi học đúng giờ.',
      generalComment: 'Bảo Ngọc có nhiều tiềm năng bứt phá lên danh hiệu Vua trong tháng tới. Cô rất tự hào về em!',
    },
  });

  // 6. Create Meeting Notes
  await prisma.meetingNote.create({
    data: {
      title: 'Họp Tổ Chuyên Môn Tiếng Anh - Triển Khai Kế Hoạch Học Kỳ 1',
      category: 'DEPARTMENT',
      meetingDate: new Date(),
      location: 'Phòng Hội Đồng / Google Meet',
      attendees: 'Tổ trưởng chuyên môn, GV khối 10, 11, 12',
      content: `1. Thống nhất ma trận đề kiểm tra giữa kỳ 1 theo định dạng mới của Bộ GD&ĐT.
2. Ứng dụng nền tảng GVBM Gamification để tăng tương tác và giảm tỷ lệ nói tiếng Việt trong giờ học.
3. Tổ chức cuộc thi English Speaking Contest cấp trường vào tháng 11.`,
      actionItems: JSON.stringify([
        { id: '1', task: 'Soạn ngân hàng câu hỏi đề kiểm tra giữa kỳ 1', assignee: 'Cô Lan', deadline: '2026-09-15', completed: false },
        { id: '2', task: 'Thiết lập danh sách học sinh và chủ đề Gamification trên hệ thống GVBM', assignee: 'Thầy Hưng', deadline: '2026-09-05', completed: true },
        { id: '3', task: 'Lên kế hoạch tổ chức English Speaking Contest', assignee: 'Cô Mai', deadline: '2026-10-01', completed: false },
      ]),
    },
  });

  await prisma.meetingNote.create({
    data: {
      title: 'Họp Phụ Huynh Đầu Năm Học 2026 - 2027 Lớp 10A1',
      category: 'PARENTS',
      meetingDate: new Date(Date.now() - 7 * 86400000),
      location: 'Phòng học 10A1',
      attendees: 'GVCN, GVBM Tiếng Anh, 40 Phụ huynh học sinh',
      content: `1. Giới thiệu lộ trình học tập, mục tiêu đầu ra IELTS 6.0 - 6.5.
2. Giới thiệu hệ thống sổ liên lạc trực tuyến và phiếu đánh giá định kỳ hàng tháng từ GVBM.
3. Kênh liên lạc hỗ trợ phụ huynh theo dõi chuyên cần và điểm thi đua của con.`,
      actionItems: JSON.stringify([
        { id: '1', task: 'Gửi link nhóm Zalo và tài liệu định hướng cho phụ huynh', assignee: 'GVCN', deadline: '2026-09-01', completed: true },
        { id: '2', task: 'Tổng hợp phiếu khảo sát mục tiêu học tập của từng học sinh', assignee: 'GVBM Tiếng Anh', deadline: '2026-09-08', completed: true },
      ]),
    },
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

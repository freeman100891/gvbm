import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { StudentWithStats, ClassItem, EvaluationItem } from '@/types';

// Register standard fonts if needed or use Helvetica / Courier built-in
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    borderBottomStyle: 'solid',
    paddingBottom: 12,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  schoolTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  subHeader: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
  },
  reportTitleBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    padding: 10,
    textAlign: 'center',
    marginBottom: 15,
  },
  reportTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  periodText: {
    fontSize: 9,
    color: '#475569',
    marginTop: 2,
  },
  studentCard: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
  },
  studentInfoCol: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    width: 90,
    fontWeight: 'bold',
    color: '#475569',
  },
  infoValue: {
    flex: 1,
    color: '#0f172a',
  },
  rankBadgeBox: {
    width: 120,
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankTitle: {
    fontSize: 8,
    color: '#b45309',
    fontWeight: 'bold',
  },
  rankName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400e',
    marginVertical: 2,
  },
  rankPoints: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#b45309',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e40af',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 4,
    marginBottom: 8,
    marginTop: 10,
  },
  criteriaTable: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 6,
  },
  tableRowHeader: {
    backgroundColor: '#f1f5f9',
    fontWeight: 'bold',
  },
  criteriaCol: {
    width: 130,
    fontWeight: 'bold',
    color: '#334155',
  },
  commentCol: {
    flex: 1,
    color: '#1e293b',
    lineHeight: 1.3,
  },
  generalCommentBox: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 6,
    padding: 10,
    marginBottom: 20,
  },
  generalCommentText: {
    fontSize: 9.5,
    color: '#1e3a8a',
    lineHeight: 1.4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 10,
  },
  signatureBox: {
    width: 160,
    textAlign: 'center',
  },
  signatureTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 40,
  },
  signatureName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0f172a',
  },
});

interface StudentPDFTemplateProps {
  student: StudentWithStats;
  classData: ClassItem;
  evaluation?: EvaluationItem | null;
  periodName?: string;
}

export const StudentPDFTemplate: React.FC<StudentPDFTemplateProps> = ({
  student,
  classData,
  evaluation,
  periodName = 'Học Kỳ 1 - 2026',
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.schoolTitle}>GVBM ENGLISH ACADEMY</Text>
            <Text style={styles.subHeader}>
              Chương trình Đào tạo Tiếng Anh Toàn Diện & Gamification
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#1e40af' }}>
              LỚP: {classData.name.toUpperCase()}
            </Text>
            <Text style={styles.subHeader}>Năm học: {classData.academicYear}</Text>
          </View>
        </View>

        {/* Report Title */}
        <View style={styles.reportTitleBox}>
          <Text style={styles.reportTitle}>
            PHIẾU NHẬN XÉT KẾT QUẢ HỌC TẬP & RÈN LUYỆN TIẾNG ANH
          </Text>
          <Text style={styles.periodText}>Kỳ đánh giá: {evaluation?.period || periodName}</Text>
        </View>

        {/* Student Profile Card */}
        <View style={styles.studentCard}>
          <View style={styles.studentInfoCol}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Họ và Tên:</Text>
              <Text style={[styles.infoValue, { fontWeight: 'bold', fontSize: 11 }]}>
                {student.fullName}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phụ Huynh:</Text>
              <Text style={styles.infoValue}>{student.parentName || 'Chưa cập nhật'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số Điện Thoại:</Text>
              <Text style={styles.infoValue}>{student.parentPhone || 'Chưa cập nhật'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tỷ Lệ Chuyên Cần:</Text>
              <Text style={[styles.infoValue, { fontWeight: 'bold', color: '#16a34a' }]}>
                {Math.round(student.attendanceRate ?? 100)}% Có mặt
              </Text>
            </View>
          </View>

          {/* Rank Badge Box */}
          <View style={styles.rankBadgeBox}>
            <Text style={styles.rankTitle}>DANH HIỆU THI ĐUA</Text>
            <Text style={styles.rankName}>
              {student.rankConfig?.displayName || student.currentRank}
            </Text>
            <Text style={styles.rankPoints}>{student.totalPoints} Points</Text>
          </View>
        </View>

        {/* Criteria Evaluation */}
        <Text style={styles.sectionTitle}>1. ĐÁNH GIÁ CÁC KỸ NĂNG TIẾNG ANH CHUYÊN BIỆT</Text>
        <View style={styles.criteriaTable}>
          <View style={[styles.tableRow, styles.tableRowHeader]}>
            <Text style={styles.criteriaCol}>Kỹ năng / Tiêu chí</Text>
            <Text style={styles.commentCol}>Nhận xét chi tiết của Giáo viên bộ môn</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.criteriaCol}>Từ Vựng (Vocabulary)</Text>
            <Text style={styles.commentCol}>
              {evaluation?.vocabulary || 'Nắm vững từ vựng bài học, tích cực áp dụng vào giao tiếp thực tế.'}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.criteriaCol}>Ngữ Pháp (Grammar)</Text>
            <Text style={styles.commentCol}>
              {evaluation?.grammar || 'Hiểu chắc cấu trúc câu, làm bài tập ngữ pháp chính xác.'}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.criteriaCol}>Phát Âm & Nói (Speaking)</Text>
            <Text style={styles.commentCol}>
              {evaluation?.speaking || 'Phát âm chuẩn ngữ điệu, tự tin khi thuyết trình và thảo luận nhóm.'}
            </Text>
          </View>

          <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.criteriaCol}>Chuyên Cần & Thái Độ</Text>
            <Text style={styles.commentCol}>
              {evaluation?.attitude || 'Tích cực tham gia xây dựng bài, tuân thủ quy định nói tiếng Anh trong lớp.'}
            </Text>
          </View>
        </View>

        {/* General Teacher Comments */}
        <Text style={styles.sectionTitle}>2. LỜI PHÊ TỔNG QUÁT CỦA GIÁO VIÊN</Text>
        <View style={styles.generalCommentBox}>
          <Text style={styles.generalCommentText}>
            {evaluation?.generalComment ||
              `${student.fullName} có tinh thần học tập rất nghiêm túc và có nhiều nỗ lực vượt bậc trong kỳ này. Kính mong Quý Phụ Huynh tiếp tục đồng hành và khích lệ con duy trì phong độ!`}
          </Text>
        </View>

        {/* Signatures */}
        <View style={styles.footer}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>Ý KIẾN PHỤ HUYNH</Text>
            <Text style={styles.signatureName}>(Ký và ghi rõ họ tên)</Text>
          </View>

          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>GIÁO VIÊN BỘ MÔN</Text>
            <Text style={styles.signatureName}>GV. Tiếng Anh</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

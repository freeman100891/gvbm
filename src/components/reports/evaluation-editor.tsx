'use client';

import React, { useState } from 'react';
import { StudentWithStats, ClassItem, EvaluationItem } from '@/types';
import { RankAvatar } from '../gamification/rank-avatar';
import { RankBadge } from '../gamification/rank-badge';
import {
  FileText,
  Save,
  Download,
  Check,
  Sparkles,
  BookOpen,
  Mic,
  Smile,
  ShieldCheck,
} from 'lucide-react';

interface EvaluationEditorProps {
  students: StudentWithStats[];
  classData: ClassItem;
  initialEvaluations?: EvaluationItem[];
  onSaveEvaluation: (evaluation: Partial<EvaluationItem>) => Promise<void>;
}

export const EvaluationEditor: React.FC<EvaluationEditorProps> = ({
  students,
  classData,
  initialEvaluations = [],
  onSaveEvaluation,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || ''
  );
  const [period, setPeriod] = useState<string>('Tháng 09/2026');
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Form states
  const [vocabulary, setVocabulary] = useState<string>('');
  const [grammar, setGrammar] = useState<string>('');
  const [speaking, setSpeaking] = useState<string>('');
  const [attitude, setAttitude] = useState<string>('');
  const [generalComment, setGeneralComment] = useState<string>('');

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  // When student or period changes, load existing evaluation if any
  React.useEffect(() => {
    const existing = initialEvaluations.find(
      (e) => e.studentId === selectedStudentId && e.period === period
    );

    if (existing) {
      setVocabulary(existing.vocabulary || '');
      setGrammar(existing.grammar || '');
      setSpeaking(existing.speaking || '');
      setAttitude(existing.attitude || '');
      setGeneralComment(existing.generalComment || '');
    } else {
      // Default templates
      setVocabulary('Vốn từ phong phú, tích cực sử dụng từ vựng mới trong bài.');
      setGrammar('Nắm vững các cấu trúc ngữ pháp cơ bản và nâng cao.');
      setSpeaking('Phát âm chuẩn, tự tin giao tiếp và thuyết trình trước lớp.');
      setAttitude('Chăm chỉ, làm bài tập đầy đủ, thái độ học tập tích cực.');
      setGeneralComment(
        `Em ${selectedStudent?.fullName || 'học sinh'} có nhiều tiến bộ trong quá trình học tập. Tiếp tục phát huy nhé!`
      );
    }
  }, [selectedStudentId, period, initialEvaluations, selectedStudent?.fullName]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    setSaving(true);
    try {
      await onSaveEvaluation({
        studentId: selectedStudentId,
        classId: classData.id,
        period,
        vocabulary,
        grammar,
        speaking,
        attitude,
        generalComment,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save evaluation:', err);
      alert('Không thể lưu nhận xét. Vui lòng thử lại!');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!selectedStudentId) return;
    const url = `/api/classes/${classData.id}/export-pdf?studentId=${selectedStudentId}&period=${encodeURIComponent(
      period
    )}`;
    window.open(url, '_blank');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Student List Selector */}
      <div className="lg:col-span-4 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Danh Sách Học Sinh ({students.length})
          </h3>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="Tháng 09/2026">Tháng 09/2026</option>
            <option value="Tháng 10/2026">Tháng 10/2026</option>
            <option value="Tháng 11/2026">Tháng 11/2026</option>
            <option value="Học kỳ 1">Học kỳ 1</option>
            <option value="Học kỳ 2">Học kỳ 2</option>
            <option value="Cả năm học">Cả năm học</option>
          </select>
        </div>

        <div className="max-h-[600px] overflow-y-auto space-y-2 pr-1">
          {students.map((student) => {
            const isSelected = student.id === selectedStudentId;
            return (
              <button
                key={student.id}
                onClick={() => setSelectedStudentId(student.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition ${
                  isSelected
                    ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <RankAvatar
                    fullName={student.fullName}
                    avatarUrl={student.avatar}
                    rank={student.currentRank}
                    rankConfig={student.rankConfig}
                    size="sm"
                    showGlow={false}
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {student.fullName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {student.totalPoints} pts
                    </p>
                  </div>
                </div>

                <RankBadge
                  rank={student.currentRank}
                  rankConfig={student.rankConfig}
                  size="sm"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor Form */}
      <div className="lg:col-span-8">
        {selectedStudent ? (
          <form
            onSubmit={handleSave}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5"
          >
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3.5">
                <RankAvatar
                  fullName={selectedStudent.fullName}
                  avatarUrl={selectedStudent.avatar}
                  rank={selectedStudent.currentRank}
                  rankConfig={selectedStudent.rankConfig}
                  size="md"
                />
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {selectedStudent.fullName}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <RankBadge
                      rank={selectedStudent.currentRank}
                      rankConfig={selectedStudent.rankConfig}
                      size="sm"
                    />
                    <span className="text-xs text-slate-500 font-semibold">
                      Chuyên cần: {Math.round(selectedStudent.attendanceRate ?? 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-primary border border-primary/30 hover:bg-primary/10 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Xuất Phiếu PDF Gửi PH
                </button>
              </div>
            </div>

            {/* Criteria Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Vocab */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                  1. Nhận xét Từ Vựng (Vocabulary)
                </label>
                <textarea
                  rows={2}
                  value={vocabulary}
                  onChange={(e) => setVocabulary(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="Nhận xét vốn từ và khả năng vận dụng..."
                />
              </div>

              {/* 2. Grammar */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  2. Nhận xét Ngữ Pháp (Grammar)
                </label>
                <textarea
                  rows={2}
                  value={grammar}
                  onChange={(e) => setGrammar(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="Nhận xét độ chuẩn xác ngữ pháp..."
                />
              </div>

              {/* 3. Speaking */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <Mic className="w-3.5 h-3.5 text-purple-500" />
                  3. Phát Âm & Kỹ Năng Nói (Speaking)
                </label>
                <textarea
                  rows={2}
                  value={speaking}
                  onChange={(e) => setSpeaking(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="Nhận xét phát âm, ngữ điệu và phản xạ..."
                />
              </div>

              {/* 4. Attitude */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <Smile className="w-3.5 h-3.5 text-amber-500" />
                  4. Thái Độ & Chuyên Cần (Attitude)
                </label>
                <textarea
                  rows={2}
                  value={attitude}
                  onChange={(e) => setAttitude(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="Nhận xét tính chuyên cần, bài tập về nhà..."
                />
              </div>
            </div>

            {/* 5. General Comment */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Lời Phê Chung Của Giáo Viên (Gửi Phụ Huynh)
              </label>
              <textarea
                rows={3}
                value={generalComment}
                onChange={(e) => setGeneralComment(e.target.value)}
                required
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Lời phê tổng kết, động viên và định hướng gửi tới phụ huynh..."
              />
            </div>

            {/* Submit Bar */}
            <div className="flex items-center justify-end gap-3 pt-3">
              {savedSuccess && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-fade-in">
                  <Check className="w-4 h-4" />
                  Đã lưu nhận xét thành công!
                </span>
              )}

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Đang Lưu...' : 'Lưu Nhận Xét Học Sinh'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            Vui lòng chọn một học sinh để nhập nhận xét
          </div>
        )}
      </div>
    </div>
  );
};

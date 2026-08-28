'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  StudentWithStats,
  ClassItem,
  StudentRank,
  RankConfigItem,
} from '@/types';
import { RankAvatar } from '@/components/gamification/rank-avatar';
import { RankBadge } from '@/components/gamification/rank-badge';
import { PointActionModal } from '@/components/gamification/point-action-modal';
import { PromotionModal } from '@/components/gamification/promotion-modal';
import { DemotionToast } from '@/components/gamification/demotion-toast';
import { StudentImportWizard } from '@/components/excel/student-import-wizard';
import { StudentFormDialog } from '@/components/students/student-form-dialog';
import { StudentActionMenu } from '@/components/students/student-action-menu';
import { DeleteStudentConfirmModal } from '@/components/students/delete-student-confirm-modal';
import { TransferStudentModal } from '@/components/students/transfer-student-modal';
import { StudentBatchToolbar } from '@/components/students/student-batch-toolbar';
import { useGamification } from '@/hooks/use-gamification';
import {
  Users,
  CheckSquare,
  Trophy,
  Projector,
  FileSpreadsheet,
  Upload,
  Plus,
  Minus,
  Search,
  Sparkles,
  Phone,
  MessageSquare,
  Shield,
  Palette,
  Clock,
  CheckCircle2,
  Check,
  RotateCcw,
} from 'lucide-react';

export default function ClassDashboardPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = use(params);

  const [classData, setClassData] = useState<ClassItem | null>(null);
  const [students, setStudents] = useState<StudentWithStats[]>([]);
  const [rankConfigs, setRankConfigs] = useState<RankConfigItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRankFilter, setSelectedRankFilter] = useState<string>('ALL');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<string>('ALL');

  // Checkbox multi-selection
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Modals state
  const [scoringStudent, setScoringStudent] = useState<StudentWithStats | null>(null);
  const [scoringMode, setScoringMode] = useState<'ADD' | 'DEDUCT'>('ADD');
  const [showImportWizard, setShowImportWizard] = useState(false);

  // Student Form (Add / Edit)
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentWithStats | null>(null);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<StudentWithStats | null>(null);
  const [isBatchDelete, setIsBatchDelete] = useState(false);

  // Transfer modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTargetIds, setTransferTargetIds] = useState<string[]>([]);

  const {
    activePromotion,
    activeDemotion,
    processPointChange,
    closePromotionModal,
    closeDemotionToast,
  } = useGamification(rankConfigs);

  const fetchClassDetails = async () => {
    try {
      const res = await fetch(`/api/classes/${classId}`);
      if (res.ok) {
        const data = await res.json();
        setClassData(data);
        setStudents(data.students || []);
        setRankConfigs(data.rankConfigs || []);
      }
    } catch (err) {
      console.error('Failed to load class:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassDetails();
  }, [classId]);

  // Scoring
  const handleOpenScoring = (student: StudentWithStats, mode: 'ADD' | 'DEDUCT') => {
    setScoringStudent(student);
    setScoringMode(mode);
  };

  const handleApplyPoints = async (
    student: StudentWithStats,
    pointsChanged: number,
    reason: string
  ) => {
    const { newPoints, transition } = processPointChange(
      student,
      pointsChanged,
      reason
    );

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== student.id) return s;
        return {
          ...s,
          totalPoints: newPoints,
          currentRank: transition.newRank,
          rankConfig: transition.newConfig,
        };
      })
    );

    try {
      await fetch(`/api/classes/${classId}/points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          pointsChanged,
          reason,
        }),
      });
    } catch (err) {
      console.error('Failed to persist point change:', err);
    }
  };

  // Single Student Actions
  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setShowStudentForm(true);
  };

  const handleOpenEditStudent = (student: StudentWithStats) => {
    setEditingStudent(student);
    setShowStudentForm(true);
  };

  const handleOpenSingleDelete = (student: StudentWithStats) => {
    setDeletingStudent(student);
    setIsBatchDelete(false);
    setShowDeleteModal(true);
  };

  const handleOpenSingleTransfer = (student: StudentWithStats) => {
    setTransferTargetIds([student.id]);
    setShowTransferModal(true);
  };

  const handleResetStudentPoints = async (student: StudentWithStats) => {
    if (!confirm(`Đặt lại điểm thi đua của em ${student.fullName} về 0 (Dân) cho chu kỳ mới?`)) return;

    try {
      const res = await fetch(`/api/classes/${classId}/students/${student.id}/reset-points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        await fetchClassDetails();
      }
    } catch (err) {
      console.error('Reset points failed:', err);
    }
  };

  // Batch Operations
  const handleToggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedStudentIds(filteredStudents.map((s) => s.id));
  };

  const handleClearSelection = () => {
    setSelectedStudentIds([]);
  };

  const handleOpenBatchDelete = () => {
    if (selectedStudentIds.length === 0) return;
    setDeletingStudent(null);
    setIsBatchDelete(true);
    setShowDeleteModal(true);
  };

  const handleExecuteDelete = async () => {
    if (isBatchDelete) {
      await fetch(`/api/classes/${classId}/students/batch-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: selectedStudentIds }),
      });
      setSelectedStudentIds([]);
    } else if (deletingStudent) {
      await fetch(`/api/classes/${classId}/students/${deletingStudent.id}`, {
        method: 'DELETE',
      });
    }
    await fetchClassDetails();
  };

  const handleOpenBatchTransfer = () => {
    if (selectedStudentIds.length === 0) return;
    setTransferTargetIds(selectedStudentIds);
    setShowTransferModal(true);
  };

  const handleBatchResetPoints = async () => {
    if (selectedStudentIds.length === 0) return;
    if (!confirm(`Đặt lại điểm thi đua của ${selectedStudentIds.length} học sinh đã chọn về 0 (Dân)?`)) return;

    try {
      const res = await fetch(`/api/classes/${classId}/students/batch-reset-points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: selectedStudentIds }),
      });
      if (res.ok) {
        setSelectedStudentIds([]);
        await fetchClassDetails();
      }
    } catch (err) {
      console.error('Batch reset points failed:', err);
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchQuery =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.parentPhone && s.parentPhone.includes(searchQuery));
    const matchRank =
      selectedRankFilter === 'ALL' || s.currentRank === selectedRankFilter;
    const matchGender =
      selectedGenderFilter === 'ALL' || ((s as any).gender || 'MALE') === selectedGenderFilter;
    return matchQuery && matchRank && matchGender;
  });

  const countByRank = {
    VUA: students.filter((s) => s.currentRank === 'VUA').length,
    QUAN: students.filter((s) => s.currentRank === 'QUAN').length,
    LINH: students.filter((s) => s.currentRank === 'LINH').length,
    DAN: students.filter((s) => s.currentRank === 'DAN').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="p-8 text-center text-slate-400">
        Không tìm thấy thông tin lớp học.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {classData.academicYear}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Sĩ số: {students.length} học sinh
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {classData.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {classData.description || 'Bảng điều khiển lớp học và chấm điểm tương tác'}
          </p>
        </div>

        {/* Quick Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href={`/classes/${classId}/attendance`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition"
          >
            <CheckSquare className="w-4 h-4" />
            Điểm Danh 1 Chạm
          </Link>

          <Link
            href={`/classes/${classId}/projector`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition"
          >
            <Projector className="w-4 h-4" />
            Máy Chiếu
          </Link>

          <button
            onClick={() => setShowImportWizard(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
          >
            <Upload className="w-4 h-4 text-emerald-500" />
            Excel Wizard
          </button>

          <button
            onClick={handleOpenAddStudent}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 transition"
          >
            <Plus className="w-4 h-4" />
            Thêm Học Sinh
          </button>
        </div>
      </div>

      {/* Gamification Tier Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <button
          onClick={() => setSelectedRankFilter(selectedRankFilter === 'VUA' ? 'ALL' : 'VUA')}
          className={`p-4 rounded-3xl border text-left transition ${
            selectedRankFilter === 'VUA'
              ? 'border-yellow-400 bg-yellow-400/10 shadow-glow-vua'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-yellow-400/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-base">👑</span>
            <span className="text-xs font-bold text-amber-500">90+ pts</span>
          </div>
          <p className="text-xs font-extrabold text-amber-400">Cấp Vua (King)</p>
          <p className="text-xl font-black text-slate-900 dark:text-white">
            {countByRank.VUA} <span className="text-xs font-medium text-slate-400">em</span>
          </p>
        </button>

        <button
          onClick={() => setSelectedRankFilter(selectedRankFilter === 'QUAN' ? 'ALL' : 'QUAN')}
          className={`p-4 rounded-3xl border text-left transition ${
            selectedRankFilter === 'QUAN'
              ? 'border-purple-400 bg-purple-400/10 shadow-glow-quan'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-400/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-base">📜</span>
            <span className="text-xs font-bold text-purple-500">60 - 89 pts</span>
          </div>
          <p className="text-xs font-extrabold text-purple-400">Cấp Quan (Scholar)</p>
          <p className="text-xl font-black text-slate-900 dark:text-white">
            {countByRank.QUAN} <span className="text-xs font-medium text-slate-400">em</span>
          </p>
        </button>

        <button
          onClick={() => setSelectedRankFilter(selectedRankFilter === 'LINH' ? 'ALL' : 'LINH')}
          className={`p-4 rounded-3xl border text-left transition ${
            selectedRankFilter === 'LINH'
              ? 'border-blue-400 bg-blue-400/10 shadow-glow-linh'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-base">🛡️</span>
            <span className="text-xs font-bold text-blue-500">30 - 59 pts</span>
          </div>
          <p className="text-xs font-extrabold text-blue-400">Cấp Lính (Soldier)</p>
          <p className="text-xl font-black text-slate-900 dark:text-white">
            {countByRank.LINH} <span className="text-xs font-medium text-slate-400">em</span>
          </p>
        </button>

        <button
          onClick={() => setSelectedRankFilter(selectedRankFilter === 'DAN' ? 'ALL' : 'DAN')}
          className={`p-4 rounded-3xl border text-left transition ${
            selectedRankFilter === 'DAN'
              ? 'border-emerald-400 bg-emerald-400/10 shadow-glow-dan'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-400/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-base">🌾</span>
            <span className="text-xs font-bold text-emerald-500">0 - 29 pts</span>
          </div>
          <p className="text-xs font-extrabold text-emerald-400">Cấp Dân (Villager)</p>
          <p className="text-xl font-black text-slate-900 dark:text-white">
            {countByRank.DAN} <span className="text-xs font-medium text-slate-400">em</span>
          </p>
        </button>
      </div>

      {/* Search & Multi-Filters Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-1 items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo tên học sinh hoặc SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Gender Filter */}
          <select
            value={selectedGenderFilter}
            onChange={(e) => setSelectedGenderFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shrink-0"
          >
            <option value="ALL">Tất Cả Giới Tính</option>
            <option value="MALE">👦 Nam</option>
            <option value="FEMALE">👧 Nữ</option>
            <option value="OTHER">✨ Khác</option>
          </select>
        </div>

        {/* Selection Stats */}
        <div className="flex items-center justify-between md:justify-end gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span>
            Hiển thị: <strong>{filteredStudents.length}</strong> / {students.length}
          </span>
          <button
            onClick={selectedStudentIds.length === filteredStudents.length ? handleClearSelection : handleSelectAll}
            className="text-primary hover:underline font-bold"
          >
            {selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0
              ? 'Bỏ chọn'
              : 'Chọn tất cả'}
          </button>
        </div>
      </div>

      {/* Student Cards Grid (1-Touch Scoring & Profile Management) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 sm:gap-5">
        {filteredStudents.map((student) => {
          const isSelected = selectedStudentIds.includes(student.id);

          return (
            <div
              key={student.id}
              className={`rounded-3xl border-2 p-4 sm:p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group relative overflow-hidden @container ${
                isSelected
                  ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              {/* Top Student Header */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Multi-select Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectStudent(student.id)}
                      className="w-4 h-4 rounded text-primary accent-primary cursor-pointer shrink-0"
                    />

                    <RankAvatar
                      fullName={student.fullName}
                      avatarUrl={student.avatar}
                      rank={student.currentRank}
                      rankConfig={student.rankConfig}
                      size="lg"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                          {student.fullName}
                        </h3>
                        <span className="text-[11px]" title={student.gender === 'FEMALE' ? 'Nữ' : 'Nam'}>
                          {student.gender === 'FEMALE' ? '👧' : '👦'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1">
                        <RankBadge
                          rank={student.currentRank}
                          rankConfig={student.rankConfig}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions: Total Points + Context Menu */}
                  <div className="flex items-start gap-1 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Điểm
                      </span>
                      <p className="text-lg sm:text-xl font-black text-amber-500">
                        {student.totalPoints}
                      </p>
                    </div>

                    <StudentActionMenu
                      student={student}
                      classId={classId}
                      onEdit={handleOpenEditStudent}
                      onTransfer={handleOpenSingleTransfer}
                      onResetPoints={handleResetStudentPoints}
                      onDelete={handleOpenSingleDelete}
                    />
                  </div>
                </div>

                {/* Notes snippet */}
                {student.notes && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl mb-3 line-clamp-2 italic border border-slate-100 dark:border-slate-800">
                    🎯 {student.notes}
                  </p>
                )}

                {/* Attendance & Contact snippet */}
                <div className="space-y-1.5 py-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Chuyên cần:
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {Math.round(student.attendanceRate ?? 100)}%
                    </span>
                  </div>

                  {student.parentPhone && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-blue-500" />
                        PH ({student.parentName || 'PH'}):
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${student.parentPhone}`}
                          className="font-mono font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {student.parentPhone}
                        </a>
                        <a
                          href={`https://zalo.me/${student.parentPhone.replace(/[\s.-]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded-md hover:bg-blue-500 hover:text-white transition"
                          title="Nhắn tin qua Zalo"
                        >
                          Zalo
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 1-Touch Action Buttons: + (Bonus) and - (Deduct) */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleOpenScoring(student, 'ADD')}
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl font-extrabold text-xs bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-500/20 transition transform active:scale-95 shadow-sm touch-target-safe"
                >
                  <Plus className="w-4 h-4" />
                  Cộng Điểm (+)
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenScoring(student, 'DEDUCT')}
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl font-extrabold text-xs bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-500/20 transition transform active:scale-95 shadow-sm touch-target-safe"
                >
                  <Minus className="w-4 h-4" />
                  Trừ Điểm (-)
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Batch Action Toolbar */}
      <StudentBatchToolbar
        selectedCount={selectedStudentIds.length}
        totalCount={filteredStudents.length}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onBatchTransfer={handleOpenBatchTransfer}
        onBatchResetPoints={handleBatchResetPoints}
        onBatchDelete={handleOpenBatchDelete}
      />

      {/* Point Scoring Modal */}
      <PointActionModal
        student={scoringStudent}
        rankConfig={scoringStudent?.rankConfig}
        initialMode={scoringMode}
        isOpen={scoringStudent !== null}
        onClose={() => setScoringStudent(null)}
        onApplyPoints={handleApplyPoints}
      />

      {/* Promotion Celebration Modal */}
      <PromotionModal
        event={activePromotion}
        onClose={closePromotionModal}
      />

      {/* Demotion Toast */}
      <DemotionToast
        event={activeDemotion}
        onClose={closeDemotionToast}
      />

      {/* Excel Import Wizard */}
      <StudentImportWizard
        classId={classId}
        className={classData.name}
        isOpen={showImportWizard}
        onClose={() => setShowImportWizard(false)}
        onSuccess={fetchClassDetails}
      />

      {/* Student Form Dialog (Create / Edit) */}
      <StudentFormDialog
        classId={classId}
        isOpen={showStudentForm}
        onClose={() => {
          setShowStudentForm(false);
          setEditingStudent(null);
        }}
        onSuccess={fetchClassDetails}
        studentToEdit={editingStudent}
      />

      {/* Delete Confirmation Modal (Single & Batch) */}
      <DeleteStudentConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleExecuteDelete}
        student={deletingStudent}
        batchCount={isBatchDelete ? selectedStudentIds.length : undefined}
      />

      {/* Transfer Class Modal */}
      <TransferStudentModal
        currentClassId={classId}
        studentIds={transferTargetIds}
        studentsList={students}
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onSuccess={() => {
          setSelectedStudentIds([]);
          fetchClassDetails();
        }}
      />
    </div>
  );
}

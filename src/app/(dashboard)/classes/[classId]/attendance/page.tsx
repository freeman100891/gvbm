'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  AttendanceStatus,
  StudentWithStats,
  ClassItem,
} from '@/types';
import { RankAvatar } from '@/components/gamification/rank-avatar';
import { RankBadge } from '@/components/gamification/rank-badge';
import { useOfflineSync } from '@/hooks/use-offline-sync';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import {
  CheckSquare,
  Calendar,
  Save,
  CheckCircle2,
  Clock,
  HelpCircle,
  XCircle,
  ArrowLeft,
  Check,
  Edit2,
  Sparkles,
} from 'lucide-react';

export default function AttendancePage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = use(params);

  const [classData, setClassData] = useState<ClassItem | null>(null);
  const [students, setStudents] = useState<StudentWithStats[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: AttendanceStatus; note: string }>
  >({});
  const [editingNoteStudentId, setEditingNoteStudentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const { isOnline, enqueueMutation } = useOfflineSync();
  const { playPositiveChime } = useSoundEffects();

  const fetchClassAndAttendance = async () => {
    try {
      const res = await fetch(`/api/classes/${classId}`);
      if (res.ok) {
        const data = await res.json();
        setClassData(data);
        const stdList: StudentWithStats[] = data.students || [];
        setStudents(stdList);

        // Fetch existing attendance for selectedDate
        const attRes = await fetch(
          `/api/classes/${classId}/attendance?date=${selectedDate}`
        );
        const attData = await attRes.json();

        const map: Record<string, { status: AttendanceStatus; note: string }> = {};

        // Default all to PRESENT unless recorded
        stdList.forEach((s) => {
          map[s.id] = { status: 'PRESENT', note: '' };
        });

        if (Array.isArray(attData)) {
          attData.forEach((a: any) => {
            map[a.studentId] = {
              status: a.status as AttendanceStatus,
              note: a.note || '',
            };
          });
        }

        setAttendanceMap(map);
      }
    } catch (err) {
      console.error('Failed to load attendance:', err);
    }
  };

  useEffect(() => {
    fetchClassAndAttendance();
  }, [classId, selectedDate]);

  // 1-Touch Cycle State: PRESENT -> LATE -> EXCUSED -> UNEXCUSED -> PRESENT
  const cycleAttendance = (studentId: string) => {
    playPositiveChime();
    setAttendanceMap((prev) => {
      const current = prev[studentId]?.status || 'PRESENT';
      let next: AttendanceStatus = 'LATE';

      if (current === 'PRESENT') next = 'LATE';
      else if (current === 'LATE') next = 'EXCUSED_ABSENCE';
      else if (current === 'EXCUSED_ABSENCE') next = 'UNEXCUSED_ABSENCE';
      else if (current === 'UNEXCUSED_ABSENCE') next = 'PRESENT';

      return {
        ...prev,
        [studentId]: {
          status: next,
          note: prev[studentId]?.note || '',
        },
      };
    });
  };

  const handleMarkAllPresent = () => {
    playPositiveChime();
    setAttendanceMap((prev) => {
      const updated: Record<string, { status: AttendanceStatus; note: string }> = {};
      students.forEach((s) => {
        updated[s.id] = {
          status: 'PRESENT',
          note: prev[s.id]?.note || '',
        };
      });
      return updated;
    });
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    const records = Object.entries(attendanceMap).map(([studentId, data]) => ({
      studentId,
      status: data.status,
      note: data.note || undefined,
    }));

    try {
      if (isOnline) {
        await fetch(`/api/classes/${classId}/attendance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: selectedDate,
            records,
          }),
        });
      } else {
        // Enqueue to offline sync outbox
        await enqueueMutation('attendances', 'BATCH_ATTENDANCE', {
          classId,
          date: selectedDate,
          records,
        });
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save attendance:', err);
      alert('Không thể lưu điểm danh. Vui lòng kiểm tra lại!');
    } finally {
      setSaving(false);
    }
  };

  // Metrics
  const stats = {
    total: students.length,
    present: Object.values(attendanceMap).filter((a) => a.status === 'PRESENT').length,
    late: Object.values(attendanceMap).filter((a) => a.status === 'LATE').length,
    excused: Object.values(attendanceMap).filter((a) => a.status === 'EXCUSED_ABSENCE').length,
    unexcused: Object.values(attendanceMap).filter((a) => a.status === 'UNEXCUSED_ABSENCE').length,
  };

  const rate = stats.total > 0 ? Math.round(((stats.present + stats.late) / stats.total) * 100) : 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Date Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href={`/classes/${classId}`}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Điểm Danh 1 Chạm Thông Minh
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Lớp: {classData?.name} | Nhấp vào thẻ học sinh để chuyển đổi trạng thái
            </p>
          </div>
        </div>

        {/* Date Selector & Save */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Calendar className="w-4 h-4 text-primary" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleMarkAllPresent}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition active:scale-95"
          >
            <Check className="w-4 h-4" />
            Tất Cả Có Mặt
          </button>

          <button
            onClick={handleSaveAttendance}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 rounded-2xl font-bold text-xs text-white bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Đang Lưu...' : savedSuccess ? 'Đã Lưu Xong!' : 'Lưu Điểm Danh'}
          </button>
        </div>
      </div>

      {/* Real-time Attendance Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500 text-white">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
              Có Mặt (P)
            </span>
            <p className="text-xl font-black text-emerald-900 dark:text-emerald-200">
              {stats.present} / {stats.total}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500 text-white">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
              Đi Trễ (L)
            </span>
            <p className="text-xl font-black text-amber-900 dark:text-amber-200">
              {stats.late}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-500 text-white">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400">
              Có Phép (E)
            </span>
            <p className="text-xl font-black text-blue-900 dark:text-blue-200">
              {stats.excused}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-500 text-white">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400">
              Không Phép (A)
            </span>
            <p className="text-xl font-black text-rose-900 dark:text-rose-200">
              {stats.unexcused}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="p-2.5 rounded-2xl bg-indigo-600 text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
              Tỷ Lệ Hiện Diện
            </span>
            <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">
              {rate}%
            </p>
          </div>
        </div>
      </div>

      {/* 1-Touch Student Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {students.map((student) => {
          const current = attendanceMap[student.id] || { status: 'PRESENT', note: '' };

          // Visual styles by status
          const statusConfig = {
            PRESENT: {
              label: 'Có Mặt',
              color: 'border-emerald-500/60 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
              badge: 'bg-emerald-500 text-white',
              icon: CheckCircle2,
            },
            LATE: {
              label: 'Đi Trễ',
              color: 'border-amber-500/60 bg-amber-50/70 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
              badge: 'bg-amber-500 text-slate-950',
              icon: Clock,
            },
            EXCUSED_ABSENCE: {
              label: 'Có Phép',
              color: 'border-blue-500/60 bg-blue-50/70 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
              badge: 'bg-blue-500 text-white',
              icon: HelpCircle,
            },
            UNEXCUSED_ABSENCE: {
              label: 'Không Phép',
              color: 'border-rose-500/60 bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300',
              badge: 'bg-rose-500 text-white',
              icon: XCircle,
            },
          }[current.status];

          const Icon = statusConfig.icon;

          return (
            <div
              key={student.id}
              onClick={() => cycleAttendance(student.id)}
              className={`rounded-3xl border-2 p-4 cursor-pointer select-none transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm flex flex-col justify-between ${statusConfig.color}`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <RankAvatar
                    fullName={student.fullName}
                    avatarUrl={student.avatar}
                    rank={student.currentRank}
                    rankConfig={student.rankConfig}
                    size="sm"
                    showGlow={false}
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {student.fullName}
                    </h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {student.totalPoints} pts
                    </span>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-sm ${statusConfig.badge}`}
                >
                  <Icon className="w-3 h-3" />
                  {statusConfig.label}
                </span>
              </div>

              {/* Note / Reason inline */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingNoteStudentId(
                    editingNoteStudentId === student.id ? null : student.id
                  );
                }}
                className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
              >
                <span className="truncate italic">
                  {current.note ? `📝 ${current.note}` : '+ Thêm ghi chú lý do'}
                </span>
                <Edit2 className="w-3 h-3 shrink-0 ml-1 opacity-60" />
              </div>

              {/* Note Edit Input Popup */}
              {editingNoteStudentId === student.id && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2 pt-2 border-t border-black/10 dark:border-white/10"
                >
                  <input
                    type="text"
                    autoFocus
                    value={current.note}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAttendanceMap((prev) => ({
                        ...prev,
                        [student.id]: {
                          ...prev[student.id],
                          note: val,
                        },
                      }));
                    }}
                    onBlur={() => setEditingNoteStudentId(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setEditingNoteStudentId(null);
                    }}
                    placeholder="Nhập lý do vắng / trễ..."
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

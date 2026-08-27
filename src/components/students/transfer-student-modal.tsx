'use client';

import React, { useState, useEffect } from 'react';
import { StudentWithStats, ClassItem } from '@/types';
import { ArrowRightLeft, Check, X, GraduationCap, AlertCircle } from 'lucide-react';

interface TransferStudentModalProps {
  currentClassId: string;
  studentIds: string[];
  studentsList: StudentWithStats[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TransferStudentModal: React.FC<TransferStudentModalProps> = ({
  currentClassId,
  studentIds,
  studentsList,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [targetClassId, setTargetClassId] = useState<string>('');
  const [keepPointHistory, setKeepPointHistory] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/classes')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            // Filter out current class
            const otherClasses = data.filter((c) => c.id !== currentClassId);
            setClasses(otherClasses);
            if (otherClasses.length > 0) {
              setTargetClassId(otherClasses[0].id);
            }
          }
        })
        .catch((err) => console.error('Failed to load classes for transfer:', err));
    }
  }, [isOpen, currentClassId]);

  if (!isOpen) return null;

  const selectedStudents = studentsList.filter((s) => studentIds.includes(s.id));

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetClassId) {
      setErrorMsg('Vui lòng chọn lớp học đích!');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/classes/${currentClassId}/students/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIds,
          sourceClassId: currentClassId,
          targetClassId,
          keepPointHistory,
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Có lỗi xảy ra khi chuyển lớp!');
      }
    } catch (err) {
      console.error('Transfer failed:', err);
      setErrorMsg('Không thể kết nối đến máy chủ. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Chuyển Lớp Học Sinh
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chuyển {selectedStudents.length} học sinh sang lớp học mới
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleTransferSubmit} className="space-y-4">
          {/* Selected Students Preview */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Học Sinh Được Chọn ({selectedStudents.length}):
            </label>
            <div className="max-h-32 overflow-y-auto p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
              {selectedStudents.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between text-xs text-slate-800 dark:text-slate-200"
                >
                  <span className="font-semibold">{s.fullName}</span>
                  <span className="text-[11px] text-slate-400">
                    [{s.currentRank}] ({s.totalPoints} pts)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Destination Class Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Chọn Lớp Học Đích (*)
            </label>
            {classes.length === 0 ? (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
                Chưa có lớp học nào khác trong hệ thống để chuyển. Vui lòng tạo thêm lớp học mới trước!
              </div>
            ) : (
              <select
                value={targetClassId}
                onChange={(e) => setTargetClassId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    🎓 {c.name} ({c.academicYear})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Point History Policy Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={keepPointHistory}
                onChange={(e) => setKeepPointHistory(e.target.checked)}
                className="w-4 h-4 rounded text-primary accent-primary mt-0.5"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Bảo lưu điểm thi đua hiện tại
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {keepPointHistory
                    ? 'Học sinh sẽ giữ nguyên tổng điểm và cấp bậc khi sang lớp mới.'
                    : 'Điểm sẽ được đặt lại về mốc Dân (0 điểm) để bắt đầu chu kỳ thi đua mới tại lớp đích.'}
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={loading || classes.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {loading ? 'Đang Chuyển...' : 'Xác Nhận Chuyển Lớp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { StudentWithStats, ClassItem } from '@/types';
import { AdaptiveModal } from '../shared/adaptive-modal';
import { ArrowRightLeft, Check, GraduationCap, AlertCircle } from 'lucide-react';

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
          targetClassId,
          keepPointHistory,
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Chuyển lớp thất bại!');
      }
    } catch (err) {
      console.error('Transfer failed:', err);
      setErrorMsg('Không thể kết nối đến máy chủ. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdaptiveModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Chuyển Lớp Học Sinh
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chuyển {selectedStudents.length} học sinh sang lớp học mới
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
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

          {/* Target Class Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Chọn Lớp Học Đích Tiếp Nhận:
            </label>
            {classes.length === 0 ? (
              <p className="text-xs text-amber-500 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-900/50">
                ⚠️ Hiện tại chưa có lớp học nào khác. Vui lòng tạo thêm lớp học trước khi chuyển học sinh.
              </p>
            ) : (
              <div className="relative">
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full p-3.5 pr-10 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer touch-target-safe"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.academicYear})
                    </option>
                  ))}
                </select>
                <GraduationCap className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Keep Point History Option */}
          <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={keepPointHistory}
                onChange={(e) => setKeepPointHistory(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 accent-purple-600 mt-0.5"
              />
              <div>
                <span className="text-xs font-bold text-purple-900 dark:text-purple-200">
                  Bảo lưu điểm số và lịch sử thi đua
                </span>
                <p className="text-[11px] text-purple-700 dark:text-purple-300/80 mt-0.5">
                  Nếu không chọn, học sinh sẽ được chuyển sang lớp mới với 0 điểm (cấp Dân).
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
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 transition disabled:opacity-50 touch-target-safe"
            >
              <Check className="w-4 h-4" />
              {loading ? 'Đang Chuyển...' : `Chuyển ${selectedStudents.length} Học Sinh`}
            </button>
          </div>
        </form>
      </div>
    </AdaptiveModal>
  );
};

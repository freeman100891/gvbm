'use client';

import React, { useState } from 'react';
import { StudentWithStats } from '@/types';
import { RankAvatar } from '@/components/gamification/rank-avatar';
import { RankBadge } from '@/components/gamification/rank-badge';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteStudentConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  student?: StudentWithStats | null;
  batchCount?: number;
}

export const DeleteStudentConfirmModal: React.FC<DeleteStudentConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  student,
  batchCount,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const isBatch = Boolean(batchCount && batchCount > 1);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 text-center">
        {/* Warning Icon */}
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {isBatch
              ? `Xác Nhận Xóa ${batchCount} Học Sinh?`
              : 'Xác Nhận Xóa Học Sinh Khỏi Lớp?'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hành động này không thể hoàn tác sau khi xác nhận
          </p>
        </div>

        {/* Target Profile Card */}
        {student && !isBatch && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-left">
            <div className="flex items-center gap-3">
              <RankAvatar
                fullName={student.fullName}
                avatarUrl={student.avatar}
                rank={student.currentRank}
                rankConfig={student.rankConfig}
                size="md"
                showGlow={false}
              />
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {student.fullName}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <RankBadge
                    rank={student.currentRank}
                    rankConfig={student.rankConfig}
                    size="sm"
                  />
                  <span className="text-[11px] text-slate-400">
                    {student.totalPoints} pts
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="text-slate-400">Chuyên cần</span>
              <p className="font-bold text-slate-700 dark:text-slate-200">
                {Math.round(student.attendanceRate ?? 100)}%
              </p>
            </div>
          </div>
        )}

        {/* Warning Callout */}
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs text-left leading-relaxed">
          ⚠️ <strong>Lưu ý quan trọng:</strong> Toàn bộ lịch sử điểm danh, nhật ký điểm thi đua và phiếu nhận xét của {isBatch ? `${batchCount} học sinh này` : student?.fullName} sẽ bị xóa vĩnh viễn khỏi hệ thống.
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {loading ? 'Đang Xóa...' : 'Xác Nhận Xóa'}
          </button>
        </div>
      </div>
    </div>
  );
};

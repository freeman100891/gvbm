'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRightLeft,
  RotateCcw,
  Trash2,
  X,
  CheckSquare,
} from 'lucide-react';

interface StudentBatchToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBatchTransfer: () => void;
  onBatchResetPoints: () => void;
  onBatchDelete: () => void;
}

export const StudentBatchToolbar: React.FC<StudentBatchToolbarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onBatchTransfer,
  onBatchResetPoints,
  onBatchDelete,
}) => {
  if (selectedCount === 0) return null;

  const isAllSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <AnimatePresence>
      <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[94%] sm:w-auto pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex flex-wrap items-center justify-between gap-2.5 p-3 sm:px-5 sm:py-3.5 rounded-3xl bg-slate-900/95 dark:bg-slate-900/95 border border-slate-700 shadow-2xl text-white backdrop-blur-xl"
        >
          {/* Left Selection Info */}
          <div className="flex items-center gap-2.5 pr-2 border-r border-slate-700">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary font-black text-xs text-white shadow-md">
              {selectedCount}
            </span>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-white leading-tight">
                Đã chọn {selectedCount} học sinh
              </p>
              <button
                type="button"
                onClick={isAllSelected ? onClearSelection : onSelectAll}
                className="text-[10px] text-primary hover:underline font-semibold"
              >
                {isAllSelected ? 'Bỏ chọn tất cả' : `Chọn tất cả (${totalCount})`}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Transfer */}
            <button
              type="button"
              onClick={onBatchTransfer}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 transition transform active:scale-95"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chuyển Lớp</span>
            </button>

            {/* Reset Points */}
            <button
              type="button"
              onClick={onBatchResetPoints}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 transition transform active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đặt Lại Điểm (Về Dân)</span>
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={onBatchDelete}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition transform active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xóa Đã Chọn</span>
            </button>

            {/* Clear button */}
            <button
              type="button"
              onClick={onClearSelection}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Bỏ chọn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

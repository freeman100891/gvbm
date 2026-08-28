'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { StudentWithStats, RankConfigItem } from '@/types';
import { RankAvatar } from './rank-avatar';
import { RankBadge } from './rank-badge';
import { KidButton } from '../ui/kid-button';
import { StudentActionMenu } from '../students/student-action-menu';
import { Plus, Minus, Star, Heart, CheckCircle2, Phone } from 'lucide-react';

interface KidStudentCardProps {
  student: StudentWithStats;
  classId: string;
  rankConfig?: RankConfigItem;
  isSelected?: boolean;
  onToggleSelect?: (studentId: string) => void;
  onScoreAction?: (student: StudentWithStats, mode: 'ADD' | 'DEDUCT') => void;
  onEditStudent?: (student: StudentWithStats) => void;
  onTransferStudent?: (student: StudentWithStats) => void;
  onResetPoints?: (student: StudentWithStats) => void;
  onDeleteStudent?: (student: StudentWithStats) => void;
}

export const KidStudentCard: React.FC<KidStudentCardProps> = ({
  student,
  classId,
  rankConfig,
  isSelected = false,
  onToggleSelect,
  onScoreAction,
  onEditStudent,
  onTransferStudent,
  onResetPoints,
  onDeleteStudent,
}) => {
  // Star count calculation for visual feedback (1 star per 10 points, up to 5 stars per rank tier)
  const starCount = Math.min(5, Math.max(1, Math.floor(student.totalPoints / 15) + 1));

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      className={`relative rounded-3xl border-2 p-4 sm:p-5 flex flex-col justify-between shadow-sm transition-all duration-200 @container ${
        isSelected
          ? 'border-primary bg-primary/10 dark:bg-primary/15 shadow-md ring-2 ring-primary/40'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-400/60 dark:hover:border-amber-500/40 hover:shadow-lg'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2.5 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Multi-select checkbox */}
            {onToggleSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(student.id)}
                className="w-4 h-4 rounded-md text-primary accent-primary cursor-pointer shrink-0"
              />
            )}

            <div className="relative">
              <RankAvatar
                fullName={student.fullName}
                avatarUrl={student.avatar}
                rank={student.currentRank}
                rankConfig={rankConfig || student.rankConfig}
                size="lg"
                showGlow={true}
              />
              <span className="absolute -bottom-1 -right-1 text-xs">
                {student.gender === 'FEMALE' ? '👧' : '👦'}
              </span>
            </div>

            <div className="min-w-0">
              <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white truncate">
                {student.fullName}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <RankBadge
                  rank={student.currentRank}
                  rankConfig={rankConfig || student.rankConfig}
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* Points & Context Menu */}
          <div className="flex items-start gap-1 shrink-0">
            <div className="text-right">
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-500">
                ⭐ ĐIỂM
              </span>
              <p className="text-lg sm:text-xl font-black text-amber-500 leading-none mt-0.5">
                {student.totalPoints}
              </p>
            </div>

            {onEditStudent && onTransferStudent && onResetPoints && onDeleteStudent && (
              <StudentActionMenu
                student={student}
                classId={classId}
                onEdit={onEditStudent}
                onTransfer={onTransferStudent}
                onResetPoints={onResetPoints}
                onDelete={onDeleteStudent}
              />
            )}
          </div>
        </div>

        {/* Visual Stars Bar for Kids */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 mb-2.5">
          <span className="text-[10px] font-black text-amber-700 dark:text-amber-300 uppercase">
            Sao Tích Lũy:
          </span>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: starCount }).map((_, i) => (
              <span key={i} className="text-xs animate-pop">
                ⭐
              </span>
            ))}
          </div>
        </div>

        {/* Notes snippet */}
        {student.notes && (
          <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-2xl mb-2.5 line-clamp-2 italic border border-slate-100 dark:border-slate-800">
            🎯 {student.notes}
          </p>
        )}

        {/* Attendance snippet */}
        <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Chuyên cần:
          </span>
          <span className="font-black text-slate-700 dark:text-slate-200">
            {Math.round(student.attendanceRate ?? 100)}%
          </span>
        </div>
      </div>

      {/* Chunky 3D Kid Action Buttons: + (Bonus) and - (Deduct) */}
      {onScoreAction && (
        <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <KidButton
            variant="success"
            size="sm"
            onClick={() => onScoreAction(student, 'ADD')}
            className="w-full justify-center"
          >
            <Plus className="w-4 h-4" />
            Thưởng Điểm 🌟
          </KidButton>

          <KidButton
            variant="danger"
            size="sm"
            onClick={() => onScoreAction(student, 'DEDUCT')}
            className="w-full justify-center"
          >
            <Minus className="w-4 h-4" />
            Nhắc Nhở 🎈
          </KidButton>
        </div>
      )}
    </motion.div>
  );
};

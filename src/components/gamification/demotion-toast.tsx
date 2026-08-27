'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DemotionEvent } from '@/hooks/use-gamification';
import { RankAvatar } from './rank-avatar';
import { RankBadge } from './rank-badge';
import { X, ArrowDownRight, Compass } from 'lucide-react';

interface DemotionToastProps {
  event: DemotionEvent | null;
  onClose: () => void;
}

export const DemotionToast: React.FC<DemotionToastProps> = ({
  event,
  onClose,
}) => {
  useEffect(() => {
    if (event) {
      const timer = setTimeout(() => {
        onClose();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [event, onClose]);

  if (!event) return null;

  const { student, oldRank, newRank, quote, config } = event;

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 right-6 z-50 max-w-md w-full pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl p-4.5 text-white backdrop-blur-md"
        >
          {/* Subtle accent bar */}
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-blue-500" />

          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-slate-400 hover:text-white transition p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5 pl-2">
            <RankAvatar
              fullName={student.fullName}
              avatarUrl={student.avatar}
              rank={newRank}
              rankConfig={config}
              size="md"
              showGlow={false}
            />

            <div className="flex-1 pr-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-white">
                  {student.fullName}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                  <ArrowDownRight className="w-3 h-3 text-blue-400" />
                  Chuyển cấp
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300 mb-2">
                <span>{oldRank}</span>
                <span className="text-slate-500">➔</span>
                <RankBadge rank={newRank} rankConfig={config} size="sm" />
                <span className="text-slate-400">({student.totalPoints} pts)</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-blue-300 bg-blue-950/50 border border-blue-800/40 px-2.5 py-1.5 rounded-lg">
                <Compass className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <p className="italic font-medium">{quote}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

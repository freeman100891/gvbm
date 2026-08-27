'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { PromotionEvent } from '@/hooks/use-gamification';
import { RankAvatar } from './rank-avatar';
import { RankBadge } from './rank-badge';
import { Sparkles, Trophy, X } from 'lucide-react';

interface PromotionModalProps {
  event: PromotionEvent | null;
  onClose: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  event,
  onClose,
}) => {
  useEffect(() => {
    if (event) {
      // Trigger canvas-confetti fireworks
      const end = Date.now() + 3000;
      const colors = ['#eab308', '#3b82f6', '#a855f7', '#10b981', '#f43f5e'];

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [event]);

  if (!event) return null;

  const { student, oldRank, newRank, config } = event;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: 1,
            scale: [0.5, 1.15, 1.0],
            transition: { duration: 0.6, times: [0, 0.7, 1], ease: 'easeOut' },
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 p-8 text-center text-white shadow-2xl border-2"
          style={{ borderColor: config.frameColor }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Background aura lights */}
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ backgroundColor: config.frameColor }}
          />

          {/* Header Title */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-7 h-7 text-yellow-400 animate-spin-slow" />
            <span className="text-xs uppercase tracking-widest font-bold text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/30">
              Rank Promotion 🎉
            </span>
            <Sparkles className="w-7 h-7 text-yellow-400 animate-spin-slow" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 bg-clip-text text-transparent mb-1">
            VINH DANH THĂNG CẤP!
          </h2>
          <p className="text-slate-300 text-sm mb-6">
            Chúc mừng học sinh đã đạt được cột mốc thi đua xuất sắc
          </p>

          {/* 360-degree rotating emblem with avatar */}
          <div className="relative my-6 flex justify-center items-center">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              className="absolute w-40 h-40 rounded-full border-2 border-dashed opacity-40"
              style={{ borderColor: config.frameColor }}
            />
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <RankAvatar
                fullName={student.fullName}
                avatarUrl={student.avatar}
                rank={newRank}
                rankConfig={config}
                size="xl"
              />
            </motion.div>
          </div>

          {/* Student Name */}
          <h3 className="text-2xl font-bold text-white mb-2">
            {student.fullName}
          </h3>

          {/* Rank Transition Card */}
          <div className="flex items-center justify-center gap-4 my-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Cấp trước</p>
              <RankBadge rank={oldRank} size="sm" />
            </div>

            <span className="text-2xl font-bold text-amber-400">➔</span>

            <div className="text-center">
              <p className="text-xs text-amber-300 font-semibold mb-1">Cấp mới</p>
              <RankBadge rank={newRank} rankConfig={config} size="lg" />
            </div>
          </div>

          {/* Total Points */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-sm font-semibold mb-6">
            <Trophy className="w-4 h-4 text-amber-400" />
            Tổng điểm hiện tại: {student.totalPoints} pts
          </div>

          <div>
            <button
              onClick={onClose}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-slate-900 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 shadow-lg shadow-amber-500/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Tiếp Tục Giảng Dạy ✨
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

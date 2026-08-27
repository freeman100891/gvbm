'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { StudentWithStats, RankConfigItem } from '@/types';
import { RankAvatar } from '../gamification/rank-avatar';
import { RankBadge } from '../gamification/rank-badge';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import {
  X,
  Play,
  RotateCcw,
  Sparkles,
  Users,
  CheckCircle2,
  Maximize2,
  Volume2,
} from 'lucide-react';

interface RandomPickerModalProps {
  students: StudentWithStats[];
  rankConfigs?: RankConfigItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const RandomPickerModal: React.FC<RandomPickerModalProps> = ({
  students,
  rankConfigs,
  isOpen,
  onClose,
}) => {
  const { playTick, playFanfare } = useSoundEffects();

  const [onlyPresent, setOnlyPresent] = useState(true);
  const [noRepeat, setNoRepeat] = useState(true);
  const [pickedHistory, setPickedHistory] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState<StudentWithStats | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithStats | null>(null);

  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Eligible pool
  const eligibleStudents = students.filter((s) => {
    if (onlyPresent && s.attendances && s.attendances.length > 0) {
      const latest = s.attendances[0];
      if (latest.status === 'UNEXCUSED_ABSENCE' || latest.status === 'EXCUSED_ABSENCE') {
        return false;
      }
    }
    if (noRepeat && pickedHistory.includes(s.id)) {
      return false;
    }
    return true;
  });

  const startSpin = () => {
    if (eligibleStudents.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setSelectedStudent(null);

    let speed = 50; // ms
    let iterations = 0;
    const maxIterations = 35 + Math.floor(Math.random() * 15);

    const spin = () => {
      iterations++;
      const randomIndex = Math.floor(Math.random() * eligibleStudents.length);
      const chosen = eligibleStudents[randomIndex];
      setCurrentCandidate(chosen);
      playTick();

      if (iterations < maxIterations) {
        if (iterations > maxIterations - 12) {
          speed += 30; // slow down smoothly
        }
        spinIntervalRef.current = setTimeout(spin, speed);
      } else {
        // Final Stop
        setIsSpinning(false);
        setSelectedStudent(chosen);
        setPickedHistory((prev) => [...prev, chosen.id]);

        // Celebration
        playFanfare();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    };

    spin();
  };

  const handleResetHistory = () => {
    setPickedHistory([]);
    setSelectedStudent(null);
    setCurrentCandidate(null);
  };

  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) clearTimeout(spinIntervalRef.current);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-lg">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col text-white">
        {/* Top bar */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Vòng Quay Gọi Tên Ngẫu Nhiên
              </h2>
              <p className="text-xs text-slate-400">
                Chế độ máy chiếu tương tác lớp học tiếng Anh
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Options & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 bg-slate-800/40 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyPresent}
                onChange={(e) => setOnlyPresent(e.target.checked)}
                className="w-4 h-4 rounded text-primary accent-primary"
              />
              <span className="text-slate-300 font-medium">
                Chỉ quay học sinh có mặt
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={noRepeat}
                onChange={(e) => setNoRepeat(e.target.checked)}
                className="w-4 h-4 rounded text-primary accent-primary"
              />
              <span className="text-slate-300 font-medium">
                Không lặp lại ({pickedHistory.length}/{students.length})
              </span>
            </label>
          </div>

          {pickedHistory.length > 0 && (
            <button
              onClick={handleResetHistory}
              className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Đặt lại lượt quay
            </button>
          )}
        </div>

        {/* Roulette Screen Area */}
        <div className="p-8 sm:p-12 flex flex-col items-center justify-center min-h-[340px] text-center relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
          {/* Background Ambient Glow */}
          <div className="absolute w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          {selectedStudent ? (
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: [0.7, 1.1, 1], opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center z-10"
            >
              <div className="mb-4">
                <RankAvatar
                  fullName={selectedStudent.fullName}
                  avatarUrl={selectedStudent.avatar}
                  rank={selectedStudent.currentRank}
                  rankConfig={selectedStudent.rankConfig}
                  size="xl"
                />
              </div>

              <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 mb-2">
                🌟 Xin Mời Học Sinh Trả Lời:
              </span>

              <h3 className="text-3xl sm:text-5xl font-black text-white mb-3">
                {selectedStudent.fullName}
              </h3>

              <div className="flex items-center gap-2">
                <RankBadge
                  rank={selectedStudent.currentRank}
                  rankConfig={selectedStudent.rankConfig}
                  size="md"
                />
                <span className="text-sm font-bold text-amber-300">
                  {selectedStudent.totalPoints} pts
                </span>
              </div>
            </motion.div>
          ) : currentCandidate ? (
            <div className="flex flex-col items-center z-10">
              <div className="mb-4 transform scale-95">
                <RankAvatar
                  fullName={currentCandidate.fullName}
                  avatarUrl={currentCandidate.avatar}
                  rank={currentCandidate.currentRank}
                  rankConfig={currentCandidate.rankConfig}
                  size="xl"
                  showGlow={false}
                />
              </div>

              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-300 mb-2">
                {currentCandidate.fullName}
              </h3>

              <RankBadge
                rank={currentCandidate.currentRank}
                rankConfig={currentCandidate.rankConfig}
                size="sm"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center text-slate-400 z-10">
              <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-slate-500">
                <Users className="w-10 h-10" />
              </div>
              <p className="text-lg font-bold text-slate-200">
                Sẵn sàng quay tên ngẫu nhiên
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {eligibleStudents.length} học sinh đủ điều kiện trong danh sách
              </p>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="p-6 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-4">
          <button
            onClick={startSpin}
            disabled={isSpinning || eligibleStudents.length === 0}
            className="flex items-center justify-center gap-3 px-10 py-4 rounded-2xl font-black text-lg text-slate-900 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 shadow-xl shadow-amber-500/20 transition transform active:scale-95 disabled:opacity-40"
          >
            <Play className="w-5 h-5 fill-slate-900" />
            {isSpinning ? 'Đang Quay...' : 'QUAY TÊN NGẪU NHIÊN 🎲'}
          </button>
        </div>
      </div>
    </div>
  );
};

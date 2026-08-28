'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { StudentWithStats, RankConfigItem, StudentRank } from '@/types';
import { RankAvatar } from '../gamification/rank-avatar';
import { RankBadge } from '../gamification/rank-badge';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import { checkRankTransition, calculateStudentRank } from '@/lib/gamification-engine';
import {
  X,
  Play,
  RotateCcw,
  Sparkles,
  Users,
  CheckCircle2,
  Trophy,
  Plus,
  Minus,
  Check,
  ChevronRight,
  HelpCircle,
  Volume2,
  Award,
} from 'lucide-react';

interface QuickPointOption {
  label: string;
  points: number;
  reason: string;
  hotkey: string;
  variant: 'positive' | 'negative';
  icon: string;
}

const QUICK_POINT_PRESETS: QuickPointOption[] = [
  {
    label: '+1 Từ vựng',
    points: 1,
    reason: 'Correct Vocabulary',
    hotkey: '1',
    variant: 'positive',
    icon: '📖',
  },
  {
    label: '+2 Phát âm / Nói',
    points: 2,
    reason: 'Good Speaking & Pronunciation',
    hotkey: '2',
    variant: 'positive',
    icon: '🎤',
  },
  {
    label: '+5 Xuất sắc',
    points: 5,
    reason: 'Outstanding Answer / Challenge',
    hotkey: '3',
    variant: 'positive',
    icon: '⭐',
  },
  {
    label: '-1 Tiếng Việt',
    points: -1,
    reason: 'Used Vietnamese (No-VN Rule)',
    hotkey: '-',
    variant: 'negative',
    icon: '⚠️',
  },
  {
    label: '-1 Thiếu tập trung',
    points: -1,
    reason: 'Distracted / Unprepared',
    hotkey: '0',
    variant: 'negative',
    icon: '⏳',
  },
];

interface RandomPickerModalProps {
  classId?: string;
  students: StudentWithStats[];
  rankConfigs?: RankConfigItem[];
  isOpen: boolean;
  onClose: () => void;
  onPointAwarded?: (
    studentId: string,
    pointsChanged: number,
    newTotal: number,
    newRank: StudentRank,
    newConfig: RankConfigItem
  ) => void;
}

export const RandomPickerModal: React.FC<RandomPickerModalProps> = ({
  classId,
  students,
  rankConfigs,
  isOpen,
  onClose,
  onPointAwarded,
}) => {
  const { playTick, playFanfare, playPositiveChime, playDeductTone } =
    useSoundEffects();

  const [onlyPresent, setOnlyPresent] = useState(true);
  const [noRepeat, setNoRepeat] = useState(true);
  const [pickedHistory, setPickedHistory] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentCandidate, setCurrentCandidate] =
    useState<StudentWithStats | null>(null);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentWithStats | null>(null);

  // In-modal point feedback state
  const [lastScoredInfo, setLastScoredInfo] = useState<{
    points: number;
    reason: string;
  } | null>(null);
  const [inModalPromotion, setInModalPromotion] = useState<{
    oldRank: StudentRank;
    newRank: StudentRank;
    config: RankConfigItem;
  } | null>(null);

  // Custom Point Popup inside picker
  const [showCustomPoints, setShowCustomPoints] = useState(false);
  const [customPointsInput, setCustomPointsInput] = useState('1');
  const [customReasonInput, setCustomReasonInput] = useState('');
  const [highContrast, setHighContrast] = useState(false);

  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Filter eligible pool
  const eligibleStudents = students.filter((s) => {
    if (onlyPresent && s.attendances && s.attendances.length > 0) {
      const latest = s.attendances[0];
      if (
        latest.status === 'UNEXCUSED_ABSENCE' ||
        latest.status === 'EXCUSED_ABSENCE'
      ) {
        return false;
      }
    }
    if (noRepeat && pickedHistory.includes(s.id)) {
      return false;
    }
    return true;
  });

  const startSpin = useCallback(() => {
    if (eligibleStudents.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setSelectedStudent(null);
    setLastScoredInfo(null);
    setInModalPromotion(null);
    setShowCustomPoints(false);

    let speed = 50; // ms
    let iterations = 0;
    const maxIterations = 32 + Math.floor(Math.random() * 14);

    const spin = () => {
      iterations++;
      const randomIndex = Math.floor(Math.random() * eligibleStudents.length);
      const chosen = eligibleStudents[randomIndex];
      setCurrentCandidate(chosen);
      playTick();

      if (iterations < maxIterations) {
        if (iterations > maxIterations - 12) {
          speed += 28; // slow down smoothly
        }
        spinIntervalRef.current = setTimeout(spin, speed);
      } else {
        // Final Stop
        setIsSpinning(false);
        setSelectedStudent(chosen);
        setPickedHistory((prev) =>
          prev.includes(chosen.id) ? prev : [...prev, chosen.id]
        );

        // Celebration Fanfare & Confetti
        playFanfare();
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    };

    spin();
  }, [eligibleStudents, isSpinning, playFanfare, playTick]);

  // Apply Quick Points
  const handleApplyQuickPoints = async (points: number, reason: string) => {
    if (!selectedStudent) return;

    const oldPoints = selectedStudent.totalPoints;
    const newPoints = oldPoints + points;

    const transition = checkRankTransition(oldPoints, newPoints, rankConfigs);

    // Audio & Confetti
    if (points > 0) {
      playPositiveChime();
    } else {
      playDeductTone();
    }

    if (transition.type === 'PROMOTION') {
      playFanfare();
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
      });
      setInModalPromotion({
        oldRank: transition.oldRank,
        newRank: transition.newRank,
        config: transition.newConfig,
      });
    }

    // Update state inside modal
    const updatedStudent: StudentWithStats = {
      ...selectedStudent,
      totalPoints: newPoints,
      currentRank: transition.newRank,
      rankConfig: transition.newConfig,
    };
    setSelectedStudent(updatedStudent);
    setLastScoredInfo({ points, reason });

    // Notify parent & persist to database
    onPointAwarded?.(
      selectedStudent.id,
      points,
      newPoints,
      transition.newRank,
      transition.newConfig
    );

    if (classId) {
      try {
        await fetch(`/api/classes/${classId}/points`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: selectedStudent.id,
            pointsChanged: points,
            reason,
          }),
        });
      } catch (err) {
        console.error('Failed to save in-picker point log:', err);
      }
    }
  };

  const handleCustomPointSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pts = parseInt(customPointsInput, 10);
    if (isNaN(pts) || pts === 0) return;
    const reason = customReasonInput.trim() || 'Chấm điểm trực tiếp tại máy chiếu';
    handleApplyQuickPoints(pts, reason);
    setShowCustomPoints(false);
    setCustomReasonInput('');
  };

  const handleResetHistory = () => {
    setPickedHistory([]);
    setSelectedStudent(null);
    setCurrentCandidate(null);
    setLastScoredInfo(null);
    setInModalPromotion(null);
  };

  // Keyboard Hotkeys listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing inside an input/textarea, ignore hotkeys
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (!isSpinning) {
          startSpin();
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedStudent && !isSpinning) {
          startSpin();
        }
        return;
      }

      // Quick Scoring Hotkeys when a student is selected
      if (selectedStudent && !isSpinning) {
        if (e.key === '1') {
          e.preventDefault();
          handleApplyQuickPoints(1, 'Correct Vocabulary');
        } else if (e.key === '2') {
          e.preventDefault();
          handleApplyQuickPoints(2, 'Good Speaking & Pronunciation');
        } else if (e.key === '3') {
          e.preventDefault();
          handleApplyQuickPoints(5, 'Outstanding Answer');
        } else if (e.key === '-' || e.key === '_') {
          e.preventDefault();
          handleApplyQuickPoints(-1, 'Used Vietnamese (No-VN Rule)');
        } else if (e.key === '0' || e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          handleApplyQuickPoints(-1, 'Distracted / Unprepared');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSpinning, selectedStudent, startSpin, onClose]);

  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) clearTimeout(spinIntervalRef.current);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
      <div
        className={`relative w-full max-w-4xl overflow-hidden rounded-3xl border shadow-2xl flex flex-col text-white transition-colors ${
          highContrast
            ? 'bg-black border-white text-white shadow-none'
            : 'bg-slate-900 border-slate-700/80'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-md shadow-amber-500/10">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white">
                  Vòng Quay Gọi Tên Ngẫu Nhiên
                </h2>
                <span className="hidden sm:inline text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-amber-400 text-slate-950">
                  Quick Score
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Chế độ máy chiếu tương tác & Chấm điểm 1 chạm liền mạch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* High Contrast Toggle for sunlit classrooms */}
            <button
              type="button"
              onClick={() => setHighContrast(!highContrast)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                highContrast
                  ? 'bg-yellow-400 text-black font-black'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Bật độ tương phản cao chống chói đèn phòng học"
            >
              <span>{highContrast ? '☀️ Chống lóa: BẬT' : '☀️ Chống lóa'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Đóng (Esc)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Options & Filters Bar */}
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
                Không gọi lặp lại ({pickedHistory.length}/{students.length})
              </span>
            </label>
          </div>

          {pickedHistory.length > 0 && (
            <button
              onClick={handleResetHistory}
              className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Đặt lại lượt quay
            </button>
          )}
        </div>

        {/* Main Stage Area */}
        <div className="p-6 sm:p-10 flex flex-col items-center justify-center min-h-[380px] text-center relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
          {/* Ambient Glow */}
          <div className="absolute w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          {selectedStudent ? (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex flex-col items-center z-10 w-full max-w-2xl space-y-4"
            >
              {/* Promotion Banner inside modal if triggered */}
              {inModalPromotion && (
                <motion.div
                  initial={{ scale: 0.8, y: -10 }}
                  animate={{ scale: 1, y: 0 }}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-400/20"
                >
                  <Trophy className="w-4 h-4" />
                  <span>
                    🎉 CHÚC MỪNG {selectedStudent.fullName.toUpperCase()} ĐÃ THĂNG CẤP{' '}
                    {inModalPromotion.config.displayName.toUpperCase()}!
                  </span>
                </motion.div>
              )}

              {/* Avatar & Rank Aura */}
              <div className="relative">
                <RankAvatar
                  fullName={selectedStudent.fullName}
                  avatarUrl={selectedStudent.avatar}
                  rank={selectedStudent.currentRank}
                  rankConfig={selectedStudent.rankConfig}
                  size="xl"
                  showGlow={true}
                />
              </div>

              {/* Title & Name */}
              <div>
                <span className="text-xs uppercase font-black tracking-widest text-amber-400 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20 inline-block mb-2">
                  🌟 Xin Mời Học Sinh Trả Lời:
                </span>
                <h3 className="text-fluid-winner font-black text-white tracking-tight leading-tight">
                  {selectedStudent.fullName}
                </h3>
              </div>

              {/* Badges & Score */}
              <div className="flex items-center gap-3">
                <RankBadge
                  rank={selectedStudent.currentRank}
                  rankConfig={selectedStudent.rankConfig}
                  size="md"
                />
                <div className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-amber-300 font-extrabold text-sm sm:text-base flex items-center gap-1.5 shadow-inner">
                  <span>{selectedStudent.totalPoints}</span>
                  <span className="text-xs text-slate-400">điểm</span>
                </div>
              </div>

              {/* Last Scored Feedback Toast */}
              {lastScoredInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black shadow-md ${
                    lastScoredInfo.points > 0
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {lastScoredInfo.points > 0 ? '+' : ''}
                    {lastScoredInfo.points} pts : {lastScoredInfo.reason}
                  </span>
                </motion.div>
              )}

              {/* IN-PICKER QUICK SCORING BAR */}
              <div className="w-full pt-3 mt-2 border-t border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
                  <span>⚡ CHẤM ĐIỂM NHANH TRỰC TIẾP:</span>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    Phím tắt: [1], [2], [3], [-], [0]
                  </span>
                </div>

                {/* Quick Buttons Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {QUICK_POINT_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() =>
                        handleApplyQuickPoints(preset.points, preset.reason)
                      }
                      className={`flex flex-col items-center justify-center p-2.5 rounded-2xl font-bold transition transform active:scale-95 border ${
                        preset.variant === 'positive'
                          ? 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-300 hover:text-white border-emerald-500/30 hover:border-emerald-400 shadow-sm'
                          : 'bg-rose-500/10 hover:bg-rose-500 text-rose-300 hover:text-white border-rose-500/30 hover:border-rose-400 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span>{preset.icon}</span>
                        <span className="text-sm font-black">
                          {preset.points > 0 ? `+${preset.points}` : preset.points}
                        </span>
                      </div>
                      <span className="text-[11px] truncate w-full mt-0.5 text-center opacity-90">
                        {preset.label.split(' ')[1] || preset.label}
                      </span>
                      <span className="text-[9px] font-mono opacity-60 mt-0.5">
                        [{preset.hotkey}]
                      </span>
                    </button>
                  ))}

                  {/* Custom Points Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowCustomPoints(!showCustomPoints)}
                    className="flex flex-col items-center justify-center p-2.5 rounded-2xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                    title="Điểm số tùy chỉnh"
                  >
                    <span className="text-base">✍️</span>
                    <span className="text-[11px] mt-0.5">Tùy chọn</span>
                    <span className="text-[9px] font-mono opacity-60">Khác</span>
                  </button>
                </div>

                {/* Inline Custom Points Form */}
                {showCustomPoints && (
                  <form
                    onSubmit={handleCustomPointSubmit}
                    className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-slate-800/80 border border-slate-700 animate-fade-in"
                  >
                    <input
                      type="number"
                      value={customPointsInput}
                      onChange={(e) => setCustomPointsInput(e.target.value)}
                      placeholder="+/- Điểm"
                      className="w-20 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-600 text-white font-bold text-center text-xs"
                      required
                    />
                    <input
                      type="text"
                      value={customReasonInput}
                      onChange={(e) => setCustomReasonInput(e.target.value)}
                      placeholder="Lý do cộng/trừ điểm..."
                      className="flex-1 min-w-[160px] px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-600 text-white text-xs"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl font-bold text-xs bg-primary hover:bg-primary/90 text-white shadow-md transition"
                    >
                      Lưu Điểm
                    </button>
                  </form>
                )}
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
              <div className="w-20 h-20 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-4 text-slate-400 shadow-inner">
                <Users className="w-10 h-10" />
              </div>
              <p className="text-xl font-bold text-slate-200">
                Sẵn sàng quay tên ngẫu nhiên
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {eligibleStudents.length} học sinh đủ điều kiện trong danh sách
              </p>
              <p className="text-[11px] text-amber-400/80 mt-3 font-mono">
                💡 Bấm phím [Space] trên bàn phím để quay nhanh
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="px-2 py-1 rounded-lg bg-slate-800 font-mono text-[10px] text-slate-300">
              Space: Quay / Dừng
            </span>
            <span className="px-2 py-1 rounded-lg bg-slate-800 font-mono text-[10px] text-slate-300">
              Enter: Quay tiếp
            </span>
            <span className="px-2 py-1 rounded-lg bg-slate-800 font-mono text-[10px] text-slate-300">
              Esc: Đóng
            </span>
          </div>

          <div className="flex items-center gap-3">
            {selectedStudent && (
              <button
                type="button"
                onClick={startSpin}
                disabled={isSpinning || eligibleStudents.length === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-400/20 transition transform active:scale-95 disabled:opacity-40"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Quay Tiếp 🔄</span>
              </button>
            )}

            {!selectedStudent && (
              <button
                type="button"
                onClick={startSpin}
                disabled={isSpinning || eligibleStudents.length === 0}
                className="flex items-center gap-3 px-8 py-3.5 rounded-2xl font-black text-base text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 shadow-xl shadow-amber-500/20 transition transform active:scale-95 disabled:opacity-40"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>{isSpinning ? 'Đang Quay...' : 'QUAY TÊN NGẪU NHIÊN 🎲'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Đóng (Esc)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

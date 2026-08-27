'use client';

import React, { useState } from 'react';
import { StudentWithStats, RankConfigItem } from '@/types';
import { POINT_CRITERIA_PRESETS } from '@/lib/gamification-engine';
import { RankAvatar } from './rank-avatar';
import { RankBadge } from './rank-badge';
import {
  X,
  Plus,
  Minus,
  BookOpen,
  Mic,
  CheckCircle,
  Heart,
  Flame,
  Sparkles,
  XCircle,
  MessageSquareOff,
  EyeOff,
  Clock,
} from 'lucide-react';

interface PointActionModalProps {
  student: StudentWithStats | null;
  rankConfig?: RankConfigItem;
  initialMode?: 'ADD' | 'DEDUCT';
  isOpen: boolean;
  onClose: () => void;
  onApplyPoints: (
    student: StudentWithStats,
    pointsChanged: number,
    reason: string
  ) => void;
}

export const PointActionModal: React.FC<PointActionModalProps> = ({
  student,
  rankConfig,
  initialMode = 'ADD',
  isOpen,
  onClose,
  onApplyPoints,
}) => {
  const [mode, setMode] = useState<'ADD' | 'DEDUCT'>(initialMode);
  const [customPoints, setCustomPoints] = useState<string>('1');
  const [customReason, setCustomReason] = useState<string>('');

  if (!isOpen || !student) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen className="w-4 h-4" />;
      case 'Mic':
        return <Mic className="w-4 h-4" />;
      case 'CheckCircle':
        return <CheckCircle className="w-4 h-4" />;
      case 'Heart':
        return <Heart className="w-4 h-4" />;
      case 'Flame':
        return <Flame className="w-4 h-4" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'XCircle':
        return <XCircle className="w-4 h-4" />;
      case 'MessageSquareOff':
        return <MessageSquareOff className="w-4 h-4" />;
      case 'EyeOff':
        return <EyeOff className="w-4 h-4" />;
      case 'Clock':
        return <Clock className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const filteredPresets = POINT_CRITERIA_PRESETS.filter(
    (p) => p.type === mode
  );

  const handleSelectPreset = (preset: (typeof POINT_CRITERIA_PRESETS)[0]) => {
    onApplyPoints(student, preset.points, preset.label);
    onClose();
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const pts = parseInt(customPoints, 10);
    if (isNaN(pts) || pts === 0) return;

    const multiplier = mode === 'ADD' ? 1 : -1;
    const finalPoints = Math.abs(pts) * multiplier;
    const reason = customReason.trim() || (mode === 'ADD' ? 'Cộng điểm chuyên cần' : 'Trừ điểm chuyên cần');

    onApplyPoints(student, finalPoints, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        {/* Header bar */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <RankAvatar
              fullName={student.fullName}
              avatarUrl={student.avatar}
              rank={student.currentRank}
              rankConfig={rankConfig}
              size="md"
            />
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {student.fullName}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <RankBadge
                  rank={student.currentRank}
                  rankConfig={rankConfig}
                  size="sm"
                />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {student.totalPoints} pts
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle (Cộng điểm vs Trừ điểm) */}
        <div className="p-5 pb-0">
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setMode('ADD')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                mode === 'ADD'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              Cộng Điểm Thưởng
            </button>
            <button
              onClick={() => setMode('DEDUCT')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                mode === 'DEDUCT'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Minus className="w-4 h-4" />
              Trừ Điểm Nhắc Nhở
            </button>
          </div>
        </div>

        {/* Preset list */}
        <div className="p-5 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Tiêu chí tiếng Anh chuẩn 1 chạm:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {filteredPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPreset(preset)}
                className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  mode === 'ADD'
                    ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-100/50'
                    : 'border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 hover:border-rose-400 dark:hover:border-rose-600 hover:bg-rose-100/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`p-2 rounded-xl shrink-0 ${
                      mode === 'ADD'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {getIcon(preset.icon)}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {preset.label}
                  </span>
                </div>

                <span
                  className={`text-sm font-extrabold px-2.5 py-1 rounded-xl shrink-0 ${
                    mode === 'ADD'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {preset.points > 0 ? `+${preset.points}` : preset.points}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Point Input */}
        <form
          onSubmit={handleApplyCustom}
          className="p-5 pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Hoặc nhập điểm & lý do riêng:
          </p>

          <div className="flex gap-2">
            <div className="w-24 shrink-0">
              <input
                type="number"
                min="1"
                max="50"
                value={customPoints}
                onChange={(e) => setCustomPoints(e.target.value)}
                className="w-full px-3 py-2 text-center font-bold text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Điểm"
              />
            </div>

            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Nhập lý do (VD: Giải thưởng Mini-game...)"
              className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <button
              type="submit"
              className={`px-4 py-2 rounded-xl text-sm font-bold text-white transition ${
                mode === 'ADD'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20'
              }`}
            >
              Áp Dụng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

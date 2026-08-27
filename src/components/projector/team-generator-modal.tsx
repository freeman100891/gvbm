'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { StudentWithStats, RankConfigItem } from '@/types';
import { RankAvatar } from '../gamification/rank-avatar';
import { RankBadge } from '../gamification/rank-badge';
import {
  X,
  Users2,
  Shuffle,
  Scale,
  Sparkles,
  Download,
  Copy,
  Check,
} from 'lucide-react';

interface TeamGeneratorModalProps {
  students: StudentWithStats[];
  rankConfigs?: RankConfigItem[];
  isOpen: boolean;
  onClose: () => void;
}

const TEAM_NAMES = [
  'Team Dragons 🐉',
  'Team Phoenix 🦅',
  'Team Lions 🦁',
  'Team Tigers 🐅',
  'Team Wizards 🧙♂️',
  'Team Warriors ⚔️',
  'Team Titans ⚡',
  'Team Guardians 🛡️',
];

const TEAM_COLORS = [
  'from-blue-600/20 to-blue-900/30 border-blue-500/50',
  'from-rose-600/20 to-rose-900/30 border-rose-500/50',
  'from-amber-600/20 to-amber-900/30 border-amber-500/50',
  'from-emerald-600/20 to-emerald-900/30 border-emerald-500/50',
  'from-purple-600/20 to-purple-900/30 border-purple-500/50',
  'from-cyan-600/20 to-cyan-900/30 border-cyan-500/50',
  'from-indigo-600/20 to-indigo-900/30 border-indigo-500/50',
  'from-teal-600/20 to-teal-900/30 border-teal-500/50',
];

export const TeamGeneratorModal: React.FC<TeamGeneratorModalProps> = ({
  students,
  rankConfigs,
  isOpen,
  onClose,
}) => {
  const [teamCount, setTeamCount] = useState<number>(3);
  const [balanceMode, setBalanceMode] = useState<'BALANCED' | 'RANDOM'>('BALANCED');
  const [generatedTeams, setGeneratedTeams] = useState<{ name: string; color: string; members: StudentWithStats[] }[]>([]);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (students.length === 0) return;

    let pool = [...students];
    const teams: { name: string; color: string; members: StudentWithStats[] }[] = [];

    for (let i = 0; i < teamCount; i++) {
      teams.push({
        name: TEAM_NAMES[i % TEAM_NAMES.length],
        color: TEAM_COLORS[i % TEAM_COLORS.length],
        members: [],
      });
    }

    if (balanceMode === 'RANDOM') {
      // Shuffle randomly
      pool = pool.sort(() => Math.random() - 0.5);
      pool.forEach((student, index) => {
        teams[index % teamCount].members.push(student);
      });
    } else {
      // Balanced mode: Sort by rank/points descending (Vua -> Quan -> Linh -> Dan)
      pool.sort((a, b) => b.totalPoints - a.totalPoints);

      // Snake draft distribution (0, 1, 2, 2, 1, 0...) to balance teams
      let currentTeam = 0;
      let direction = 1;

      pool.forEach((student) => {
        teams[currentTeam].members.push(student);
        currentTeam += direction;
        if (currentTeam >= teamCount) {
          currentTeam = teamCount - 1;
          direction = -1;
        } else if (currentTeam < 0) {
          currentTeam = 0;
          direction = 1;
        }
      });
    }

    setGeneratedTeams(teams);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  const handleCopyTeams = () => {
    if (generatedTeams.length === 0) return;
    let text = `DANH SÁCH CHIA NHÓM THỰC HÀNH TIẾNG ANH:\n\n`;
    generatedTeams.forEach((t) => {
      text += `📍 ${t.name} (${t.members.length} học sinh):\n`;
      t.members.forEach((m, idx) => {
        text += `  ${idx + 1}. ${m.fullName} [${m.currentRank}] (${m.totalPoints} pts)\n`;
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-lg">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Chia Nhóm Tự Động & Cân Bằng Năng Lực
              </h2>
              <p className="text-xs text-slate-400">
                Phân bổ đều Vua / Quan / Lính để tối ưu hóa thảo luận nhóm
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

        {/* Controls */}
        <div className="p-6 bg-slate-800/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            {/* Number of Teams */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">
                Số lượng nhóm:
              </span>
              <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
                {[2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    onClick={() => setTeamCount(num)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      teamCount === num
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {num} Nhóm
                  </button>
                ))}
              </div>
            </div>

            {/* Mode: Balanced vs Random */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">
                Chế độ chia:
              </span>
              <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
                <button
                  onClick={() => setBalanceMode('BALANCED')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition ${
                    balanceMode === 'BALANCED'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  Cân Bằng Trình Độ
                </button>
                <button
                  onClick={() => setBalanceMode('RANDOM')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition ${
                    balanceMode === 'RANDOM'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  Ngẫu Nhiên
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-slate-900 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 shadow-md transition transform active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              Tạo Nhóm Ngay
            </button>

            {generatedTeams.length > 0 && (
              <button
                onClick={handleCopyTeams}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Đã Sao Chép!' : 'Sao Chép'}
              </button>
            )}
          </div>
        </div>

        {/* Teams Display Grid */}
        <div className="p-6 overflow-y-auto max-h-[55vh]">
          {generatedTeams.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Users2 className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="font-bold text-lg text-slate-300">Chưa tạo nhóm</p>
              <p className="text-xs text-slate-400 mt-1">
                Nhấn "Tạo Nhóm Ngay" để hệ thống tự động phân chia {students.length} học sinh
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {generatedTeams.map((team, tIdx) => {
                const totalPoints = team.members.reduce((a, b) => a + b.totalPoints, 0);
                return (
                  <div
                    key={tIdx}
                    className={`rounded-3xl p-5 border bg-gradient-to-b ${team.color} backdrop-blur-md`}
                  >
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                      <div>
                        <h3 className="font-extrabold text-lg text-white">
                          {team.name}
                        </h3>
                        <span className="text-xs text-slate-300">
                          {team.members.length} thành viên
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400">Tổng điểm</span>
                        <p className="text-sm font-bold text-amber-300">
                          {totalPoints} pts
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {team.members.map((member, mIdx) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-2.5 rounded-2xl bg-black/20 border border-white/5"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xs font-bold text-slate-400 w-4">
                              {mIdx + 1}.
                            </span>
                            <RankAvatar
                              fullName={member.fullName}
                              avatarUrl={member.avatar}
                              rank={member.currentRank}
                              rankConfig={member.rankConfig}
                              size="sm"
                              showGlow={false}
                            />
                            <span className="text-xs font-semibold text-white truncate">
                              {member.fullName}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <RankBadge
                              rank={member.currentRank}
                              rankConfig={member.rankConfig}
                              size="sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { StudentWithStats, RankConfigItem } from '@/types';
import { RankAvatar } from '../gamification/rank-avatar';
import { RankBadge } from '../gamification/rank-badge';
import { KidButton } from '../ui/kid-button';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import {
  X,
  Users2,
  Shuffle,
  Scale,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';

interface TeamGeneratorModalProps {
  students: StudentWithStats[];
  rankConfigs?: RankConfigItem[];
  isOpen: boolean;
  onClose: () => void;
}

const ANIMAL_SQUAD_NAMES = [
  {
    name: 'Khủng Long Xanh 🦖',
    eng: 'Dino Squad',
    color: 'from-emerald-600/25 to-emerald-950/40 border-emerald-500/60 text-emerald-300',
  },
  {
    name: 'Gấu Trúc Đáng Yêu 🐼',
    eng: 'Panda Squad',
    color: 'from-slate-600/25 to-slate-950/40 border-slate-400/60 text-slate-200',
  },
  {
    name: 'Chim Cánh Cụt 🐧',
    eng: 'Penguin Squad',
    color: 'from-sky-600/25 to-sky-950/40 border-sky-400/60 text-sky-300',
  },
  {
    name: 'Sư Tử Dũng Mãnh 🦁',
    eng: 'Lion Squad',
    color: 'from-amber-600/25 to-amber-950/40 border-amber-400/60 text-amber-300',
  },
  {
    name: 'Cáo Nhanh Nhẹn 🦊',
    eng: 'Fox Squad',
    color: 'from-orange-600/25 to-orange-950/40 border-orange-400/60 text-orange-300',
  },
  {
    name: 'Thỏ Trắng Tinh Nghịch 🐰',
    eng: 'Rabbit Squad',
    color: 'from-pink-600/25 to-pink-950/40 border-pink-400/60 text-pink-300',
  },
  {
    name: 'Cá Heo Thông Thái 🐬',
    eng: 'Dolphin Squad',
    color: 'from-blue-600/25 to-blue-950/40 border-blue-400/60 text-blue-300',
  },
  {
    name: 'Đại Bàng Bay Cao 🦅',
    eng: 'Eagle Squad',
    color: 'from-purple-600/25 to-purple-950/40 border-purple-400/60 text-purple-300',
  },
];

export const TeamGeneratorModal: React.FC<TeamGeneratorModalProps> = ({
  students,
  rankConfigs,
  isOpen,
  onClose,
}) => {
  const { playFanfare } = useSoundEffects();

  const [teamCount, setTeamCount] = useState<number>(3);
  const [balanceMode, setBalanceMode] = useState<'BALANCED' | 'RANDOM'>(
    'BALANCED'
  );
  const [generatedTeams, setGeneratedTeams] = useState<
    {
      name: string;
      eng: string;
      color: string;
      members: StudentWithStats[];
    }[]
  >([]);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (students.length === 0) return;

    let pool = [...students];
    const teams: {
      name: string;
      eng: string;
      color: string;
      members: StudentWithStats[];
    }[] = [];

    for (let i = 0; i < teamCount; i++) {
      const squad = ANIMAL_SQUAD_NAMES[i % ANIMAL_SQUAD_NAMES.length];
      teams.push({
        name: squad.name,
        eng: squad.eng,
        color: squad.color,
        members: [],
      });
    }

    if (balanceMode === 'RANDOM') {
      pool = pool.sort(() => Math.random() - 0.5);
      pool.forEach((student, index) => {
        teams[index % teamCount].members.push(student);
      });
    } else {
      // Balanced snake draft
      pool.sort((a, b) => b.totalPoints - a.totalPoints);
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
    playFanfare();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.5 },
    });
  };

  const handleCopyTeams = () => {
    if (generatedTeams.length === 0) return;

    let text = '📋 DANH SÁCH BIỆT ĐỘI HỌC TẬP:\n\n';
    generatedTeams.forEach((t) => {
      text += `🌟 ${t.name} (${t.eng}) - ${t.members.length} thành viên:\n`;
      t.members.forEach((m, idx) => {
        text += `  ${idx + 1}. ${m.fullName} [${m.currentRank}] (${m.totalPoints} pts)\n`;
      });
      text += '\n';
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-md shadow-blue-500/10">
              <Users2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Chia Biệt Đội Động Vật Siêu Nhí 🐾
              </h2>
              <p className="text-xs text-slate-400">
                Phân bổ cân bằng theo năng lực & cấp bậc Dân - Vua
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

        {/* Options Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:px-6 bg-slate-800/40 border-b border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            {/* Number of Teams */}
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-black">Số nhóm:</span>
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-2xl border border-slate-700">
                {[2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTeamCount(num)}
                    className={`w-8 h-8 rounded-xl font-black text-xs transition ${
                      teamCount === num
                        ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode selection */}
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-black">Chế độ:</span>
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-2xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setBalanceMode('BALANCED')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-black text-xs transition ${
                    balanceMode === 'BALANCED'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  Cân Bằng ⭐
                </button>
                <button
                  type="button"
                  onClick={() => setBalanceMode('RANDOM')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-black text-xs transition ${
                    balanceMode === 'RANDOM'
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  Ngẫu Nhiên 🎲
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <KidButton
              variant="primary"
              size="md"
              onClick={handleGenerate}
              className="px-6"
            >
              <Sparkles className="w-4 h-4" />
              CHIA BIỆT ĐỘI NGAY 🐾
            </KidButton>
          </div>
        </div>

        {/* Generated Teams Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-gradient-to-b from-slate-900 to-slate-950">
          {generatedTeams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedTeams.map((team, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.08 }}
                  className={`rounded-3xl border-2 p-4 bg-gradient-to-b ${team.color} shadow-lg flex flex-col justify-between`}
                >
                  {/* Team Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
                    <div>
                      <h4 className="font-black text-base tracking-tight text-white">
                        {team.name}
                      </h4>
                      <span className="text-[10px] opacity-75 font-semibold">
                        {team.eng}
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-black/40 text-[11px] font-black text-white">
                      {team.members.length} bạn
                    </span>
                  </div>

                  {/* Members List */}
                  <div className="space-y-2 flex-1">
                    {team.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2 rounded-2xl bg-black/25 backdrop-blur-sm border border-white/5"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <RankAvatar
                            fullName={member.fullName}
                            avatarUrl={member.avatar}
                            rank={member.currentRank}
                            rankConfig={member.rankConfig}
                            size="sm"
                            showGlow={false}
                          />
                          <span className="font-bold text-xs truncate text-slate-100">
                            {member.fullName}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <RankBadge
                            rank={member.currentRank}
                            rankConfig={member.rankConfig}
                            size="sm"
                          />
                          <span className="text-[11px] font-extrabold text-amber-300">
                            {member.totalPoints} pts
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl">
                🐾
              </div>
              <p className="text-base font-bold text-slate-200">
                Sẵn sàng phân chia {students.length} học sinh thành các Biệt Đội Động Vật
              </p>
              <p className="text-xs text-slate-400">
                Nhấn nút &quot;CHIA BIỆT ĐỘI NGAY 🐾&quot; để bắt đầu chia nhóm
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Sĩ số lớp: <strong className="text-white">{students.length}</strong> học sinh
          </span>

          <div className="flex items-center gap-2">
            {generatedTeams.length > 0 && (
              <KidButton
                variant="sky"
                size="sm"
                onClick={handleCopyTeams}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Đã Sao Chép!' : 'Sao Chép Danh Sách'}
              </KidButton>
            )}

            <KidButton variant="neutral" size="sm" onClick={onClose}>
              Đóng (Esc)
            </KidButton>
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  StudentWithStats,
  ClassItem,
  PeriodFilter,
  RankConfigItem,
} from '@/types';
import { RankAvatar } from '@/components/gamification/rank-avatar';
import { RankBadge } from '@/components/gamification/rank-badge';
import { calculateTotalPoints } from '@/lib/gamification-engine';
import {
  Trophy,
  Sparkles,
  ArrowLeft,
  Calendar,
  ChevronRight,
  TrendingUp,
  Medal,
  Award,
  Crown,
} from 'lucide-react';

export default function GamificationPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = use(params);

  const [classData, setClassData] = useState<ClassItem | null>(null);
  const [students, setStudents] = useState<StudentWithStats[]>([]);
  const [rankConfigs, setRankConfigs] = useState<RankConfigItem[]>([]);
  const [periodType, setPeriodType] = useState<'month' | 'semester' | 'year' | 'all'>('month');
  const [selectedMonth, setSelectedMonth] = useState<number>(9);
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/classes/${classId}`)
      .then((res) => res.json())
      .then((data) => {
        setClassData(data);
        setStudents(data.students || []);
        setRankConfigs(data.rankConfigs || []);
      })
      .catch((err) => console.error('Gamification fetch failed:', err))
      .finally(() => setLoading(false));
  }, [classId]);

  // Period filter object
  const filter: PeriodFilter =
    periodType === 'month'
      ? { type: 'month', month: selectedMonth, year: 2026 }
      : periodType === 'semester'
      ? { type: 'semester', semester: selectedSemester, year: 2026 }
      : periodType === 'year'
      ? { type: 'year', year: 2026 }
      : { type: 'all' };

  // Calculate points and rank based on selected period
  const sortedStudents = [...students].sort((a, b) => b.totalPoints - a.totalPoints);

  const vuaStudents = sortedStudents.filter((s) => s.currentRank === 'VUA');
  const quanStudents = sortedStudents.filter((s) => s.currentRank === 'QUAN');
  const linhStudents = sortedStudents.filter((s) => s.currentRank === 'LINH');
  const danStudents = sortedStudents.filter((s) => s.currentRank === 'DAN');

  const getNextRankThreshold = (student: StudentWithStats) => {
    if (student.currentRank === 'DAN') return { target: 30, nextRank: 'Lính (Soldier)' };
    if (student.currentRank === 'LINH') return { target: 60, nextRank: 'Quan (Scholar)' };
    if (student.currentRank === 'QUAN') return { target: 90, nextRank: 'Vua (King)' };
    return { target: student.totalPoints, nextRank: 'Tối Thượng (Max Rank)' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href={`/classes/${classId}`}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                Gamification Arena
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Đấu Trường Thi Đua Dân ➔ Lính ➔ Quan ➔ Vua
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Lớp: {classData?.name} | Điểm được tích lũy theo chu kỳ rèn luyện tiếng Anh
            </p>
          </div>
        </div>

        {/* Multi-Period Filter Switcher */}
        <div className="flex flex-wrap items-center gap-2 bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            onClick={() => setPeriodType('month')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              periodType === 'month'
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Theo Tháng
          </button>

          <button
            onClick={() => setPeriodType('semester')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              periodType === 'semester'
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Theo Học Kỳ
          </button>

          <button
            onClick={() => setPeriodType('year')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              periodType === 'year'
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Cả Năm Học
          </button>

          {/* Sub options */}
          {periodType === 'month' && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 border-0 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary"
            >
              <option value={9}>Tháng 09/2026</option>
              <option value={10}>Tháng 10/2026</option>
              <option value={11}>Tháng 11/2026</option>
              <option value={12}>Tháng 12/2026</option>
              <option value={1}>Tháng 01/2027</option>
              <option value={2}>Tháng 02/2027</option>
              <option value={3}>Tháng 03/2027</option>
              <option value={4}>Tháng 04/2027</option>
              <option value={5}>Tháng 05/2027</option>
            </select>
          )}

          {periodType === 'semester' && (
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(parseInt(e.target.value, 10) as any)}
              className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 border-0 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary"
            >
              <option value={1}>Học Kỳ 1 (2026)</option>
              <option value={2}>Học Kỳ 2 (2027)</option>
            </select>
          )}
        </div>
      </div>

      {/* Top 3 Royal Podium Display */}
      {sortedStudents.length >= 3 && (
        <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 text-white shadow-2xl relative overflow-hidden">
          <div className="text-center mb-8">
            <h2 className="text-xl font-extrabold text-amber-300 flex items-center justify-center gap-2">
              <Crown className="w-5 h-5" />
              BẢNG VINH DANH DANH DỰ
              <Crown className="w-5 h-5" />
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Top 3 học sinh xuất sắc dẫn đầu bảng xếp hạng
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 items-end max-w-2xl mx-auto pt-4">
            {/* Rank 2 (Silver) */}
            <div className="flex flex-col items-center">
              <RankAvatar
                fullName={sortedStudents[1].fullName}
                avatarUrl={sortedStudents[1].avatar}
                rank={sortedStudents[1].currentRank}
                rankConfig={sortedStudents[1].rankConfig}
                size="lg"
              />
              <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-950 font-black text-xs flex items-center justify-center -mt-3 z-10 shadow-md">
                2
              </span>
              <p className="font-bold text-xs sm:text-sm text-white mt-2 text-center truncate max-w-[100px]">
                {sortedStudents[1].fullName}
              </p>
              <span className="text-xs font-bold text-slate-300">
                {sortedStudents[1].totalPoints} pts
              </span>
              <div className="w-full h-24 rounded-t-2xl bg-gradient-to-t from-slate-800 to-slate-700 mt-3 flex items-center justify-center border-t border-slate-600">
                <Medal className="w-6 h-6 text-slate-300" />
              </div>
            </div>

            {/* Rank 1 (Gold Champion) */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <Crown className="w-8 h-8 text-yellow-400 absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce-slight" />
                <RankAvatar
                  fullName={sortedStudents[0].fullName}
                  avatarUrl={sortedStudents[0].avatar}
                  rank={sortedStudents[0].currentRank}
                  rankConfig={sortedStudents[0].rankConfig}
                  size="xl"
                />
              </div>
              <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center -mt-3.5 z-10 shadow-lg shadow-amber-500/50">
                1
              </span>
              <p className="font-extrabold text-sm sm:text-base text-yellow-300 mt-2 text-center truncate max-w-[120px]">
                {sortedStudents[0].fullName}
              </p>
              <span className="text-sm font-black text-amber-400">
                {sortedStudents[0].totalPoints} pts
              </span>
              <div className="w-full h-36 rounded-t-2xl bg-gradient-to-t from-amber-600/60 to-yellow-500/80 mt-3 flex items-center justify-center border-t-2 border-yellow-300 shadow-glow-vua">
                <Trophy className="w-8 h-8 text-yellow-100" />
              </div>
            </div>

            {/* Rank 3 (Bronze) */}
            <div className="flex flex-col items-center">
              <RankAvatar
                fullName={sortedStudents[2].fullName}
                avatarUrl={sortedStudents[2].avatar}
                rank={sortedStudents[2].currentRank}
                rankConfig={sortedStudents[2].rankConfig}
                size="lg"
              />
              <span className="w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center -mt-3 z-10 shadow-md">
                3
              </span>
              <p className="font-bold text-xs sm:text-sm text-white mt-2 text-center truncate max-w-[100px]">
                {sortedStudents[2].fullName}
              </p>
              <span className="text-xs font-bold text-amber-500">
                {sortedStudents[2].totalPoints} pts
              </span>
              <div className="w-full h-18 rounded-t-2xl bg-gradient-to-t from-slate-900 to-amber-900/60 mt-3 flex items-center justify-center border-t border-amber-800">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table with Progress Bars */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Bảng Tiến Trình Cấp Bậc Toàn Lớp
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Theo dõi điểm và mức phấn đấu thăng cấp của từng học sinh
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-4 w-16 text-center">Hạng</th>
                <th className="p-4 min-w-[200px]">Học Sinh</th>
                <th className="p-4 min-w-[140px]">Cấp Bậc Hiện Tại</th>
                <th className="p-4 min-w-[100px] text-center">Tổng Điểm</th>
                <th className="p-4 min-w-[240px]">Tiến Độ Lên Cấp Kế Tiếp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedStudents.map((student, idx) => {
                const { target, nextRank } = getNextRankThreshold(student);
                const progressPct =
                  student.currentRank === 'VUA'
                    ? 100
                    : Math.min(100, Math.round((student.totalPoints / target) * 100));

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="p-4 text-center font-bold">
                      {idx === 0 ? (
                        <span className="text-base font-black text-amber-500">🥇 1</span>
                      ) : idx === 1 ? (
                        <span className="text-base font-black text-slate-400">🥈 2</span>
                      ) : idx === 2 ? (
                        <span className="text-base font-black text-amber-700">🥉 3</span>
                      ) : (
                        <span className="text-slate-400">{idx + 1}</span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <RankAvatar
                          fullName={student.fullName}
                          avatarUrl={student.avatar}
                          rank={student.currentRank}
                          rankConfig={student.rankConfig}
                          size="sm"
                          showGlow={false}
                        />
                        <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                          {student.fullName}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <RankBadge
                        rank={student.currentRank}
                        rankConfig={student.rankConfig}
                        size="sm"
                      />
                    </td>

                    <td className="p-4 text-center">
                      <span className="text-sm font-black text-amber-500">
                        {student.totalPoints} pts
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          <span>
                            Mục tiêu: <strong>{nextRank}</strong>
                          </span>
                          <span>{student.currentRank === 'VUA' ? 'Max Rank' : `${student.totalPoints} / ${target} pts`}</span>
                        </div>

                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-amber-400 transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

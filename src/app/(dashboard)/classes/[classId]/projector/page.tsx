'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { StudentWithStats, ClassItem } from '@/types';
import { RandomPickerModal } from '@/components/projector/random-picker-modal';
import { TeamGeneratorModal } from '@/components/projector/team-generator-modal';
import { CountdownTimer } from '@/components/projector/countdown-timer';
import {
  Projector,
  ArrowLeft,
  Sparkles,
  Users2,
  Timer,
  Play,
  RotateCcw,
} from 'lucide-react';

export default function ProjectorPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = use(params);

  const [classData, setClassData] = useState<ClassItem | null>(null);
  const [students, setStudents] = useState<StudentWithStats[]>([]);
  const [activeTool, setActiveTool] = useState<'TIMER' | 'PICKER' | 'TEAMS'>('TIMER');
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);

  useEffect(() => {
    fetch(`/api/classes/${classId}`)
      .then((res) => res.json())
      .then((data) => {
        setClassData(data);
        setStudents(data.students || []);
      })
      .catch((err) => console.error('Projector load failed:', err));
  }, [classId]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <Link
            href={`/classes/${classId}`}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                Projector Mode
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Bộ Công Cụ Trình Chiếu Lớp Học
            </h1>
            <p className="text-xs text-slate-400">
              Lớp: {classData?.name} | Sĩ số: {students.length} học sinh
            </p>
          </div>
        </div>

        {/* Quick Modal Launcher Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowPickerModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition transform active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            Quay Gọi Tên 🎲
          </button>

          <button
            onClick={() => setShowTeamModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition transform active:scale-95"
          >
            <Users2 className="w-4 h-4" />
            Chia Nhóm 👥
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Countdown Timer Display Area */}
        <div className="lg:col-span-8 flex justify-center">
          <CountdownTimer initialSeconds={180} />
        </div>

        {/* Quick Tool Launchers & Information */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Công Cụ Tương Tác Trực Tiếp
            </h3>

            {/* Tool 1: Random Picker Card */}
            <div
              onClick={() => setShowPickerModal(true)}
              className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 hover:border-amber-400 cursor-pointer transition flex items-center justify-between group"
            >
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-500 transition">
                  Gọi Tên Ngẫu Nhiên
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Hiệu ứng Slot Machine, lọc học sinh có mặt
                </p>
              </div>
              <span className="text-xl">🎲</span>
            </div>

            {/* Tool 2: Team Generator Card */}
            <div
              onClick={() => setShowTeamModal(true)}
              className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 hover:border-blue-400 cursor-pointer transition flex items-center justify-between group"
            >
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-500 transition">
                  Chia Nhóm Cân Bằng
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tự động phân bổ Vua & Quan vào các nhóm
                </p>
              </div>
              <span className="text-xl">👥</span>
            </div>
          </div>
        </div>
      </div>

      {/* Random Picker Fullscreen Modal with In-Picker Quick Scoring */}
      <RandomPickerModal
        classId={classId}
        students={students}
        rankConfigs={classData?.rankConfigs}
        isOpen={showPickerModal}
        onClose={() => setShowPickerModal(false)}
        onPointAwarded={(studentId, pointsChanged, newTotal, newRank, newConfig) => {
          setStudents((prev) =>
            prev.map((s) => {
              if (s.id !== studentId) return s;
              return {
                ...s,
                totalPoints: newTotal,
                currentRank: newRank,
                rankConfig: newConfig,
              };
            })
          );
        }}
      />

      {/* Team Generator Fullscreen Modal */}
      <TeamGeneratorModal
        students={students}
        rankConfigs={classData?.rankConfigs}
        isOpen={showTeamModal}
        onClose={() => setShowTeamModal(false)}
      />
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  Trophy,
  CheckSquare,
  Projector,
  FileSpreadsheet,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar,
  NotebookTabs,
} from 'lucide-react';
import { ClassItem } from '@/types';

export default function DashboardPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newAcademicYear, setNewAcademicYear] = useState('2026-2027');
  const [newDescription, setNewDescription] = useState('');

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes');
      const data = await res.json();
      if (Array.isArray(data)) {
        setClasses(data);
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName) return;

    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClassName,
          academicYear: newAcademicYear,
          description: newDescription,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewClassName('');
        setNewDescription('');
        await fetchClasses();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('class_created'));
        }
      }
    } catch (err) {
      console.error('Create class failed:', err);
    }
  };

  const totalStudents = classes.reduce(
    (acc, c) => acc + (c.studentCount || 0),
    0
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 p-8 text-white shadow-xl border border-indigo-800/40">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 border border-white/15 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Năm Học 2026 - 2027 | GVBM English Platform
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Chào Mừng Thầy / Cô Giảng Dạy!
          </h1>
          <p className="text-sm sm:text-base text-slate-300">
            Hệ thống quản lý lớp học 1-chạm, đấu trường thi đua Dân - Lính - Quan - Vua, công cụ máy chiếu và phiếu nhận xét PDF gửi phụ huynh.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {classes[0] && (
              <Link
                href={`/classes/${classes[0].id}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-500/20 transition transform active:scale-95"
              >
                Vào Lớp {classes[0].name} Ngay
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            {classes[0] && (
              <Link
                href={`/classes/${classes[0].id}/projector`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs bg-white/15 hover:bg-white/25 text-white border border-white/20 transition"
              >
                <Projector className="w-4 h-4 text-amber-300" />
                Mở Máy Chiếu Lớp Học
              </Link>
            )}
          </div>
        </div>

        {/* Ambient background blur */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Tổng Số Lớp
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {classes.length} Lớp
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Tổng Học Sinh
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {totalStudents} Học Viên
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Động Cơ Thi Đua
            </span>
            <p className="text-2xl font-black text-amber-500">
              4 Cấp Bậc
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Điểm Danh 1 Chạm
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              Real-time
            </p>
          </div>
        </div>
      </div>

      {/* Class List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Danh Sách Các Lớp Giảng Dạy
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chọn lớp để quản lý điểm danh, chấm điểm thi đua và xuất báo cáo
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs text-white bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition"
          >
            <Plus className="w-4 h-4" />
            Thêm Lớp Mới
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((c) => (
            <div
              key={c.id}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition transform">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                    {c.academicYear}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition mb-1">
                  {c.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                  {c.description || 'Lớp học tiếng Anh tiêu chuẩn'}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1 font-semibold">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {c.studentCount ?? 15} Học Sinh
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-amber-500">
                    <Trophy className="w-3.5 h-3.5" />
                    Gamification ON
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href={`/classes/${c.id}`}
                  className="py-2 rounded-xl text-center font-bold text-xs bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-300 transition"
                >
                  Vào Lớp
                </Link>
                <Link
                  href={`/classes/${c.id}/attendance`}
                  className="py-2 rounded-xl text-center font-bold text-xs bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 transition"
                >
                  Điểm Danh
                </Link>
                <Link
                  href={`/classes/${c.id}/projector`}
                  className="py-2 rounded-xl text-center font-bold text-xs bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-600 dark:text-amber-400 transition"
                >
                  Máy Chiếu
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Tạo Lớp Học Mới
            </h3>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Lớp (*)
                </label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="VD: 11A2 - IELTS Advanced..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Năm Học (*)
                </label>
                <input
                  type="text"
                  required
                  value={newAcademicYear}
                  onChange={(e) => setNewAcademicYear(e.target.value)}
                  placeholder="2026-2027"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mô Tả Lớp Học
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Mô tả mục tiêu, giáo trình hoặc lịch học..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition"
                >
                  Tạo Lớp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

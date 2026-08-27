'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Trophy,
  Projector,
  Palette,
  FileSpreadsheet,
  NotebookTabs,
  Database,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const params = useParams();
  const classId = (params?.classId as string) || 'class-10a1-ielts';

  const navItems = [
    {
      title: 'Bảng Điều Khiển Lớp',
      href: `/classes/${classId}`,
      icon: Users,
      exact: true,
    },
    {
      title: 'Điểm Danh 1 Chạm',
      href: `/classes/${classId}/attendance`,
      icon: CheckSquare,
    },
    {
      title: 'Đấu Trường Thi Đua',
      href: `/classes/${classId}/gamification`,
      icon: Trophy,
      badge: 'Dân-Vua',
    },
    {
      title: 'Bộ Công Cụ Máy Chiếu',
      href: `/classes/${classId}/projector`,
      icon: Projector,
      highlight: true,
    },
    {
      title: 'Tùy Biến Cấp Bậc',
      href: `/classes/${classId}/rank-settings`,
      icon: Palette,
    },
    {
      title: 'Đánh Giá & Xuất Báo Cáo',
      href: `/classes/${classId}/reports`,
      icon: FileSpreadsheet,
    },
  ];

  const adminItems = [
    {
      title: 'Sổ Biên Bản Họp',
      href: '/meetings',
      icon: NotebookTabs,
    },
    {
      title: 'Sao Lưu & Ngoại Tuyến',
      href: '/settings/backup',
      icon: Database,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 left-0 bottom-0 z-40 w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Active Class Section */}
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Nghiệp Vụ Lớp Học
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition group ${
                      isActive
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : item.highlight
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span>{item.title}</span>
                    </div>

                    {item.badge ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-white/20 text-white">
                        {item.badge}
                      </span>
                    ) : (
                      <ChevronRight
                        className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition ${
                          isActive ? 'opacity-100' : ''
                        }`}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Administrative Section */}
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Hành Chính & Hệ Thống
            </p>
            <nav className="space-y-1">
              {adminItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition group ${
                      isActive
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span>{item.title}</span>
                    </div>
                    <ChevronRight
                      className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition ${
                        isActive ? 'opacity-100' : ''
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
              GV
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                Giáo Viên Tiếng Anh
              </p>
              <p className="text-[10px] text-slate-400">Offline-First Engine Active</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

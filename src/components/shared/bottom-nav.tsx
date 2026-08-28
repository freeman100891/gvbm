'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import {
  Users,
  CheckSquare,
  Trophy,
  Projector,
  FileSpreadsheet,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const params = useParams();
  const classId = (params?.classId as string) || 'class-10a1-ielts';

  const navItems = [
    {
      title: 'Học Sinh',
      href: `/classes/${classId}`,
      icon: Users,
      exact: true,
    },
    {
      title: 'Điểm Danh',
      href: `/classes/${classId}/attendance`,
      icon: CheckSquare,
    },
    {
      title: 'Thi Đua',
      href: `/classes/${classId}/gamification`,
      icon: Trophy,
    },
    {
      title: 'Máy Chiếu',
      href: `/classes/${classId}/projector`,
      icon: Projector,
      highlight: true,
    },
    {
      title: 'Báo Cáo',
      href: `/classes/${classId}/reports`,
      icon: FileSpreadsheet,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/90 dark:bg-slate-950/90 border-t border-slate-200 dark:border-slate-800 backdrop-blur-xl px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl touch-target-safe transition ${
                isActive
                  ? 'text-primary font-black scale-105'
                  : item.highlight
                  ? 'text-amber-500 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : item.highlight
                    ? 'bg-amber-500/10 text-amber-500'
                    : ''
                }`}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

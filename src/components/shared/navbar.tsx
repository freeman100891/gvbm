'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { NetworkStatusIndicator } from './network-status-indicator';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import {
  GraduationCap,
  Projector,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Menu,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentClassId = (params?.classId as string) || 'class-10a1-ielts';

  const { isMuted, toggleMute } = useSoundEffects();
  const [isDark, setIsDark] = useState(false);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);

  const fetchClassesList = async () => {
    try {
      const res = await fetch('/api/classes');
      const data = await res.json();
      if (Array.isArray(data)) {
        setClasses(data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // Check dark mode
    if (typeof window !== 'undefined') {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    }

    // Initial fetch
    fetchClassesList();

    // Listen to global class creation/update events
    const handleClassUpdated = () => fetchClassesList();
    window.addEventListener('class_created', handleClassUpdated);
    window.addEventListener('focus', handleClassUpdated);

    return () => {
      window.removeEventListener('class_created', handleClassUpdated);
      window.removeEventListener('focus', handleClassUpdated);
    };
  }, [pathname]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleClassChange = (newClassId: string) => {
    if (pathname.includes('/classes/')) {
      // Replace classId in current sub-path
      const segments = pathname.split('/');
      const classIdx = segments.indexOf('classes') + 1;
      if (classIdx > 0 && segments[classIdx]) {
        segments[classIdx] = newClassId;
        router.push(segments.join('/'));
        return;
      }
    }
    router.push(`/classes/${newClassId}`);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile Menu & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base text-slate-900 dark:text-white tracking-tight">
                  GVBM Platform
                </span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                English Teaching & Gamification
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Fast Class Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={currentClassId}
              onChange={(e) => handleClassChange(e.target.value)}
              onFocus={fetchClassesList}
              onClick={fetchClassesList}
              className="appearance-none pl-3.5 pr-8 py-2 rounded-2xl font-bold text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-sm"
            >
              {classes.length > 0 ? (
                classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    🎓 Lớp: {c.name}
                  </option>
                ))
              ) : (
                <option value="class-10a1-ielts">🎓 10A1 - IELTS & Comm</option>
              )}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Quick Projector Mode Button */}
          <Link
            href={`/classes/${currentClassId}/projector`}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-2xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition transform active:scale-95 shrink-0"
          >
            <Projector className="w-4 h-4" />
            <span className="hidden md:inline">Máy Chiếu</span>
          </Link>
        </div>

        {/* Right Tools: Status, Audio, Theme */}
        <div className="flex items-center gap-2 sm:gap-3">
          <NetworkStatusIndicator />

          {/* Sound Toggle */}
          <button
            onClick={toggleMute}
            className={`p-2 rounded-xl border transition ${
              isMuted
                ? 'border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                : 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
            }`}
            title={isMuted ? 'Bật âm thanh tương tác' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Chuyển đổi giao diện Sáng / Tối"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};

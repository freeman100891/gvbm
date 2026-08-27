'use client';

import React, { useState, useRef, useEffect } from 'react';
import { StudentWithStats } from '@/types';
import {
  MoreVertical,
  Edit3,
  FileText,
  ArrowRightLeft,
  RotateCcw,
  Trash2,
} from 'lucide-react';

interface StudentActionMenuProps {
  student: StudentWithStats;
  classId: string;
  onEdit: (student: StudentWithStats) => void;
  onTransfer: (student: StudentWithStats) => void;
  onResetPoints: (student: StudentWithStats) => void;
  onDelete: (student: StudentWithStats) => void;
}

export const StudentActionMenu: React.FC<StudentActionMenuProps> = ({
  student,
  classId,
  onEdit,
  onTransfer,
  onResetPoints,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        title="Tác vụ học sinh"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-52 z-30 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 space-y-1 animate-fade-in text-xs font-semibold text-slate-700 dark:text-slate-300">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onEdit(student);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition"
          >
            <Edit3 className="w-4 h-4 text-blue-500" />
            <span>Chỉnh Sửa Hồ Sơ</span>
          </button>

          <a
            href={`/api/classes/${classId}/export-pdf?studentId=${student.id}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition"
          >
            <FileText className="w-4 h-4 text-emerald-500" />
            <span>Xem Phiếu Nhận Xét PDF</span>
          </a>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onTransfer(student);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition"
          >
            <ArrowRightLeft className="w-4 h-4 text-purple-500" />
            <span>Chuyển Sang Lớp Khác</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onResetPoints(student);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition text-amber-600 dark:text-amber-400"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Đặt Lại Điểm Về 0 (Dân)</span>
          </button>

          <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onDelete(student);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-left transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa Khỏi Lớp Học</span>
          </button>
        </div>
      )}
    </div>
  );
};

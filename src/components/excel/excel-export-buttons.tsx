'use client';

import React, { useState } from 'react';
import { Download, FileSpreadsheet, Trophy, Calendar, Users, Loader2 } from 'lucide-react';

interface ExcelExportButtonsProps {
  classId: string;
  className: string;
}

export const ExcelExportButtons: React.FC<ExcelExportButtonsProps> = ({
  classId,
  className,
}) => {
  const [downloadingType, setDownloadingType] = useState<string | null>(null);

  const handleExport = async (type: 'contacts' | 'gamification' | 'attendance' | 'template') => {
    setDownloadingType(type);
    try {
      const url = `/api/classes/${classId}/export-excel?type=${type}`;
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export error:', err);
      alert('Không thể tải file Excel. Vui lòng thử lại!');
    } finally {
      setTimeout(() => setDownloadingType(null), 1000);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* 1. Contacts */}
      <button
        onClick={() => handleExport('contacts')}
        disabled={downloadingType !== null}
        className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500 text-left transition hover:shadow-md group flex items-start justify-between"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition transform">
              <Users className="w-5 h-5" />
            </span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Danh Sách Liên Lạc
            </h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Họ tên học sinh, phụ huynh, SĐT và ghi chú
          </p>
        </div>

        <span className="p-2 text-slate-400 group-hover:text-blue-500 transition">
          {downloadingType === 'contacts' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
        </span>
      </button>

      {/* 2. Gamification Leaderboard */}
      <button
        onClick={() => handleExport('gamification')}
        disabled={downloadingType !== null}
        className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-500 dark:hover:border-purple-500 text-left transition hover:shadow-md group flex items-start justify-between"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition transform">
              <Trophy className="w-5 h-5" />
            </span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Bảng Xếp Hạng Thi Đua
            </h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Xếp hạng Dân-Lính-Quan-Vua định dạng màu
          </p>
        </div>

        <span className="p-2 text-slate-400 group-hover:text-purple-500 transition">
          {downloadingType === 'gamification' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
        </span>
      </button>

      {/* 3. Monthly Attendance */}
      <button
        onClick={() => handleExport('attendance')}
        disabled={downloadingType !== null}
        className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500 dark:hover:border-teal-500 text-left transition hover:shadow-md group flex items-start justify-between"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition transform">
              <Calendar className="w-5 h-5" />
            </span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Sổ Điểm Danh Tháng
            </h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ma trận chi tiết từng ngày (P/L/E/A) và tỷ lệ %
          </p>
        </div>

        <span className="p-2 text-slate-400 group-hover:text-teal-500 transition">
          {downloadingType === 'attendance' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
        </span>
      </button>
    </div>
  );
};

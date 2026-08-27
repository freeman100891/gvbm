'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useOfflineSync } from '@/hooks/use-offline-sync';
import { offlineDb } from '@/lib/db/offline-db';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  Check,
} from 'lucide-react';

export default function BackupPage() {
  const { isOnline, isSyncing, pendingCount, syncOutbox } = useOfflineSync();

  const [restoring, setRestoring] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [offlineStats, setOfflineStats] = useState({
    classes: 0,
    students: 0,
    attendances: 0,
    pointLogs: 0,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadOfflineStats = async () => {
    try {
      const c = await offlineDb.classes.count();
      const s = await offlineDb.students.count();
      const a = await offlineDb.attendances.count();
      const p = await offlineDb.pointLogs.count();
      setOfflineStats({ classes: c, students: s, attendances: a, pointLogs: p });
    } catch {}
  };

  useEffect(() => {
    loadOfflineStats();
  }, []);

  const handleExportBackup = () => {
    window.open('/api/backup', '_blank');
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('Khôi phục dữ liệu sẽ thay thế toàn bộ dữ liệu hiện tại. Bạn có chắc chắn muốn tiếp tục?')) {
      return;
    }

    setRestoring(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const json = JSON.parse(text);

        const res = await fetch('/api/backup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(json),
        });

        if (res.ok) {
          setRestoreSuccess(true);
          setTimeout(() => {
            setRestoreSuccess(false);
            window.location.reload();
          }, 2000);
        } else {
          alert('Khôi phục dữ liệu thất bại. Tệp tin không đúng định dạng!');
        }
      } catch (err) {
        console.error('Restore error:', err);
        alert('Lỗi khi đọc file sao lưu JSON!');
      } finally {
        setRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  const handlePurgeOffline = async () => {
    if (!confirm('Bạn có chắc muốn xóa sạch hàng đợi đồng bộ và bộ nhớ đệm ngoại tuyến?')) return;
    try {
      await offlineDb.syncQueue.clear();
      await loadOfflineStats();
      alert('Đã dọn sạch bộ nhớ đệm ngoại tuyến!');
    } catch (err) {
      console.error('Purge error:', err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Sao Lưu Toàn Vẹn & Bộ Nhớ Ngoại Tuyến
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Xuất/nhập file JSON cơ sở dữ liệu, quản lý hàng đợi đồng bộ Outbox và IndexedDB
          </p>
        </div>
      </div>

      {/* Backup & Restore Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Export JSON */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Download className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Xuất Tệp Sao Lưu (.json)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tải toàn bộ cơ sở dữ liệu gồm lớp học, danh sách học sinh, điểm danh, nhật ký điểm thi đua và biên bản họp về máy tính cá nhân.
            </p>
          </div>

          <button
            onClick={handleExportBackup}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs text-white bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition active:scale-95"
          >
            <FileJson className="w-4 h-4" />
            Tải Xuống File Sao Lưu (.json)
          </button>
        </div>

        {/* 2. Restore JSON */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-purple-500">
              <Upload className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Khôi Phục Dữ Liệu (.json)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nạp lại toàn bộ dữ liệu từ tệp tin sao lưu khi chuyển đổi sang máy tính giảng dạy hoặc máy tính lớp học mới.
            </p>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleRestoreFile}
              className="hidden"
            />

            {restoreSuccess ? (
              <div className="w-full py-3 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-center font-bold text-xs flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                Đã khôi phục thành công! Đang tải lại...
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={restoring}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/20 transition active:scale-95 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {restoring ? 'Đang Khôi Phục...' : 'Chọn Tệp JSON Để Khôi Phục'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Offline Storage & Outbox Sync Inspector */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <HardDrive className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Trạng Thái Bộ Nhớ Cục Bộ (IndexedDB - Dexie)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lưu trữ ngoại tuyến cho phép đứng lớp giảng dạy ngay cả khi mất mạng internet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={syncOutbox}
              disabled={isSyncing || !isOnline}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              Đồng Bộ Ngay ({pendingCount} chờ)
            </button>

            <button
              onClick={handlePurgeOffline}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Dọn Bộ Nhớ
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-400">Hàng Đợi Đồng Bộ (Outbox)</span>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {pendingCount} lệnh
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-400">Trạng Thái Kết Nối</span>
            <p className={`text-base font-bold mt-1 ${isOnline ? 'text-emerald-500' : 'text-amber-500'}`}>
              {isOnline ? '🟢 Trực Tuyến (Online)' : '🟠 Ngoại Tuyến (Offline)'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-400">Chiến Lược Điểm</span>
            <p className="text-sm font-bold text-blue-500 mt-1">
              Append-only (Bảo toàn)
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-400">Chiến Lược Điểm Danh</span>
            <p className="text-sm font-bold text-purple-500 mt-1">
              Last-Write-Wins
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

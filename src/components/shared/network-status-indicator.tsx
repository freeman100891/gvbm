'use client';

import React from 'react';
import { useOfflineSync } from '@/hooks/use-offline-sync';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export const NetworkStatusIndicator: React.FC = () => {
  const { isOnline, isSyncing, pendingCount, syncOutbox } = useOfflineSync();

  if (!isOnline) {
    return (
      <div
        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold"
        title="Đang hoạt động ngoại tuyến. Mọi thao tác sẽ tự động đồng bộ khi có mạng."
      >
        <WifiOff className="w-3.5 h-3.5" />
        <span>Ngoại Tuyến ({pendingCount} chờ)</span>
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs font-bold animate-pulse">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        <span>Đang Đồng Bộ...</span>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <button
        onClick={syncOutbox}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-xs font-bold hover:bg-indigo-500/20 transition"
        title="Nhấp để đồng bộ ngay"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Đồng bộ ({pendingCount})</span>
      </button>
    );
  }

  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold"
      title="Đã kết nối trực tuyến & đồng bộ hoàn toàn"
    >
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      <span className="hidden sm:inline">Trực Tuyến</span>
    </div>
  );
};

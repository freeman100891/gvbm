'use client';

import { useState, useEffect, useCallback } from 'react';
import { offlineDb } from '@/lib/db/offline-db';
import { SyncMutation } from '@/types';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const updatePendingCount = useCallback(async () => {
    try {
      const count = await offlineDb.syncQueue.where('synced').equals(0).count();
      setPendingCount(count);
    } catch {
      // IndexedDB might not be available in SSR
    }
  }, []);

  const syncOutbox = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;

    try {
      const pendingItems = await offlineDb.syncQueue
        .where('synced')
        .equals(0)
        .sortBy('timestamp');

      if (pendingItems.length === 0) {
        setPendingCount(0);
        return;
      }

      setIsSyncing(true);

      const response = await fetch('/api/sync/offline-mutations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mutations: pendingItems }),
      });

      if (response.ok) {
        // Mark all processed items as synced
        const ids = pendingItems.map((item) => item.id!).filter(Boolean);
        await Promise.all(
          ids.map((id) => offlineDb.syncQueue.update(id, { synced: 1 }))
        );
        await offlineDb.clearSynced();
        setLastSyncTime(new Date());
        await updatePendingCount();
      }
    } catch (err) {
      console.warn('Sync outbox deferred due to network/server error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, updatePendingCount]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);
    updatePendingCount();

    const handleOnline = () => {
      setIsOnline(true);
      syncOutbox();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic check every 15s
    const interval = setInterval(() => {
      updatePendingCount();
      if (navigator.onLine) {
        syncOutbox();
      }
    }, 15000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [syncOutbox, updatePendingCount]);

  const enqueueMutation = useCallback(
    async (
      table: SyncMutation['table'],
      action: SyncMutation['action'],
      payload: any
    ) => {
      await offlineDb.enqueueMutation(table, action, payload);
      await updatePendingCount();
      if (navigator.onLine) {
        syncOutbox();
      }
    },
    [syncOutbox, updatePendingCount]
  );

  return {
    isOnline,
    isSyncing,
    pendingCount,
    lastSyncTime,
    syncOutbox,
    enqueueMutation,
  };
}

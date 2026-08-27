'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { RankConfigItem, ClassItem } from '@/types';
import { RankCustomizerForm } from '@/components/gamification/rank-customizer-form';
import { Palette, ArrowLeft, Shield } from 'lucide-react';

export default function RankSettingsPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = use(params);

  const [classData, setClassData] = useState<ClassItem | null>(null);
  const [rankConfigs, setRankConfigs] = useState<RankConfigItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConfigs = async () => {
    try {
      const res = await fetch(`/api/classes/${classId}`);
      if (res.ok) {
        const data = await res.json();
        setClassData(data);
        setRankConfigs(data.rankConfigs || []);
      }
    } catch (err) {
      console.error('Failed to load rank configs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, [classId]);

  const handleSaveConfigs = async (newConfigs: RankConfigItem[]) => {
    const res = await fetch(`/api/classes/${classId}/rank-config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ configs: newConfigs }),
    });

    if (!res.ok) {
      throw new Error('Failed to update rank configs');
    }

    await fetchConfigs();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <Link
          href={`/classes/${classId}`}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold text-purple-500 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
              Rank Theme Builder
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Tùy Biến Cấp Bậc & Chủ Đề Thi Đua
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Lớp: {classData?.name} | Thay đổi danh hiệu, emoji, mã màu viền và mốc điểm sàn kích hoạt
          </p>
        </div>
      </div>

      <RankCustomizerForm
        classId={classId}
        initialConfigs={rankConfigs}
        onSave={handleSaveConfigs}
      />
    </div>
  );
}

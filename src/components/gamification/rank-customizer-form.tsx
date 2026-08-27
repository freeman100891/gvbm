'use client';

import React, { useState } from 'react';
import { StudentRank, RankConfigItem } from '@/types';
import {
  DEFAULT_RANK_CONFIGS,
  RANK_THEME_PRESETS,
} from '@/lib/gamification-engine';
import { RankAvatar } from './rank-avatar';
import { RankBadge } from './rank-badge';
import { Sparkles, Palette, Save, Check } from 'lucide-react';

interface RankCustomizerFormProps {
  classId: string;
  initialConfigs?: RankConfigItem[];
  onSave: (configs: RankConfigItem[]) => Promise<void>;
}

export const RankCustomizerForm: React.FC<RankCustomizerFormProps> = ({
  initialConfigs,
  onSave,
}) => {
  const [configs, setConfigs] = useState<Record<StudentRank, RankConfigItem>>(() => {
    const base = { ...DEFAULT_RANK_CONFIGS };
    if (initialConfigs && initialConfigs.length > 0) {
      initialConfigs.forEach((c) => {
        base[c.rank] = { ...c };
      });
    }
    return base;
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const applyPreset = (presetId: string) => {
    const preset = RANK_THEME_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setConfigs((prev) => {
      const updated = { ...prev };
      (Object.keys(preset.ranks) as StudentRank[]).forEach((rank) => {
        updated[rank] = {
          ...updated[rank],
          displayName: preset.ranks[rank].displayName,
          avatarType: preset.ranks[rank].avatarType,
          avatarValue: preset.ranks[rank].avatarValue,
          frameColor: preset.ranks[rank].frameColor,
          minPoints: preset.ranks[rank].minPoints,
        };
      });
      return updated;
    });
  };

  const handleFieldChange = (
    rank: StudentRank,
    field: keyof RankConfigItem,
    value: any
  ) => {
    setConfigs((prev) => ({
      ...prev,
      [rank]: {
        ...prev[rank],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const arrayConfigs = Object.values(configs);
      await onSave(arrayConfigs);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save rank configs:', err);
    } finally {
      setSaving(false);
    }
  };

  const ranksList: StudentRank[] = ['DAN', 'LINH', 'QUAN', 'VUA'];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Theme Presets Selector */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-purple-500" />
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Gói Chủ Đề Cấp Bậc Tích Hợp (Preset Themes)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {RANK_THEME_PRESETS.map((preset) => (
            <button
              type="button"
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-purple-400 dark:hover:border-purple-500 text-left transition hover:shadow-md group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  {preset.name}
                </span>
                <Sparkles className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                {preset.description}
              </p>

              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                {Object.values(preset.ranks).map((r, i) => (
                  <span
                    key={i}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-sm"
                    style={{ backgroundColor: `${r.frameColor}25`, border: `1px solid ${r.frameColor}` }}
                    title={r.displayName}
                  >
                    {r.avatarValue}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Rank Detail Customizer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ranksList.map((rankKey) => {
          const cfg = configs[rankKey];
          return (
            <div
              key={rankKey}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 shadow-sm transition hover:shadow-md"
              style={{ borderColor: `${cfg.frameColor}60` }}
            >
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <RankAvatar
                    fullName={cfg.displayName}
                    rank={rankKey}
                    rankConfig={cfg}
                    size="md"
                  />
                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">
                      Cấp Bậc: {rankKey}
                    </h4>
                    <RankBadge rank={rankKey} rankConfig={cfg} size="sm" />
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 font-medium">Ngưỡng tối thiểu</span>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">
                    {cfg.minPoints}+ pts
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    Tên Danh Hiệu Hiển Thị
                  </label>
                  <input
                    type="text"
                    value={cfg.displayName}
                    onChange={(e) =>
                      handleFieldChange(rankKey, 'displayName', e.target.value)
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="VD: Dân (Villager), Knight..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                      Emoji / Biểu tượng Avatar
                    </label>
                    <input
                      type="text"
                      value={cfg.avatarValue}
                      onChange={(e) =>
                        handleFieldChange(rankKey, 'avatarValue', e.target.value)
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none text-center"
                      placeholder="🌾, 🛡️, 📜, 👑..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                      Mã Màu Hào Quang (Hex)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={cfg.frameColor}
                        onChange={(e) =>
                          handleFieldChange(rankKey, 'frameColor', e.target.value)
                        }
                        className="w-10 h-10 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={cfg.frameColor}
                        onChange={(e) =>
                          handleFieldChange(rankKey, 'frameColor', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Điểm Sàn Kích Hoạt ({cfg.minPoints} điểm)
                    </label>
                  </div>
                  <input
                    type="range"
                    min={rankKey === 'DAN' ? 0 : 5}
                    max={200}
                    step={5}
                    value={cfg.minPoints}
                    onChange={(e) =>
                      handleFieldChange(
                        rankKey,
                        'minPoints',
                        parseInt(e.target.value, 10)
                      )
                    }
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-4">
        {savedSuccess && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 animate-fade-in">
            <Check className="w-4 h-4" />
            Đã lưu cấu hình thành công!
          </span>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition transform active:scale-95 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Đang Lưu...' : 'Lưu Thay Đổi Cấp Bậc'}
        </button>
      </div>
    </form>
  );
};

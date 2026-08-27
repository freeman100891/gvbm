'use client';

import React from 'react';
import { StudentRank, RankConfigItem } from '@/types';

interface RankBadgeProps {
  rank: StudentRank;
  rankConfig?: RankConfigItem;
  size?: 'sm' | 'md' | 'lg';
  showPointsThreshold?: boolean;
}

export const RankBadge: React.FC<RankBadgeProps> = ({
  rank,
  rankConfig,
  size = 'md',
  showPointsThreshold = false,
}) => {
  const frameColor =
    rankConfig?.frameColor ||
    (rank === 'VUA'
      ? '#EAB308'
      : rank === 'QUAN'
      ? '#A855F7'
      : rank === 'LINH'
      ? '#3B82F6'
      : '#10B981');

  const emoji =
    rankConfig?.avatarValue ||
    (rank === 'VUA'
      ? '👑'
      : rank === 'QUAN'
      ? '📜'
      : rank === 'LINH'
      ? '🛡️'
      : '🌾');

  const displayName = rankConfig?.displayName || (
    rank === 'VUA' ? 'Vua' :
    rank === 'QUAN' ? 'Quan' :
    rank === 'LINH' ? 'Lính' : 'Dân'
  );

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs md:text-sm gap-1.5 font-medium',
    lg: 'px-3.5 py-1.5 text-sm md:text-base gap-2 font-semibold',
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border transition-all shadow-sm ${sizeClasses[size]}`}
      style={{
        borderColor: frameColor,
        backgroundColor: `${frameColor}15`,
        color: frameColor,
      }}
    >
      <span className="shrink-0">{emoji}</span>
      <span className="font-semibold">{displayName}</span>
      {showPointsThreshold && rankConfig?.minPoints !== undefined && (
        <span className="text-[11px] opacity-75 ml-0.5">
          ({rankConfig.minPoints}+)
        </span>
      )}
    </div>
  );
};

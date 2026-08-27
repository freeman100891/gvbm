'use client';

import React from 'react';
import { StudentRank, RankConfigItem } from '@/types';

interface RankAvatarProps {
  fullName: string;
  avatarUrl?: string | null;
  rank: StudentRank;
  rankConfig?: RankConfigItem;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
}

export const RankAvatar: React.FC<RankAvatarProps> = ({
  fullName,
  avatarUrl,
  rank,
  rankConfig,
  size = 'md',
  showGlow = true,
}) => {
  const frameColor = rankConfig?.frameColor || (
    rank === 'VUA' ? '#EAB308' :
    rank === 'QUAN' ? '#A855F7' :
    rank === 'LINH' ? '#3B82F6' : '#10B981'
  );

  const emoji = rankConfig?.avatarValue || (
    rank === 'VUA' ? '👑' :
    rank === 'QUAN' ? '📜' :
    rank === 'LINH' ? '🛡️' : '🌾'
  );

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  const sizeClasses = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-13 h-13 text-sm',
    lg: 'w-18 h-18 text-base',
    xl: 'w-24 h-24 text-xl',
  };

  const badgeSizeClasses = {
    sm: 'w-4 h-4 text-[10px] -bottom-1 -right-1',
    md: 'w-6 h-6 text-xs -bottom-1 -right-1',
    lg: 'w-8 h-8 text-sm -bottom-1.5 -right-1.5',
    xl: 'w-10 h-10 text-base -bottom-2 -right-2',
  };

  const glowClass = !showGlow
    ? ''
    : rank === 'VUA'
    ? 'glow-aura-vua'
    : rank === 'QUAN'
    ? 'glow-aura-quan'
    : rank === 'LINH'
    ? 'glow-aura-linh'
    : 'glow-aura-dan';

  return (
    <div className="relative inline-block select-none">
      <div
        className={`relative rounded-full flex items-center justify-center font-bold text-white transition-all duration-300 ${sizeClasses[size]} ${glowClass}`}
        style={{
          borderWidth: size === 'xl' ? '4px' : size === 'lg' ? '3px' : '2px',
          borderColor: frameColor,
          background: `linear-gradient(135deg, ${frameColor}33, ${frameColor}88)`,
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span className="text-gray-900 dark:text-white font-extrabold tracking-tight">
            {initials}
          </span>
        )}
      </div>

      {/* Rank Icon / Emoji Overlay */}
      <div
        className={`absolute rounded-full flex items-center justify-center shadow-md bg-white dark:bg-slate-900 border ${badgeSizeClasses[size]}`}
        style={{ borderColor: frameColor }}
        title={`${rankConfig?.displayName || rank}`}
      >
        <span>{emoji}</span>
      </div>
    </div>
  );
};

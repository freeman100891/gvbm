import { StudentRank, RankConfigItem, RankThemePreset, PointLogItem, PeriodFilter } from '@/types';

export const DEFAULT_RANK_CONFIGS: Record<StudentRank, RankConfigItem> = {
  DAN: {
    rank: 'DAN',
    displayName: 'Dân (Villager)',
    avatarType: 'EMOJI',
    avatarValue: '🌾',
    frameColor: '#10B981',
    minPoints: 0,
  },
  LINH: {
    rank: 'LINH',
    displayName: 'Lính (Soldier)',
    avatarType: 'EMOJI',
    avatarValue: '🛡️',
    frameColor: '#3B82F6',
    minPoints: 30,
  },
  QUAN: {
    rank: 'QUAN',
    displayName: 'Quan (Scholar)',
    avatarType: 'EMOJI',
    avatarValue: '📜',
    frameColor: '#A855F7',
    minPoints: 60,
  },
  VUA: {
    rank: 'VUA',
    displayName: 'Vua (King)',
    avatarType: 'EMOJI',
    avatarValue: '👑',
    frameColor: '#EAB308',
    minPoints: 90,
  },
};

export const RANK_THEME_PRESETS: RankThemePreset[] = [
  {
    id: 'classic',
    name: 'Cổ điển Đại Việt (Classic)',
    description: 'Bộ cấp bậc truyền thống Dân - Lính - Quan - Vua thân thuộc và gần gũi',
    ranks: {
      DAN: {
        displayName: 'Dân (Villager)',
        avatarType: 'EMOJI',
        avatarValue: '🌾',
        frameColor: '#10B981',
        minPoints: 0,
        badgeIcon: 'Wheat',
      },
      LINH: {
        displayName: 'Lính (Soldier)',
        avatarType: 'EMOJI',
        avatarValue: '🛡️',
        frameColor: '#3B82F6',
        minPoints: 30,
        badgeIcon: 'Shield',
      },
      QUAN: {
        displayName: 'Quan (Scholar)',
        avatarType: 'EMOJI',
        avatarValue: '📜',
        frameColor: '#A855F7',
        minPoints: 60,
        badgeIcon: 'Scroll',
      },
      VUA: {
        displayName: 'Vua (King)',
        avatarType: 'EMOJI',
        avatarValue: '👑',
        frameColor: '#EAB308',
        minPoints: 90,
        badgeIcon: 'Crown',
      },
    },
  },
  {
    id: 'medieval',
    name: 'Medieval Fantasy',
    description: 'Phong cách hiệp sĩ phương Tây: Villager ➔ Knight ➔ Mage ➔ Emperor',
    ranks: {
      DAN: {
        displayName: 'Villager',
        avatarType: 'EMOJI',
        avatarValue: '🧑🌾',
        frameColor: '#10B981',
        minPoints: 0,
        badgeIcon: 'User',
      },
      LINH: {
        displayName: 'Knight',
        avatarType: 'EMOJI',
        avatarValue: '⚔️',
        frameColor: '#3B82F6',
        minPoints: 30,
        badgeIcon: 'Sword',
      },
      QUAN: {
        displayName: 'High Scholar / Mage',
        avatarType: 'EMOJI',
        avatarValue: '🔮',
        frameColor: '#9333EA',
        minPoints: 60,
        badgeIcon: 'Sparkles',
      },
      VUA: {
        displayName: 'Emperor',
        avatarType: 'EMOJI',
        avatarValue: '👑',
        frameColor: '#F59E0B',
        minPoints: 90,
        badgeIcon: 'Crown',
      },
    },
  },
  {
    id: 'space',
    name: 'Space Explorer',
    description: 'Chủ đề thám hiểm vũ trụ viễn tưởng: Cadet ➔ Pilot ➔ Commander ➔ Galactic Overlord',
    ranks: {
      DAN: {
        displayName: 'Space Cadet',
        avatarType: 'EMOJI',
        avatarValue: '🚀',
        frameColor: '#06B6D4',
        minPoints: 0,
        badgeIcon: 'Rocket',
      },
      LINH: {
        displayName: 'Star Pilot',
        avatarType: 'EMOJI',
        avatarValue: '🛸',
        frameColor: '#3B82F6',
        minPoints: 30,
        badgeIcon: 'Plane',
      },
      QUAN: {
        displayName: 'Fleet Commander',
        avatarType: 'EMOJI',
        avatarValue: '🛰️',
        frameColor: '#8B5CF6',
        minPoints: 60,
        badgeIcon: 'Compass',
      },
      VUA: {
        displayName: 'Galactic Overlord',
        avatarType: 'EMOJI',
        avatarValue: '🌌',
        frameColor: '#EC4899',
        minPoints: 90,
        badgeIcon: 'Sparkles',
      },
    },
  },
  {
    id: 'academic',
    name: 'Academic English Mastery',
    description: 'Chuẩn học thuật tiếng Anh: Beginner ➔ Challenger ➔ Achiever ➔ Grand Master',
    ranks: {
      DAN: {
        displayName: 'English Beginner',
        avatarType: 'EMOJI',
        avatarValue: '🌱',
        frameColor: '#10B981',
        minPoints: 0,
        badgeIcon: 'Sprout',
      },
      LINH: {
        displayName: 'Challenger',
        avatarType: 'EMOJI',
        avatarValue: '🎯',
        frameColor: '#2563EB',
        minPoints: 30,
        badgeIcon: 'Target',
      },
      QUAN: {
        displayName: 'Achiever',
        avatarType: 'EMOJI',
        avatarValue: '🏆',
        frameColor: '#7C3AED',
        minPoints: 60,
        badgeIcon: 'Trophy',
      },
      VUA: {
        displayName: 'Grand Master',
        avatarType: 'EMOJI',
        avatarValue: '💎',
        frameColor: '#D97706',
        minPoints: 90,
        badgeIcon: 'Gem',
      },
    },
  },
];

export const POINT_CRITERIA_PRESETS = [
  // Bonus points
  { label: 'New Vocab Master', points: 1, type: 'ADD', icon: 'BookOpen', color: 'emerald' },
  { label: 'Good Speaking / Presentation', points: 2, type: 'ADD', icon: 'Mic', color: 'blue' },
  { label: 'Completed Homework', points: 2, type: 'ADD', icon: 'CheckCircle', color: 'indigo' },
  { label: 'Helpful & Cooperative', points: 1, type: 'ADD', icon: 'Heart', color: 'rose' },
  { label: 'Active Participation', points: 1, type: 'ADD', icon: 'Flame', color: 'amber' },
  { label: 'Perfect Pronunciation', points: 2, type: 'ADD', icon: 'Sparkles', color: 'purple' },
  
  // Penalty points
  { label: 'Missed Homework', points: -2, type: 'DEDUCT', icon: 'XCircle', color: 'red' },
  { label: 'Speaking Vietnamese in English Zone', points: -1, type: 'DEDUCT', icon: 'MessageSquareOff', color: 'orange' },
  { label: 'Distracted / Off-task', points: -1, type: 'DEDUCT', icon: 'EyeOff', color: 'amber' },
  { label: 'Late to Class', points: -1, type: 'DEDUCT', icon: 'Clock', color: 'yellow' },
];

export const ENCOURAGING_DEMOTION_QUOTES = [
  "Don't give up! Keep climbing! 🌟",
  "Mistakes are proof that you are trying! Keep going! 💪",
  "Every master was once a beginner. Keep your head up! 🚀",
  "Small steps every day lead to big victories! ✨",
  "You've got this! Let's earn those points back! 🎯",
  "A stumble is not a defeat! You can rise again! 🛡️",
];

export function getRandomEncouragingQuote(): string {
  const index = Math.floor(Math.random() * ENCOURAGING_DEMOTION_QUOTES.length);
  return ENCOURAGING_DEMOTION_QUOTES[index];
}

export function calculateStudentRank(
  points: number,
  customConfigs?: RankConfigItem[] | null
): { rank: StudentRank; config: RankConfigItem } {
  const configs: Record<StudentRank, RankConfigItem> = {
    ...DEFAULT_RANK_CONFIGS,
  };

  if (customConfigs && customConfigs.length > 0) {
    customConfigs.forEach((cfg) => {
      configs[cfg.rank] = { ...configs[cfg.rank], ...cfg };
    });
  }

  // Sort descending by minPoints
  const sortedRanks: StudentRank[] = ['VUA', 'QUAN', 'LINH', 'DAN'];
  for (const r of sortedRanks) {
    if (points >= (configs[r]?.minPoints ?? DEFAULT_RANK_CONFIGS[r].minPoints)) {
      return { rank: r, config: configs[r] };
    }
  }

  return { rank: 'DAN', config: configs.DAN };
}

export function calculateTotalPoints(
  pointLogs: PointLogItem[],
  filter?: PeriodFilter
): number {
  if (!pointLogs || pointLogs.length === 0) return 0;

  let filtered = pointLogs;

  if (filter && filter.type !== 'all') {
    filtered = pointLogs.filter((log) => {
      const date = new Date(log.createdAt);
      if (filter.type === 'month') {
        return date.getMonth() + 1 === filter.month && date.getFullYear() === filter.year;
      }
      if (filter.type === 'semester') {
        const month = date.getMonth() + 1;
        const isSem1 = month >= 8 && month <= 12;
        const isSem2 = month >= 1 && month <= 5;
        if (filter.semester === 1) return isSem1 && date.getFullYear() === filter.year;
        if (filter.semester === 2) return isSem2 && date.getFullYear() === filter.year;
      }
      if (filter.type === 'year') {
        return date.getFullYear() === filter.year;
      }
      return true;
    });
  }

  return filtered.reduce((acc, curr) => acc + curr.pointsChanged, 0);
}

export function checkRankTransition(
  oldPoints: number,
  newPoints: number,
  customConfigs?: RankConfigItem[] | null
): {
  type: 'PROMOTION' | 'DEMOTION' | 'SAME';
  oldRank: StudentRank;
  newRank: StudentRank;
  newConfig: RankConfigItem;
} {
  const oldRankInfo = calculateStudentRank(oldPoints, customConfigs);
  const newRankInfo = calculateStudentRank(newPoints, customConfigs);

  const rankWeight: Record<StudentRank, number> = {
    DAN: 0,
    LINH: 1,
    QUAN: 2,
    VUA: 3,
  };

  const oldWeight = rankWeight[oldRankInfo.rank];
  const newWeight = rankWeight[newRankInfo.rank];

  if (newWeight > oldWeight) {
    return {
      type: 'PROMOTION',
      oldRank: oldRankInfo.rank,
      newRank: newRankInfo.rank,
      newConfig: newRankInfo.config,
    };
  } else if (newWeight < oldWeight) {
    return {
      type: 'DEMOTION',
      oldRank: oldRankInfo.rank,
      newRank: newRankInfo.rank,
      newConfig: newRankInfo.config,
    };
  }

  return {
    type: 'SAME',
    oldRank: oldRankInfo.rank,
    newRank: newRankInfo.rank,
    newConfig: newRankInfo.config,
  };
}

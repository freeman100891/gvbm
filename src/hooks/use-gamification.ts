'use client';

import { useState, useCallback } from 'react';
import {
  StudentRank,
  RankConfigItem,
  StudentWithStats,
  PeriodFilter,
} from '@/types';
import {
  calculateStudentRank,
  calculateTotalPoints,
  checkRankTransition,
  getRandomEncouragingQuote,
} from '@/lib/gamification-engine';
import { useSoundEffects } from './use-sound-effects';

export interface PromotionEvent {
  student: StudentWithStats;
  oldRank: StudentRank;
  newRank: StudentRank;
  config: RankConfigItem;
}

export interface DemotionEvent {
  student: StudentWithStats;
  oldRank: StudentRank;
  newRank: StudentRank;
  quote: string;
  config: RankConfigItem;
}

export function useGamification(customConfigs?: RankConfigItem[]) {
  const { playFanfare, playPositiveChime, playDeductTone, playGentleDemotionTone } =
    useSoundEffects();

  const [activePromotion, setActivePromotion] = useState<PromotionEvent | null>(
    null
  );
  const [activeDemotion, setActiveDemotion] = useState<DemotionEvent | null>(
    null
  );

  const processPointChange = useCallback(
    (
      student: StudentWithStats,
      delta: number,
      reason: string,
      options?: { isProjectorMode?: boolean; discreetDemotion?: boolean }
    ) => {
      const oldPoints = student.totalPoints;
      const newPoints = oldPoints + delta;

      const transition = checkRankTransition(
        oldPoints,
        newPoints,
        customConfigs
      );

      if (delta > 0) {
        playPositiveChime();
      } else {
        playDeductTone();
      }

      if (transition.type === 'PROMOTION') {
        // Trigger royal fanfare and modal
        playFanfare();
        setActivePromotion({
          student: { ...student, totalPoints: newPoints },
          oldRank: transition.oldRank,
          newRank: transition.newRank,
          config: transition.newConfig,
        });
      } else if (transition.type === 'DEMOTION') {
        // Check discreet demotion on projector
        const shouldSuppress =
          options?.isProjectorMode && options?.discreetDemotion;

        if (!shouldSuppress) {
          playGentleDemotionTone();
          setActiveDemotion({
            student: { ...student, totalPoints: newPoints },
            oldRank: transition.oldRank,
            newRank: transition.newRank,
            quote: getRandomEncouragingQuote(),
            config: transition.newConfig,
          });
        }
      }

      return {
        newPoints,
        transition,
      };
    },
    [
      customConfigs,
      playFanfare,
      playPositiveChime,
      playDeductTone,
      playGentleDemotionTone,
    ]
  );

  const closePromotionModal = useCallback(() => {
    setActivePromotion(null);
  }, []);

  const closeDemotionToast = useCallback(() => {
    setActiveDemotion(null);
  }, []);

  return {
    activePromotion,
    activeDemotion,
    processPointChange,
    closePromotionModal,
    closeDemotionToast,
    calculateRank: (pts: number) => calculateStudentRank(pts, customConfigs),
    calculateTotal: (logs: any[], filter?: PeriodFilter) =>
      calculateTotalPoints(logs, filter),
  };
}

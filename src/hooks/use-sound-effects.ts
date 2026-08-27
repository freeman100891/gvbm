'use client';

import { useState, useEffect, useCallback } from 'react';
import { soundEffects } from '@/lib/sound-effects';

export function useSoundEffects() {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('gvbm_sound_muted');
    if (stored !== null) {
      const muted = stored === 'true';
      setIsMuted(muted);
      soundEffects.setMuted(muted);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    soundEffects.setMuted(nextState);
    localStorage.setItem('gvbm_sound_muted', String(nextState));
  }, [isMuted]);

  return {
    isMuted,
    toggleMute,
    playPositiveChime: () => soundEffects.playPositiveChime(),
    playDeductTone: () => soundEffects.playDeductTone(),
    playFanfare: () => soundEffects.playFanfare(),
    playGentleDemotionTone: () => soundEffects.playGentleDemotionTone(),
    playTick: () => soundEffects.playTick(),
    playTimerAlarm: () => soundEffects.playTimerAlarm(),
  };
}

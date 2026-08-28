'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery() {
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const [windowHeight, setWindowHeight] = useState<number>(
    typeof window !== 'undefined' ? window.innerHeight : 800
  );
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateDimensions = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    setIsTouchDevice(
      'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
    );

    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;
  const isLargeScreen = windowWidth >= 1440;
  const is4k = windowWidth >= 2560;

  // Aspect ratio detection (e.g. 4:3 projector ~1.33 vs 16:9 widescreen ~1.77)
  const aspectRatio = windowHeight > 0 ? windowWidth / windowHeight : 1.77;
  const is4By3Projector = aspectRatio <= 1.45;

  return {
    windowWidth,
    windowHeight,
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
    is4k,
    isTouchDevice,
    aspectRatio,
    is4By3Projector,
  };
}

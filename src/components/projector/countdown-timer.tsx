'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import { KidButton } from '../ui/kid-button';
import {
  Play,
  Pause,
  RotateCcw,
  Timer,
  Clock,
  Maximize,
  Minimize,
  Sparkles,
  Rocket,
  Flame,
} from 'lucide-react';

interface CountdownTimerProps {
  initialSeconds?: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  initialSeconds = 180, // 3 minutes default
}) => {
  const { playTimerAlarm, playFanfare } = useSoundEffects();

  const [mode, setMode] = useState<'COUNTDOWN' | 'STOPWATCH'>('COUNTDOWN');
  const [totalDuration, setTotalDuration] = useState<number>(initialSeconds);
  const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      timer = setInterval(() => {
        if (mode === 'COUNTDOWN') {
          setSecondsLeft((prev) => {
            if (prev <= 1) {
              setIsRunning(false);
              playTimerAlarm();
              playFanfare();
              confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.5 },
              });
              return 0;
            }
            return prev - 1;
          });
        } else {
          setStopwatchSeconds((prev) => prev + 1);
        }
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isRunning, mode, playTimerAlarm, playFanfare]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const mStr = mins < 10 ? `0${mins}` : `${mins}`;
    const sStr = secs < 10 ? `0${secs}` : `${secs}`;
    return { mins: mStr, secs: sStr };
  };

  const handleSetTime = (minutes: number) => {
    setIsRunning(false);
    setMode('COUNTDOWN');
    setTotalDuration(minutes * 60);
    setSecondsLeft(minutes * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'COUNTDOWN') {
      setSecondsLeft(totalDuration);
    } else {
      setStopwatchSeconds(0);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Fullscreen error:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const displayTime =
    mode === 'COUNTDOWN'
      ? formatTime(secondsLeft)
      : formatTime(stopwatchSeconds);
  const isUrgent =
    mode === 'COUNTDOWN' && secondsLeft <= 30 && secondsLeft > 0;
  const isFinished = mode === 'COUNTDOWN' && secondsLeft === 0;

  // Progress calculation for rocket
  const progressPercent =
    mode === 'COUNTDOWN'
      ? Math.min(
          100,
          Math.max(
            0,
            ((totalDuration - secondsLeft) / (totalDuration || 1)) * 100
          )
        )
      : (stopwatchSeconds % 60) * (100 / 60);

  return (
    <div
      ref={containerRef}
      className={`relative rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-6 sm:p-8 shadow-2xl text-white flex flex-col items-center justify-between transition-all ${
        isFullscreen
          ? 'w-screen h-screen justify-center p-8 sm:p-14'
          : 'w-full max-w-2xl'
      }`}
    >
      {/* Header controls */}
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800/80 rounded-2xl p-1 border border-slate-700/60 shadow-inner">
            <button
              onClick={() => {
                setMode('COUNTDOWN');
                setIsRunning(false);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black rounded-xl transition ${
                mode === 'COUNTDOWN'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              Đếm Ngược ⏱️
            </button>
            <button
              onClick={() => {
                setMode('STOPWATCH');
                setIsRunning(false);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black rounded-xl transition ${
                mode === 'STOPWATCH'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Bấm Giờ 🎯
            </button>
          </div>
        </div>

        <button
          onClick={toggleFullscreen}
          className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          title="Toàn màn hình máy chiếu"
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Preset Buttons for Countdown (Kid 3D Chunky Buttons) */}
      {mode === 'COUNTDOWN' && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          {[
            { m: 1, icon: '⚡' },
            { m: 2, icon: '🎯' },
            { m: 3, icon: '🚀' },
            { m: 5, icon: '⭐' },
            { m: 10, icon: '🏆' },
          ].map((item) => (
            <button
              key={item.m}
              onClick={() => handleSetTime(item.m)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black transition border-b-2 transform active:translate-y-0.5 ${
                secondsLeft === item.m * 60 && !isRunning
                  ? 'bg-amber-400 text-slate-950 border-amber-600 shadow-md scale-105'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-950'
              }`}
            >
              <span>{item.icon}</span> {item.m} Phút
            </button>
          ))}
        </div>
      )}

      {/* Visual Rocket Space Flight Tracker */}
      <div className="w-full my-3 px-2">
        <div className="flex items-center justify-between text-[11px] font-black text-slate-400 mb-1.5">
          <span className="flex items-center gap-1">
            <span>🌍</span> Trạm Phóng
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-mono">
            {Math.round(progressPercent)}% Hành Trình
          </span>
          <span className="flex items-center gap-1">
            <span>🪐</span> Đích Đến 🏆
          </span>
        </div>

        {/* Orbit track */}
        <div className="relative h-6 w-full rounded-full bg-slate-950 border-2 border-slate-800 overflow-visible shadow-inner flex items-center px-1">
          {/* Progress fill */}
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              isUrgent
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 animate-pulse'
                : 'bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />

          {/* Gliding Rocket */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 text-2xl filter drop-shadow-md cursor-pointer pointer-events-none"
            style={{ left: `calc(${progressPercent}% - 14px)` }}
            animate={
              isRunning
                ? { y: ['-50%', '-60%', '-50%'], rotate: [0, 5, -5, 0] }
                : {}
            }
            transition={{ repeat: Infinity, duration: 1.2 }}
          >
            {isFinished ? '🎉' : isUrgent ? '🔥🚀' : '🚀'}
          </motion.div>
        </div>
      </div>

      {/* Massive Clock Digits Area */}
      <div className="my-4 flex items-center justify-center">
        <div
          className={`flex items-center gap-2 sm:gap-4 font-mono font-black select-none tracking-tight transition-all duration-300 ${
            isFullscreen
              ? 'text-8xl sm:text-[13rem]'
              : 'text-6xl sm:text-7xl'
          } ${
            isFinished
              ? 'text-rose-400 animate-bounce'
              : isUrgent
              ? 'text-amber-400 animate-pulse'
              : 'text-white'
          }`}
        >
          <div className="px-4 py-2 sm:px-6 sm:py-3 rounded-3xl bg-slate-950/90 border-2 border-slate-800 shadow-inner">
            {displayTime.mins}
          </div>
          <span className="text-amber-400 text-5xl sm:text-7xl">:</span>
          <div className="px-4 py-2 sm:px-6 sm:py-3 rounded-3xl bg-slate-950/90 border-2 border-slate-800 shadow-inner">
            {displayTime.secs}
          </div>
        </div>
      </div>

      {isFinished && (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: [0.8, 1.1, 1] }}
          className="mb-3 px-6 py-2 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-black text-sm sm:text-base shadow-xl flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          HẾT GIỜ THỬ THÁCH TIẾNG ANH! 🎉
          <Sparkles className="w-5 h-5" />
        </motion.div>
      )}

      {/* Action Controls */}
      <div className="w-full flex items-center justify-center gap-3 mt-4 pt-4 border-t border-slate-800">
        <KidButton
          variant={isRunning ? 'danger' : 'success'}
          size="lg"
          onClick={() => setIsRunning(!isRunning)}
          className="px-8"
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-white" />
              TẠM DỪNG
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-white" />
              {secondsLeft === 0 ? 'BẮT ĐẦU LẠI 🚀' : 'BẮT ĐẦU ⏱️'}
            </>
          )}
        </KidButton>

        <KidButton
          variant="neutral"
          size="lg"
          onClick={handleReset}
          className="px-6"
        >
          <RotateCcw className="w-4 h-4" />
          Đặt Lại
        </KidButton>
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import {
  Play,
  Pause,
  RotateCcw,
  Timer,
  Clock,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Sparkles,
} from 'lucide-react';

interface CountdownTimerProps {
  initialSeconds?: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  initialSeconds = 180, // 3 minutes default
}) => {
  const { playTimerAlarm } = useSoundEffects();

  const [mode, setMode] = useState<'COUNTDOWN' | 'STOPWATCH'>('COUNTDOWN');
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
  }, [isRunning, mode, playTimerAlarm]);

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
    setSecondsLeft(minutes * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'COUNTDOWN') {
      setSecondsLeft(initialSeconds);
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

  const displayTime = mode === 'COUNTDOWN' ? formatTime(secondsLeft) : formatTime(stopwatchSeconds);
  const isUrgent = mode === 'COUNTDOWN' && secondsLeft <= 30 && secondsLeft > 0;
  const isFinished = mode === 'COUNTDOWN' && secondsLeft === 0;

  return (
    <div
      ref={containerRef}
      className={`relative rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-8 shadow-2xl text-white flex flex-col items-center justify-between ${
        isFullscreen ? 'w-screen h-screen justify-center' : 'w-full max-w-2xl'
      }`}
    >
      {/* Header controls */}
      <div className="w-full flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
            <button
              onClick={() => {
                setMode('COUNTDOWN');
                setIsRunning(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition ${
                mode === 'COUNTDOWN'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              Đếm Ngược
            </button>
            <button
              onClick={() => {
                setMode('STOPWATCH');
                setIsRunning(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition ${
                mode === 'STOPWATCH'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Bấm Giờ
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Toàn màn hình máy chiếu"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Preset Buttons for Countdown */}
      {mode === 'COUNTDOWN' && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {[1, 2, 3, 5, 10, 15].map((m) => (
            <button
              key={m}
              onClick={() => handleSetTime(m)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                secondsLeft === m * 60 && !isRunning
                  ? 'bg-amber-500 text-slate-900 border-amber-400 shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              +{m} Phút
            </button>
          ))}
        </div>
      )}

      {/* Massive Clock Digits Area */}
      <div className="my-6 flex items-center justify-center">
        <div
          className={`flex items-center gap-2 sm:gap-4 font-mono font-black select-none tracking-tight transition-all duration-300 ${
            isFullscreen
              ? 'text-8xl sm:text-[14rem]'
              : 'text-6xl sm:text-8xl'
          } ${
            isFinished
              ? 'text-rose-500 animate-pulse'
              : isUrgent
              ? 'text-amber-400 animate-bounce-slight'
              : 'text-white'
          }`}
        >
          <div className="px-4 py-2 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-inner">
            {displayTime.mins}
          </div>
          <span className="text-amber-400">:</span>
          <div className="px-4 py-2 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-inner">
            {displayTime.secs}
          </div>
        </div>
      </div>

      {isFinished && (
        <div className="mb-4 flex items-center gap-2 text-rose-400 font-extrabold text-lg animate-bounce">
          <Sparkles className="w-5 h-5" />
          HẾT GIỜ THẢO LUẬN / LÀM BÀI!
          <Sparkles className="w-5 h-5" />
        </div>
      )}

      {/* Action Controls */}
      <div className="w-full flex items-center justify-center gap-4 mt-6 pt-4 border-t border-slate-800">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-black text-base transition transform active:scale-95 shadow-xl ${
            isRunning
              ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-white" />
              TẠM DỪNG
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-white" />
              {secondsLeft === 0 ? 'BẮT ĐẦU LẠI' : 'BẮT ĐẦU'}
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
        >
          <RotateCcw className="w-4 h-4" />
          Đặt Lại
        </button>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useSoundEffects } from '@/hooks/use-sound-effects';

export interface KidButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'sky' | 'neutral';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  sound?: boolean;
  children: React.ReactNode;
}

export const KidButton: React.FC<KidButtonProps> = ({
  variant = 'primary',
  size = 'md',
  sound = true,
  className = '',
  children,
  onClick,
  disabled,
  ...props
}) => {
  const { playTick } = useSoundEffects();

  const variantClasses = {
    primary:
      'bg-amber-400 hover:bg-amber-300 text-slate-950 border-b-4 border-amber-600 active:border-b-0 shadow-lg shadow-amber-400/20',
    success:
      'bg-emerald-500 hover:bg-emerald-400 text-white border-b-4 border-emerald-700 active:border-b-0 shadow-lg shadow-emerald-500/20',
    warning:
      'bg-orange-500 hover:bg-orange-400 text-white border-b-4 border-orange-700 active:border-b-0 shadow-lg shadow-orange-500/20',
    danger:
      'bg-rose-500 hover:bg-rose-400 text-white border-b-4 border-rose-700 active:border-b-0 shadow-lg shadow-rose-500/20',
    purple:
      'bg-purple-500 hover:bg-purple-400 text-white border-b-4 border-purple-700 active:border-b-0 shadow-lg shadow-purple-500/20',
    sky:
      'bg-sky-400 hover:bg-sky-300 text-slate-950 border-b-4 border-sky-600 active:border-b-0 shadow-lg shadow-sky-400/20',
    neutral:
      'bg-slate-800 hover:bg-slate-700 text-slate-100 border-b-4 border-slate-950 active:border-b-0 shadow-md',
  }[variant];

  const sizeClasses = {
    sm: 'px-3 py-1.5 rounded-xl text-xs font-black min-h-[36px]',
    md: 'px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black min-h-[44px]',
    lg: 'px-6 py-3.5 rounded-3xl text-sm sm:text-base font-black min-h-[50px]',
    xl: 'px-8 py-4.5 rounded-3xl text-base sm:text-lg font-black min-h-[58px]',
  }[size];

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (sound && !disabled) {
      playTick();
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.96, y: 3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      disabled={disabled}
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center gap-2 select-none font-sans transition-all duration-75 active:translate-y-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:border-b-4 ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

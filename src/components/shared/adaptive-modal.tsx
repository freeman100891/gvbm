'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '@/hooks/use-media-query';
import { X } from 'lucide-react';

interface AdaptiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  showCloseButton?: boolean;
}

const MAX_WIDTH_MAP = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
};

export const AdaptiveModal: React.FC<AdaptiveModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
  showCloseButton = true,
}) => {
  const { isMobile } = useMediaQuery();

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-center bg-black/60 backdrop-blur-md overflow-hidden">
        {/* Mobile: Bottom Sheet Layout */}
        {isMobile ? (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop click */}
            <div className="absolute inset-0" onClick={onClose} />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative z-10 w-full rounded-t-[32px] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden"
            >
              {/* Drag Handle */}
              <div className="w-full flex items-center justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>

              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <div>
                    {title && (
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {title}
                      </h3>
                    )}
                    {description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {description}
                      </p>
                    )}
                  </div>

                  {showCloseButton && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition touch-target-safe flex items-center justify-center"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Content Body */}
              <div className="p-6 overflow-y-auto overscroll-contain flex-1">
                {children}
              </div>
            </motion.div>
          </div>
        ) : (
          /* Desktop / Tablet: Centered Dialog Layout */
          <div className="relative flex items-center justify-center p-4 sm:p-6 w-full h-full">
            {/* Backdrop click */}
            <div className="absolute inset-0" onClick={onClose} />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`relative z-10 w-full ${MAX_WIDTH_MAP[maxWidth]} max-h-[90vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden`}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <div>
                    {title && (
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        {title}
                      </h3>
                    )}
                    {description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {description}
                      </p>
                    )}
                  </div>

                  {showCloseButton && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Content Body */}
              <div className="p-6 overflow-y-auto overscroll-contain flex-1">
                {children}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};

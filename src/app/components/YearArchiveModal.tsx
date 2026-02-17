import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { GitHubHeatmap } from './GitHubHeatmap';
import { RetroCard } from './RetroCard';

interface TimerSession {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  date: string;
}

interface YearArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: string;
  endDate: string;
  logs: any[];
  timerSessions: TimerSession[];
}

export const YearArchiveModal = ({ isOpen, onClose, startDate, endDate, logs, timerSessions }: YearArchiveModalProps) => {
  if (!isOpen) return null;

  // Safely handle timerSessions array
  const safeTimerSessions = Array.isArray(timerSessions) ? timerSessions : [];
  const daysWorked = new Set(safeTimerSessions.map(s => s.date)).size;
  const totalSessions = safeTimerSessions.length;
  const totalSeconds = safeTimerSessions.reduce((sum, s) => sum + s.duration, 0);
  const totalHours = Math.floor(totalSeconds / 3600);
  const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
  const totalTimeLabel = totalHours > 0 ? `${totalHours}h ${totalMinutes}m` : `${totalMinutes}m`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-4xl bg-[#e6e2d1] border-4 border-black shadow-[8px_8px_0px_black] p-6 overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6 sticky top-0 bg-[#e6e2d1] z-10">
            <h2 className="text-xl font-bold font-pixel tracking-tighter">DAILY_LOG_REPOSITORY</h2>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-black hover:text-white border-2 border-transparent hover:border-black transition-all"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[10px] font-pixel text-gray-500 uppercase">Mission Range</div>
                <div className="text-sm font-bold font-pixel">
                  {startDate} — {endDate}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center px-4 py-2 border-2 border-dashed border-gray-400">
                  <div className="text-xs font-pixel text-gray-500 uppercase">Days Worked</div>
                  <div className="text-2xl font-bold">{daysWorked}</div>
                </div>
                <div className="text-center px-4 py-2 border-2 border-dashed border-gray-400">
                  <div className="text-xs font-pixel text-gray-500 uppercase">Total Sessions</div>
                  <div className="text-2xl font-bold text-red-600">{totalSessions}</div>
                </div>
                <div className="text-center px-4 py-2 border-2 border-dashed border-gray-400">
                  <div className="text-xs font-pixel text-gray-500 uppercase">Total time (vibe coded)</div>
                  <div className="text-2xl font-bold text-orange-600">{totalTimeLabel}</div>
                </div>
              </div>
            </div>

            <div className="bg-[#f0ece0] border-4 border-black p-8 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.1)] flex flex-col items-center">
              <GitHubHeatmap 
                data={safeTimerSessions.reduce((acc: any[], session: TimerSession) => {
                  const dateStr = session.date;
                  const existing = acc.find(item => item.date === dateStr);
                  if (existing) {
                    existing.count += 1;
                    existing.totalMinutes += Math.floor(session.duration / 60);
                  } else {
                    acc.push({ 
                      date: dateStr, 
                      count: 1,
                      totalMinutes: Math.floor(session.duration / 60)
                    });
                  }
                  return acc;
                }, [])}
                year={2026}
              />
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <div className="ml-auto">
                <button 
                  onClick={onClose}
                  className="px-6 py-2 bg-black text-white font-pixel text-[10px] hover:bg-gray-800 transition-all shadow-[4px_4px_0px_#666]"
                >
                  CLOSE_ARCHIVE
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

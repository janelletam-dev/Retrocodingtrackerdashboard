import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface SmallWinsLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: Array<{
    id: string;
    text: string;
    date: string;
  }>;
}

export const SmallWinsLogModal = ({ isOpen, onClose, logs }: SmallWinsLogModalProps) => {
  if (!isOpen) return null;

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
          className="relative w-full max-w-2xl bg-[#e6e2d1] border-4 border-black shadow-[12px_12px_0px_black] p-6 overflow-hidden max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6 bg-[#e6e2d1] z-10">
            <div className="flex items-center gap-3">
              <Trophy size={24} className="text-orange-500" />
              <h2 className="text-xl font-bold font-pixel tracking-tighter uppercase">Victory Log Repository</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-black hover:text-white border-2 border-transparent hover:border-black transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-between mb-8 px-4 py-3 bg-white border-2 border-black shadow-[4px_4px_0px_black]">
            <div className="flex flex-col">
              <span className="text-[10px] font-pixel text-gray-500 uppercase">Total Victories</span>
              <span className="text-2xl font-black">{logs.length}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-pixel text-gray-500 uppercase">Last Updated</span>
              <span className="text-xs font-bold uppercase">
                {logs.length > 0 ? format(new Date(logs[0].date), 'MMM dd, yyyy') : 'N/A'}
              </span>
            </div>
          </div>

          {/* Logs List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
            {logs.length > 0 ? (
              logs.map((log) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={log.id} 
                  className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.1)] hover:shadow-[4px_4px_0px_black] transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-red-600 font-pixel text-[10px] font-bold">
                      <Calendar size={12} />
                      {format(new Date(log.date), 'MMMM dd, yyyy').toUpperCase()}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      {format(new Date(log.date), 'HH:mm:ss')}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-black uppercase tracking-tight">
                    {log.text}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 border-4 border-dashed border-black/10 text-gray-400">
                <Trophy size={48} className="mb-4 opacity-20" />
                <p className="font-pixel text-[10px] uppercase">No victories archived in the current cycle...</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t-2 border-black flex justify-between items-center">
            <span className="text-[10px] font-pixel text-gray-400">VIBE_OS // ARCHIVE_v2.1</span>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-black text-white font-pixel text-[10px] hover:bg-gray-800 transition-all shadow-[6px_6px_0px_#666] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none uppercase"
            >
              Close Archive
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

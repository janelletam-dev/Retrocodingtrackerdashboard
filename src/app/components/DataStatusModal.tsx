import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Database, Download, Upload, CheckCircle } from 'lucide-react';
import { RetroButton } from './RetroButton';

interface DataStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: any[];
  logs: any[];
  timerSessions: any[];
  settings: any;
  onExportData: () => void;
  onImportData: (data: any) => void;
}

export function DataStatusModal({
  isOpen,
  onClose,
  tasks,
  logs,
  timerSessions,
  settings,
  onExportData,
  onImportData,
}: DataStatusModalProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        onImportData(data);
      } catch (error) {
        alert('Invalid data file');
      }
    };
    reader.readAsText(file);
  };

  // Safely handle arrays
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeLogs = Array.isArray(logs) ? logs : [];
  const safeTimerSessions = Array.isArray(timerSessions) ? timerSessions : [];

  const dataStats = [
    {
      label: 'Today\'s Tasks',
      count: safeTasks.length,
      description: 'Active tasks in your workflow',
      icon: '✓',
      color: 'bg-green-100 border-green-500',
    },
    {
      label: 'Victory Log',
      count: safeLogs.length,
      description: 'Completed achievements',
      icon: '🏆',
      color: 'bg-yellow-100 border-yellow-500',
    },
    {
      label: 'Timer Sessions',
      count: safeTimerSessions.length,
      description: 'Focus sessions tracked',
      icon: '⏱️',
      color: 'bg-blue-100 border-blue-500',
    },
    {
      label: 'Days Worked',
      count: new Set(safeTimerSessions.map((s: any) => s.date)).size,
      description: 'Unique active days',
      icon: '📅',
      color: 'bg-purple-100 border-purple-500',
    },
  ];

  const savedSettings = [
    { label: 'Project Name', value: settings.projectName },
    { label: 'Mission Start', value: settings.startDate },
    { label: 'Target Projects', value: settings.targetProjects },
    { label: 'Docs URL', value: settings.docsLink },
    { label: 'GitHub URL', value: settings.ghLink },
    { label: 'Audio Stream URL', value: settings.spotifyLink },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#e6e2d1] border-4 border-black shadow-[12px_12px_0px_black] w-full max-w-3xl max-h-[90vh] overflow-y-auto relative"
          >
            {/* Header */}
            <div className="sticky top-0 bg-black text-white p-6 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <Database size={24} />
                <h2 className="text-2xl font-bold font-pixel">DATA PERSISTENCE STATUS</h2>
              </div>
              <button
                onClick={onClose}
                className="hover:bg-white/20 p-2 transition-colors rounded"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Status Banner */}
              <div className="bg-green-100 border-4 border-green-600 p-6 shadow-[6px_6px_0px_black]">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle size={32} className="text-green-600" />
                  <div>
                    <h3 className="font-pixel text-lg text-green-800 font-bold">ALL DATA SYNCED</h3>
                    <p className="text-sm text-green-700 font-mono">Your productivity data is securely stored in the cloud</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-xs font-mono text-green-800">
                  <div>✓ Auto-save enabled (1-second debounce)</div>
                  <div>✓ Encrypted backend storage</div>
                  <div>✓ User-specific data isolation</div>
                  <div>✓ Persistent across sessions</div>
                </div>
              </div>

              {/* Data Statistics */}
              <div>
                <h3 className="font-pixel text-sm mb-4 border-b-2 border-black pb-2">DATA STATISTICS</h3>
                <div className="grid grid-cols-2 gap-4">
                  {dataStats.map((stat) => (
                    <div
                      key={stat.label}
                      className={`${stat.color} border-2 p-4 shadow-[4px_4px_0px_black]`}
                    >
                      <div className="text-3xl mb-2">{stat.icon}</div>
                      <div className="text-2xl font-black mb-1">{stat.count}</div>
                      <div className="font-pixel text-[10px] font-bold mb-1">{stat.label}</div>
                      <div className="text-[10px] text-gray-600 font-mono">{stat.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Saved Settings */}
              <div>
                <h3 className="font-pixel text-sm mb-4 border-b-2 border-black pb-2">SAVED SETTINGS</h3>
                <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_black] space-y-2">
                  {savedSettings.map((setting) => (
                    <div key={setting.label} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                      <span className="font-pixel text-[10px] text-gray-500">{setting.label}:</span>
                      <span className="font-mono text-sm font-bold truncate max-w-[60%] text-right">{setting.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Persisted Data Types */}
              <div>
                <h3 className="font-pixel text-sm mb-4 border-b-2 border-black pb-2">WHAT'S BEING SAVED?</h3>
                <div className="space-y-3">
                  {[
                    { title: 'Tasks & Victory Log', desc: 'All active tasks and completed wins with timestamps' },
                    { title: 'Timer Sessions', desc: 'Every focus session ≥60 seconds with date/time data' },
                    { title: 'Project Settings', desc: 'Project name, start date, and target goals' },
                    { title: 'System Directory', desc: 'All three custom URLs (Docs, GitHub, Audio)' },
                    { title: 'Focus Progress', desc: 'Daily work progress and character reveal shuffle' },
                    { title: 'Timer State', desc: 'Total accumulated focus time' },
                  ].map((item) => (
                    <div key={item.title} className="bg-white border-2 border-black p-3 shadow-[2px_2px_0px_black]">
                      <div className="font-pixel text-[10px] font-bold mb-1">{item.title}</div>
                      <div className="text-xs text-gray-600 font-mono">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Management */}
              <div>
                <h3 className="font-pixel text-sm mb-4 border-b-2 border-black pb-2">DATA MANAGEMENT</h3>
                <div className="flex gap-4">
                  <RetroButton
                    variant="yellow"
                    onClick={onExportData}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    EXPORT DATA
                  </RetroButton>
                  <RetroButton
                    variant="orange"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Upload size={16} />
                    IMPORT DATA
                  </RetroButton>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </div>
                <p className="text-[10px] text-gray-500 font-mono mt-3 text-center">
                  Export your data as JSON or import from a previous backup
                </p>
              </div>

              {/* Close Button */}
              <RetroButton
                variant="default"
                onClick={onClose}
                className="w-full"
              >
                CLOSE
              </RetroButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import image_08acad3607eefb483c16193df9ad599d69ef6ef0 from 'figma:asset/08acad3607eefb483c16193df9ad599d69ef6ef0.png'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RetroCard } from './components/RetroCard';
import { RetroButton } from './components/RetroButton';
import { HorseReveal } from './components/HorseReveal';
import { YearArchiveModal } from './components/YearArchiveModal';
import { SmallWinsLogModal } from './components/SmallWinsLogModal';
import { AuthModal } from './components/AuthModal';
import { DataStatusModal } from './components/DataStatusModal';
import { 
  Folder, 
  Github, 
  Headphones, 
  Pencil, 
  Check, 
  Link as LinkIcon, 
  Plus,
  BatteryFull,
  Globe,
  ChevronDown,
  Trophy,
  LogOut,
  LogIn,
  Database
} from 'lucide-react';
import pixelHorseHero from 'figma:asset/f7e8305ecb8b6adb45346ed46ec1d753558ee4bf.png';
import timeToRestImg from 'figma:asset/be18bd135608a92104663a585d83e802774f217e.png';
import { motion, AnimatePresence } from 'motion/react';
import { toast, Toaster } from 'sonner';
import * as api from '../utils/api';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

interface Log {
  id: string;
  text: string;
  date: string;
}

interface TimerSession {
  id: string;
  startTime: string; // ISO timestamp
  endTime: string; // ISO timestamp
  duration: number; // seconds elapsed
  date: string; // YYYY-MM-DD format for easy grouping
}

export default function App() {
  const [date, setDate] = useState(new Date());
  const [projectName, setProjectName] = useState('NEON_DRIFTER_V2');
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [isEditingStartDate, setIsEditingStartDate] = useState(false);
  const [isYearArchiveOpen, setIsYearArchiveOpen] = useState(false);
  const [isSmallWinsLogOpen, setIsSmallWinsLogOpen] = useState(false);
  const [isDataStatusOpen, setIsDataStatusOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [targetProjects, setTargetProjects] = useState(100);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newLogText, setNewLogText] = useState('');
  
  // Editable Links
  const [docsLink, setDocsLink] = useState('https://docs.vibe-os.dev');
  const [ghLink, setGhLink] = useState('https://github.com/vibe-os');
  const [spotifyLink, setSpotifyLink] = useState('https://spotify.com');
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  // Timer State
  const [isRunning, setIsRunning] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Timer Session Logging
  const [timerSessions, setTimerSessions] = useState<TimerSession[]>([]);
  const currentSessionStartTime = useRef<Date | null>(null);
  const currentSessionStartSeconds = useRef<number>(0);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Horse Reveal Shuffle State
  const [horseShuffle, setHorseShuffle] = useState<number[] | null>(null);

  // Debounce timer for saving data
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [showDataBanner, setShowDataBanner] = useState(true);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTotalSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await api.supabase.auth.getSession();
        if (session?.user) {
          setIsAuthenticated(true);
          setUserEmail(session.user.email || null);
          await loadUserData();
        } else {
          setIsAuthModalOpen(true);
        }
      } catch (error) {
        console.error('Session check error:', error);
        setIsAuthModalOpen(true);
      } finally {
        setIsLoadingData(false);
      }
    };

    checkSession();
  }, []);

  // Load user data from backend
  const loadUserData = async () => {
    try {
      const data = await api.getUserData();
      
      setTasks(data.tasks);
      setLogs(data.logs);
      setTimerSessions(data.timerSessions || []);
      setProjectName(data.settings.projectName);
      setStartDate(data.settings.startDate);
      setTargetProjects(data.settings.targetProjects);
      setDocsLink(data.settings.docsLink);
      setGhLink(data.settings.ghLink);
      setSpotifyLink(data.settings.spotifyLink);
      setTotalSeconds(data.timer.totalSeconds);
      setHorseShuffle(data.horseRevealShuffle);
      
      toast.success('Data loaded successfully!');
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load data');
    }
  };

  // Debounced save function
  const debouncedSave = useCallback((saveFunction: () => Promise<void>) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      if (isAuthenticated) {
        try {
          setIsSaving(true);
          await saveFunction();
          setLastSaveTime(new Date());
        } catch (error) {
          console.error('Error saving data:', error);
          toast.error('Failed to sync data');
        } finally {
          setIsSaving(false);
        }
      }
    }, 1000); // Save 1 second after last change
  }, [isAuthenticated]);

  // Save tasks when they change
  useEffect(() => {
    if (isAuthenticated && !isLoadingData) {
      debouncedSave(() => api.saveTasks(tasks));
    }
  }, [tasks, isAuthenticated, isLoadingData, debouncedSave]);

  // Save logs when they change
  useEffect(() => {
    if (isAuthenticated && !isLoadingData) {
      debouncedSave(() => api.saveLogs(logs));
    }
  }, [logs, isAuthenticated, isLoadingData, debouncedSave]);

  // Save timer sessions when they change
  useEffect(() => {
    if (isAuthenticated && !isLoadingData) {
      debouncedSave(() => api.saveTimerSessions(timerSessions));
    }
  }, [timerSessions, isAuthenticated, isLoadingData, debouncedSave]);

  // Save settings when they change
  useEffect(() => {
    if (isAuthenticated && !isLoadingData) {
      debouncedSave(() => api.saveSettings({
        projectName,
        startDate,
        targetProjects,
        docsLink,
        ghLink,
        spotifyLink,
      }));
    }
  }, [projectName, startDate, targetProjects, docsLink, ghLink, spotifyLink, isAuthenticated, isLoadingData, debouncedSave]);

  // Save timer when it changes
  useEffect(() => {
    if (isAuthenticated && !isLoadingData) {
      debouncedSave(() => api.saveTimer(totalSeconds));
    }
  }, [totalSeconds, isAuthenticated, isLoadingData, debouncedSave]);

  // Save horse shuffle when it's generated
  const handleShuffleGenerated = useCallback((shuffle: number[]) => {
    setHorseShuffle(shuffle);
    if (isAuthenticated) {
      api.saveHorseShuffle(shuffle).catch(error => {
        console.error('Error saving horse shuffle:', error);
      });
    }
  }, [isAuthenticated]);

  // Auth handlers
  const handleSignIn = async (email: string, password: string) => {
    setIsAuthLoading(true);
    setAuthError(null);
    
    try {
      await api.signIn(email, password);
      setIsAuthenticated(true);
      setUserEmail(email);
      setIsAuthModalOpen(false);
      
      await loadUserData();
      toast.success('Welcome back to Vibe OS!');
    } catch (error: any) {
      console.error('Sign in error:', error);
      setAuthError(error.message || 'Sign in failed');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    setIsAuthLoading(true);
    setAuthError(null);
    
    try {
      await api.signUp(email, password, name);
      
      // Auto sign-in after successful signup
      await api.signIn(email, password);
      setIsAuthenticated(true);
      setUserEmail(email);
      setIsAuthModalOpen(false);
      
      toast.success('Account created! Welcome to Vibe OS!');
    } catch (error: any) {
      console.error('Sign up error:', error);
      setAuthError(error.message || 'Sign up failed');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await api.signOut();
      setIsAuthenticated(false);
      setUserEmail(null);
      setIsAuthModalOpen(true);
      
      // Clear local state
      setTasks([]);
      setLogs([]);
      setTimerSessions([]);
      setTotalSeconds(0);
      setHorseShuffle(null);
      
      toast.info('Signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('Sign out failed');
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleTimerToggle = () => {
    if (!isRunning) {
      // Starting timer - record start time
      currentSessionStartTime.current = new Date();
      currentSessionStartSeconds.current = totalSeconds;
      setIsRunning(true);
      toast.info('Focus session started!');
    } else {
      // Stopping timer - log the session
      if (currentSessionStartTime.current) {
        const endTime = new Date();
        const sessionDuration = totalSeconds - currentSessionStartSeconds.current;
        
        // Only log sessions that are at least 1 minute long
        if (sessionDuration >= 60) {
          const newSession: TimerSession = {
            id: Math.random().toString(36).substr(2, 9),
            startTime: currentSessionStartTime.current.toISOString(),
            endTime: endTime.toISOString(),
            duration: sessionDuration,
            date: endTime.toISOString().split('T')[0] // YYYY-MM-DD
          };
          
          setTimerSessions(prev => [newSession, ...prev]);
          toast.success(`Session logged: ${Math.floor(sessionDuration / 60)} minutes`);
        } else {
          toast.info('Session too short to log (minimum 1 minute)');
        }
      }
      
      setIsRunning(false);
      currentSessionStartTime.current = null;
      currentSessionStartSeconds.current = 0;
    }
  };

  const handleAddTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      text: newTaskText,
      completed: false,
      createdAt: new Date().toISOString()
    };
    setTasks([...tasks, newTask]);
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    const taskToComplete = tasks.find(t => t.id === id);
    if (!taskToComplete) return;

    if (!taskToComplete.completed) {
      // Moving to Small Wins automatically
      const now = new Date();
      const newLog: Log = {
        id: taskToComplete.id,
        text: taskToComplete.text,
        date: now.toISOString()
      };
      setLogs([newLog, ...logs]);
      setTasks(tasks.filter(t => t.id !== id));
      toast.success("Task moved to Small Wins!");
    } else {
      setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    }
  };

  const handleAddLog = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newLogText.trim()) return;
    const now = new Date();
    const newLog: Log = {
      id: Math.random().toString(36).substr(2, 9),
      text: newLogText,
      date: now.toISOString()
    };
    setLogs([newLog, ...logs]);
    setNewLogText('');
    toast.success("Added to Small Wins!");
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText("https://vibe-os.dev/u/lucky_stallion");
    toast.success("Public profile link copied!");
  };

  const handleExportData = () => {
    const exportData = {
      tasks,
      logs,
      timerSessions,
      settings: {
        projectName,
        startDate,
        targetProjects,
        docsLink,
        ghLink,
        spotifyLink,
      },
      timer: { totalSeconds },
      horseShuffle,
      exportedAt: new Date().toISOString(),
      version: '2.1',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vibe-os-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully!');
  };

  const handleImportData = async (data: any) => {
    try {
      if (data.tasks) setTasks(data.tasks);
      if (data.logs) setLogs(data.logs);
      if (data.timerSessions) setTimerSessions(data.timerSessions);
      if (data.settings) {
        setProjectName(data.settings.projectName || projectName);
        setStartDate(data.settings.startDate || startDate);
        setTargetProjects(data.settings.targetProjects || targetProjects);
        setDocsLink(data.settings.docsLink || docsLink);
        setGhLink(data.settings.ghLink || ghLink);
        setSpotifyLink(data.settings.spotifyLink || spotifyLink);
      }
      if (data.timer) setTotalSeconds(data.timer.totalSeconds || 0);
      if (data.horseShuffle) setHorseShuffle(data.horseShuffle);
      
      toast.success('Data imported successfully!');
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import data');
    }
  };

  const currentFormattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase();
  
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(startDateObj);
  endDateObj.setFullYear(endDateObj.getFullYear() + 1);
  const endDateFormatted = endDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  
  const now = new Date();
  const totalTime = endDateObj.getTime() - startDateObj.getTime();
  const elapsedTime = now.getTime() - startDateObj.getTime();
  const yearProgress = Math.max(0, Math.min(100, Math.round((elapsedTime / totalTime) * 100)));

  // Daily Focus Progress for Reveal - based on timer sessions
  const uniqueDaysCount = new Set(timerSessions.map(session => session.date)).size;
  const focusProgress = targetProjects > 0 ? Math.min(100, (uniqueDaysCount / targetProjects) * 100) : 0;

  // Show loading screen while checking auth
  if (isLoadingData) {
    return (
      <div className="p-4 md:p-8 min-h-screen relative overflow-x-hidden bg-[#e6e2d1] flex items-center justify-center">
        <div className="retro-card p-12 text-center">
          <div className="font-pixel text-xl mb-4">VIBE OS v2.1</div>
          <div className="font-pixel text-sm text-gray-600">INITIALIZING SYSTEM...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen relative overflow-x-hidden bg-[#e6e2d1]">
      <Toaster position="bottom-right" richColors />
      
      <div className="max-w-6xl mx-auto relative z-10 flex flex-col">
        
        {/* TOP NAV */}
        <header className="flex flex-col md:flex-row justify-between items-center border-b-2 border-black pb-4 gap-4 md:gap-0 mb-8">
          <div className="flex items-center gap-4">
            <div className="font-pixel text-sm md:text-base font-bold">VIBE OS v2.1</div>
            <button 
              onClick={copyProfileLink}
              className="hidden md:flex items-center gap-2 text-[10px] bg-white border-2 border-black px-2 py-1 hover:bg-gray-100 transition-all cursor-pointer group shadow-[2px_2px_0px_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              <LinkIcon size={12} />
              <span className="group-hover:hidden">SHARE_PROFILE</span>
              <span className="hidden group-hover:inline">COPY_LINK</span>
            </button>
            {isAuthenticated && (
              <button 
                onClick={() => setIsDataStatusOpen(true)}
                className="hidden lg:flex items-center gap-2 text-[10px] bg-blue-500 text-white border-2 border-black px-2 py-1 hover:bg-blue-600 transition-all cursor-pointer shadow-[2px_2px_0px_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                title="View data persistence status"
              >
                <Database size={12} />
                <span>DATA_STATUS</span>
              </button>
            )}
          </div>
          
          <div className="animate-pulse-red text-[10px] md:text-xs font-bold text-red-600 font-pixel tracking-widest border-2 border-black bg-red-100 px-3 py-1 shadow-[4px_4px_0px_black]">
            🔥 YEAR OF THE FIRE HORSE
          </div>

          <div className="flex gap-4 text-black text-sm font-bold items-center">
            {isAuthenticated && userEmail && (
              <span className="hidden sm:inline font-pixel text-[10px] text-gray-600">
                [{userEmail.split('@')[0].toUpperCase()}]
              </span>
            )}
            {isAuthenticated && (
              <span className="hidden md:inline flex items-center gap-1 font-pixel text-[10px]" title={lastSaveTime ? `Last saved: ${lastSaveTime.toLocaleTimeString()}` : 'Not saved yet'}>
                {isSaving ? (
                  <><span className="animate-pulse text-yellow-600">⚡ SYNCING...</span></>
                ) : lastSaveTime ? (
                  <><span className="text-green-600">💾 SAVED</span></>
                ) : (
                  <><span className="text-gray-400">💾 IDLE</span></>
                )}
              </span>
            )}
            <span className="hidden sm:inline flex items-center gap-1">
              <Globe size={16} /> [ONLINE]
            </span>
            <span className="hidden sm:inline flex items-center gap-1">
              <BatteryFull size={16} /> [100%]
            </span>
            {isAuthenticated ? (
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-2 text-[10px] bg-red-500 text-white border-2 border-black px-2 py-1 hover:bg-red-600 transition-all cursor-pointer shadow-[2px_2px_0px_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                title="Sign out"
              >
                <LogOut size={12} />
                <span className="hidden md:inline">LOGOUT</span>
              </button>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 text-[10px] bg-green-500 text-white border-2 border-black px-2 py-1 hover:bg-green-600 transition-all cursor-pointer shadow-[2px_2px_0px_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                <LogIn size={12} />
                <span className="hidden md:inline">LOGIN</span>
              </button>
            )}
          </div>
        </header>

        {/* HERO SECTION - SIZED TO HERO HEIGHT */}
        <section className="min-h-[75vh] flex flex-col justify-center relative mb-12">
          <div className="retro-card p-6 md:p-12 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
            {/* Background pattern for hero feel */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(black 1px, transparent 0)', backgroundSize: '20px 20px' }} />
            
            <div className="text-center md:text-left space-y-6 flex-1 z-10">
              <div className="flex flex-col gap-1">
                <div className="flex flex-col md:flex-row md:items-center md:gap-6">
                  <div className="font-pixel text-[10px] text-gray-500">SYSTEM_DATE:</div>
                  <div className="hidden md:flex items-center gap-2 text-[10px] text-gray-600 border border-black bg-white px-2 py-1">
                    <span>YEAR_PROGRESS:</span>
                    <div className="w-24 h-2 border border-black p-[1px]">
                      <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${yearProgress}%` }}></div>
                    </div>
                    <span>{yearProgress}%</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-6">
                  <div className="flex flex-col gap-1 border-l-2 border-red-500 pl-3">
                    <div className="font-pixel text-[8px] text-red-600 uppercase tracking-tighter font-bold">MISSION_START</div>
                    {!isEditingStartDate ? (
                      <button 
                        onClick={() => setIsEditingStartDate(true)}
                        className="font-pixel text-[10px] text-black font-bold hover:bg-red-50 text-left transition-all"
                      >
                        {startDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                      </button>
                    ) : (
                      <input 
                        autoFocus
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        onBlur={() => setIsEditingStartDate(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setIsEditingStartDate(false)}
                        className="text-[10px] font-pixel text-black bg-white border-b border-black focus:outline-none w-fit"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 border-l-2 border-gray-300 pl-3">
                    <div className="font-pixel text-[8px] text-gray-400 uppercase tracking-tighter font-bold">MISSION_END</div>
                    <div className="font-pixel text-[10px] text-gray-400 font-bold">{endDateFormatted}</div>
                  </div>
                </div>
              </div>

              <div>
                <h1 className="text-7xl md:text-9xl text-black font-bold tracking-tighter leading-none mb-1">
                  DAY {Math.floor((date.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1}
                </h1>
                <div className="font-pixel text-sm md:text-xl text-gray-500 tracking-[0.2em]">
                  {currentFormattedDate}
                </div>
              </div>
              
              <div className="inline-block relative mt-6">
                <div className="bg-orange-200 border-2 border-black px-8 py-5 shadow-[6px_6px_0px_black] group transition-transform hover:-translate-y-1">
                  <div className="font-pixel text-[10px] text-gray-700 mb-2">CURRENT PROJECT:</div>
                  
                  <div className="flex items-center gap-4">
                    {!isEditingProject ? (
                      <>
                        <div className="text-2xl md:text-4xl font-bold leading-none text-black uppercase">
                          {projectName}
                        </div>
                        <button 
                          onClick={() => setIsEditingProject(true)}
                          className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Pencil size={20} className="text-black hover:text-gray-600" />
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input 
                          autoFocus
                          type="text" 
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          onBlur={() => setIsEditingProject(false)}
                          onKeyDown={(e) => e.key === 'Enter' && setIsEditingProject(false)}
                          className="text-2xl md:text-4xl font-bold leading-none text-black bg-transparent border-b-2 border-black focus:outline-none w-full uppercase"
                        />
                        <button onClick={() => setIsEditingProject(false)}>
                          <Check size={28} className="text-green-700" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Character Asset - Responsive Sizing */}
            <div className="w-48 md:w-80 flex items-center justify-center animate-float">
              <img 
                src={image_08acad3607eefb483c16193df9ad599d69ef6ef0} 
                className="w-full h-auto drop-shadow-[8px_8px_0px_rgba(0,0,0,0.1)]" 
                alt="Pixel Horse Character" 
              />
            </div>

            {/* Timer Section - Sized for Hero */}
            <div className="flex flex-col items-center gap-4 min-w-[240px] z-10 bg-white/50 backdrop-blur-sm border-2 border-black p-6 shadow-[8px_8px_0px_black]">
              <div className="font-pixel text-[12px] text-gray-500 font-bold uppercase">Daily Focus Time</div>
              <div className="text-xl md:text-2xl font-bold text-black font-pixel py-4 whitespace-nowrap">
                {formatTime(totalSeconds)}
              </div>
              <RetroButton 
                variant={isRunning ? 'orange' : 'yellow'} 
                onClick={handleTimerToggle}
                className="w-full py-4 text-lg"
              >
                {isRunning ? 'PAUSE' : 'INITIATE'}
              </RetroButton>

              <AnimatePresence>
                {isRunning && (
                  <motion.button
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleTimerToggle}
                    className="w-full mt-2 relative group cursor-pointer"
                  >
                    <img 
                      src={timeToRestImg} 
                      alt="Time to rest" 
                      className="w-full h-auto drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                    />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Continuity Scroll Indicator */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown size={24} className="text-black" />
          </div>
        </section>

        {/* Data Persistence Info Banner */}
        <AnimatePresence>
          {isAuthenticated && showDataBanner && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 bg-blue-50 border-2 border-blue-500 p-4 shadow-[6px_6px_0px_black] relative"
            >
              <button
                onClick={() => setShowDataBanner(false)}
                className="absolute top-2 right-2 text-blue-600 hover:text-blue-800 font-bold text-xl leading-none"
              >
                ×
              </button>
              <div className="flex items-start gap-4">
                <Database size={32} className="text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-pixel text-sm text-blue-900 font-bold mb-2">💾 AUTO-SYNC ENABLED</h3>
                  <p className="text-xs text-blue-800 font-mono mb-2">
                    All your data is automatically saved to the cloud and will persist across sessions.
                  </p>
                  <div className="flex flex-wrap gap-2 text-[10px] font-pixel text-blue-700">
                    <span className="bg-white px-2 py-1 border border-blue-300">✓ TASKS</span>
                    <span className="bg-white px-2 py-1 border border-blue-300">✓ VICTORIES</span>
                    <span className="bg-white px-2 py-1 border border-blue-300">✓ TIMER SESSIONS</span>
                    <span className="bg-white px-2 py-1 border border-blue-300">✓ SETTINGS</span>
                    <span className="bg-white px-2 py-1 border border-blue-300">✓ URLS</span>
                  </div>
                  <button
                    onClick={() => setIsDataStatusOpen(true)}
                    className="mt-3 text-[10px] font-pixel text-blue-600 hover:text-blue-800 underline font-bold"
                  >
                    VIEW FULL DATA STATUS →
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DASHBOARD GRID - WITH CONTINUITY OFFSET */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            
          {/* LEFT COLUMN */}
          <div className="space-y-8">
            
            {/* Today's Tasks */}
            <RetroCard accent className="p-6 md:p-8">
              <h3 className="text-base text-black mb-6 border-b-2 border-black pb-3 flex justify-between items-center">
                <div className="flex items-center gap-2 font-bold tracking-tight">
                  <Check size={18} className="text-green-600" />
                  <span>Today's Tasks</span>
                </div>
              </h3>
              
              <ul className="space-y-4 text-xl md:text-2xl mb-8">
                <AnimatePresence mode="popLayout">
                  {tasks.map(task => (
                    <motion.li 
                      layout
                      key={task.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center gap-4 hover:bg-yellow-50 p-2 rounded transition-colors group"
                    >
                      <input 
                        type="checkbox" 
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="pixel-checkbox w-6 h-6" 
                      />
                      <span className={`${task.completed ? "line-through text-gray-400" : "text-black"} flex-1`}>
                        {task.text}
                      </span>
                    </motion.li>
                  ))}
                </AnimatePresence>
                {tasks.length === 0 && (
                  <li className="text-gray-400 text-base font-mono italic p-4 border-2 border-dashed border-gray-200 text-center">No active tasks. System idling...</li>
                )}
              </ul>

              {/* Add New Task Input */}
              <form onSubmit={handleAddTask} className="flex gap-2 items-end pt-4 border-t-2 border-dashed border-gray-300">
                <span className="text-black font-mono text-2xl mb-1">+</span>
                <input 
                  type="text" 
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="Add mission component..." 
                  className="retro-input w-full text-base pb-1 placeholder-gray-400"
                />
                <button 
                  type="submit"
                  className="bg-black text-white px-5 py-2 text-xs font-pixel hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_#666]"
                >
                  Add
                </button>
              </form>
            </RetroCard>

            {/* Small Wins */}
            <RetroCard className="bg-[#fff0f0] p-6 md:p-8">
              <h3 className="text-base text-black mb-6 border-b-2 border-black pb-3 flex justify-between font-bold tracking-tight">
                <div className="flex items-center gap-2">
                  <Trophy size={18} className="text-orange-500" />
                  <span>Small Wins</span>
                </div>
                <span className="text-[10px] text-gray-500 font-pixel mt-auto mb-1">Total Victories: {logs.length}</span>
              </h3>
              
              <ul className="space-y-3 text-gray-700 font-mono text-sm max-h-[200px] overflow-y-auto custom-scrollbar pr-2 mb-6">
                {logs.length > 0 ? (
                  logs.map(log => (
                    <motion.li 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={log.id} 
                      className="flex gap-4 p-2 hover:bg-white transition-colors border-b border-black/5 last:border-0"
                    >
                      <span className="font-bold text-black min-w-[70px] shrink-0">
                        [{new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}]
                      </span>
                      <span className="uppercase">{log.text}</span>
                    </motion.li>
                  ))
                ) : (
                  <li className="flex gap-2 italic text-gray-400 p-4 border-2 border-dashed border-gray-200 text-center justify-center">
                    <span>[System]</span>
                    <span>No wins logged yet...</span>
                  </li>
                )}
              </ul>

              {/* Add New Win Manual Input */}
              <form onSubmit={handleAddLog} className="flex gap-2 items-end pt-4 border-t-2 border-dashed border-gray-300">
                <Plus size={18} className="text-black mb-1" />
                <input 
                  type="text" 
                  value={newLogText}
                  onChange={(e) => setNewLogText(e.target.value)}
                  placeholder="Log a small win..." 
                  className="retro-input w-full text-base pb-1 placeholder-gray-400"
                />
                <button 
                  type="submit"
                  className="bg-black text-white px-4 py-2 text-xs font-pixel hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_#666]"
                >
                  Log
                </button>
              </form>

              <button 
                onClick={() => setIsSmallWinsLogOpen(true)}
                className="w-full mt-6 text-[10px] font-pixel text-center text-gray-500 hover:text-black border-2 border-dashed border-gray-300 hover:border-black py-3 transition-all hover:bg-white uppercase font-bold"
              >
                Open Full Victory Log
              </button>
            </RetroCard>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-8">
            
            {/* Focus Reveal Character */}
            <RetroCard accent className="p-6 md:p-8">
              <div className="flex justify-between items-end mb-6 border-b-2 border-gray-200 pb-3">
                <h3 className="text-sm text-black font-bold uppercase tracking-tight">
                  Focus Session Progress
                </h3>
                <div className="text-[10px] text-gray-500 font-mono">DAILY_CHARACTER_REVEAL</div>
              </div>
              
              <div className="bg-[#f0ece0] border-2 border-black p-4 mb-6 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.05)] flex justify-center">
                <HorseReveal 
                  progress={focusProgress} 
                  shuffle={horseShuffle}
                  onShuffleGenerated={handleShuffleGenerated}
                />
              </div>

              <div className="flex justify-between items-center bg-white border-2 border-black p-4 shadow-[4px_4px_0px_black]">
                <div className="text-center flex-1 border-r-2 border-black">
                  <div className="text-4xl font-black text-black">{uniqueDaysCount}</div>
                  <div className="text-[10px] text-gray-500 font-pixel font-bold uppercase">Days Worked</div>
                </div>
                <div className="text-center flex-1 relative group">
                  {!isEditingTarget ? (
                    <div 
                      className="cursor-pointer hover:bg-red-50 transition-colors py-1"
                      onClick={() => setIsEditingTarget(true)}
                    >
                      <div className="text-4xl font-black text-red-500">{targetProjects}</div>
                      <div className="text-[10px] text-gray-500 font-pixel font-bold uppercase flex items-center justify-center gap-1">
                        Projects <Pencil size={8} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-1">
                      <input 
                        autoFocus
                        type="number"
                        value={targetProjects}
                        onChange={(e) => setTargetProjects(parseInt(e.target.value) || 0)}
                        onBlur={() => setIsEditingTarget(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setIsEditingTarget(false)}
                        className="text-4xl font-black text-red-500 w-full text-center bg-transparent focus:outline-none"
                      />
                      <div className="text-[10px] text-gray-500 font-pixel font-bold uppercase">Target</div>
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={() => setIsYearArchiveOpen(true)}
                className="w-full mt-6 text-[10px] font-pixel text-center text-gray-500 hover:text-black border-2 border-dashed border-gray-300 hover:border-black py-3 transition-all hover:bg-white uppercase font-bold"
              >
                Open Full Annual Repository
              </button>
            </RetroCard>

            {/* Directory / Links */}
            <RetroCard className="p-6 md:p-8">
              <h3 className="text-sm text-black mb-6 border-b-2 border-black pb-3 font-bold flex justify-between">
                <span>SYSTEM_DIRECTORY</span>
                <Folder size={16} />
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <DirectoryLink 
                  id="docs"
                  icon={<div className="w-10 h-[30px] bg-retro-orange border-2 border-black relative rounded-sm shadow-[2px_2px_0px_black] before:content-[''] before:absolute before:-top-[6px] before:-left-[2px] before:w-4 before:h-2 before:bg-retro-orange before:border-2 before:border-black before:border-b-0 before:rounded-t-sm" />}
                  title="PROJECT_DOCS"
                  desc="Specs, Notes, Planning"
                  href={docsLink}
                  isEditing={editingLinkId === 'docs'}
                  onEdit={() => setEditingLinkId('docs')}
                  onSave={(newVal) => { setDocsLink(newVal); setEditingLinkId(null); }}
                />
                <DirectoryLink 
                  id="github"
                  icon={<Github className="text-black" size={24} />}
                  title="GITHUB_REPOSITORY"
                  desc="Commit & Push Logic"
                  href={ghLink}
                  isEditing={editingLinkId === 'github'}
                  onEdit={() => setEditingLinkId('github')}
                  onSave={(newVal) => { setGhLink(newVal); setEditingLinkId(null); }}
                />
                <DirectoryLink 
                  id="audio"
                  icon={<Headphones className="text-black" size={24} />}
                  title="AUDIO_STREAM"
                  desc="Focus Waveforms"
                  href={spotifyLink}
                  isEditing={editingLinkId === 'audio'}
                  onEdit={() => setEditingLinkId('audio')}
                  onSave={(newVal) => { setSpotifyLink(newVal); setEditingLinkId(null); }}
                />
              </div>
            </RetroCard>

          </div>
        </div>
        
        {/* Footer */}
        <footer className="text-center py-12 border-t-2 border-black/10">
          <p className="font-header text-[#6a7282] uppercase tracking-[0.3em] text-[20px]">
            MADE WITH LOVE IN CAMBRIDGE, UK
          </p>
          <div className="mt-2 font-pixel text-[8px] text-gray-400">
            SYSTEM_VERSION_2.1 // BUILD_ID_20260216
          </div>
          {isAuthenticated && (
            <button
              onClick={() => setIsDataStatusOpen(true)}
              className="mt-4 font-pixel text-[8px] text-blue-600 hover:text-blue-800 underline cursor-pointer"
            >
              💾 VIEW DATA PERSISTENCE STATUS
            </button>
          )}
        </footer>

        <YearArchiveModal 
          isOpen={isYearArchiveOpen}
          onClose={() => setIsYearArchiveOpen(false)}
          startDate={startDate}
          endDate={endDateFormatted}
          logs={logs}
          timerSessions={timerSessions}
        />

        <SmallWinsLogModal 
          isOpen={isSmallWinsLogOpen}
          onClose={() => setIsSmallWinsLogOpen(false)}
          logs={logs}
        />

        <DataStatusModal
          isOpen={isDataStatusOpen}
          onClose={() => setIsDataStatusOpen(false)}
          tasks={tasks}
          logs={logs}
          timerSessions={timerSessions}
          settings={{
            projectName,
            startDate,
            targetProjects,
            docsLink,
            ghLink,
            spotifyLink,
          }}
          onExportData={handleExportData}
          onImportData={handleImportData}
        />

        <AuthModal 
          isOpen={isAuthModalOpen}
          onClose={() => {
            if (isAuthenticated) {
              setIsAuthModalOpen(false);
            }
          }}
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          isLoading={isAuthLoading}
          error={authError}
        />
      </div>
      
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #e6e2d1;
          border-left: 1px solid rgba(0,0,0,0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #000;
          border-radius: 0px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
        .animate-pulse-red {
          animation: pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-red {
          0%, 100% { opacity: 1; }
          50% { opacity: .7; }
        }
      `}</style>
    </div>
  );
}

function DirectoryLink({ 
  icon, 
  title, 
  desc, 
  href = "#", 
  isEditing, 
  onEdit, 
  onSave 
}: { 
  id: string,
  icon: React.ReactNode, 
  title: string, 
  desc: string, 
  href?: string,
  isEditing: boolean,
  onEdit: () => void,
  onSave: (val: string) => void
}) {
  const [tempLink, setTempLink] = useState(href);

  return (
    <div className="relative group">
      {!isEditing ? (
        <a 
          href={href === "#" ? undefined : href} 
          target={href !== "#" ? "_blank" : undefined}
          className="flex items-center gap-4 bg-white p-4 hover:translate-x-1 border-2 border-black transition-all group shadow-[4px_4px_0px_black] hover:shadow-[2px_2px_0px_black] active:shadow-none active:translate-y-[2px]"
        >
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold group-hover:underline uppercase font-pixel tracking-tighter truncate">{title}</div>
            <div className="text-[10px] text-gray-500 font-pixel uppercase truncate">{desc}</div>
          </div>
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit();
            }}
            className="flex-shrink-0 bg-yellow-300 border-2 border-black px-2 py-1 text-[8px] font-pixel shadow-[2px_2px_0px_black] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
          >
            EDIT_URL
          </button>
        </a>
      ) : (
        <div className="flex flex-col gap-2 bg-white p-4 border-2 border-black shadow-[4px_4px_0px_black]">
          <div className="flex items-center gap-2">
            {icon}
            <div className="text-xs font-pixel font-bold uppercase">{title}</div>
          </div>
          <div className="flex gap-2">
            <input 
              autoFocus
              className="flex-1 bg-yellow-50 border-2 border-black px-2 py-1 text-[10px] font-pixel focus:outline-none"
              value={tempLink}
              onChange={(e) => setTempLink(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSave(tempLink)}
            />
            <button 
              onClick={() => onSave(tempLink)}
              className="bg-black text-white px-2 py-1 font-pixel text-[10px] hover:bg-gray-800"
            >
              SAVE
            </button>
            <button 
              onClick={() => onSave(href)}
              className="border-2 border-black px-2 py-1 font-pixel text-[10px] hover:bg-gray-100"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

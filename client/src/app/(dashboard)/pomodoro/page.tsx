"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Music,
  Volume2,
  VolumeX,
  Settings2,
  Brain,
  Coffee,
  TrendingUp,
  Clock,
  Target,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { getPomodoroStats, recordPomodoroSession, PomodoroStats } from "@/services/pomodoro.service";
import { cn } from "@/lib/utils";

// Types
type TimerMode = 'work' | 'shortBreak' | 'longBreak' | 'custom';

const defaultDurations = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
  custom: 25 * 60
};

export default function PomodoroPage() {
  // Timer State
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(defaultDurations.work);
  const [isActive, setIsActive] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);
  
  // Audio State
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicVolume, setMusicVolume] = useState([50]);
  
  // Analytics State
  const [stats, setStats] = useState<PomodoroStats | null>(null);
  
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notificationRef = useRef<HTMLAudioElement | null>(null);

  const fetchStats = async () => {
    try {
      const data = await getPomodoroStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  const handleComplete = async () => {
    setIsActive(false);
    
    // Play notification
    if (soundEnabled && notificationRef.current) {
      notificationRef.current.play().catch(e => console.error("Notification failed:", e));
    }
    
    // Record session
    try {
      let durationMinutes = 0;
      if (mode === 'work') durationMinutes = 25;
      else if (mode === 'shortBreak') durationMinutes = 5;
      else if (mode === 'longBreak') durationMinutes = 15;
      else durationMinutes = customMinutes;
      
      const type = mode === 'work' || mode === 'custom' ? 'work' : 'break';
      await recordPomodoroSession(durationMinutes, type);
      fetchStats();
    } catch (error) {
      console.error("Failed to record session", error);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Setup Audio
    audioRef.current = new Audio('https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3');
    audioRef.current.loop = true;
    
    notificationRef.current = new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=success-1-6297.mp3');
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Timer countdown logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Audio volume and play/pause effects
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume[0] / 100;
      if (musicEnabled && isActive) {
        audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [musicEnabled, isActive, musicVolume]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'custom') {
      setTimeLeft(customMinutes * 60);
    } else {
      setTimeLeft(defaultDurations[mode]);
    }
  };

  const changeMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    if (newMode === 'custom') {
      setTimeLeft(customMinutes * 60);
    } else {
      setTimeLeft(defaultDurations[newMode]);
    }
  };

  const handleCustomTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0) {
      setCustomMinutes(val);
      if (mode === 'custom' && !isActive) {
        setTimeLeft(val * 60);
      }
    }
  };

  // Formatting
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    let total = defaultDurations[mode];
    if (mode === 'custom') total = customMinutes * 60;
    return ((total - timeLeft) / total) * 100;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black mb-1">Focus Timer</h2>
          <p className="text-muted-foreground">Deep work sessions powered by Pomodoro.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Timer Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-2xl bg-card/50 backdrop-blur-xl relative overflow-hidden">
            {/* Background progress ring logic (simplified to a bar for UI elegance) */}
            <div 
              className="absolute bottom-0 left-0 h-1 bg-violet-500 transition-all duration-1000 ease-linear"
              style={{ width: `${getProgress()}%` }}
            />
            
            <CardContent className="p-8 flex flex-col items-center">
              {/* Modes */}
              <div className="flex items-center gap-2 p-1 bg-secondary rounded-2xl mb-12">
                <Button 
                  variant="ghost" 
                  className={cn("rounded-xl transition-all", mode === 'work' && "bg-background shadow-sm")}
                  onClick={() => changeMode('work')}
                >
                  <Brain className="w-4 h-4 mr-2" /> Focus
                </Button>
                <Button 
                  variant="ghost" 
                  className={cn("rounded-xl transition-all", mode === 'shortBreak' && "bg-background shadow-sm")}
                  onClick={() => changeMode('shortBreak')}
                >
                  <Coffee className="w-4 h-4 mr-2" /> Short Break
                </Button>
                <Button 
                  variant="ghost" 
                  className={cn("rounded-xl transition-all", mode === 'custom' && "bg-background shadow-sm")}
                  onClick={() => changeMode('custom')}
                >
                  <Settings2 className="w-4 h-4 mr-2" /> Custom
                </Button>
              </div>

              {/* Timer Display */}
              <motion.div 
                key={mode}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-[120px] font-black tracking-tighter leading-none mb-12 tabular-nums"
                style={{ textShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
              >
                {formatTime(timeLeft)}
              </motion.div>

              {/* Controls */}
              <div className="flex items-center gap-6">
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="w-14 h-14 rounded-2xl text-muted-foreground hover:text-foreground"
                  onClick={resetTimer}
                >
                  <RotateCcw className="w-6 h-6" />
                </Button>
                
                <Button 
                  size="icon" 
                  className={cn(
                    "w-20 h-20 rounded-[2rem] shadow-xl transition-all hover:scale-105 active:scale-95",
                    isActive ? "bg-amber-500 hover:bg-amber-600 text-white" : "gradient-primary text-white"
                  )}
                  onClick={toggleTimer}
                >
                  {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-2" />}
                </Button>
                
                <div className="w-14" /> {/* Spacer for balance */}
              </div>
            </CardContent>
          </Card>

          {/* Custom Mode Settings */}
          <AnimatePresence>
            {mode === 'custom' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Custom Duration</p>
                      <p className="text-sm text-muted-foreground">Set your focus minutes.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={customMinutes} 
                        onChange={handleCustomTimeChange}
                        className="w-20 p-2 bg-secondary rounded-lg text-center font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        min="1"
                      />
                      <span className="text-muted-foreground font-medium">min</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Settings & Analytics */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2 font-semibold">
                <Music className="w-5 h-5 text-violet-400" />
                Audio Settings
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Lo-Fi Beats</p>
                    <p className="text-xs text-muted-foreground">Focus enhancing background music</p>
                  </div>
                  <Switch checked={musicEnabled} onCheckedChange={setMusicEnabled} />
                </div>
                
                {musicEnabled && (
                  <div className="flex items-center gap-3 px-2">
                    <VolumeX className="w-4 h-4 text-muted-foreground" />
                    <Slider 
                      value={musicVolume} 
                      onValueChange={setMusicVolume} 
                      max={100} step={1}
                      className="flex-1"
                    />
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                
                <div className="h-px bg-border my-2" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Timer Sounds</p>
                    <p className="text-xs text-muted-foreground">Chime when session ends</p>
                  </div>
                  <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-violet-500/20 bg-violet-500/5">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2 font-semibold">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Today&apos;s Progress
              </div>
              
              {stats ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-end gap-2 mb-1">
                      <span className="text-4xl font-black">{Math.floor(stats.totalFocusMinutesToday / 60)}</span>
                      <span className="text-muted-foreground mb-1">h</span>
                      <span className="text-4xl font-black">{stats.totalFocusMinutesToday % 60}</span>
                      <span className="text-muted-foreground mb-1">m</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Total focus time today</p>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-1 bg-background rounded-xl p-3 border border-border">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <Target className="w-3 h-3" /> Sessions
                      </div>
                      <p className="font-semibold">{stats.completedSessionsToday}</p>
                    </div>
                    <div className="flex-1 bg-background rounded-xl p-3 border border-border">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <Clock className="w-3 h-3" /> All Time
                      </div>
                      <p className="font-semibold">{Math.floor(stats.totalFocusMinutesAllTime / 60)}h</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

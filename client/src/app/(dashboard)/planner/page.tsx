"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  Circle,
  Target,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Flame,
  AlarmClock,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getPlannerData, createTask, updateTask, generateAISchedule, Task, Exam } from "@/services/planner.service";

const subjectColors: Record<string, string> = {
  Biology: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  Mathematics: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  History: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  Chemistry: "bg-violet-500/15 text-violet-400 border-violet-500/25",
};

const priorityColors: Record<string, string> = {
  high: "bg-red-500/10 border-red-500/20",
  medium: "bg-amber-500/10 border-amber-500/20",
  low: "bg-emerald-500/10 border-emerald-500/20",
};

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function PlannerPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Create an array of 7 dates starting from today
  const [weekOffset, setWeekOffset] = useState(0); // 0 means current week starting today
  
  const getDates = () => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i + (weekOffset * 7));
      return d;
    });
  };
  
  const dates = getDates();
  const [selectedDateStr, setSelectedDateStr] = useState(dates[0].toISOString());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getPlannerData();
      setTasks(data.tasks);
      setExams(data.exams);
    } catch (error) {
      console.error("Failed to load planner data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => t._id === task._id ? { ...t, done: !t.done } : t));
      await updateTask(task._id, { done: !task.done });
    } catch (error) {
      console.error("Failed to update task", error);
      // Revert on error
      setTasks(prev => prev.map(t => t._id === task._id ? { ...t, done: task.done } : t));
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const newTasks = await generateAISchedule();
      setTasks(prev => [...prev, ...newTasks]);
    } catch (error) {
      console.error("Failed to generate AI schedule", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Calculate stats for the selected date
  const selectedDateTasks = tasks.filter(t => {
    const d = new Date(t.date);
    d.setHours(0,0,0,0);
    return d.toISOString() === selectedDateStr;
  });
  
  const doneTasks = selectedDateTasks.filter((t) => t.done).length;
  const totalMinutes = selectedDateTasks.reduce((sum, t) => sum + (t.done ? 0 : t.duration), 0);

  // Calculate stats for the week
  const weekStudyHours = dates.map(d => {
    const dayTasks = tasks.filter(t => {
      const td = new Date(t.date);
      td.setHours(0,0,0,0);
      return td.toISOString() === d.toISOString();
    });
    return dayTasks.reduce((sum, t) => sum + t.duration, 0);
  });
  
  const maxH = Math.max(...weekStudyHours, 1);

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>;
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black mb-1">Study Planner</h2>
          <p className="text-muted-foreground">Your AI-optimized study schedule.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            AI Schedule
          </Button>
          <Button>
            <Plus className="w-4 h-4" />
            Add task
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Week Overview</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon-sm" onClick={() => setWeekOffset(prev => prev - 1)}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon-sm" onClick={() => setWeekOffset(prev => prev + 1)}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {dates.map((date, i) => {
              const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dateNum = date.getDate();
              const isToday = date.getTime() === today.getTime();
              const isSelected = date.toISOString() === selectedDateStr;
              const dayTasks = tasks.filter(t => {
                const td = new Date(t.date);
                td.setHours(0,0,0,0);
                return td.toISOString() === date.toISOString();
              });

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDateStr(date.toISOString())}
                  className={cn(
                    "flex flex-col items-center gap-2 p-2 rounded-xl transition-all",
                    isSelected ? "bg-violet-500/15 border border-violet-500/25" : "hover:bg-secondary"
                  )}
                >
                  <span className={cn(
                    "text-xs font-medium",
                    isToday ? "text-violet-400" : "text-muted-foreground"
                  )}>
                    {dayStr} {dateNum}
                  </span>
                  <div className="relative w-full h-16 flex items-end justify-center">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(weekStudyHours[i] / maxH) * 100}%` }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className={cn(
                        "w-4 rounded-full min-h-[4px]",
                        isToday ? "gradient-primary" : isSelected ? "bg-violet-500/50" : "bg-secondary"
                      )}
                    />
                  </div>
                  <span className="text-xs font-semibold">
                    {Math.round(weekStudyHours[i] / 60 * 10) / 10}h
                  </span>
                  {dayTasks.length > 0 && (
                    <div className="flex gap-0.5">
                      {dayTasks.slice(0, 3).map((_, ti) => (
                        <div key={ti} className="w-1 h-1 rounded-full bg-violet-400" />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {new Date(selectedDateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              <span className="text-muted-foreground font-normal ml-2 text-sm">
                {doneTasks}/{selectedDateTasks.length} done
              </span>
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{totalMinutes} min remaining</span>
            </div>
          </div>

          {selectedDateTasks.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No tasks for this day</p>
                <Button variant="outline" size="sm" className="mt-3">
                  <Plus className="w-4 h-4" /> Add task
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {selectedDateTasks.map((task, i) => (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer",
                    task.done ? "opacity-60 bg-secondary/30" : `${priorityColors[task.priority] || priorityColors.medium}`,
                    "hover:scale-[1.01]"
                  )}
                  onClick={() => toggleTask(task)}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors",
                    task.done ? "bg-emerald-500 border-emerald-500" : "border-border"
                  )}>
                    {task.done && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium", task.done && "line-through text-muted-foreground")}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge className={cn("text-xs border", subjectColors[task.subject] || "bg-secondary text-foreground")}>
                        {task.subject}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {task.duration} min
                      </span>
                    </div>
                  </div>
                  <Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "warning" : "success"} className="text-xs capitalize">
                    {task.priority}
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}

          {selectedDateTasks.length > 0 && (
            <div className="pt-1">
              <div className="flex justify-between mb-1.5 text-xs text-muted-foreground">
                <span>Daily progress</span>
                <span>{Math.round((doneTasks / selectedDateTasks.length) * 100)}%</span>
              </div>
              <Progress value={(doneTasks / selectedDateTasks.length) * 100} />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card className="border-violet-500/20 bg-violet-500/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-5 h-5 text-amber-400" />
                <span className="font-semibold text-sm">Study Streak</span>
              </div>
              <p className="text-3xl font-black mb-1">12 days</p>
              <p className="text-xs text-muted-foreground mb-3">Your longest: 21 days</p>
              <Progress value={(12 / 21) * 100} className="h-1.5" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-violet-400" />
                <span className="font-semibold text-sm">Upcoming exams</span>
              </div>
              {exams.length === 0 ? (
                 <p className="text-sm text-muted-foreground">No upcoming exams.</p>
              ) : (
                <div className="space-y-3">
                  {exams.map((exam) => {
                    const diffTime = Math.abs(new Date(exam.date).getTime() - new Date().getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return (
                      <div key={exam._id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{exam.subject}</p>
                          <p className="text-xs text-muted-foreground">{new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}</p>
                        </div>
                        <Badge variant={diffDays <= 7 ? "destructive" : diffDays <= 14 ? "warning" : "secondary"} className="text-xs">
                          {diffDays}d
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlarmClock className="w-5 h-5 text-cyan-400" />
                <span className="font-semibold text-sm">AI recommendations</span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                  <p>Generate an AI study schedule to optimize your study time for upcoming exams!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

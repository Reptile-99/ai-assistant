"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalyticsStats, DashboardStats } from "@/services/analytics.service";
import { Loader2, TrendingUp, Sparkles, BookOpen, Clock, BarChart3 } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

// Custom Tooltip components for Recharts to match theme
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass border border-border p-3 rounded-lg shadow-xl backdrop-blur-md">
        <p className="font-semibold text-sm mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color || entry.fill }}>
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getAnalyticsStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to load analytics", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
      </div>
    );
  }

  // Fallbacks if data is empty for aesthetic testing
  const studyHours = stats.studyHours.length ? stats.studyHours : [
    { day: 'Mon', hours: 2 }, { day: 'Tue', hours: 4 }, { day: 'Wed', hours: 1 },
    { day: 'Thu', hours: 5 }, { day: 'Fri', hours: 3 }, { day: 'Sat', hours: 6 }, { day: 'Sun', hours: 4 }
  ];
  
  const uploadStats = stats.uploadStats.some(s => s.uploads > 0) ? stats.uploadStats : [
    { name: 'Week 1', uploads: 2 }, { name: 'Week 2', uploads: 5 }, { name: 'Week 3', uploads: 3 }, { name: 'Week 4', uploads: 8 }
  ];

  const productivityTrends = stats.productivityTrends.length ? stats.productivityTrends : [
    { day: 'Mon', focus: 60, distraction: 20 }, { day: 'Tue', focus: 80, distraction: 15 },
    { day: 'Wed', focus: 40, distraction: 40 }, { day: 'Thu', focus: 90, distraction: 10 },
    { day: 'Fri', focus: 70, distraction: 25 }, { day: 'Sat', focus: 100, distraction: 5 }, { day: 'Sun', focus: 85, distraction: 10 }
  ];

  const flashcardProgress = stats.flashcardProgress.length ? stats.flashcardProgress : [
    { subject: 'Biology', mastery: 80, total: 100 },
    { subject: 'Math', mastery: 45, total: 100 },
    { subject: 'History', mastery: 90, total: 100 },
    { subject: 'Chemistry', mastery: 60, total: 100 }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-6 pb-10 overflow-x-hidden"
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-3xl font-black mb-1 flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-indigo-400" /> Analytics
        </h2>
        <p className="text-muted-foreground">Deep insights into your learning patterns.</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Productivity Trends - AreaChart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-indigo-500/20 bg-indigo-500/5 shadow-xl shadow-indigo-500/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                Productivity Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={productivityTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorDistraction" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fb7185" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#fb7185" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="focus" name="Focus Score" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorFocus)" />
                    <Area type="monotone" dataKey="distraction" name="Distraction" stroke="#fb7185" strokeWidth={3} fillOpacity={1} fill="url(#colorDistraction)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Study Hours - BarChart */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                Study Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studyHours} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="hours" name="Hours" fill="#34d399" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Usage - PieChart */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                AI Usage Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.aiUsage}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {stats.aiUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom Legend */}
                <div className="absolute right-0 flex flex-col gap-2 pointer-events-none">
                  {stats.aiUsage.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                      <span className="text-muted-foreground">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Flashcard Mastery - RadarChart */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                Subject Mastery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={flashcardProgress}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Mastery %" dataKey="mastery" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.4} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upload Stats - LineChart */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Document Uploads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={uploadStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="uploads" name="Uploads" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4, fill: '#60a5fa', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

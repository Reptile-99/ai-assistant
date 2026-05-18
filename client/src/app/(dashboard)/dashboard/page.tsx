"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  MessageSquare,
  CreditCard,
  TrendingUp,
  Upload,
  Flame,
  Clock,
  Target,
  ArrowRight,
  ChevronRight,
  FileText,
  Brain,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { getDashboardStats, DashboardStats } from "@/services/analytics.service";
import { getDocuments, Document } from "@/services/ai.service";
import { cn } from "@/lib/utils";

const quickActions = [
  { label: "Upload document", href: "/upload", icon: Upload, color: "text-blue-400", bg: "bg-blue-500/10" },
  { label: "Start AI chat", href: "/chat", icon: MessageSquare, color: "text-violet-400", bg: "bg-violet-500/10" },
  { label: "Review flashcards", href: "/flashcards", icon: CreditCard, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { label: "View planner", href: "/planner", icon: Target, color: "text-amber-400", bg: "bg-amber-500/10" },
];

const studyGoals = [
  { label: "Daily study goal", current: 75, target: 100, unit: "min", color: "violet" },
  { label: "Flashcard review", current: 40, target: 50, unit: "cards", color: "emerald" },
  { label: "Reading progress", current: 3, target: 5, unit: "chapters", color: "blue" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<DashboardStats | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, docsData] = await Promise.all([
          getDashboardStats(),
          getDocuments()
        ]);
        setAnalytics(statsData);
        setDocuments(docsData);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalMastered = analytics?.flashcardProgress.reduce((sum, p) => sum + Math.round((p.mastery / 100) * p.total), 0) || 0;
  const totalCards = analytics?.flashcardProgress.reduce((sum, p) => sum + p.total, 0) || 0;
  const totalHours = analytics?.studyHours.reduce((sum, h) => sum + h.hours, 0) || 0;

  const stats = [
    {
      title: "Documents",
      value: documents.length.toString(),
      change: "+3 this week",
      icon: BookOpen,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
    },
    {
      title: "Chat Sessions",
      value: "147", // Mocked for now as we don't have chat sessions in analytics
      change: "+12 today",
      icon: MessageSquare,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
    },
    {
      title: "Cards Mastered",
      value: totalMastered.toString(),
      change: totalCards > 0 ? `${Math.round((totalMastered / totalCards) * 100)}% retention` : "0% retention",
      icon: CreditCard,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      title: "Study Streak",
      value: "12", // Mocked
      change: "days in a row",
      icon: Flame,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-7xl"
    >
      {/* Welcome header */}
      <motion.div variants={itemVariants} className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">
            Good morning, {user?.name?.split(" ")[0] || "Student"} 👋
          </h2>
          <p className="text-muted-foreground mt-1">Here&apos;s your study overview for today.</p>
        </div>
        <Button asChild id="upload-quick-btn">
          <Link href="/upload">
            <Upload className="w-4 h-4" />
            Upload
          </Link>
        </Button>
      </motion.div>
    
      {/* Stats grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className={cn("border", stat.border)}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", stat.bg, stat.border)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-3xl font-black mb-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.title}</p>
              <p className={cn("text-xs mt-0.5", stat.color)}>{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href} id={`quick-${action.label.replace(/\s+/g, "-")}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.bg} border border-border hover:border-current transition-all cursor-pointer text-center`}
                  >
                    <action.icon className={`w-6 h-6 ${action.color}`} />
                    <span className="text-xs font-medium">{action.label}</span>
                  </motion.div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's goals */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-violet-400" />
                Today&apos;s goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {studyGoals.map((goal) => (
                <div key={goal.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium">{goal.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {goal.current}/{goal.target} {goal.unit}
                    </span>
                  </div>
                  <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                </div>
              ))}

              <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <Flame className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-sm font-semibold">12-day streak!</p>
                  <p className="text-xs text-muted-foreground">Keep it up to reach 14 days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Study time */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Study time this week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1 h-24 mb-4">
                {(analytics?.studyHours || [0, 0, 0, 0, 0, 0, 0]).map((h: number | { hours: number; day: string }, i: number) => {
                  const val = typeof h === 'number' ? h : h.hours;
                  const maxHours = Math.max(...(analytics?.studyHours.map(sh => sh.hours) || [1]));
                  const height = maxHours > 0 ? (val / maxHours) * 100 : 0;
                  return (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 5)}%` }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                      className={cn(
                        "flex-1 rounded-t-sm min-h-[4px]",
                        i === (analytics?.studyHours.length || 0) - 1 ? "gradient-primary" : "bg-secondary"
                      )}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mb-4">
                {(analytics?.studyHours || ["M", "T", "W", "T", "F", "S", "S"]).map((sh: any, i: number) => (
                  <span key={i} className={cn("flex-1 text-center", i === (analytics?.studyHours.length || 0) - 1 && "text-violet-400 font-semibold")}>
                    {typeof sh === 'string' ? sh : sh.day}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 p-3 bg-violet-500/10 rounded-xl border border-violet-500/20">
                <Brain className="w-8 h-8 text-violet-400" />
                <div>
                  <p className="text-lg font-bold">{totalHours.toFixed(1)}h</p>
                  <p className="text-xs text-muted-foreground">Total this week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent documents */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent documents</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/summarize">View all <ChevronRight className="w-4 h-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {documents.slice(0, 4).map((doc, i) => (
              <motion.div
                key={doc._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.pageCount} pages · {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">PDF</Badge>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
            {documents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No documents uploaded yet.</p>
                <Button variant="link" asChild>
                  <Link href="/upload">Upload your first document</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

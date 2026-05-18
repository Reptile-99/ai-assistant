"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Loader2,
  Sparkles,
  Zap,
  CheckCircle,
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
  { label: "Upload document", href: "/upload", icon: Upload, color: "text-blue-400", bg: "bg-blue-500/10", border: "hover:border-blue-500/30" },
  { label: "Start AI chat", href: "/chat", icon: MessageSquare, color: "text-violet-400", bg: "bg-violet-500/10", border: "hover:border-violet-500/30" },
  { label: "Review flashcards", href: "/flashcards", icon: CreditCard, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "hover:border-emerald-500/30" },
  { label: "View planner", href: "/planner", icon: Target, color: "text-amber-400", bg: "bg-amber-500/10", border: "hover:border-amber-500/30" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } },
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

  const totalMastered = analytics?.flashcardProgress?.reduce((sum, p) => sum + Math.round((p.mastery / 100) * p.total), 0) || 0;
  const totalCards = analytics?.flashcardProgress?.reduce((sum, p) => sum + p.total, 0) || 0;
  const totalHours = analytics?.studyHours?.reduce((sum, h) => sum + h.hours, 0) || 0;

  const stats = [
    {
      title: "Documents",
      value: documents.length.toString(),
      change: documents.length > 0 
        ? `+${documents.filter(d => new Date(d.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000).length} this week`
        : "No uploads yet",
      icon: BookOpen,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
    },
    {
      title: "Chat Sessions",
      value: (analytics?.chatSessions ?? 0).toString(),
      change: (analytics?.chatSessions ?? 0) > 0 
        ? "Active conversations"
        : "No chat history yet",
      icon: MessageSquare,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
    },
    {
      title: "Cards Mastered",
      value: totalMastered.toString(),
      change: totalCards > 0 
        ? `${Math.round((totalMastered / totalCards) * 100)}% retention` 
        : "0 cards generated",
      icon: CreditCard,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      title: "Study Streak",
      value: (analytics?.streak ?? 0).toString(),
      change: (analytics?.streak ?? 0) === 1 ? "day active streak" : "days in a row",
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

  const hasAnyProgress = documents.length > 0 || totalCards > 0 || totalHours > 0 || (analytics?.streak ?? 0) > 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-7xl relative pb-10"
    >
      {/* Background Blobs for Premium Depth */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-40 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header / Welcome Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="border-violet-500/30 bg-violet-500/5 text-violet-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
              <Sparkles className="w-3 h-3 mr-1 text-violet-400" />
              Intelligence Dashboard
            </Badge>
          </div>
          <h2 className="text-3xl font-black tracking-tight">
            Welcome back, <span className="gradient-text font-black">{user?.name?.split(" ")[0] || "Student"}</span> 👋
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {hasAnyProgress 
              ? "Ready to crush your study goals today? Here is your overview."
              : "Let's kickstart your AI learning journey! Upload a document to begin."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-white/10 hover:bg-white/5 rounded-xl h-11" asChild>
            <Link href="/chat">
              <MessageSquare className="w-4 h-4 mr-2" />
              AI Chat
            </Link>
          </Button>
          <Button className="gradient-primary shadow-lg shadow-violet-500/25 hover:shadow-violet-500/35 rounded-xl h-11 px-5" asChild id="upload-quick-btn">
            <Link href="/upload">
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={stat.title} className={cn("glass border card-hover shine rounded-2xl relative overflow-hidden", stat.border)}>
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <stat.icon className="w-16 h-16" />
            </div>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner", stat.bg, stat.border)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                {stat.value !== "0" && <TrendingUp className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-4xl font-black tracking-tight mb-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{stat.title}</p>
              <p className={cn("text-[11px] mt-1 font-semibold", stat.value === "0" ? "text-muted-foreground" : stat.color)}>
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="glass border border-white/5 h-full rounded-2xl">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 pt-5">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href} id={`quick-${action.label.replace(/\s+/g, "-")}`}>
                  <motion.div
                    whileHover={{ y: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex flex-col items-center gap-3 p-4 rounded-xl border border-white/5 transition-all cursor-pointer text-center h-full justify-center glass",
                      action.bg,
                      action.border
                    )}
                  >
                    <div className="p-2 rounded-lg bg-white/5 shadow-md">
                      <action.icon className={cn("w-5 h-5", action.color)} />
                    </div>
                    <span className="text-xs font-semibold text-foreground/90">{action.label}</span>
                  </motion.div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's goals */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="glass border border-white/5 h-full rounded-2xl">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400 animate-pulse" />
                Today&apos;s Study Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              {analytics?.todaysGoals && analytics.todaysGoals.length > 0 ? (
                analytics.todaysGoals.map((goal) => (
                  <div key={goal.label} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground/80">{goal.label}</span>
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-full border-white/10 font-bold bg-white/5">
                        {goal.current}/{goal.target} {goal.unit}
                      </Badge>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={Math.min(100, (goal.current / goal.target) * 100)} 
                        className="h-2 rounded-full overflow-hidden bg-white/5"
                        // Custom style with color matching
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-xs font-medium">
                  No active goals set.
                </div>
              )}

              {/* Streak Alert Card */}
              {(analytics?.streak ?? 0) > 0 ? (
                <motion.div 
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-3 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 shadow-lg shadow-amber-500/5 mt-4"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0 animate-bounce">
                    <Flame className="w-5 h-5 text-amber-400 fill-current" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-amber-300">{analytics?.streak}-Day Streak Active!</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Keep studying daily to maintain your momentum!</p>
                  </div>
                </motion.div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-xl border border-border mt-4">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <Flame className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground/70">Start your study streak!</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Complete a Pomodoro timer session to start.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Study time */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="glass border border-white/5 h-full rounded-2xl">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Study Hours This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 flex flex-col justify-between h-[calc(100%-60px)]">
              <div>
                <div className="flex items-end gap-1.5 h-20 mb-4 px-2">
                  {(analytics?.studyHours || [0, 0, 0, 0, 0, 0, 0]).map((h: number | { hours: number; day: string }, i: number) => {
                    const val = typeof h === 'number' ? h : h.hours;
                    const maxHours = Math.max(...(analytics?.studyHours?.map(sh => sh.hours) || [1]));
                    const height = maxHours > 0 ? (val / maxHours) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                        {val > 0 && (
                          <div className="absolute -top-7 bg-popover text-popover-foreground text-[10px] font-bold px-1.5 py-0.5 rounded border shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            {val}h
                          </div>
                        )}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(height, 5)}%` }}
                          transition={{ delay: i * 0.03, duration: 0.4 }}
                          className={cn(
                            "w-full rounded-t-md min-h-[4px] transition-all card-hover",
                            val > 0 
                              ? (i === (analytics?.studyHours?.length || 0) - 1 ? "gradient-brand shadow-lg" : "bg-violet-500/30 group-hover:bg-violet-500/50")
                              : "bg-secondary/40"
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground font-semibold px-2 mb-4">
                  {(analytics?.studyHours || ["M", "T", "W", "T", "F", "S", "S"]).map((sh: any, i: number) => (
                    <span key={i} className={cn("flex-1 text-center", i === (analytics?.studyHours?.length || 0) - 1 && "text-violet-400 font-bold")}>
                      {typeof sh === 'string' ? sh : sh.day}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-violet-500/10 rounded-xl border border-violet-500/20">
                <div className="w-9 h-9 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-base font-black text-violet-300">{totalHours.toFixed(1)}h</p>
                  <p className="text-[10px] text-muted-foreground">Total study time this week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent documents */}
      <motion.div variants={itemVariants}>
        <Card className="glass border border-white/5 rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-white/5 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              Recent Documents
            </CardTitle>
            {documents.length > 0 && (
              <Button variant="ghost" size="sm" className="hover:bg-white/5 text-xs text-violet-400 hover:text-violet-300" asChild>
                <Link href="/summarize" className="flex items-center gap-1">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {documents.length > 0 ? (
              <div className="divide-y divide-white/5">
                {documents.slice(0, 4).map((doc, i) => (
                  <motion.div
                    key={doc._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                  >
                    <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate group-hover:text-violet-400 transition-colors">{doc.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                        <span>{doc.pageCount} pages</span>
                        <span>•</span>
                        <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-white/5 text-[10px] px-2 py-0.5 rounded border-white/5 text-muted-foreground uppercase font-bold">
                        PDF
                      </Badge>
                      <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-4 h-4 text-violet-400" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/10 shadow-inner">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-bold text-foreground/80">Your study library is empty</p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
                  Upload lecture notes, textbook chapters, or reference PDFs to unlock AI summarization and Q&A features.
                </p>
                <Button className="gradient-primary mt-4 rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30" asChild>
                  <Link href="/upload">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload your first document
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

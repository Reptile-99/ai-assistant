"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Upload,
  MessageSquare,
  CreditCard,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
  X,
  BrainCircuit,
  Timer,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getInitials } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    color: "text-violet-400",
  },
  {
    href: "/upload",
    label: "Upload",
    icon: Upload,
    color: "text-blue-400",
  },
  {
    href: "/summarize",
    label: "Summarize",
    icon: BrainCircuit,
    color: "text-violet-400",
  },
  {
    href: "/chat",
    label: "AI Chat",
    icon: MessageSquare,
    color: "text-cyan-400",
  },
  {
    href: "/flashcards",
    label: "Flashcards",
    icon: CreditCard,
    color: "text-emerald-400",
  },
  {
    href: "/planner",
    label: "Study Planner",
    icon: Calendar,
    color: "text-amber-400",
  },
  {
    href: "/pomodoro",
    label: "Pomodoro",
    icon: Timer,
    color: "text-rose-400",
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: BarChart3,
    color: "text-indigo-400",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    color: "text-pink-400",
  },
];

interface SidebarContentProps {
  sidebarCollapsed: boolean;
  pathname: string;
  setSidebarOpen: (open: boolean) => void;
  user: { name?: string; email?: string; avatar?: string } | null;
  logout: () => void;
}

const SidebarContent = ({ 
  sidebarCollapsed, 
  pathname, 
  setSidebarOpen, 
  user, 
  logout 
}: SidebarContentProps) => (
  <div className="flex h-full flex-col">
    {/* Logo */}
    <div className={cn(
      "flex items-center gap-3 px-4 py-5 border-b border-border",
      sidebarCollapsed && "justify-center px-2"
    )}>
      <div className="flex-shrink-0 w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
        <Sparkles className="w-5 h-5 text-white" />
      </div>
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <span className="font-bold text-lg gradient-text whitespace-nowrap">StudyAI</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Navigation */}
    <ScrollArea className="flex-1 py-4">
      <nav className="space-y-1 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
              <motion.div
                whileHover={{ x: sidebarCollapsed ? 0 : 4 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-violet-500/15 text-violet-300 border border-violet-500/25"
                    : "text-foreground/70 hover:bg-secondary hover:text-foreground",
                  sidebarCollapsed && "justify-center px-2"
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 gradient-primary rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? item.color : "")} />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </ScrollArea>

    {/* User profile */}
    <div className={cn(
      "border-t border-border p-3",
      sidebarCollapsed && "px-2"
    )}>
      <div className={cn(
        "flex items-center gap-3 rounded-xl p-2 hover:bg-secondary transition-colors cursor-pointer group",
        sidebarCollapsed && "justify-center"
      )}>
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={user?.avatar} alt={user?.name} />
          <AvatarFallback className="text-xs">
            {user?.name ? getInitials(user.name) : "U"}
          </AvatarFallback>
        </Avatar>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-hidden min-w-0"
            >
              <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={logout}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  </div>
);

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebarCollapsed, sidebarOpen, setSidebarOpen } = useUIStore();
  const { user, logout } = useAuthStore();

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 72 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden lg:flex flex-col fixed left-0 top-0 h-full z-40 glass border-r border-border overflow-hidden"
      >
        <SidebarContent 
          sidebarCollapsed={sidebarCollapsed}
          pathname={pathname}
          setSidebarOpen={setSidebarOpen}
          user={user}
          logout={logout}
        />

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleSidebarCollapsed}
          className="absolute top-5 -right-3.5 w-7 h-7 rounded-full border border-border bg-background shadow-md z-10"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </Button>
      </motion.aside>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 h-full w-[260px] z-50 glass border-r border-border"
            >
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4"
              >
                <X className="w-4 h-4" />
              </Button>
              <SidebarContent 
                sidebarCollapsed={false}
                pathname={pathname}
                setSidebarOpen={setSidebarOpen}
                user={user}
                logout={logout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

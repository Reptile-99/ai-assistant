"use client";

import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Navbar />
      <motion.main
        animate={{
          marginLeft: sidebarCollapsed ? "72px" : "260px",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="pt-16 min-h-screen transition-all hidden lg:block"
      >
        <motion.div
          key="page-content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="p-6"
        >
          {children}
        </motion.div>
      </motion.main>
      {/* Mobile */}
      <main className="pt-16 lg:hidden min-h-screen">
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
}

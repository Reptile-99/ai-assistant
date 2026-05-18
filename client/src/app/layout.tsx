import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "StudyAI — Your AI-Powered Study Assistant",
    template: "%s | StudyAI",
  },
  description:
    "Transform your study sessions with AI-powered document analysis, smart flashcards, personalized study plans, and intelligent chat assistance.",
  keywords: [
    "AI study assistant",
    "flashcards",
    "study planner",
    "document analysis",
    "learning AI",
  ],
  authors: [{ name: "StudyAI Team" }],
  openGraph: {
    type: "website",
    siteName: "StudyAI",
    title: "StudyAI — Your AI-Powered Study Assistant",
    description: "Transform your study sessions with AI-powered assistance.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
          <Toaster />
          <SonnerToaster position="top-center" expand={true} richColors />
        </AuthProvider>
      </body>
    </html>
  );
}

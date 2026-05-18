import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your StudyAI account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
        <div className="absolute -bottom-40 left-1/3 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "-1.5s" }} />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, User, Sparkles, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "@/hooks/use-toast";
import api from "@/services/api.client";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

const passwordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColors = ["", "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"];

export default function RegisterPage() {
  const router = useRouter();
  const { login, setLoading, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const strength = passwordStrength(password);

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password
      });
      
      if (response.data.success) {
        const { user, accessToken } = response.data;
        login(user, accessToken);
        
        toast({ title: "Account created!", description: "Welcome to StudyAI 🎉" });
        router.push("/dashboard");
      }
    } catch (error: any) {
      const message = error.response?.data?.error || "Registration failed";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const perks = [
    "Free forever plan available",
    "AI-powered document analysis",
    "Smart flashcard generation",
    "Personalized study schedules",
  ];

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #0f0f1a 100%)" }} />
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-cyan-500/15 rounded-full blur-2xl animate-float" style={{ animationDelay: "-2s" }} />
        </div>
        <div className="relative z-10 flex flex-col justify-center p-12 text-white w-full">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-12">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">StudyAI</span>
            </div>

            <h2 className="text-4xl font-black mb-4 leading-tight">
              Start your AI study<br />journey today
            </h2>
            <p className="text-white/60 mb-10">
              Join 50,000+ students already mastering their subjects with AI.
            </p>

            <ul className="space-y-4">
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-white/80">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md py-8"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl gradient-text">StudyAI</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black mb-2">Create your account</h1>
            <p className="text-muted-foreground">Free to start, no credit card required</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="register-form">
            <div className="space-y-2">
              <Label htmlFor="reg-name">Full name</Label>
              <Input
                id="reg-name"
                type="text"
                placeholder="Alex Johnson"
                icon={<User className="w-4 h-4" />}
                {...register("name")}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-email">Email address</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="you@example.com"
                icon={<Mail className="w-4 h-4" />}
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-password">Password</Label>
              <Input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                placeholder="8+ characters"
                icon={<Lock className="w-4 h-4" />}
                iconRight={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                {...register("password", {
                  onChange: (e) => setPassword(e.target.value),
                })}
                className={errors.password ? "border-destructive" : ""}
              />
              {/* Password strength */}
              {password.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColors[strength] : "bg-border"}`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${strength <= 1 ? "text-red-400" : strength <= 2 ? "text-amber-400" : strength <= 3 ? "text-blue-400" : "text-emerald-400"}`}>
                    {strengthLabels[strength]} password
                  </p>
                </div>
              )}
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-confirm">Confirm password</Label>
              <Input
                id="reg-confirm"
                type="password"
                placeholder="Repeat your password"
                icon={<Lock className="w-4 h-4" />}
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "border-destructive" : ""}
              />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
              id="register-submit-btn"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
              ) : (
                <>Create account <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-primary hover:underline">Terms</a> and{" "}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  MessageSquare,
  CreditCard,
  Upload,
  Clock,
  Brain,
  Target,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Zap,
  Search,
  Shield,
  LayoutDashboard as Layout,
  ChevronRight,
  Menu,
  X,
  PlayCircle as Play,
  Settings,
  Layers,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- Components ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter">StudyAI</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#capabilities" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">AI Engine</Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" className="gradient-primary shadow-lg shadow-violet-500/20" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>

          <button 
            className="md:hidden p-2 text-muted-foreground" 
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link href="#features" className="block py-2 text-base font-medium text-muted-foreground">Features</Link>
              <Link href="#capabilities" className="block py-2 text-base font-medium text-muted-foreground">AI Engine</Link>
              <Link href="#pricing" className="block py-2 text-base font-medium text-muted-foreground">Pricing</Link>
              <Link href="#faq" className="block py-2 text-base font-medium text-muted-foreground">FAQ</Link>
              <div className="pt-4 flex flex-col gap-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button className="w-full gradient-primary" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

interface FeatureCardProps {
  icon: any; // Lucide icon type is complex, using any for now but could use LucideIcon
  title: string;
  description: string;
  color: string;
  slug: string;
  delay: number;
}

const FeatureCard = ({ icon: Icon, title, description, color, slug, delay }: FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -5 }}
    className="group relative p-8 rounded-3xl glass border border-white/5 hover:border-violet-500/30 flex flex-col justify-between h-full transition-all overflow-hidden"
  >
    <div>
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
    
    <div className="mt-8 pt-4 border-t border-white/5 relative z-10 flex items-center justify-between">
      <Button 
        variant="ghost" 
        className="h-10 px-4 -ml-4 rounded-xl text-violet-400 group-hover:text-violet-300 font-bold flex items-center gap-2 hover:bg-violet-500/10 border border-violet-500/0 hover:border-violet-500/20 transition-all duration-300" 
        asChild
      >
        <Link href={`/features/${slug}`}>
          Learn More
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
        </Link>
      </Button>
    </div>

    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-20 transition-opacity">
      <Icon className="w-24 h-24 blur-2xl" />
    </div>
  </motion.div>
);

interface PricingCardProps {
  tier: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  delay: number;
}

const PricingCard = ({ tier, price, description, features, popular, delay }: PricingCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6 }}
    className={cn(
      "relative p-8 rounded-[2.5rem] flex flex-col h-full",
      popular 
        ? "bg-violet-950/20 border-2 border-violet-500/50 shadow-2xl shadow-violet-500/10" 
        : "glass border border-white/5"
    )}
  >
    {popular && (
      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary px-4 py-1 text-xs font-bold uppercase tracking-wider">
        Most Popular
      </Badge>
    )}
    <div className="mb-8">
      <h3 className="text-2xl font-black mb-2">{tier}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
    <div className="mb-8 flex items-baseline gap-1">
      <span className="text-4xl font-black">{price}</span>
      {price !== "Custom" && <span className="text-muted-foreground text-sm">/month</span>}
    </div>
    <div className="space-y-4 mb-10 flex-1">
      {features.map((feature: string) => (
        <div key={feature} className="flex items-center gap-3 text-sm">
          <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-3 h-3 text-violet-400" />
          </div>
          <span>{feature}</span>
        </div>
      ))}
    </div>
    <Button 
      className={cn("w-full h-12 rounded-2xl text-base font-bold", popular ? "gradient-primary" : "variant-outline")}
      asChild
    >
      <Link href="/register">Get Started</Link>
    </Button>
  </motion.div>
);

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/5">
      <button
        className="w-full py-6 flex items-center justify-between text-left hover:text-violet-400 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-bold">{question}</span>
        <ChevronRight className={cn("w-5 h-5 transition-transform duration-300", isOpen && "rotate-90")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-muted-foreground leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Page ---

export default function LandingPage() {
  return (
    <div className="relative min-h-screen selection:bg-violet-500/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-violet-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-bold uppercase tracking-widest gap-2">
                <Sparkles className="w-3 h-3" />
                The future of studying is here
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8"
            >
              Master Any Subject with <span className="gradient-text">AI Intelligence</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Upload your documents, chat with your study materials, and generate interactive flashcards. Boost your learning speed by 3x with your personal AI study partner.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button size="lg" className="h-14 px-10 text-lg font-black gradient-primary rounded-2xl shadow-xl shadow-violet-500/30 group" asChild>
                <Link href="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold rounded-2xl border-white/10 hover:bg-white/5 transition-all group" id="watch-demo">
                <Play className="mr-2 w-5 h-5 fill-current" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Dashboard Mockup Preview */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1, type: "spring" }}
              className="mt-20 relative group"
            >
              <div className="absolute inset-0 bg-violet-500/20 rounded-[2.5rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="relative glass border border-white/10 rounded-[2.5rem] p-4 shadow-2xl overflow-hidden aspect-[16/10] sm:aspect-[16/9]">
                <div className="w-full h-full rounded-2xl relative overflow-hidden group-hover:scale-[1.01] transition-transform duration-700">
                  <img 
                    src="/dashboard-mockup.png" 
                    alt="AI Study Assistant Premium Dashboard Mockup" 
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] mb-12">Trusted by 50,000+ students from top universities</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            {["Harvard", "Stanford", "Oxford", "MIT", "Berkeley", "Cambridge"].map((uni) => (
              <span key={uni} className="text-2xl font-black tracking-tighter italic">{uni}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Designed for <span className="gradient-text">Unstoppable</span> Learning</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Everything you need to crush your exams and master complex topics in record time.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={BookOpen}
              title="Smart Library"
              description="Upload PDFs, images, or notes. Our AI indexes everything so you can find anything in seconds."
              color="bg-blue-500"
              slug="smart-library"
              delay={0.1}
            />
            <FeatureCard
              icon={MessageSquare}
              title="Interactive AI Chat"
              description="Ask questions about your documents and get instant, cited answers with page references."
              color="bg-violet-500"
              slug="ai-chat"
              delay={0.2}
            />
            <FeatureCard
              icon={CreditCard}
              title="Auto-Flashcards"
              description="AI automatically creates flashcards from your notes using spaced repetition algorithms."
              color="bg-emerald-500"
              slug="flashcards"
              delay={0.3}
            />
            <FeatureCard
              icon={Clock}
              title="Adaptive Planner"
              description="A study schedule that automatically adjusts based on your learning speed and exam dates."
              color="bg-amber-500"
              slug="planner"
              delay={0.4}
            />
            <FeatureCard
              icon={Brain}
              title="Knowledge Graph"
              description="Visualize how different concepts connect across all your subjects and documents."
              color="bg-pink-500"
              slug="knowledge-graph"
              delay={0.5}
            />
            <FeatureCard
              icon={Shield}
              title="Privacy First"
              description="Your study materials are yours alone. We use enterprise-grade encryption to protect your data."
              color="bg-cyan-500"
              slug="privacy"
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* AI Capabilities / Showcase */}
      <section id="capabilities" className="py-32 bg-secondary/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <Badge className="mb-6 gradient-primary">AI Engine</Badge>
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">It&apos;s not just a chat. It&apos;s a <span className="text-violet-400">Genius</span> in your pocket.</h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Contextual Understanding</h4>
                    <p className="text-muted-foreground text-sm">Our RAG engine reads across all your documents simultaneously to provide holistic answers.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Layers className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Multi-Modal Support</h4>
                    <p className="text-muted-foreground text-sm">Upload handwritten notes, diagrams, or 500-page textbooks. We process it all with high precision OCR.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Bilingual Mastery</h4>
                    <p className="text-muted-foreground text-sm">Study in 50+ languages. Translate concepts or explain foreign materials in your native tongue.</p>
                  </div>
                </div>
              </div>
              <Button className="mt-12 group rounded-2xl h-12 px-8" variant="outline">
                Explore Technology
                <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 gradient-primary blur-[100px] opacity-20 animate-pulse" />
              <div className="relative rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl glass min-h-[400px] flex flex-col justify-between">
                {/* Background AI brain image with overlay */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src="/ai-brain.png" 
                    alt="AI Neural Network Brain Illustration" 
                    className="w-full h-full object-cover opacity-30 blur-[1px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                </div>
                
                <div className="relative z-10 w-full">
                  <div className="p-6 bg-white/5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/20" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/20" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                    </div>
                    <div className="text-xs font-mono text-muted-foreground font-semibold">analyzer.study_ai</div>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full gradient-primary flex-shrink-0" />
                      <div className="bg-secondary/80 backdrop-blur-md p-4 rounded-2xl rounded-tl-none text-sm leading-relaxed border border-white/5 shadow-lg">
                        Based on your **Organic Chemistry** notes, the key difference in the reaction mechanism is the...
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      <Badge variant="outline" className="border-violet-500/30 text-violet-400 bg-violet-500/5 backdrop-blur-md font-bold">Analyzing Ch. 5</Badge>
                      <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-500/5 backdrop-blur-md font-bold">OCR: Active</Badge>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md shadow-lg">
                      <div className="flex items-center gap-2 mb-2 text-emerald-400">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-wider">Auto-Generated Flashcard</span>
                      </div>
                      <p className="text-sm font-semibold">Q: Define Markovnikov&apos;s Rule</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-black mb-6">Loved by <span className="gradient-text">Ambitious</span> Students</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Join thousands of students who have upgraded their study game.</p>
        </div>
        
        <div className="flex gap-6 overflow-hidden py-4 -mx-4 px-4 mask-fade-edges">
          {/* First row of testimonials */}
          <div className="flex gap-6 animate-scroll-left">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="w-[350px] flex-shrink-0 glass border-white/5 rounded-3xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-lg font-bold">
                    {["SC", "MW", "AL", "JD", "EM", "RT"][i-1]}
                  </div>
                  <div className="text-left">
                    <p className="font-bold">Student {i}</p>
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => <Sparkles key={s} className="w-3 h-3 fill-current" />)}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  &quot;StudyAI completely changed how I prepare for my finals. The ability to chat with my 600-page biology textbook is a literal cheat code.&quot;
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Simple, <span className="gradient-text">Transparent</span> Pricing</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Choose the plan that fits your academic goals.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard
              tier="Free"
              price="$0"
              description="Perfect for casual study sessions."
              features={[
                "3 documents / month",
                "Basic AI chat engine",
                "50 flashcards generation",
                "Standard study planner",
                "Community support"
              ]}
              delay={0.1}
            />
            <PricingCard
              tier="Pro"
              price="$12"
              description="For students who want to excel."
              popular={true}
              features={[
                "Unlimited documents",
                "Advanced AI engine (GPT-4)",
                "Unlimited flashcards",
                "AI adaptive scheduling",
                "OCR for handwritten notes",
                "Priority 24/7 support"
              ]}
              delay={0.2}
            />
            <PricingCard
              tier="Campus"
              price="Custom"
              description="For universities and study groups."
              features={[
                "Everything in Pro",
                "Shared knowledge base",
                "Team collaboration tools",
                "Admin analytics",
                "Custom integrations",
                "Dedicated manager"
              ]}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 bg-secondary/20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-black mb-16 text-center">Frequently Asked <span className="gradient-text">Questions</span></h2>
          <div className="glass p-8 rounded-[2.5rem] border-white/5">
            <FAQItem 
              question="How accurate is the AI at answering document-specific questions?"
              answer="Our system uses state-of-the-art Retrieval-Augmented Generation (RAG). It doesn't just guess; it retrieves relevant passages from your uploaded documents first and then synthesizes an answer. We also provide citations and page numbers so you can verify everything."
            />
            <FAQItem 
              question="What file formats do you support?"
              answer="We currently support PDF, TXT, and MD files for text-based study. For handwritten notes or images, we support PNG, JPG, and WEBP, which are processed through our high-precision OCR engine."
            />
            <FAQItem 
              question="Is my data secure and private?"
              answer="Absolutely. We take privacy seriously. Your uploaded documents are encrypted and stored securely. We do not use your personal study materials to train public AI models. Only you (and anyone you explicitly share with) can access your content."
            />
            <FAQItem 
              question="Can I use it for group study?"
              answer="Yes! Our Campus plan is specifically designed for collaboration. You can create shared libraries, collaborate on flashcard decks, and see group-wide knowledge graphs."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-[3rem] gradient-primary p-12 md:p-20 overflow-hidden text-center"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">Ready to transform your grades?</h2>
              <p className="text-white/80 text-lg mb-12 font-medium">Join 50,000+ students and start studying smarter today. No credit card required to start.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-black bg-white text-violet-700 hover:bg-white/90 hover:text-violet-800 border-none rounded-2xl shadow-2xl" asChild>
                  <Link href="/register">Start for Free</Link>
                </Button>
                <Button size="lg" variant="ghost" className="h-14 px-10 text-lg font-bold text-white hover:bg-white/10 rounded-2xl" id="contact-sales">
                  Contact Sales
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background pt-20 pb-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tighter">StudyAI</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                The AI-powered study platform designed to help students master any subject with the power of intelligence.
              </p>
              <div className="flex gap-4">
                <button className="w-10 h-10 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-violet-400 transition-colors"><MessageSquare className="w-5 h-5" /></button>
                <button className="w-10 h-10 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-violet-400 transition-colors"><Search className="w-5 h-5" /></button>
                <button className="w-10 h-10 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-violet-400 transition-colors"><Settings className="w-5 h-5" /></button>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-violet-400">Product</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">AI Chat</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Flashcards</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Study Planner</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Knowledge Graph</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-violet-400">Company</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-violet-400">Newsletter</h4>
              <p className="text-sm text-muted-foreground mb-4">Get the latest study tips and AI updates.</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
                <Button size="icon" className="gradient-primary rounded-xl shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">© 2026 StudyAI Inc. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

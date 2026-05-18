"use client";

import { use, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  MessageSquare,
  CreditCard,
  Clock,
  Brain,
  Shield,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Terminal,
  Database,
  Lock,
  Calendar,
  Layers,
  Fingerprint,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// Define TypeScript structures for our dynamic feature detail page
interface Subfeature {
  title: string;
  description: string;
  icon: any;
}

interface FeatureDetail {
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  color: string;
  glowColor: string;
  subfeatures: Subfeature[];
  whyItMatters: string[];
  mockupTitle: string;
  mockupDescription: string;
  mockupType: "uploader" | "chat" | "flashcard" | "planner" | "graph" | "privacy";
}

// Full, rich dataset for each feature card
const featuresData: Record<string, FeatureDetail> = {
  "smart-library": {
    title: "Smart Library",
    subtitle: "Your entire academic library, supercharged by AI.",
    description: "Upload lectures, presentations, textbooks, and handwritten notes. StudyAI automatically processes them using high-precision optical character recognition (OCR), extracts key terms, and indexes them into your personalized search engine.",
    icon: BookOpen,
    color: "bg-blue-500",
    glowColor: "from-blue-500/20 to-indigo-500/20",
    whyItMatters: [
      "Find any concept across thousands of PDF pages in under 2 seconds.",
      "Converts messy handwritten notes and diagrams into clean, searchable text.",
      "Organize notes automatically into smart folders categorized by subject.",
      "Saves up to 10 hours a week by ending manual document digging.",
    ],
    mockupTitle: "Interactive Smart Uploader",
    mockupDescription: "Drag and drop your study materials to witness real-time vector indexing.",
    mockupType: "uploader",
    subfeatures: [
      {
        title: "High-Precision OCR",
        description: "Scans whiteboard photos, scribbled lectures, and textbooks to extract high-yield text.",
        icon: Sparkles,
      },
      {
        title: "Semantic Vector Indexing",
        description: "Indexes documents based on conceptual meaning, not just simple text keywords.",
        icon: Database,
      },
      {
        title: "Universal Format Support",
        description: "Fully supports PDF, TXT, Markdown, JPG, PNG, and EPUB files seamlessly.",
        icon: Layers,
      },
    ],
  },
  "ai-chat": {
    title: "Interactive AI Chat",
    subtitle: "Deep context conversations with your documents.",
    description: "Ask questions directly to your textbooks or uploaded homework. StudyAI's advanced RAG (Retrieval-Augmented Generation) reads across all your materials simultaneously, delivering instant answers cited with clickable page numbers.",
    icon: MessageSquare,
    color: "bg-violet-500",
    glowColor: "from-violet-500/20 to-purple-500/20",
    whyItMatters: [
      "Get precise answers to complex questions, entirely sourced from your materials.",
      "Eliminates AI hallucinations by locking the model to your upload's content.",
      "Cites exactly where each piece of information came from (PDF title & page numbers).",
      "Explain complicated terms in simple terms, or auto-generate practice exam questions.",
    ],
    mockupTitle: "Document-Grounded Chat Console",
    mockupDescription: "Simulated interaction showing precise document retrieval and page citations.",
    mockupType: "chat",
    subfeatures: [
      {
        title: "Document Grounding",
        description: "Zero hallucination answers backed exclusively by your active study materials.",
        icon: Shield,
      },
      {
        title: "Multi-Source Synthesizer",
        description: "Pulls key context from three different textbooks simultaneously to answer one query.",
        icon: Layers,
      },
      {
        title: "Bilingual Translation",
        description: "Study and ask questions in over 50 languages natively, regardless of document language.",
        icon: Brain,
      },
    ],
  },
  "flashcards": {
    title: "Auto-Flashcards",
    subtitle: "AI-generated spaced repetition flashcards.",
    description: "Turn hours of textbook reading into high-yield active recall flashcard decks in one click. StudyAI parses your documents, extracts the core exam-grade concepts, and builds spaced repetition schedules aligned with memory retention curves.",
    icon: CreditCard,
    color: "bg-emerald-500",
    glowColor: "from-emerald-500/20 to-teal-500/20",
    whyItMatters: [
      "Instantly converts 50 pages of reading into key Q&A card decks.",
      "Uses Spaced Repetition algorithms to schedule cards right before you forget them.",
      "Keeps track of your mastery metrics to show you what concepts to focus on.",
      "Drastically boosts memory recall by replacing passive reading with active testing.",
    ],
    mockupTitle: "Active Recall Card Sandbox",
    mockupDescription: "Click to flip the auto-generated card and practice active recall.",
    mockupType: "flashcard",
    subfeatures: [
      {
        title: "Spaced Repetition (SRS)",
        description: "Based on the Leitner system to review cards at optimal scientific intervals.",
        icon: Clock,
      },
      {
        title: "Exam-Grade Extractions",
        description: "AI extracts actual high-yield definitions, mechanisms, and core questions.",
        icon: Sparkles,
      },
      {
        title: "Interactive Flip Decks",
        description: "Stunning 3D glassmorphic card animations that mimic physical study cards.",
        icon: CreditCard,
      },
    ],
  },
  "planner": {
    title: "Adaptive Planner",
    subtitle: "Your study roadmap, dynamically tailored to you.",
    description: "Say goodbye to rigid calendars. Our adaptive planner analyzes your upcoming exam dates, daily study goals, and conceptual learning speeds to automatically build a micro-task schedule that dynamically adapts to your progress.",
    icon: Clock,
    color: "bg-amber-500",
    glowColor: "from-amber-500/20 to-orange-500/20",
    whyItMatters: [
      "Automatically breaks complex subjects into manageable daily study tasks.",
      "Syncs with exam dates to prioritize high-stake topics as tests get closer.",
      "If you miss a day, the schedule recalculates automatically without penalty or guilt.",
      "Monitors daily study durations to protect against academic burnout.",
    ],
    mockupTitle: "Dynamic Schedule Roadmapping",
    mockupDescription: "See how tasks adjust based on priority flags and study goals.",
    mockupType: "planner",
    subfeatures: [
      {
        title: "Exam Countdown Sync",
        description: "Prioritizes learning subjects dynamically as specific test deadlines approach.",
        icon: Calendar,
      },
      {
        title: "Burnout Protection",
        description: "Paces daily learning quotas to ensure you maintain high cognitive retention.",
        icon: Shield,
      },
      {
        title: "Guilt-Free Recalibrator",
        description: "Instantly shifts remaining study tasks forward if you take an unexpected day off.",
        icon: Clock,
      },
    ],
  },
  "knowledge-graph": {
    title: "Knowledge Graph",
    subtitle: "See the connections, master the big picture.",
    description: "Stop memorizing facts in isolation. StudyAI's Knowledge Graph visualizes semantic connections across all uploaded documents, helping you see how chapters from chemistry, biology, or calculus link together.",
    icon: Brain,
    color: "bg-pink-500",
    glowColor: "from-pink-500/20 to-rose-500/20",
    whyItMatters: [
      "Visualizes cognitive conceptual links to accelerate interdisciplinary mastery.",
      "Identifies structural gaps in your library that need additional research.",
      "Shows visual color-coding of which nodes you have fully mastered.",
      "Provides clickable conceptual spheres to review files directly.",
    ],
    mockupTitle: "Semantic Conceptual Relationship Map",
    mockupDescription: "Explore interactive nodes and see links between different study chapters.",
    mockupType: "graph",
    subfeatures: [
      {
        title: "Interdisciplinary Mapping",
        description: "Connects biology notes to organic chemistry reactions automatically.",
        icon: Brain,
      },
      {
        title: "Click-To-Explore Spheres",
        description: "Click any connection node to immediately pull up corresponding text references.",
        icon: Layers,
      },
      {
        title: "Visual Mastery Indicators",
        description: "Glowing node outlines showing your cognitive mastery progress at a glance.",
        icon: Sparkles,
      },
    ],
  },
  "privacy": {
    title: "Privacy First",
    subtitle: "Your intellect is your own. We keep it secure.",
    description: "Your academic papers, research essays, and lecture notes are valuable personal property. We deploy industry-standard end-to-end encryption to guarantee your study library remains private, secure, and fully owned by you.",
    icon: Shield,
    color: "bg-cyan-500",
    glowColor: "from-cyan-500/20 to-teal-500/20",
    whyItMatters: [
      "We strictly do NOT use your personal study files to train public models.",
      "All documents are locked behind industry-grade AES-256 encryption at rest.",
      "Complete self-sovereign control: delete any document vector instantly.",
      "Fully compliant with rigid student data privacy regulations.",
    ],
    mockupTitle: "Military-Grade Security Console",
    mockupDescription: "Secure authorization metrics showing encrypted transit data details.",
    mockupType: "privacy",
    subfeatures: [
      {
        title: "Zero AI Training Leaks",
        description: "Your uploaded assets are strictly walled off from public model tuning databases.",
        icon: Lock,
      },
      {
        title: "AES-256 Storage Shields",
        description: "All textual and vector storage matches corporate and financial protection standards.",
        icon: Fingerprint,
      },
      {
        title: "Instant Self-Destruct Keys",
        description: "One-click deletion removes all MongoDB entries and Pinecone index slices immediately.",
        icon: Shield,
      },
    ],
  },
  "ai-engine": {
    title: "AI Genius Engine",
    subtitle: "A specialized hybrid model designed for academic mastery.",
    description: "The heart of StudyAI. Our advanced Retrieval-Augmented Generation (RAG) system combined with vision processing and contextual routing does more than just chat. It acts as an elite, customized academic advisor in your pocket.",
    icon: Sparkles,
    color: "bg-violet-600",
    glowColor: "from-violet-500/20 to-indigo-500/20",
    whyItMatters: [
      "Reads and understands thousands of pages of academic literature at once.",
      "Processes formulas, diagrams, handwritten charts, and equations with vision AI.",
      "Translates and explains concepts in 50+ languages natively.",
      "Provides cited page-level proof for every claim it makes.",
    ],
    mockupTitle: "Advanced Contextual Reasoning Console",
    mockupDescription: "Observe how the AI engine retrieves documents, extracts text with high-precision OCR, and validates answers.",
    mockupType: "chat",
    subfeatures: [
      {
        title: "Contextual RAG Routing",
        description: "Analyzes questions, fetches matching text fragments, and structures responses cleanly.",
        icon: Database,
      },
      {
        title: "Bilingual OCR Parsing",
        description: "Extracts formulas and handwritten diagrams in real time from image inputs.",
        icon: Layers,
      },
      {
        title: "Academic Summarization",
        description: "Simplifies advanced university lectures into structured, high-yield study outlines.",
        icon: Sparkles,
      },
    ],
  },
};

export default function FeatureDetailsPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
  const params = use(paramsPromise);
  const slug = params.slug;
  const feature = featuresData[slug];

  // Interactive mockup states
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: "user", text: "What is Markovnikov's Rule?" },
    { role: "ai", text: "According to Organic Chemistry (Page 142), Markovnikov's rule states that in the addition of an acid to an alkene, the acid hydrogen (H) becomes attached to the carbon with fewer alkyl substituents, while the halide group (X) attaches to the carbon with more alkyl substituents.", source: "Organic_Chemistry.pdf (Page 142)" }
  ]);

  if (!feature) {
    return (
      <div className="min-h-screen bg-[#07070a] text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-black mb-4">Feature Not Found</h1>
        <p className="text-muted-foreground mb-8">The capability you are looking for does not exist.</p>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  const FeatureIcon = feature.icon;

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: "user", text: chatInput };
    const aiMsg = { 
      role: "ai", 
      text: `Based on your uploaded study guide, "${chatInput}" refers to a core academic mechanism. You can find detail markers in Section 3 of your notes.`, 
      source: "Study_Guide_Draft.pdf (Page 4)" 
    };
    setChatMessages([...chatMessages, userMsg, aiMsg]);
    setChatInput("");
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-white relative overflow-hidden selection:bg-violet-500/30 selection:text-white pb-24">
      {/* Background Blobs */}
      <div className={`absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br ${feature.glowColor} rounded-full blur-[150px] opacity-60 animate-pulse`} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[150px] opacity-40 animate-pulse [animation-delay:2s]" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 relative z-10">
        
        {/* Back Navigation */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-white font-bold mb-12 group transition-colors"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Capabilities
        </Link>

        {/* Feature Header Section */}
        <div className="grid lg:grid-cols-12 gap-12 items-center mb-24">
          <div className="lg:col-span-7">
            <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full border-white/10 bg-white/5 text-violet-300 text-xs font-bold uppercase tracking-widest gap-2">
              <Sparkles className="w-3 h-3 text-violet-400 animate-spin" />
              Core AI Capability
            </Badge>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center shadow-lg shadow-violet-500/10`}>
                <FeatureIcon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight">{feature.title}</h1>
            </div>
            <h2 className="text-2xl font-bold text-muted-foreground mb-6 leading-relaxed">{feature.subtitle}</h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">{feature.description}</p>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-violet-500/10 rounded-[2.5rem] blur-3xl opacity-50" />
            <div className="relative glass border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-violet-400" />
                Why It Matters
              </h3>
              <ul className="space-y-4">
                {feature.whyItMatters.map((point, index) => (
                  <motion.li 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={index} 
                    className="flex gap-3 text-sm text-muted-foreground leading-relaxed"
                  >
                    <div className="w-5 h-5 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <ChevronRight className="w-3 h-3 text-violet-400" />
                    </div>
                    <span>{point}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Feature Sub-Capabilities Grid */}
        <div className="mb-24">
          <h2 className="text-2xl md:text-3xl font-black mb-12 text-center">Engineered for Academic Excellence</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {feature.subfeatures.map((sub, index) => {
              const SubIcon = sub.icon;
              return (
                <Card key={index} className="glass border-white/5 hover:border-violet-500/30 transition-all rounded-3xl p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <SubIcon className="w-16 h-16" />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6">
                    <SubIcon className="w-5 h-5 text-violet-400" />
                  </div>
                  <h4 className="font-bold text-lg mb-3 text-white">{sub.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{sub.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Dynamic Interactive Features Showcase Section */}
        <div className="grid lg:grid-cols-12 gap-12 items-center mb-24">
          <div className="lg:col-span-5">
            <Badge className="mb-6 gradient-primary">Interactive Showcase</Badge>
            <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight">{feature.mockupTitle}</h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-8">{feature.mockupDescription}</p>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-3 text-sm">
                <Terminal className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                <p className="text-muted-foreground font-mono">Status: Ready <br/>Mode: Fully Grounded AI Engine</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="glass border border-white/10 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden min-h-[400px] flex flex-col justify-between">
              
              {/* UPLOADER MOCKUP */}
              {feature.mockupType === "uploader" && (
                <div className="flex-1 flex flex-col justify-center items-center p-8 border-2 border-dashed border-white/10 rounded-3xl bg-[#09090d] hover:border-violet-500/30 transition-all cursor-pointer group">
                  <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-8 h-8 text-violet-400 animate-bounce" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">Drop your lecture PDF here</h4>
                  <p className="text-muted-foreground text-sm text-center max-w-sm mb-6">Supports PDFs, scans, notes and diagrams up to 100MB</p>
                  <Button className="gradient-primary rounded-xl h-11 px-6 shadow-lg shadow-violet-500/20">Select File</Button>
                </div>
              )}

              {/* CHAT MOCKUP */}
              {feature.mockupType === "chat" && (
                <div className="flex-1 flex flex-col justify-between h-[450px]">
                  {/* Dialogue Screen */}
                  <div className="flex-1 space-y-4 overflow-y-auto pr-2 mb-4 scrollbar-thin">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'ai' && <div className="w-7 h-7 rounded-full gradient-primary flex-shrink-0" />}
                        <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[85%] border shadow-md ${msg.role === 'user' ? 'bg-violet-600 border-violet-500 rounded-tr-none' : 'bg-secondary/80 border-white/5 rounded-tl-none'}`}>
                          {msg.text}
                          {msg.source && (
                            <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1">
                              <span className="text-[10px] uppercase font-bold text-violet-400">Cited Source:</span>
                              <Badge className="bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[10px] cursor-pointer hover:bg-violet-500/40">{msg.source}</Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input Console */}
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Ask the PDF anything..." 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                    <Button onClick={handleSendMessage} className="gradient-primary rounded-xl px-4">Send</Button>
                  </div>
                </div>
              )}

              {/* FLASHCARD MOCKUP */}
              {feature.mockupType === "flashcard" && (
                <div className="flex-1 flex flex-col justify-center items-center py-12">
                  <div 
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="w-[320px] h-[200px] cursor-pointer relative preserve-3d duration-700 select-none"
                    style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                  >
                    {/* Front of Card */}
                    <div className="absolute inset-0 backface-hidden glass border border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-2xl bg-gradient-to-br from-white/5 to-white/0">
                      <div className="flex items-center justify-between text-xs text-muted-foreground uppercase font-bold tracking-widest">
                        <span>Organic Chemistry</span>
                        <Sparkles className="w-4 h-4 text-violet-400 animate-spin" />
                      </div>
                      <p className="text-lg font-bold text-center leading-relaxed">What is the outcome of a nucleophilic attack on a carbonyl carbon?</p>
                      <span className="text-xs text-muted-foreground text-center animate-pulse">Click to flip card</span>
                    </div>

                    {/* Back of Card */}
                    <div 
                      className="absolute inset-0 backface-hidden glass border border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-2xl bg-gradient-to-br from-violet-950/20 to-purple-950/20"
                      style={{ transform: 'rotateY(180deg)' }}
                    >
                      <div className="flex items-center justify-between text-xs text-muted-foreground uppercase font-bold tracking-widest">
                        <span>Answer</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-base font-semibold text-center leading-relaxed">It breaks the pi bond, pushing the electrons to the oxygen to form a tetrahedral intermediate.</p>
                      <div className="flex justify-center gap-2">
                        <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">Got it (Easy)</Badge>
                        <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px]">Hard (Review soon)</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PLANNER MOCKUP */}
              {feature.mockupType === "planner" && (
                <div className="flex-1 flex flex-col justify-center py-6">
                  <h4 className="font-bold text-lg mb-4 text-center">Adaptive Study Schedule</h4>
                  <div className="space-y-3">
                    {[
                      { title: "Review Mitochondria ATP Synthesis", time: "30 mins", priority: "High Priority", active: true },
                      { title: "Practice Organic Chemistry Reactions", time: "45 mins", priority: "Daily Goal", active: true },
                      { title: "Read Chapter 4 of Calculus Guide", time: "60 mins", priority: "Standard Tasks", active: false }
                    ].map((item, i) => (
                      <div key={i} className={`p-4 rounded-2xl flex items-center justify-between border ${item.active ? 'bg-violet-950/15 border-violet-500/35' : 'bg-white/5 border-white/5 opacity-55'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${item.active ? 'bg-violet-400 animate-ping' : 'bg-muted-foreground'}`} />
                          <div>
                            <p className="text-sm font-bold text-white">{item.title}</p>
                            <span className="text-xs text-muted-foreground">{item.priority}</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-violet-400">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* KNOWLEDGE GRAPH MOCKUP */}
              {feature.mockupType === "graph" && (
                <div className="flex-1 flex flex-col justify-center items-center relative py-6">
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div className="relative w-full h-[250px] flex items-center justify-center">
                    {/* Connecting SVGs lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                      <line x1="50%" y1="50%" x2="20%" y2="25%" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="2" strokeDasharray="4 4" />
                      <line x1="50%" y1="50%" x2="80%" y2="25%" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="2" strokeDasharray="4 4" />
                      <line x1="50%" y1="50%" x2="20%" y2="75%" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="2" strokeDasharray="4 4" />
                      <line x1="50%" y1="50%" x2="80%" y2="75%" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="2" strokeDasharray="4 4" />
                    </svg>

                    {/* Central Core Concept Node */}
                    <div className="absolute z-10 w-24 h-24 rounded-full bg-violet-600/35 border-2 border-violet-500 flex items-center justify-center flex-col text-center shadow-xl shadow-violet-500/20 animate-pulse">
                      <Brain className="w-6 h-6 text-violet-200 mb-1" />
                      <span className="text-[10px] font-bold">Respiration</span>
                    </div>

                    {/* Satellite Nodes */}
                    <div className="absolute top-[10%] left-[10%] z-10 w-16 h-16 rounded-full bg-blue-950/60 border border-blue-500 flex items-center justify-center flex-col text-center shadow-md">
                      <BookOpen className="w-4 h-4 text-blue-400 mb-0.5" />
                      <span className="text-[9px] font-semibold">ATP Synth</span>
                    </div>
                    <div className="absolute top-[10%] right-[10%] z-10 w-16 h-16 rounded-full bg-pink-950/60 border border-pink-500 flex items-center justify-center flex-col text-center shadow-md">
                      <Layers className="w-4 h-4 text-pink-400 mb-0.5" />
                      <span className="text-[9px] font-semibold">Glycolysis</span>
                    </div>
                    <div className="absolute bottom-[10%] left-[10%] z-10 w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500 flex items-center justify-center flex-col text-center shadow-md">
                      <Clock className="w-4 h-4 text-emerald-400 mb-0.5" />
                      <span className="text-[9px] font-semibold">Krebs</span>
                    </div>
                    <div className="absolute bottom-[10%] right-[10%] z-10 w-16 h-16 rounded-full bg-amber-950/60 border border-amber-500 flex items-center justify-center flex-col text-center shadow-md">
                      <Sparkles className="w-4 h-4 text-amber-400 mb-0.5" />
                      <span className="text-[9px] font-semibold">Electron Tx</span>
                    </div>
                  </div>
                </div>
              )}

              {/* PRIVACY FIRST MOCKUP */}
              {feature.mockupType === "privacy" && (
                <div className="flex-1 flex flex-col justify-center items-center py-6">
                  <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-6 animate-pulse">
                    <Shield className="w-10 h-10 text-cyan-400" />
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-white">Advanced Security Shield</h4>
                  <p className="text-muted-foreground text-sm text-center mb-6 max-w-sm">Status: Protected. All database vector pipelines are segmented and AES-256 encrypted.</p>
                  <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                      <p className="text-xs text-muted-foreground">TLS Standard</p>
                      <p className="text-base font-bold text-cyan-400">1.3 Active</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                      <p className="text-xs text-muted-foreground">Training Exclusion</p>
                      <p className="text-base font-bold text-cyan-400">100% Walled</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Global CTA Section Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-[2.5rem] gradient-primary p-12 md:p-16 overflow-hidden text-center shadow-2xl"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-400/25 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Experience {feature.title} Live</h2>
            <p className="text-white/80 text-base md:text-lg mb-10 max-w-xl mx-auto">Boost your cognitive retention and unlock your learning potential with your premium AI study companion. Free to start.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-black bg-white text-violet-700 hover:bg-white/90 hover:text-violet-800 border-none rounded-2xl shadow-xl" asChild>
                <Link href="/register">Start Using Now</Link>
              </Button>
              <Button size="lg" variant="ghost" className="h-14 px-10 text-lg font-bold text-white hover:bg-white/10 rounded-2xl" asChild>
                <Link href="/login">Access Dashboard</Link>
              </Button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

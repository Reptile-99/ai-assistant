"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Brain,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  Download,
  Send,
  Zap,
  ArrowRight,
  Plus,
  Eye,
  FileUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { getDocument, summarizeDocument, clearSummaryCache, Document, SummaryType, SummaryResult } from "@/services/ai.service";
import { getFlashcards, generateFlashcards, Flashcard } from "@/services/flashcard.service";
import { queryRAG, RAGQueryResult } from "@/services/ai.service";
import { cn } from "@/lib/utils";

// Message interface for local chat state
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: any[];
  timestamp: Date;
}

export default function DocumentViewerPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  // Document states
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Summary states
  const [summaryType, setSummaryType] = useState<SummaryType>("short");
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Flashcards states
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  const [cardCount, setCardCount] = useState(5);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);

  // Fetch document details, summaries, and flashcards
  useEffect(() => {
    async function loadData() {
      if (!documentId) return;
      setIsLoading(true);
      setError(null);
      try {
        const doc = await getDocument(documentId);
        setDocument(doc);

        // Check if there is already a cached summary of the selected type
        if (doc.summaries && doc.summaries[summaryType]) {
          const cached = doc.summaries[summaryType];
          setSummaryResult({
            summary: cached.content,
            type: summaryType,
            tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: cached.tokenUsage },
            cost: { inputCost: 0, outputCost: 0, totalCost: 0, formattedCost: "$0.00" },
            chunksProcessed: 1,
            model: "Gemini",
            documentTitle: doc.title,
            estimatedInputTokens: Math.ceil(doc.content.length / 4),
            cached: true,
          });
        }

        // Load flashcards for this document
        const allCards = await getFlashcards();
        const documentCards = allCards.filter((card) => card.documentId === documentId);
        setFlashcards(documentCards);

        // Initialize chat with welcome message
        setChatMessages([
          {
            role: "assistant",
            content: `Hi! I have analyzed **${doc.title}**. You can ask me any specific questions about this document, or toggle to the other tabs to view study notes and flashcards!`,
            timestamp: new Date(),
          },
        ]);
      } catch (err: any) {
        console.error("Failed to load document:", err);
        setError(err?.response?.data?.error || "Failed to load document details.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [documentId]);

  // Load summary whenever summaryType changes
  useEffect(() => {
    if (!document) return;
    if (document.summaries && document.summaries[summaryType]) {
      const cached = document.summaries[summaryType];
      setSummaryResult({
        summary: cached.content,
        type: summaryType,
        tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: cached.tokenUsage },
        cost: { inputCost: 0, outputCost: 0, totalCost: 0, formattedCost: "$0.00" },
        chunksProcessed: 1,
        model: "Gemini",
        documentTitle: document.title,
        estimatedInputTokens: Math.ceil(document.content.length / 4),
        cached: true,
      });
    } else {
      setSummaryResult(null);
    }
  }, [summaryType, document]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isSendingMessage]);

  // Generate summary
  const handleGenerateSummary = async () => {
    if (!documentId) return;
    setIsSummarizing(true);
    try {
      const { data } = await summarizeDocument(documentId, summaryType);
      setSummaryResult(data);

      // Refresh local document to update cached summaries state
      const updatedDoc = await getDocument(documentId);
      setDocument(updatedDoc);
    } catch (err: any) {
      console.error("Summarization failed:", err);
      setError(err?.response?.data?.error || "Failed to generate AI summary.");
    } finally {
      setIsSummarizing(false);
    }
  };

  // Force regenerate summary (clear cache and run)
  const handleRegenerateSummary = async () => {
    if (!documentId) return;
    setIsSummarizing(true);
    try {
      await clearSummaryCache(documentId, summaryType);
      const { data } = await summarizeDocument(documentId, summaryType);
      setSummaryResult(data);

      const updatedDoc = await getDocument(documentId);
      setDocument(updatedDoc);
    } catch (err: any) {
      console.error("Regeneration failed:", err);
      setError(err?.response?.data?.error || "Failed to regenerate AI summary.");
    } finally {
      setIsSummarizing(false);
    }
  };

  // Copy summary to clipboard
  const copySummary = async () => {
    if (!summaryResult?.summary) return;
    try {
      await navigator.clipboard.writeText(summaryResult.summary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch (e) {
      console.error("Failed to copy", e);
    }
  };

  // Download summary as Markdown
  const downloadSummaryMarkdown = () => {
    if (!summaryResult?.summary || !document) return;
    const header = `# Study Notes: ${document.title}\n> Format: ${summaryType.toUpperCase()} · Generated by AI Assistant\n\n---\n\n`;
    const blob = new Blob([header + summaryResult.summary], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = `${document.title.replace(/\.[^/.]+$/, "")}-${summaryType}-notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle RAG Chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isSendingMessage || !documentId) return;

    const userMsg = userInput.trim();
    setUserInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg, timestamp: new Date() }]);
    setIsSendingMessage(true);

    try {
      const response = await queryRAG(userMsg, documentId);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.answer,
          sources: response.sources,
          timestamp: new Date(),
        },
      ]);
    } catch (err: any) {
      console.error("RAG Query failed:", err);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I encountered an error searching this document: **${err?.response?.data?.error || err.message}**`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Generate Flashcards
  const handleGenerateFlashcards = async () => {
    if (!documentId) return;
    setIsGeneratingCards(true);
    try {
      await generateFlashcards(documentId, cardCount, difficulty);
      // Reload cards
      const allCards = await getFlashcards();
      const documentCards = allCards.filter((card) => card.documentId === documentId);
      setFlashcards(documentCards);
    } catch (err: any) {
      console.error("Flashcards generation failed:", err);
      setError(err?.response?.data?.error || "Failed to generate flashcards.");
    } finally {
      setIsGeneratingCards(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
        <p className="text-sm text-muted-foreground animate-pulse">Analyzing document & preparing workspace...</p>
      </div>
    );
  }

  if (error && !document) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center max-w-md mx-auto px-4">
        <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold">Failed to load document</h3>
        <p className="text-xs text-muted-foreground mt-1.5 mb-6">{error}</p>
        <Button variant="outline" className="rounded-xl" onClick={() => router.push("/dashboard")}>
          <ChevronLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  if (!document) return null;

  // Construct PDF URL
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";
  const pdfUrl = `${apiBase}/${document.fileUrl.replace(/\\/g, "/")}`;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-7xl mx-auto space-y-4">
      {/* Workspace Header */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 rounded-xl hover:bg-white/5"
            onClick={() => router.push("/dashboard")}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold truncate pr-2">{document.title}</h2>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <span>{document.pageCount} pages</span>
              <span>•</span>
              <span>{(document.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
              <span>•</span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] px-1.5 py-0 rounded-full font-bold",
                  document.isIndexed
                    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                    : "border-amber-500/30 bg-amber-500/5 text-amber-400 animate-pulse"
                )}
              >
                {document.isIndexed ? "Index Ready (RAG)" : "Indexing Vector Space"}
              </Badge>
            </p>
          </div>
        </div>
      </div>

      {/* Main Workspace Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Left Pane - Premium PDF Viewer */}
        <Card className="glass border border-white/5 overflow-hidden flex flex-col h-full rounded-2xl">
          <CardHeader className="py-3 px-4 border-b border-white/5 flex flex-row items-center justify-between bg-black/10">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              Document Viewer
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] text-muted-foreground hover:text-foreground h-7 hover:bg-white/5"
              onClick={() => window.open(pdfUrl, "_blank")}
            >
              Open in new tab
            </Button>
          </CardHeader>
          <div className="flex-1 bg-neutral-900/50 relative">
            <iframe
              src={`${pdfUrl}#toolbar=1`}
              className="w-full h-full border-0 absolute inset-0"
              title={document.title}
            />
          </div>
        </Card>

        {/* Right Pane - AI Study Hub */}
        <Card className="glass border border-white/5 overflow-hidden flex flex-col h-full rounded-2xl">
          <Tabs defaultValue="notes" className="flex flex-col h-full">
            <div className="border-b border-white/5 px-4 bg-black/10">
              <TabsList className="bg-transparent border-0 gap-6 h-12 p-0 justify-start">
                <TabsTrigger
                  value="notes"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-violet-400 data-[state=active]:border-b-2 data-[state=active]:border-violet-400 rounded-none h-12 font-bold text-xs transition-all border-b-2 border-transparent px-1"
                >
                  <Brain className="w-3.5 h-3.5 mr-1.5" />
                  Study Notes
                </TabsTrigger>
                <TabsTrigger
                  value="chat"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-violet-400 data-[state=active]:border-b-2 data-[state=active]:border-violet-400 rounded-none h-12 font-bold text-xs transition-all border-b-2 border-transparent px-1"
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                  Document Chat
                </TabsTrigger>
                <TabsTrigger
                  value="flashcards"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-violet-400 data-[state=active]:border-b-2 data-[state=active]:border-violet-400 rounded-none h-12 font-bold text-xs transition-all border-b-2 border-transparent px-1"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Flashcards
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 min-h-0 relative">
              {/* Tab 1: AI Summarizer & Study Notes */}
              <TabsContent value="notes" className="m-0 h-full flex flex-col p-4 space-y-4">
                {/* Summary Configuration Header */}
                <div className="flex items-center justify-between gap-4 flex-wrap bg-white/5 p-2.5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-1.5">
                    {(["short", "detailed", "bullet", "key_concepts"] as SummaryType[]).map((type) => (
                      <Button
                        key={type}
                        variant={summaryType === type ? "secondary" : "ghost"}
                        size="sm"
                        className={cn(
                          "text-[10px] h-7 px-2.5 rounded-lg capitalize font-bold",
                          summaryType === type ? "bg-violet-500/25 text-violet-300 border border-violet-500/30 hover:bg-violet-500/30" : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => setSummaryType(type)}
                      >
                        {type.replace("_", " ")}
                      </Button>
                    ))}
                  </div>
                  {summaryResult && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[10px] text-muted-foreground hover:text-foreground h-7 px-2"
                      onClick={handleRegenerateSummary}
                      disabled={isSummarizing}
                    >
                      <RefreshCw className={cn("w-3 h-3 mr-1", isSummarizing && "animate-spin")} />
                      Force update
                    </Button>
                  )}
                </div>

                {/* Summary Content Workspace */}
                <div className="flex-1 min-h-0">
                  {isSummarizing ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <Loader2 className="w-7 h-7 animate-spin text-violet-500" />
                      <p className="text-xs text-muted-foreground animate-pulse">Orchestrating AI models for summary...</p>
                    </div>
                  ) : summaryResult ? (
                    <div className="flex flex-col h-full space-y-3">
                      {/* Control Panel */}
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground border-b border-white/5 pb-2">
                        <span className="flex items-center gap-1">
                          Model: <Badge variant="outline" className="text-[9px] px-1 font-bold text-violet-300 border-violet-500/20">{summaryResult.model}</Badge>
                          {summaryResult.cached && <span className="text-emerald-400 font-semibold">(Cached)</span>}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-6 gap-1 text-muted-foreground hover:text-foreground" onClick={copySummary}>
                            {copiedSummary ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            {copiedSummary ? "Copied" : "Copy"}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 gap-1 text-muted-foreground hover:text-foreground" onClick={downloadSummaryMarkdown}>
                            <Download className="w-3 h-3" />
                            Download
                          </Button>
                        </div>
                      </div>

                      {/* Summary Notes Renderer */}
                      <ScrollArea className="flex-1 pr-3">
                        <div className="prose prose-invert prose-xs max-w-none text-xs leading-relaxed text-foreground/95 space-y-3 select-text pb-4">
                          {summaryResult.summary.split("\n").map((line, idx) => {
                            if (line.startsWith("#")) {
                              return <h3 key={idx} className="text-sm font-bold text-violet-300 mt-4 mb-2">{line.replace(/#/g, "").trim()}</h3>;
                            }
                            if (line.trim().startsWith("-") || line.trim().startsWith("*")) {
                              return <li key={idx} className="ml-4 list-disc marker:text-violet-400">{line.replace(/^[\s-*]+/, "").trim()}</li>;
                            }
                            if (line.trim() === "") return <div key={idx} className="h-2" />;
                            return <p key={idx} className="mt-1">{line}</p>;
                          })}
                        </div>
                      </ScrollArea>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center max-w-xs mx-auto space-y-4">
                      <div className="w-12 h-12 bg-violet-500/10 border border-violet-500/25 rounded-2xl flex items-center justify-center shadow-inner">
                        <Brain className="w-6 h-6 text-violet-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold capitalize">Generate {summaryType.replace("_", " ")} Notes</h4>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Our AI Provider will scan this PDF and build premium interactive notes optimized for rapid learning.
                        </p>
                      </div>
                      <Button className="gradient-primary shadow-lg shadow-violet-500/25 w-full rounded-xl" onClick={handleGenerateSummary}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate AI Notes
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Tab 2: Contextual Document Chat (RAG) */}
              <TabsContent value="chat" className="m-0 h-full flex flex-col">
                <div className="flex-1 min-h-0">
                  <ScrollArea className="h-full p-4 pr-6">
                    <div className="space-y-4 pb-4">
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={cn("flex flex-col max-w-[85%]", msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start")}>
                          <div
                            className={cn(
                              "px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed select-text shadow-sm",
                              msg.role === "user"
                                ? "bg-violet-600 text-white rounded-tr-none"
                                : "bg-white/5 border border-white/5 text-foreground/90 rounded-tl-none"
                            )}
                          >
                            <p className="whitespace-pre-line">{msg.content}</p>

                            {/* Render Source Citations if present */}
                            {msg.sources && msg.sources.length > 0 && (
                              <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1.5">
                                <p className="text-[10px] font-bold text-violet-300 uppercase tracking-wide">References from PDF:</p>
                                {msg.sources.map((src: any, idx: number) => (
                                  <details key={idx} className="group bg-black/25 rounded-lg border border-white/5 p-1.5 cursor-pointer">
                                    <summary className="text-[9px] font-semibold text-muted-foreground flex items-center justify-between group-open:text-foreground">
                                      <span>Source {idx + 1} (match score: {Math.round(src.score * 100)}%)</span>
                                      <span className="text-[8px] px-1 bg-white/10 rounded">view excerpt</span>
                                    </summary>
                                    <p className="text-[9px] text-muted-foreground/80 mt-1 select-text normal-case leading-normal whitespace-pre-line bg-black/10 p-1.5 rounded">
                                      {src.text}
                                    </p>
                                  </details>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="text-[9px] text-muted-foreground mt-1 px-1">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                      {isSendingMessage && (
                        <div className="mr-auto items-start max-w-[80%] flex flex-col">
                          <div className="px-3.5 py-2.5 bg-white/5 border border-white/5 text-foreground/90 rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
                            <span>AI is searching vector space...</span>
                          </div>
                        </div>
                      )}
                      <div ref={chatScrollRef} />
                    </div>
                  </ScrollArea>
                </div>

                {/* Input form */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-white/5 bg-black/10 flex items-center gap-2">
                  <Input
                    placeholder="Ask a question about this document..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    disabled={isSendingMessage}
                    className="bg-white/5 border-white/10 rounded-xl h-10 text-xs focus-visible:ring-violet-500"
                  />
                  <Button type="submit" size="icon" className="gradient-primary rounded-xl h-10 w-10 flex-shrink-0" disabled={!userInput.trim() || isSendingMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </TabsContent>

              {/* Tab 3: Flashcards */}
              <TabsContent value="flashcards" className="m-0 h-full flex flex-col p-4 space-y-4">
                {flashcards.length > 0 ? (
                  <div className="flex-1 flex flex-col min-h-0 space-y-4">
                    {/* Active Cards Flip Arena */}
                    <div className="flex-1 flex items-center justify-center p-2 relative">
                      <div className="w-full max-w-sm aspect-[5/3] relative perspective-1000">
                        {flashcards.map((card, idx) => {
                          const isCurrent = flippedCardId === card._id;
                          return (
                            <div
                              key={card._id}
                              className={cn(
                                "absolute inset-0 transition-all duration-500 transform-style-3d cursor-pointer rounded-2xl border border-white/10 relative shadow-2xl flex flex-col justify-between p-6",
                                isCurrent ? "rotate-y-180 bg-violet-950/20" : "bg-neutral-900/60 glass"
                              )}
                              onClick={() => setFlippedCardId(isCurrent ? null : card._id)}
                            >
                              {/* Card Content - Front or Back */}
                              {!isCurrent ? (
                                <div className="flex-1 flex flex-col justify-between">
                                  <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="border-violet-500/30 text-violet-300 text-[9px] uppercase font-bold px-1.5 py-0">Front</Badge>
                                    <span className="text-[10px] text-muted-foreground">Click to flip</span>
                                  </div>
                                  <p className="text-sm font-black text-center text-foreground/90 my-auto">{card.front}</p>
                                  <div className="text-[10px] text-muted-foreground/50 text-right uppercase tracking-wider font-semibold">StudyAI Flashcard</div>
                                </div>
                              ) : (
                                <div className="flex-1 flex flex-col justify-between rotate-y-180">
                                  <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[9px] uppercase font-bold px-1.5 py-0">Back / Answer</Badge>
                                    <span className="text-[10px] text-muted-foreground">Click to return</span>
                                  </div>
                                  <p className="text-xs font-semibold text-foreground/90 my-auto leading-relaxed overflow-y-auto pr-1">{card.back}</p>
                                  <div className="text-[10px] text-violet-400 text-right uppercase tracking-wider font-bold">Answer revealed</div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Cards Directory */}
                    <div className="border-t border-white/5 pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          Deck Directory ({flashcards.length} cards)
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[10px] text-violet-400 hover:text-violet-300"
                          onClick={() => {
                            // Reset cards list by generating new ones
                            setFlashcards([]);
                          }}
                        >
                          Generate new deck
                        </Button>
                      </div>
                      <ScrollArea className="h-32 pr-2">
                        <div className="space-y-2">
                          {flashcards.map((card, i) => (
                            <div
                              key={card._id}
                              className={cn(
                                "flex items-center justify-between p-2.5 rounded-xl border border-white/5 glass transition-all cursor-pointer hover:border-violet-500/20",
                                flippedCardId === card._id ? "bg-violet-500/10 border-violet-500/30" : "bg-white/5"
                              )}
                              onClick={() => setFlippedCardId(card._id)}
                            >
                              <div className="flex items-center gap-2 min-w-0 pr-2">
                                <span className="text-[10px] font-bold text-muted-foreground flex-shrink-0 w-4">{i + 1}.</span>
                                <p className="text-xs font-semibold truncate text-foreground/90">{card.front}</p>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xs mx-auto space-y-4">
                    {isGeneratingCards ? (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                        <p className="text-xs text-muted-foreground animate-pulse">Generating custom flashcards with GPT...</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-center justify-center shadow-inner">
                          <Plus className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold">Generate Study Flashcards</h4>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            Extract structured Q&A cards from this PDF to study key facts and check retention.
                          </p>
                        </div>
                        
                        <div className="w-full space-y-3 bg-white/5 p-3 rounded-xl border border-white/5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-muted-foreground">Card Count:</span>
                            <div className="flex items-center gap-2">
                              {[5, 10, 15].map((cnt) => (
                                <Button
                                  key={cnt}
                                  variant={cardCount === cnt ? "secondary" : "ghost"}
                                  size="sm"
                                  className={cn("h-6 w-8 rounded text-[10px] font-bold", cardCount === cnt && "bg-white/10 border border-white/10")}
                                  onClick={() => setCardCount(cnt)}
                                >
                                  {cnt}
                                </Button>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-muted-foreground">Difficulty:</span>
                            <div className="flex items-center gap-2">
                              {(["easy", "medium", "hard"] as const).map((diff) => (
                                <Button
                                  key={diff}
                                  variant={difficulty === diff ? "secondary" : "ghost"}
                                  size="sm"
                                  className={cn("h-6 px-2 rounded text-[10px] font-bold capitalize", difficulty === diff && "bg-white/10 border border-white/10")}
                                  onClick={() => setDifficulty(diff)}
                                >
                                  {diff}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <Button className="gradient-primary shadow-lg shadow-violet-500/25 w-full rounded-xl" onClick={handleGenerateFlashcards}>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Deck
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

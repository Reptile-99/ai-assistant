'use client';

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation, PanInfo } from "framer-motion";
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  BookOpen,
  Sparkles,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Save,
  Keyboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getDocuments, Document } from "@/services/ai.service";
import { 
  getFlashcards, 
  generateFlashcards, 
  updateFlashcard, 
  deleteFlashcard,
  Flashcard 
} from "@/services/flashcard.service";

export default function FlashcardsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  
  const [selectedDeck, setSelectedDeck] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Generation Modal State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genDocId, setGenDocId] = useState("");
  const [genCount, setGenCount] = useState(5);
  const [genDifficulty, setGenDifficulty] = useState<'easy'|'medium'|'hard'>('medium');

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editFront, setEditFront] = useState("");
  const [editBack, setEditBack] = useState("");

  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });

  // Swipe & Animation State
  const x = useMotionValue(0);
  const controls = useAnimation();
  
  // Transform values for swipe visual feedback
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const cardOpacity = useTransform(x, [-200, -100, 0, 100, 200], [0.8, 1, 1, 1, 0.8]);
  
  const indicatorOpacityRight = useTransform(x, [0, 100], [0, 1]);
  const indicatorOpacityLeft = useTransform(x, [0, -100], [0, 1]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docs, cards] = await Promise.all([
        getDocuments(),
        getFlashcards()
      ]);
      setDocuments(docs);
      setFlashcards(cards);
      if (docs.length > 0 && !genDocId) {
        setGenDocId(docs[0]._id);
      }
    } catch (error) {
      console.error("Failed to load flashcard data:", error);
    }
  };

  const handleGenerate = async () => {
    if (!genDocId) return;
    setIsGenerating(true);
    try {
      const res = await generateFlashcards(genDocId, genCount, genDifficulty);
      setFlashcards((prev) => [...res.data, ...prev]);
      setShowGenerateModal(false);
      setSelectedDeck(res.data[0].deckName);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (error) {
      console.error("Failed to generate flashcards:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const decks = Array.from(new Set(flashcards.map(c => c.deckName)));
  const deckCards = selectedDeck === "all" 
    ? flashcards 
    : flashcards.filter((c) => c.deckName === selectedDeck);
  
  const currentCard = deckCards[currentIndex] || null;
  const masteredCount = deckCards.filter((c) => c.mastered).length;

  const navigate = useCallback((dir: number) => {
    if (isEditing) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => {
      const newIndex = prev + dir;
      if (newIndex < 0) return deckCards.length - 1;
      if (newIndex >= deckCards.length) return 0;
      return newIndex;
    });
    x.set(0);
  }, [isEditing, deckCards.length, x]);

  const markCard = useCallback(async (correct: boolean) => {
    if (!currentCard) return;
    
    // Optimistic UI updates
    setSessionStats((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
    }));
    
    // Animate swipe out
    await controls.start({ 
      x: correct ? 400 : -400, 
      opacity: 0, 
      transition: { duration: 0.3 } 
    });
    
    navigate(1);
    controls.set({ x: 0, opacity: 1 });

    // Background API call
    try {
      const updated = await updateFlashcard(currentCard._id, { mastered: correct });
      setFlashcards(prev => prev.map(c => c._id === updated._id ? updated : c));
    } catch (error) {
      console.error("Failed to update flashcard mastery:", error);
    }
  }, [currentCard, controls, navigate, x]);

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      await markCard(true);
    } else if (info.offset.x < -threshold) {
      await markCard(false);
    } else {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (isEditing || showGenerateModal) return;
      
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === "ArrowRight") {
        if (isFlipped) {
          markCard(true);
        } else {
          navigate(1);
        }
      } else if (e.key === "ArrowLeft") {
        if (isFlipped) {
          markCard(false);
        } else {
          navigate(-1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditing, showGenerateModal, isFlipped, markCard, navigate]);

  const handleDelete = async () => {
    if (!currentCard) return;
    try {
      await deleteFlashcard(currentCard._id);
      setFlashcards(prev => prev.filter(c => c._id !== currentCard._id));
      if (currentIndex >= deckCards.length - 1) {
        setCurrentIndex(Math.max(0, deckCards.length - 2));
      }
      setIsFlipped(false);
    } catch (error) {
      console.error("Failed to delete flashcard:", error);
    }
  };

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditFront(currentCard.front);
    setEditBack(currentCard.back);
    setIsEditing(true);
  };

  const saveEdit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentCard) return;
    try {
      const updated = await updateFlashcard(currentCard._id, { front: editFront, back: editBack });
      setFlashcards(prev => prev.map(c => c._id === updated._id ? updated : c));
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to edit flashcard:", error);
    }
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative pb-10 overflow-x-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black mb-1">Flashcards</h2>
          <p className="text-muted-foreground">Spaced repetition powered by AI.</p>
        </div>
        <Button onClick={() => setShowGenerateModal(true)} className="gradient-primary text-white border-0 shadow-lg shadow-violet-500/25">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate cards
        </Button>
      </div>

      <AnimatePresence>
        {showGenerateModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass border border-border p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-5 relative"
            >
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground" onClick={() => setShowGenerateModal(false)}>
                <X className="w-4 h-4" />
              </Button>
              
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                Generate Flashcards
              </h3>

              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">You need to upload a document first to generate flashcards.</p>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Source Document</label>
                    <select 
                      value={genDocId} onChange={e => setGenDocId(e.target.value)}
                      className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    >
                      {documents.map(d => <option key={d._id} value={d._id}>{d.title}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Difficulty</label>
                    <select 
                      value={genDifficulty} onChange={e => setGenDifficulty(e.target.value as any)}
                      className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    >
                      <option value="easy">Easy (Basic Concepts)</option>
                      <option value="medium">Medium (Detailed Understanding)</option>
                      <option value="hard">Hard (Advanced Applications)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Number of Cards (Max 20)</label>
                    <Input 
                      type="number" min="1" max="20" 
                      value={genCount} onChange={e => setGenCount(parseInt(e.target.value) || 5)}
                    />
                  </div>

                  <Button 
                    className="w-full gradient-primary mt-2" 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    {isGenerating ? 'Generating...' : 'Create Cards'}
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
        <button
          onClick={() => { setSelectedDeck("all"); setCurrentIndex(0); setIsFlipped(false); x.set(0); }}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap transition-all",
            selectedDeck === "all"
              ? "gradient-primary text-white border-transparent shadow-lg shadow-violet-500/25"
              : "border-border hover:border-violet-500/50 hover:bg-secondary text-muted-foreground"
          )}
        >
          <BookOpen className="w-4 h-4" />
          All Cards
          <Badge variant={selectedDeck === "all" ? "secondary" : "outline"} className="text-xs ml-1">{flashcards.length}</Badge>
        </button>
        {decks.map((deckName) => {
          const count = flashcards.filter(c => c.deckName === deckName).length;
          return (
            <button
              key={deckName}
              onClick={() => { setSelectedDeck(deckName); setCurrentIndex(0); setIsFlipped(false); x.set(0); }}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap transition-all",
                selectedDeck === deckName
                  ? "gradient-primary text-white border-transparent shadow-lg shadow-violet-500/25"
                  : "border-border hover:border-violet-500/50 hover:bg-secondary text-muted-foreground"
              )}
            >
              <BookOpen className="w-4 h-4" />
              {deckName}
              <Badge variant={selectedDeck === deckName ? "secondary" : "outline"} className="text-xs ml-1">{count}</Badge>
            </button>
          )
        })}
      </div>

      {deckCards.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-3xl mt-8">
          <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No flashcards found in this deck.</p>
          <Button variant="outline" onClick={() => setShowGenerateModal(true)}>Generate Some Now</Button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">Progress</span>
                <span className="text-xs font-medium">{masteredCount}/{deckCards.length} mastered</span>
              </div>
              <Progress value={(masteredCount / deckCards.length) * 100} />
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Check className="w-4 h-4" />
                <span className="font-semibold">{sessionStats.correct}</span>
              </div>
              <div className="flex items-center gap-1.5 text-red-400">
                <X className="w-4 h-4" />
                <span className="font-semibold">{sessionStats.incorrect}</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <span className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              Card {currentIndex + 1} of {deckCards.length}
            </span>
          </div>

          <div className="hidden md:flex justify-center items-center gap-4 text-xs text-muted-foreground font-mono">
            <span className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md border border-border"><Keyboard className="w-3 h-3" /> Space</span> to flip
            <span className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md border border-border">←</span> to swipe left
            <span className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md border border-border">→</span> to swipe right
          </div>

          {currentCard && (
            <div className="relative perspective-1000 min-h-[350px] flex items-center justify-center" style={{ perspective: "1000px" }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentCard._id + (isEditing ? '-edit' : '')}
                  animate={controls}
                  initial={{ scale: 0.95, opacity: 0, rotateY: !isEditing && isFlipped ? -90 : 90 }}
                  whileInView={{ scale: 1, opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: "easeOut" as const }}
                  style={{ x, rotate, opacity: cardOpacity }}
                  drag={!isEditing && isFlipped ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.7}
                  onDragEnd={handleDragEnd}
                  className={cn("w-full h-full max-w-2xl mx-auto relative touch-none", !isEditing && "cursor-grab active:cursor-grabbing")}
                  onClick={() => { if (!isEditing && !isFlipped) setIsFlipped(true) }}
                >
                  
                  {isFlipped && !isEditing && (
                    <>
                      <motion.div 
                        style={{ opacity: indicatorOpacityLeft }}
                        className="absolute inset-y-0 left-0 w-full rounded-2xl bg-gradient-to-r from-red-500/20 to-transparent flex items-center justify-start pl-10 pointer-events-none z-10"
                      >
                        <div className="bg-red-500/20 text-red-500 border-2 border-red-500/50 rounded-full p-4 transform -rotate-12 backdrop-blur-md">
                          <X className="w-12 h-12" />
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        style={{ opacity: indicatorOpacityRight }}
                        className="absolute inset-y-0 right-0 w-full rounded-2xl bg-gradient-to-l from-emerald-500/20 to-transparent flex items-center justify-end pr-10 pointer-events-none z-10"
                      >
                        <div className="bg-emerald-500/20 text-emerald-500 border-2 border-emerald-500/50 rounded-full p-4 transform rotate-12 backdrop-blur-md">
                          <Check className="w-12 h-12" />
                        </div>
                      </motion.div>
                    </>
                  )}

                  <Card className={cn(
                    "min-h-[350px] flex flex-col items-center justify-center p-8 text-center transition-colors border-2 relative group w-full h-full",
                    isFlipped
                      ? "border-violet-500/30 bg-violet-500/5 shadow-2xl shadow-violet-500/10"
                      : "border-border hover:border-violet-500/30 shadow-xl",
                    currentCard.mastered && !isFlipped && "border-emerald-500/30",
                    isEditing && "cursor-default"
                  )}>
                    {!isEditing && (
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground pointer-events-auto" onClick={startEdit}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400 pointer-events-auto" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDelete(); }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    <CardContent className="flex flex-col items-center gap-6 p-0 w-full relative z-20 pointer-events-none">
                      <Badge variant={isFlipped ? "default" : "secondary"} className={cn("text-xs mb-2", currentCard.difficulty === 'hard' ? 'border-red-500/30 text-red-400' : '')}>
                        {isEditing ? "Editing Card" : isFlipped ? "Answer" : "Question"}
                        {!isEditing && ` • ${currentCard.difficulty}`}
                      </Badge>
                      
                      {isEditing ? (
                        <div className="w-full space-y-4 pointer-events-auto" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                          <div className="space-y-1 text-left">
                            <label className="text-xs text-muted-foreground">Question</label>
                            <Textarea 
                              value={editFront} 
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditFront(e.target.value)}
                              className="resize-none" rows={3}
                            />
                          </div>
                          <div className="space-y-1 text-left">
                            <label className="text-xs text-muted-foreground">Answer</label>
                            <Textarea 
                              value={editBack} 
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditBack(e.target.value)}
                              className="resize-none" rows={4}
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            <Button variant="ghost" size="sm" onClick={cancelEdit}>Cancel</Button>
                            <Button size="sm" onClick={saveEdit} className="gap-2">
                              <Save className="w-4 h-4" /> Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className={cn(
                            "leading-relaxed w-full whitespace-pre-wrap px-4",
                            isFlipped ? "text-foreground text-xl" : "font-semibold text-2xl"
                          )}>
                            {isFlipped ? currentCard.back : currentCard.front}
                          </p>
                          {!isFlipped && (
                            <p className="text-xs text-muted-foreground mt-4 animate-pulse">
                              Click or press Space to reveal answer
                            </p>
                          )}
                          {isFlipped && (
                            <p className="text-xs text-muted-foreground mt-4 opacity-70">
                              Swipe left for Incorrect, swipe right for Correct
                            </p>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {!isEditing && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-2xl"
                onClick={() => navigate(-1)}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>

              {isFlipped ? (
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="h-12 px-6 rounded-2xl border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-semibold"
                    onClick={() => markCard(false)}
                  >
                    <X className="w-5 h-5 mr-2" />
                    Review Again
                  </Button>
                  <Button
                    className="h-12 px-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 font-semibold"
                    variant="outline"
                    onClick={() => markCard(true)}
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Got It Right
                  </Button>
                </div>
              ) : (
                <Button 
                  className="h-12 px-8 rounded-2xl font-semibold" 
                  onClick={() => setIsFlipped(true)}
                >
                  Reveal Answer
                </Button>
              )}

              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-2xl"
                onClick={() => navigate(1)}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          )}

          <div className="flex justify-center mt-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setCurrentIndex(0); setIsFlipped(false); setSessionStats({ correct: 0, incorrect: 0 }); x.set(0); }}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restart session
            </Button>
          </div>

          {(sessionStats.correct + sessionStats.incorrect) > 0 && (
            <Card className="border-violet-500/20 bg-violet-500/5 mt-4">
              <CardContent className="p-4 flex items-center justify-center gap-3">
                <TrendingUp className="w-5 h-5 text-violet-400" />
                <p className="text-sm">
                  Session: <span className="text-emerald-400 font-semibold">{sessionStats.correct} correct</span>
                  {" · "}
                  <span className="text-red-400 font-semibold">{sessionStats.incorrect} to review</span>
                  {" · "}
                  <span className="text-muted-foreground">
                    {Math.round((sessionStats.correct / (sessionStats.correct + sessionStats.incorrect)) * 100)}% accuracy
                  </span>
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

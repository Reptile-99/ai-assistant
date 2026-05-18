'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  FileText,
  Sparkles,
  Loader2,
  PlusCircle,
  BookOpen,
  RotateCcw,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { BackgroundOrbs } from '@/components/ui/background-orbs';
import { useChat } from '@/hooks/useChat';
import { ChatMessage } from '@/components/chat/ChatMessage';

const suggestedQuestions = [
  "Summarize the key concepts",
  "What are the main differences highlighted in the text?",
  "Create a short quiz based on these documents",
  "Explain the core arguments in simple terms",
];

export default function ChatPage() {
  const {
    messages,
    input,
    setInput,
    isTyping,
    documents,
    selectedDocId,
    setSelectedDocId,
    displayedAssistantText,
    currentAssistantSources,
    sendMessage,
    clearChat,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, displayedAssistantText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const selectedDocName = selectedDocId === 'all' 
    ? 'All Documents' 
    : documents.find(d => d._id === selectedDocId)?.title || 'Selected Document';

  return (
    <div className="relative flex h-[calc(100vh-6rem)] lg:h-[calc(100vh-5rem)] max-w-7xl mx-auto gap-6 z-10 pt-4 lg:pt-0">
      <BackgroundOrbs />

      {/* ── Left Sidebar: Document Selection ── */}
      <div className="hidden lg:flex flex-col w-72 flex-shrink-0 space-y-4">
        <div className="glass rounded-3xl p-5 border border-border flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-5 rounded-full gradient-primary" />
              <h2 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">
                Knowledge Base
              </h2>
            </div>
            <Button variant="ghost" size="icon-sm" className="h-7 w-7">
              <PlusCircle className="w-4 h-4 text-muted-foreground hover:text-violet-400 transition-colors" />
            </Button>
          </div>

          <div className="space-y-1.5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {/* "All Documents" Option */}
            <motion.button
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedDocId('all')}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all",
                selectedDocId === 'all'
                  ? "bg-violet-500/15 border border-violet-500/25 shadow-sm"
                  : "hover:bg-secondary/60 border border-transparent"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                selectedDocId === 'all' ? "bg-violet-500/20" : "bg-secondary"
              )}>
                <BookOpen className={cn("w-4 h-4", selectedDocId === 'all' ? "text-violet-400" : "text-muted-foreground")} />
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm font-semibold truncate transition-colors", selectedDocId === 'all' ? "text-violet-100" : "text-foreground/80")}>
                  All Documents
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Global Search</p>
              </div>
            </motion.button>

            <div className="h-px bg-border/50 my-3 mx-2" />

            {/* Individual Documents */}
            {documents.map((doc) => (
              <motion.button
                key={doc._id}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedDocId(doc._id)}
                className={cn(
                  "w-full flex items-start gap-3 p-3 rounded-2xl text-left transition-all",
                  selectedDocId === doc._id
                    ? "bg-violet-500/15 border border-violet-500/25 shadow-sm"
                    : "hover:bg-secondary/60 border border-transparent"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                  selectedDocId === doc._id ? "bg-cyan-500/20" : "bg-secondary"
                )}>
                  <FileText className={cn("w-4 h-4", selectedDocId === doc._id ? "text-cyan-400" : "text-muted-foreground")} />
                </div>
                <div className="min-w-0">
                  <p className={cn("text-sm font-medium truncate transition-colors", selectedDocId === doc._id ? "text-cyan-100" : "text-foreground/80")}>
                    {doc.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {doc.pageCount} pages • {doc.isIndexed ? 'Indexed' : 'Pending'}
                  </p>
                </div>
              </motion.button>
            ))}

            {documents.length === 0 && (
              <div className="text-center py-10 px-4 text-sm text-muted-foreground border border-dashed border-border rounded-2xl mt-4">
                No documents uploaded yet. Head to the Upload tab to add some!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Right Chat Area ── */}
      <div className="flex-1 flex flex-col min-w-0 glass rounded-3xl border border-border shadow-2xl overflow-hidden relative">
        
        {/* Chat Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-border/50 bg-background/30 backdrop-blur-md z-20">
          <Button variant="ghost" size="icon" className="lg:hidden -ml-2 text-muted-foreground">
            <Menu className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 gradient-primary rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25 flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-base text-foreground/90 flex items-center gap-2">
              StudyAI
              {isTyping && <span className="flex h-2 w-2 rounded-full bg-violet-400 animate-pulse" />}
            </h1>
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
              <BookOpen className="w-3 h-3" />
              Context: {selectedDocName}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors" 
            title="Clear Chat"
            onClick={clearChat}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4 lg:px-8">
          <div className="py-6 space-y-6">
            
            {/* Empty State / Welcome */}
            {messages.length === 0 && !displayedAssistantText && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-16 h-16 rounded-3xl gradient-primary flex items-center justify-center shadow-2xl shadow-violet-500/30 mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold mb-2">How can I help you study today?</h2>
                <p className="text-sm text-muted-foreground max-w-md mb-8">
                  I can answer questions based on your uploaded materials, summarize topics, or quiz you to test your knowledge.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  {suggestedQuestions.map((q, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      onClick={() => sendMessage(q)}
                      className="text-left px-4 py-3 rounded-2xl glass-card border border-border/50 hover:border-violet-500/40 hover:bg-violet-500/5 transition-all group"
                    >
                      <p className="text-sm text-foreground/80 group-hover:text-foreground">{q}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Message History */}
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <ChatMessage 
                  key={msg.id} 
                  role={msg.role} 
                  content={msg.content} 
                  timestamp={msg.timestamp}
                  sources={msg.sources}
                />
              ))}
            </AnimatePresence>

            {/* Currently Streaming Message */}
            {displayedAssistantText && (
              <ChatMessage 
                role="assistant"
                content={displayedAssistantText}
                isStreaming={true}
                sources={currentAssistantSources}
              />
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 bg-background/40 backdrop-blur-xl border-t border-border/50">
          <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto flex items-end gap-2">
            <div className="relative flex-1 glass rounded-3xl border border-border/80 focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={documents.length === 0 ? "Upload a document to start chatting..." : "Ask anything about your documents..."}
                className="border-0 bg-transparent shadow-none h-14 pl-6 pr-14 rounded-3xl focus-visible:ring-0 text-base"
                disabled={isTyping || documents.length === 0}
              />
            </div>
            <motion.div whileHover={!isTyping && input.trim() ? { scale: 1.05 } : {}} whileTap={!isTyping && input.trim() ? { scale: 0.95 } : {}}>
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isTyping || documents.length === 0}
                className={cn(
                  "h-14 w-14 rounded-full transition-all shadow-lg",
                  input.trim() && !isTyping 
                    ? "gradient-primary shadow-violet-500/25" 
                    : "bg-secondary text-muted-foreground shadow-none"
                )}
              >
                {isTyping && !displayedAssistantText ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 ml-0.5" />
                )}
              </Button>
            </motion.div>
          </form>
          <div className="text-center mt-3">
             <p className="text-[10px] text-muted-foreground">StudyAI can make mistakes. Verify important information with your source documents.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

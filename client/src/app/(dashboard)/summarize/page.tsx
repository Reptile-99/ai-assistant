'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  BrainCircuit,
  AlertCircle,
  Upload,
  Wand2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

import { useAISummary } from '@/hooks/useAISummary';
import { DocumentSelector } from '@/components/dashboard/DocumentSelector';
import { SummaryTypeSelector } from '@/components/dashboard/SummaryTypeSelector';
import { SummaryOutput } from '@/components/dashboard/SummaryOutput';

import { BackgroundOrbs } from '@/components/ui/background-orbs';

// Loading spinner dots
function AILoadingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          className="w-2 h-2 rounded-full bg-violet-400"
        />
      ))}
    </div>
  );
}

export default function SummarizePage() {
  const searchParams = useSearchParams();
  const {
    documents,
    summaryTypes,
    selectedDocumentId,
    selectedType,
    result,
    displayedText,
    state,
    error,
    isCached,
    setSelectedDocumentId,
    setSelectedType,
    generate,
    regenerate,
    copyToClipboard,
    downloadAsMarkdown,
    reset,
  } = useAISummary();

  // Pre-select document from ?doc= query param
  useEffect(() => {
    const docId = searchParams.get('doc');
    if (docId && documents.length > 0) {
      const exists = documents.find((d) => d._id === docId);
      if (exists) setSelectedDocumentId(docId);
    }
  }, [searchParams, documents, setSelectedDocumentId]);

  const isLoading = state === 'loading';
  const isTyping = state === 'typing';
  const canGenerate = !!selectedDocumentId && !isLoading && !isTyping;
  const hasResult = state === 'done' || isTyping;
  const selectedDoc = documents.find((d) => d._id === selectedDocumentId);

  return (
    <div className="relative min-h-[calc(100vh-80px)]">
      <BackgroundOrbs />

      <div className="relative z-10 max-w-5xl mx-auto space-y-8 pb-20">

        {/* ─── Page Header ────────────────────────────────── */}
        <div className="space-y-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-violet-500/30">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-black">AI Summarizer</h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-sm ml-13 pl-[52px]"
          >
            Select a document and choose a summary style to get AI-powered insights instantly.
          </motion.p>
        </div>

        {/* ─── Empty state: no documents ──────────────────── */}
        <AnimatePresence>
          {documents.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 glass rounded-3xl border border-dashed border-violet-500/20 text-center gap-5"
            >
              <div className="w-20 h-20 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <Upload className="w-9 h-9 text-violet-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">No documents yet</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Upload a PDF to your study library first, then come back to generate AI summaries.
                </p>
              </div>
              <Button asChild className="gradient-primary rounded-2xl gap-2 shadow-lg shadow-violet-500/20">
                <Link href="/upload">
                  Go to Library <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Main 2-column layout ───────────────────────── */}
        {documents.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">

            {/* ── Left: Controls Panel ─────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-5 lg:sticky lg:top-24"
            >
              {/* Document selector */}
              <div className="glass rounded-3xl p-5 border border-border space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-5 rounded-full gradient-primary" />
                  <h2 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">
                    Document
                  </h2>
                </div>
                <DocumentSelector
                  documents={documents}
                  selectedId={selectedDocumentId}
                  onChange={(id) => { setSelectedDocumentId(id); reset(); }}
                  disabled={isLoading || isTyping}
                />
              </div>

              {/* Summary type selector */}
              <div className="glass rounded-3xl p-5 border border-border space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-cyan-500 to-violet-500" />
                  <h2 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">
                    Summary Style
                  </h2>
                </div>
                <SummaryTypeSelector
                  types={summaryTypes}
                  selected={selectedType}
                  onChange={(t) => { setSelectedType(t); reset(); }}
                  disabled={isLoading || isTyping}
                />
              </div>

              {/* Generate button */}
              <motion.div
                whileHover={canGenerate ? { scale: 1.015 } : {}}
                whileTap={canGenerate ? { scale: 0.985 } : {}}
              >
                <Button
                  id="generate-summary-btn"
                  disabled={!canGenerate}
                  onClick={generate}
                  className={cn(
                    'w-full h-14 rounded-2xl text-base font-bold gap-3 relative overflow-hidden',
                    'gradient-primary shadow-xl shadow-violet-500/25',
                    'disabled:opacity-50 disabled:shadow-none',
                    'transition-all duration-300'
                  )}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 shine" />

                  {isLoading || isTyping ? (
                    <>
                      <AILoadingDots />
                      <span>{isLoading ? 'Analyzing…' : 'Writing…'}</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      <span>Generate Summary</span>
                      <Sparkles className="w-4 h-4 opacity-80" />
                    </>
                  )}
                </Button>
              </motion.div>

              {/* Document context pill */}
              <AnimatePresence>
                {selectedDoc && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="px-4 py-3 rounded-2xl bg-secondary/40 border border-border text-xs text-muted-foreground flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                    <span>
                      <span className="font-medium text-foreground/70">{selectedDoc.title}</span>
                      {' '}·{' '}{selectedDoc.pageCount} pages will be analyzed
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ── Right: Output Area ────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              {/* Error banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-start gap-3 px-5 py-4 rounded-2xl bg-destructive/10 border border-destructive/25 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-destructive mb-0.5">Generation failed</p>
                      <p className="text-muted-foreground">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Idle empty state */}
              <AnimatePresence>
                {state === 'idle' && !error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center gap-5 py-20 rounded-3xl border border-dashed border-border"
                  >
                    {/* Animated AI brain */}
                    <div className="relative">
                      <motion.div
                        animate={{ scale: [1, 1.06, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
                        className="w-20 h-20 rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center"
                      >
                        <BrainCircuit className="w-10 h-10 text-violet-400" />
                      </motion.div>
                      <motion.div
                        animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' as const }}
                        className="absolute inset-0 rounded-3xl bg-violet-500/20"
                      />
                    </div>

                    <div className="text-center">
                      <p className="font-bold text-foreground/60 mb-1">Ready to summarize</p>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        Select your document and summary style, then click{' '}
                        <span className="text-violet-400 font-medium">Generate Summary</span>
                      </p>
                    </div>

                    {/* Animated mini cards preview */}
                    <div className="flex gap-2 mt-2">
                      {['⚡ Short', '📖 Detailed', '📋 Bullets', '💡 Concepts'].map((label, i) => (
                        <motion.div
                          key={label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.08 }}
                          className="px-3 py-1.5 rounded-xl bg-secondary/60 border border-border text-xs text-muted-foreground font-medium"
                        >
                          {label}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Summary output */}
              <SummaryOutput
                state={state}
                displayedText={displayedText}
                result={result}
                isCached={isCached}
                selectedType={selectedType}
                onCopy={copyToClipboard}
                onDownload={downloadAsMarkdown}
                onRegenerate={regenerate}
              />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

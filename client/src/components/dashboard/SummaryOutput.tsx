'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Check,
  Download,
  RefreshCw,
  Zap,
  Layers,
  Clock,
  DollarSign,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SummaryResult, SummaryType } from '@/services/ai.service';
import { SummaryState } from '@/hooks/useAISummary';

interface SummaryOutputProps {
  state: SummaryState;
  displayedText: string;
  result: SummaryResult | null;
  isCached: boolean;
  selectedType: SummaryType;
  onCopy: () => Promise<boolean>;
  onDownload: () => void;
  onRegenerate: () => void;
}

const typeAccent: Record<SummaryType, string> = {
  short: 'from-cyan-500/10 to-transparent border-cyan-500/20',
  detailed: 'from-violet-500/10 to-transparent border-violet-500/20',
  bullet: 'from-emerald-500/10 to-transparent border-emerald-500/20',
  key_concepts: 'from-amber-500/10 to-transparent border-amber-500/20',
};

const typeGlow: Record<SummaryType, string> = {
  short: 'shadow-cyan-500/10',
  detailed: 'shadow-violet-500/10',
  bullet: 'shadow-emerald-500/10',
  key_concepts: 'shadow-amber-500/10',
};

// Skeleton shimmer lines
function SkeletonLines() {
  return (
    <div className="space-y-3 p-6">
      {[100, 90, 95, 80, 88, 75, 60].map((w, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.08 }}
          className="h-3.5 rounded-full bg-secondary"
          style={{ width: `${w}%` }}
        />
      ))}
    </div>
  );
}

// AI Typing cursor
function TypingCursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 0] }}
      transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
      className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 align-middle rounded-full"
    />
  );
}

// Stat badge
function StatBadge({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/50 border border-border text-xs">
      <Icon className="w-3 h-3 text-muted-foreground" />
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

export function SummaryOutput({
  state,
  displayedText,
  result,
  isCached,
  selectedType,
  onCopy,
  onDownload,
  onRegenerate,
}: SummaryOutputProps) {
  const [copied, setCopied] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  const handleCopy = async () => {
    const ok = await onCopy();
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isLoading = state === 'loading';
  const isTyping = state === 'typing';
  const isDone = state === 'done';
  const isActive = isLoading || isTyping || isDone;

  if (!isActive && state !== 'idle') return null;
  if (state === 'idle') return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="output"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.4, ease: 'easeOut' as const }}
        className={cn(
          'rounded-3xl border bg-gradient-to-br shadow-xl overflow-hidden',
          typeAccent[selectedType],
          typeGlow[selectedType]
        )}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            {/* AI pulse orb */}
            <div className="relative">
              <motion.div
                animate={isTyping ? { scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] } : {}}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-2.5 h-2.5 rounded-full bg-violet-400"
              />
              {isTyping && (
                <motion.div
                  animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-violet-400"
                />
              )}
            </div>

            <span className="text-sm font-semibold text-foreground/80">
              {isLoading ? 'Generating…' : isTyping ? 'AI Writing…' : 'Summary Ready'}
            </span>

            {isCached && isDone && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-medium">
                Cached
              </span>
            )}
          </div>

          {/* Actions */}
          {isDone && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 gap-1.5 text-xs rounded-xl"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center gap-1.5 text-emerald-400"
                    >
                      <Check className="w-3.5 h-3.5" /> Copied!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onDownload}
                className="h-8 gap-1.5 text-xs rounded-xl"
              >
                <Download className="w-3.5 h-3.5" /> Save
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onRegenerate}
                className="h-8 gap-1.5 text-xs rounded-xl text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Redo
              </Button>
            </div>
          )}
        </div>

        {/* Content body */}
        <div className="min-h-[200px] relative">
          {isLoading ? (
            <SkeletonLines />
          ) : (
            <div className="p-6 pb-4">
              {/* Markdown rendered output */}
              <div className="prose prose-sm prose-invert max-w-none
                prose-headings:font-bold prose-headings:text-foreground
                prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
                prose-p:text-foreground/85 prose-p:leading-relaxed
                prose-strong:text-foreground prose-strong:font-semibold
                prose-em:text-foreground/70
                prose-ul:space-y-1 prose-ol:space-y-1
                prose-li:text-foreground/85 prose-li:leading-relaxed
                prose-blockquote:border-l-2 prose-blockquote:border-violet-500/40
                prose-blockquote:text-muted-foreground prose-blockquote:pl-4
                prose-code:text-violet-300 prose-code:bg-violet-500/10
                prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-xs
                prose-hr:border-border/50
              ">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {displayedText}
                </ReactMarkdown>
              </div>
              {isTyping && <TypingCursor />}
            </div>
          )}
        </div>

        {/* Stats footer */}
        {isDone && result && (
          <div className="border-t border-border/50">
            <button
              onClick={() => setStatsOpen((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="font-medium">Generation Details</span>
              <motion.div animate={{ rotate: statsOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.div>
            </button>

            <AnimatePresence>
              {statsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4 flex flex-wrap gap-2">
                    <StatBadge
                      icon={Zap}
                      label="Model"
                      value={result.model}
                    />
                    <StatBadge
                      icon={Layers}
                      label="Tokens"
                      value={result.tokenUsage.totalTokens.toLocaleString()}
                    />
                    <StatBadge
                      icon={Clock}
                      label="Chunks"
                      value={`${result.chunksProcessed}`}
                    />
                    <StatBadge
                      icon={DollarSign}
                      label="Cost"
                      value={result.cost.formattedCost}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

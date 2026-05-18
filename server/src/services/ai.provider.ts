/**
 * AI Provider — Gemini Only
 * ─────────────────────────
 * All AI requests are routed exclusively to Google Gemini (FREE).
 * OpenAI has been removed as a dependency.
 */

import { geminiService } from './gemini.service';
import { SummaryResult } from './ai.service';
import { SummaryType } from './prompt.engine';
import { TokenUsage } from './token.optimizer';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AIProviderName = 'gemini';

export interface ProviderSummaryResult extends SummaryResult {
  provider: AIProviderName;
}

export interface ProviderFlashcardsResult {
  flashcards: { front: string; back: string }[];
  tokenUsage: TokenUsage;
  provider: AIProviderName;
}

export interface ProviderScheduleResult {
  tasks: { title: string; subject: string; duration: number; priority: string; dayOffset: number }[];
  provider: AIProviderName;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

class AIProviderService {

  async summarize(
    text: string,
    type: SummaryType,
    documentTitle?: string
  ): Promise<ProviderSummaryResult> {
    console.log('[AIProvider] Using Gemini (free) for summarization');
    const result = await geminiService.summarize(text, type, documentTitle);
    return { ...result, provider: 'gemini' };
  }

  async generateFlashcards(
    text: string,
    count: number,
    difficulty: string,
    documentTitle?: string
  ): Promise<ProviderFlashcardsResult> {
    console.log('[AIProvider] Using Gemini (free) for flashcard generation');
    const result = await geminiService.generateFlashcards(text, count, difficulty, documentTitle);
    return { ...result, provider: 'gemini' };
  }

  async generateStudySchedule(
    exams: { subject: string; date: string }[],
    days?: number
  ): Promise<ProviderScheduleResult> {
    console.log('[AIProvider] Using Gemini (free) for study schedule');
    const result = await geminiService.generateStudySchedule(exams, days);
    return { ...result, provider: 'gemini' };
  }

  getStatus(): { gemini: boolean; primary: AIProviderName } {
    return {
      gemini: geminiService.isAvailable,
      primary: 'gemini',
    };
  }
}

export const aiProvider = new AIProviderService();

/**
 * AI Provider — Smart Orchestrator
 * ─────────────────────────────────
 * Routes all AI requests with this priority:
 *   1. Google Gemini  (FREE — primary)
 *   2. OpenAI         (paid — automatic fallback)
 *
 * If Gemini fails for any reason, OpenAI is tried transparently.
 * The active provider is logged so you can monitor usage.
 */

import { geminiService } from './gemini.service';
import { openAIService, SummaryResult } from './ai.service';
import { SummaryType } from './prompt.engine';
import { TokenUsage } from './token.optimizer';

// ─── Provider label for response metadata ────────────────────────────────────

export type AIProviderName = 'gemini' | 'openai';

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

// ─── Orchestrator ─────────────────────────────────────────────────────────────

class AIProviderService {
  private get preferGemini(): boolean {
    return geminiService.isAvailable;
  }

  /**
   * Summarize a document.
   * Tries Gemini first (free), falls back to OpenAI automatically.
   */
  async summarize(
    text: string,
    type: SummaryType,
    documentTitle?: string
  ): Promise<ProviderSummaryResult> {
    if (this.preferGemini) {
      try {
        console.log('[AIProvider] Using Gemini (free) for summarization');
        const result = await geminiService.summarize(text, type, documentTitle);
        return { ...result, provider: 'gemini' as AIProviderName };
      } catch (err) {
        console.warn('[AIProvider] Gemini failed, falling back to OpenAI:', (err as Error).message);
      }
    }

    console.log('[AIProvider] Using OpenAI for summarization');
    const result = await openAIService.summarize(text, type, documentTitle);
    return { ...result, provider: 'openai' as AIProviderName };
  }

  /**
   * Generate flashcards from document text.
   * Tries Gemini first (free), falls back to OpenAI automatically.
   */
  async generateFlashcards(
    text: string,
    count: number,
    difficulty: string,
    documentTitle?: string
  ): Promise<ProviderFlashcardsResult> {
    if (this.preferGemini) {
      try {
        console.log('[AIProvider] Using Gemini (free) for flashcard generation');
        const result = await geminiService.generateFlashcards(text, count, difficulty, documentTitle);
        return { ...result, provider: 'gemini' as AIProviderName };
      } catch (err) {
        console.warn('[AIProvider] Gemini failed, falling back to OpenAI:', (err as Error).message);
      }
    }

    console.log('[AIProvider] Using OpenAI for flashcard generation');
    const result = await openAIService.generateFlashcards(text, count, difficulty, documentTitle);
    return { ...result, provider: 'openai' as AIProviderName };
  }

  /**
   * Generate a study schedule from upcoming exams.
   * Tries Gemini first (free), falls back to OpenAI automatically.
   */
  async generateStudySchedule(
    exams: { subject: string; date: string }[],
    days?: number
  ): Promise<ProviderScheduleResult> {
    if (this.preferGemini) {
      try {
        console.log('[AIProvider] Using Gemini (free) for study schedule');
        const result = await geminiService.generateStudySchedule(exams, days);
        return { ...result, provider: 'gemini' as AIProviderName };
      } catch (err) {
        console.warn('[AIProvider] Gemini failed, falling back to OpenAI:', (err as Error).message);
      }
    }

    console.log('[AIProvider] Using OpenAI for study schedule');
    const result = await openAIService.generateStudySchedule(exams, days);
    return { ...result, provider: 'openai' as AIProviderName };
  }

  /**
   * Returns which providers are currently available.
   * Useful for a health-check endpoint.
   */
  getStatus(): { gemini: boolean; openai: boolean; primary: AIProviderName } {
    const openaiAvailable = !!(
      process.env.OPENAI_API_KEY &&
      process.env.OPENAI_API_KEY !== 'your_openai_api_key'
    );
    return {
      gemini: geminiService.isAvailable,
      openai: openaiAvailable,
      primary: geminiService.isAvailable ? 'gemini' : 'openai',
    };
  }
}

// Singleton — import this instead of openAIService in controllers
export const aiProvider = new AIProviderService();

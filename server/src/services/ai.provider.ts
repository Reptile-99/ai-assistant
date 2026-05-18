/**
 * AI Provider with Automatic Fallback
 * ───────────────────────────────────
 * Routes requests to Google Gemini (FREE) first.
 * If Gemini fails (e.g., rate limits, key issues), it automatically falls back
 * to OpenAI (GPT-4o-mini) as a backup to ensure uninterrupted service.
 */

import { geminiService } from './gemini.service';
import { openAIService, SummaryResult } from './ai.service';
import { SummaryType } from './prompt.engine';
import { TokenUsage } from './token.optimizer';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Provider ─────────────────────────────────────────────────────────────────

class AIProviderService {

  async summarize(
    text: string,
    type: SummaryType,
    documentTitle?: string
  ): Promise<ProviderSummaryResult> {
    if (geminiService.isAvailable) {
      try {
        console.log('[AIProvider] Attempting Gemini (free) for summarization');
        const result = await geminiService.summarize(text, type, documentTitle);
        return { ...result, provider: 'gemini' };
      } catch (err: any) {
        console.warn('[AIProvider] Gemini summarization failed. Error details:', err?.message || err);
        if (openAIService.isAvailable) {
          console.warn('[AIProvider] 🔄 Falling back to OpenAI for summarization');
          try {
            const result = await openAIService.summarize(text, type, documentTitle);
            return { ...result, provider: 'openai' };
          } catch (fallbackErr: any) {
            console.error('[AIProvider] OpenAI fallback ALSO failed:', fallbackErr?.message || fallbackErr);
            throw new Error(`Both AI providers failed. Gemini: ${err.message}. OpenAI: ${fallbackErr.message}`);
          }
        }
        throw err;
      }
    } else if (openAIService.isAvailable) {
      console.log('[AIProvider] Gemini is unavailable. Using OpenAI for summarization directly');
      const result = await openAIService.summarize(text, type, documentTitle);
      return { ...result, provider: 'openai' };
    } else {
      throw new Error('No AI provider is initialized. Please set either GEMINI_API_KEY or OPENAI_API_KEY.');
    }
  }

  async generateFlashcards(
    text: string,
    count: number,
    difficulty: string,
    documentTitle?: string
  ): Promise<ProviderFlashcardsResult> {
    if (geminiService.isAvailable) {
      try {
        console.log('[AIProvider] Attempting Gemini (free) for flashcard generation');
        const result = await geminiService.generateFlashcards(text, count, difficulty, documentTitle);
        return { ...result, provider: 'gemini' };
      } catch (err: any) {
        console.warn('[AIProvider] Gemini flashcard generation failed. Error details:', err?.message || err);
        if (openAIService.isAvailable) {
          console.warn('[AIProvider] 🔄 Falling back to OpenAI for flashcard generation');
          try {
            const result = await openAIService.generateFlashcards(text, count, difficulty, documentTitle);
            return { ...result, provider: 'openai' };
          } catch (fallbackErr: any) {
            console.error('[AIProvider] OpenAI fallback ALSO failed:', fallbackErr?.message || fallbackErr);
            throw new Error(`Both AI providers failed. Gemini: ${err.message}. OpenAI: ${fallbackErr.message}`);
          }
        }
        throw err;
      }
    } else if (openAIService.isAvailable) {
      console.log('[AIProvider] Gemini is unavailable. Using OpenAI for flashcard generation directly');
      const result = await openAIService.generateFlashcards(text, count, difficulty, documentTitle);
      return { ...result, provider: 'openai' };
    } else {
      throw new Error('No AI provider is initialized. Please set either GEMINI_API_KEY or OPENAI_API_KEY.');
    }
  }

  async generateStudySchedule(
    exams: { subject: string; date: string }[],
    days?: number
  ): Promise<ProviderScheduleResult> {
    if (geminiService.isAvailable) {
      try {
        console.log('[AIProvider] Attempting Gemini (free) for study schedule');
        const result = await geminiService.generateStudySchedule(exams, days);
        return { ...result, provider: 'gemini' };
      } catch (err: any) {
        console.warn('[AIProvider] Gemini study schedule generation failed. Error details:', err?.message || err);
        if (openAIService.isAvailable) {
          console.warn('[AIProvider] 🔄 Falling back to OpenAI for study schedule');
          try {
            const result = await openAIService.generateStudySchedule(exams, days);
            return { ...result, provider: 'openai' };
          } catch (fallbackErr: any) {
            console.error('[AIProvider] OpenAI fallback ALSO failed:', fallbackErr?.message || fallbackErr);
            throw new Error(`Both AI providers failed. Gemini: ${err.message}. OpenAI: ${fallbackErr.message}`);
          }
        }
        throw err;
      }
    } else if (openAIService.isAvailable) {
      console.log('[AIProvider] Gemini is unavailable. Using OpenAI for study schedule directly');
      const result = await openAIService.generateStudySchedule(exams, days);
      return { ...result, provider: 'openai' };
    } else {
      throw new Error('No AI provider is initialized. Please set either GEMINI_API_KEY or OPENAI_API_KEY.');
    }
  }

  getStatus(): { gemini: boolean; openai: boolean; primary: AIProviderName } {
    return {
      gemini: geminiService.isAvailable,
      openai: openAIService.isAvailable,
      primary: geminiService.isAvailable ? 'gemini' : (openAIService.isAvailable ? 'openai' : 'gemini'),
    };
  }
}

export const aiProvider = new AIProviderService();

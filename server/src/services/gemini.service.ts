/**
 * Google Gemini Service Layer
 * FREE AI provider — used as the PRIMARY AI engine.
 * Falls back to OpenAI only if Gemini is unavailable or fails.
 *
 * Free tier (via Google AI Studio key):
 *  - gemini-2.0-flash: 15 RPM, 1M TPM, 1,500 RPD
 *  - Get your key at: https://aistudio.google.com/apikey
 */

import { GoogleGenerativeAI, GenerativeModel, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import {
  SummaryType,
  buildSummaryPrompt,
  buildMergePrompt,
  PromptMessage,
} from './prompt.engine';
import {
  chunkText,
  needsChunking,
  calculateCost,
  TokenUsage,
  CostEstimate,
} from './token.optimizer';
import { SummaryResult, OpenAIServiceError } from './ai.service';

// ─── Config ───────────────────────────────────────────────────────────────────

interface GeminiConfig {
  model: string;
  maxOutputTokens: number;
  temperature: number;
  maxRetries: number;
}

// ─── Safety Settings (permissive for academic content) ────────────────────────

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert OpenAI-style {role, content}[] messages into a single Gemini prompt string.
 * Gemini's generateContent works best with a single combined prompt for simple tasks.
 */
function messagesToGeminiPrompt(messages: PromptMessage[]): string {
  return messages
    .map((m) => (m.role === 'system' ? `[Instructions]\n${m.content}` : m.content))
    .join('\n\n');
}

// ─── Service ──────────────────────────────────────────────────────────────────

class GeminiService {
  private client: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;
  private config: GeminiConfig;
  public isAvailable: boolean = false;

  constructor() {
    this.config = {
      model: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash',
      maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS ?? '2048', 10),
      temperature: parseFloat(process.env.GEMINI_TEMPERATURE ?? '0.3'),
      maxRetries: 2,
    };

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key') {
      console.warn('[Gemini] GEMINI_API_KEY not set — Gemini provider is disabled.');
      return;
    }

    try {
      this.client = new GoogleGenerativeAI(apiKey);
      this.model = this.client.getGenerativeModel({
        model: this.config.model,
        generationConfig: {
          maxOutputTokens: this.config.maxOutputTokens,
          temperature: this.config.temperature,
        },
        safetySettings: SAFETY_SETTINGS,
      });
      this.isAvailable = true;
      console.log(`[Gemini] ✅ Initialized with model: ${this.config.model}`);
    } catch (error) {
      console.error('[Gemini] Failed to initialize client:', error);
    }
  }

  // ─── Public API (mirrors OpenAI service) ────────────────────────────────────

  async summarize(
    text: string,
    type: SummaryType,
    documentTitle: string = 'the document'
  ): Promise<SummaryResult> {
    this.assertAvailable();
    const cleanedText = this.cleanText(text);

    if (!cleanedText || cleanedText.trim().length < 50) {
      throw new OpenAIServiceError('Document content is too short to summarize', 'CONTENT_TOO_SHORT', 400);
    }

    if (needsChunking(cleanedText, 'gpt-4o-mini', this.config.maxOutputTokens)) {
      return this.summarizeWithChunking(cleanedText, type, documentTitle);
    }

    return this.summarizeSingle(cleanedText, type, documentTitle);
  }

  async generateFlashcards(
    text: string,
    count: number,
    difficulty: string,
    documentTitle: string = 'the document'
  ): Promise<{ flashcards: { front: string; back: string }[]; tokenUsage: TokenUsage }> {
    this.assertAvailable();
    const cleanedText = this.cleanText(text);

    if (!cleanedText || cleanedText.trim().length < 50) {
      throw new OpenAIServiceError('Document content is too short to generate flashcards', 'CONTENT_TOO_SHORT', 400);
    }

    const maxChars = 6000 * 4;
    const processingText = cleanedText.length > maxChars
      ? cleanedText.slice(0, maxChars) + '...'
      : cleanedText;

    const prompt = `[Instructions]
You are an expert AI study assistant. Generate exactly ${count} flashcards from the provided text.
Difficulty level: ${difficulty}. Document: "${documentTitle}".
Output ONLY valid JSON with this exact shape: {"flashcards": [{"front": "question", "back": "answer"}]}
Do NOT include any explanation or markdown code fences — raw JSON only.

[Document Text]
${processingText}`;

    const responseText = await this.callWithRetry(() => this.generateText(prompt));

    let flashcards: { front: string; back: string }[] = [];
    try {
      // Strip potential markdown fences Gemini sometimes adds
      const clean = responseText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      flashcards = parsed.flashcards ?? [];
    } catch {
      throw new OpenAIServiceError('Failed to parse Gemini JSON response', 'JSON_PARSE_ERROR', 500);
    }

    const tokenUsage: TokenUsage = {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: Math.ceil(responseText.length / 4), // Gemini doesn't always expose usage
    };

    return { flashcards, tokenUsage };
  }

  async generateStudySchedule(
    exams: { subject: string; date: string }[],
    days: number = 7
  ): Promise<{ tasks: { title: string; subject: string; duration: number; priority: string; dayOffset: number }[] }> {
    this.assertAvailable();

    const prompt = `[Instructions]
You are an expert AI study assistant. Generate a realistic ${days}-day study schedule based on the upcoming exams.
Output ONLY valid JSON with this exact shape:
{"tasks": [{"title": "string", "subject": "string", "duration": number, "priority": "high|medium|low", "dayOffset": number}]}
dayOffset is 0 for today, 1 for tomorrow, up to ${days - 1}.
Duration is in minutes (30, 45, or 60).
Do NOT include any explanation or markdown — raw JSON only.

[Upcoming Exams]
${JSON.stringify(exams)}`;

    const responseText = await this.callWithRetry(() => this.generateText(prompt));

    let tasks: any[] = [];
    try {
      const clean = responseText.replace(/```json|```/g, '').trim();
      tasks = JSON.parse(clean).tasks ?? [];
    } catch {
      throw new OpenAIServiceError('Failed to parse Gemini schedule response', 'JSON_PARSE_ERROR', 500);
    }

    return { tasks };
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────

  private async summarizeSingle(
    text: string,
    type: SummaryType,
    documentTitle: string
  ): Promise<SummaryResult> {
    const messages = buildSummaryPrompt(type, text, documentTitle);
    const prompt = messagesToGeminiPrompt(messages);

    const summary = await this.callWithRetry(() => this.generateText(prompt));

    if (!summary) {
      throw new OpenAIServiceError('Gemini returned an empty response', 'EMPTY_RESPONSE', 502);
    }

    const tokenUsage: TokenUsage = {
      promptTokens: Math.ceil(prompt.length / 4),
      completionTokens: Math.ceil(summary.length / 4),
      totalTokens: Math.ceil((prompt.length + summary.length) / 4),
    };

    return {
      summary,
      type,
      tokenUsage,
      cost: { inputCost: 0, outputCost: 0, totalCost: 0 } as CostEstimate, // Gemini free tier = $0
      chunksProcessed: 1,
      model: this.config.model,
    };
  }

  private async summarizeWithChunking(
    text: string,
    type: SummaryType,
    documentTitle: string
  ): Promise<SummaryResult> {
    const chunks = chunkText(text, 3000);
    const chunkSummaries: string[] = [];
    let totalChars = 0;

    for (const chunk of chunks) {
      const messages = buildSummaryPrompt('short', chunk, documentTitle);
      const prompt = messagesToGeminiPrompt(messages);
      const chunkSummary = await this.callWithRetry(() => this.generateText(prompt));
      if (chunkSummary) {
        chunkSummaries.push(chunkSummary);
        totalChars += prompt.length + chunkSummary.length;
      }
    }

    const mergeMessages = buildMergePrompt(type, chunkSummaries, documentTitle);
    const mergePrompt = messagesToGeminiPrompt(mergeMessages);
    const finalSummary = await this.callWithRetry(() => this.generateText(mergePrompt));

    if (!finalSummary) {
      throw new OpenAIServiceError('Gemini returned empty response during merge', 'EMPTY_MERGE_RESPONSE', 502);
    }

    totalChars += mergePrompt.length + finalSummary.length;
    const totalTokens = Math.ceil(totalChars / 4);

    const tokenUsage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens };

    return {
      summary: finalSummary,
      type,
      tokenUsage,
      cost: { inputCost: 0, outputCost: 0, totalCost: 0 } as CostEstimate,
      chunksProcessed: chunks.length,
      model: this.config.model,
    };
  }

  private async generateText(prompt: string): Promise<string> {
    if (!this.model) throw new OpenAIServiceError('Gemini model not initialized', 'CLIENT_NOT_INITIALIZED', 500);
    const result = await this.model.generateContent(prompt);
    return result.response.text().trim();
  }

  private async callWithRetry<T>(fn: () => Promise<T>, attempt: number = 0): Promise<T> {
    try {
      return await fn();
    } catch (err: any) {
      const isRetryable = err?.status === 429 || err?.status === 503 || err?.status === 500;
      if (isRetryable && attempt < this.config.maxRetries) {
        const delayMs = Math.pow(2, attempt) * 1000 + Math.random() * 300;
        console.warn(`[Gemini] Retry ${attempt + 1}/${this.config.maxRetries} after ${Math.round(delayMs)}ms`);
        await new Promise((r) => setTimeout(r, delayMs));
        return this.callWithRetry(fn, attempt + 1);
      }
      this.handleGeminiError(err);
    }
  }

  private handleGeminiError(err: any): never {
    const status = err?.status ?? 500;
    if (status === 401 || status === 403) {
      throw new OpenAIServiceError('Invalid Gemini API key', 'INVALID_API_KEY', 500);
    }
    if (status === 429) {
      throw new OpenAIServiceError('Gemini rate limit reached — try again shortly', 'RATE_LIMIT', 429, true);
    }
    throw new OpenAIServiceError(
      `Gemini error: ${err?.message ?? 'Unknown error'}`,
      err?.code ?? 'GEMINI_ERROR',
      status >= 400 && status < 600 ? status : 502
    );
  }

  private assertAvailable(): void {
    if (!this.isAvailable || !this.model) {
      throw new OpenAIServiceError(
        'Gemini client is not initialized. Please set GEMINI_API_KEY.',
        'CLIENT_NOT_INITIALIZED',
        500
      );
    }
  }

  private cleanText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/[^\x00-\x7F]/g, ' ')
      .trim();
  }
}

export const geminiService = new GeminiService();

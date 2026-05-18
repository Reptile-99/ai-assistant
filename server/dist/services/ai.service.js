"use strict";
/**
 * OpenAI Service Layer
 * Handles all interactions with the OpenAI API, including:
 * - Client initialization
 * - Summarization with chunking for large documents
 * - Retry logic with exponential backoff
 * - Token tracking and cost estimation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openAIService = exports.OpenAIServiceError = void 0;
const openai_1 = __importDefault(require("openai"));
const prompt_engine_1 = require("./prompt.engine");
const token_optimizer_1 = require("./token.optimizer");
// ─── Error Classes ────────────────────────────────────────────────────────────
class OpenAIServiceError extends Error {
    constructor(message, code, statusCode, retryable = false) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.retryable = retryable;
        this.name = 'OpenAIServiceError';
    }
}
exports.OpenAIServiceError = OpenAIServiceError;
// ─── Service ──────────────────────────────────────────────────────────────────
class OpenAIService {
    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new OpenAIServiceError('OPENAI_API_KEY is not set in environment variables', 'MISSING_API_KEY', 500);
        }
        this.client = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY,
            timeout: parseInt(process.env.OPENAI_TIMEOUT_MS ?? '30000', 10),
            maxRetries: 0, // We handle retries manually for better control
        });
        this.config = {
            model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
            maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS ?? '2000', 10),
            temperature: parseFloat(process.env.OPENAI_TEMPERATURE ?? '0.3'),
            maxRetries: 3,
            timeoutMs: parseInt(process.env.OPENAI_TIMEOUT_MS ?? '30000', 10),
        };
    }
    /**
     * Main summarization method.
     * Automatically handles chunking for large documents.
     */
    async summarize(text, type, documentTitle = 'the document') {
        const cleanedText = this.cleanText(text);
        if (!cleanedText || cleanedText.trim().length < 50) {
            throw new OpenAIServiceError('Document content is too short to summarize', 'CONTENT_TOO_SHORT', 400);
        }
        const requiresChunking = (0, token_optimizer_1.needsChunking)(cleanedText, this.config.model, this.config.maxTokens);
        if (requiresChunking) {
            return this.summarizeWithChunking(cleanedText, type, documentTitle);
        }
        return this.summarizeSingle(cleanedText, type, documentTitle);
    }
    /**
     * Generates flashcards from document text.
     * If the text is very long, it chunks it and uses the first few chunks to avoid huge token usage,
     * or we can just ask OpenAI to extract a specific number of flashcards from the provided text chunk.
     */
    async generateFlashcards(text, count, difficulty, documentTitle = 'the document') {
        const cleanedText = this.cleanText(text);
        if (!cleanedText || cleanedText.trim().length < 50) {
            throw new OpenAIServiceError('Document content is too short to generate flashcards', 'CONTENT_TOO_SHORT', 400);
        }
        // Limit text to ~6000 tokens for flashcard generation to keep it within safe limits for prompt processing
        const maxChars = 6000 * 4;
        const processingText = cleanedText.length > maxChars ? cleanedText.slice(0, maxChars) + '...' : cleanedText;
        const messages = [
            {
                role: 'system',
                content: `You are an expert AI study assistant. Your task is to generate flashcards based ONLY on the provided document text.
Output the flashcards as a JSON object with a single key "flashcards" which is an array of objects, each containing a "front" (the question) and a "back" (the detailed answer).

Requirements:
- Generate exactly ${count} flashcards.
- The difficulty level should be: ${difficulty}.
- The document title is: ${documentTitle}.
- Ensure questions are clear and answers are concise but comprehensive.
- Output MUST be valid JSON.`,
            },
            {
                role: 'user',
                content: processingText,
            },
        ];
        const completion = await this.callWithRetry(() => this.client.chat.completions.create({
            model: this.config.model,
            messages,
            max_tokens: this.config.maxTokens,
            temperature: this.config.temperature,
            response_format: { type: "json_object" },
        }));
        const resultText = completion.choices[0]?.message?.content?.trim() ?? '{}';
        let flashcards = [];
        try {
            const parsed = JSON.parse(resultText);
            flashcards = parsed.flashcards || [];
        }
        catch (e) {
            throw new OpenAIServiceError('Failed to parse OpenAI JSON response', 'JSON_PARSE_ERROR', 500);
        }
        const tokenUsage = {
            promptTokens: completion.usage?.prompt_tokens ?? 0,
            completionTokens: completion.usage?.completion_tokens ?? 0,
            totalTokens: completion.usage?.total_tokens ?? 0,
        };
        return { flashcards, tokenUsage };
    }
    /**
     * Generates a study schedule based on upcoming exams.
     */
    async generateStudySchedule(exams, days = 7) {
        const messages = [
            {
                role: 'system',
                content: `You are an expert AI study assistant. Your task is to generate a realistic study schedule.
Output the schedule as a JSON object with a single key "tasks" which is an array of objects.
Each object must have:
- "title" (string): the task description.
- "subject" (string): the subject of the task.
- "duration" (number): duration in minutes (e.g. 30, 45, 60).
- "priority" (string): "high", "medium", or "low".
- "dayOffset" (number): 0 for today, 1 for tomorrow, up to ${days - 1}.

Requirements:
- Distribute study sessions reasonably leading up to the given exams.
- If there are no exams, generate a general balanced study plan.
- Output MUST be valid JSON.`
            },
            {
                role: 'user',
                content: `Upcoming Exams: ${JSON.stringify(exams)}`
            }
        ];
        const completion = await this.callWithRetry(() => this.client.chat.completions.create({
            model: this.config.model,
            messages,
            max_tokens: this.config.maxTokens,
            temperature: this.config.temperature,
            response_format: { type: "json_object" },
        }));
        const resultText = completion.choices[0]?.message?.content?.trim() ?? '{}';
        let tasks = [];
        try {
            const parsed = JSON.parse(resultText);
            tasks = parsed.tasks || [];
        }
        catch (e) {
            throw new OpenAIServiceError('Failed to parse OpenAI JSON response', 'JSON_PARSE_ERROR', 500);
        }
        return { tasks };
    }
    // ─── Private Methods ────────────────────────────────────────────────────────
    /**
     * Summarize text that fits in a single API call.
     */
    async summarizeSingle(text, type, documentTitle) {
        const messages = (0, prompt_engine_1.buildSummaryPrompt)(type, text, documentTitle);
        const completion = await this.callWithRetry(() => this.client.chat.completions.create({
            model: this.config.model,
            messages,
            max_tokens: this.config.maxTokens,
            temperature: this.config.temperature,
        }));
        const summary = completion.choices[0]?.message?.content?.trim() ?? '';
        if (!summary) {
            throw new OpenAIServiceError('OpenAI returned an empty response', 'EMPTY_RESPONSE', 502);
        }
        const tokenUsage = {
            promptTokens: completion.usage?.prompt_tokens ?? 0,
            completionTokens: completion.usage?.completion_tokens ?? 0,
            totalTokens: completion.usage?.total_tokens ?? 0,
        };
        return {
            summary,
            type,
            tokenUsage,
            cost: (0, token_optimizer_1.calculateCost)(tokenUsage, this.config.model),
            chunksProcessed: 1,
            model: this.config.model,
        };
    }
    /**
     * Summarize large text by splitting into chunks, summarizing each,
     * then merging the results into a final coherent summary.
     */
    async summarizeWithChunking(text, type, documentTitle) {
        const chunks = (0, token_optimizer_1.chunkText)(text, 3000);
        const chunkSummaries = [];
        const aggregatedUsage = {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
        };
        // Summarize each chunk with a "short" pass first
        for (const chunk of chunks) {
            const messages = (0, prompt_engine_1.buildSummaryPrompt)('short', chunk, documentTitle);
            const completion = await this.callWithRetry(() => this.client.chat.completions.create({
                model: this.config.model,
                messages,
                max_tokens: 600,
                temperature: this.config.temperature,
            }));
            const chunkSummary = completion.choices[0]?.message?.content?.trim() ?? '';
            if (chunkSummary) {
                chunkSummaries.push(chunkSummary);
            }
            aggregatedUsage.promptTokens += completion.usage?.prompt_tokens ?? 0;
            aggregatedUsage.completionTokens += completion.usage?.completion_tokens ?? 0;
            aggregatedUsage.totalTokens += completion.usage?.total_tokens ?? 0;
        }
        // Merge all chunk summaries into final output with the requested type
        const mergeMessages = (0, prompt_engine_1.buildMergePrompt)(type, chunkSummaries, documentTitle);
        const mergeCompletion = await this.callWithRetry(() => this.client.chat.completions.create({
            model: this.config.model,
            messages: mergeMessages,
            max_tokens: this.config.maxTokens,
            temperature: this.config.temperature,
        }));
        const finalSummary = mergeCompletion.choices[0]?.message?.content?.trim() ?? '';
        if (!finalSummary) {
            throw new OpenAIServiceError('OpenAI returned an empty response during merge', 'EMPTY_MERGE_RESPONSE', 502);
        }
        aggregatedUsage.promptTokens += mergeCompletion.usage?.prompt_tokens ?? 0;
        aggregatedUsage.completionTokens +=
            mergeCompletion.usage?.completion_tokens ?? 0;
        aggregatedUsage.totalTokens += mergeCompletion.usage?.total_tokens ?? 0;
        return {
            summary: finalSummary,
            type,
            tokenUsage: aggregatedUsage,
            cost: (0, token_optimizer_1.calculateCost)(aggregatedUsage, this.config.model),
            chunksProcessed: chunks.length,
            model: this.config.model,
        };
    }
    /**
     * Wrap an API call with exponential backoff retry logic.
     * Retries on: rate limits (429), server errors (500/502/503).
     */
    async callWithRetry(fn, attempt = 0) {
        try {
            return await fn();
        }
        catch (err) {
            const isRetryable = err?.status === 429 ||
                err?.status === 500 ||
                err?.status === 502 ||
                err?.status === 503;
            if (isRetryable && attempt < this.config.maxRetries) {
                const delayMs = Math.pow(2, attempt) * 1000 + Math.random() * 500;
                console.warn(`[OpenAI] Retrying (attempt ${attempt + 1}/${this.config.maxRetries}) after ${Math.round(delayMs)}ms — error: ${err?.message}`);
                await new Promise((resolve) => setTimeout(resolve, delayMs));
                return this.callWithRetry(fn, attempt + 1);
            }
            // Map OpenAI SDK errors to our error type
            this.handleOpenAIError(err);
        }
    }
    /**
     * Translate OpenAI SDK errors into structured OpenAIServiceError instances.
     */
    handleOpenAIError(err) {
        if (err instanceof OpenAIServiceError)
            throw err;
        const status = err?.status ?? 500;
        const code = err?.code ?? err?.error?.code ?? 'UNKNOWN_ERROR';
        if (status === 401) {
            throw new OpenAIServiceError('Invalid OpenAI API key', 'INVALID_API_KEY', 500);
        }
        if (status === 429) {
            const isQuota = err?.error?.code === 'insufficient_quota';
            if (isQuota) {
                throw new OpenAIServiceError('OpenAI quota exceeded — please check your billing', 'QUOTA_EXCEEDED', 503);
            }
            throw new OpenAIServiceError('OpenAI rate limit reached — please try again shortly', 'RATE_LIMIT', 429, true);
        }
        if (status === 400) {
            throw new OpenAIServiceError(`Invalid request to OpenAI: ${err?.message}`, code, 400);
        }
        if (err?.name === 'APIConnectionTimeoutError' || err?.name === 'Timeout') {
            throw new OpenAIServiceError('OpenAI request timed out — please try again', 'TIMEOUT', 504);
        }
        throw new OpenAIServiceError(`OpenAI service error: ${err?.message ?? 'Unknown error'}`, code, status >= 400 && status < 600 ? status : 502);
    }
    /**
     * Clean and normalize extracted PDF text.
     */
    cleanText(text) {
        return text
            .replace(/\r\n/g, '\n') // normalize line endings
            .replace(/\n{3,}/g, '\n\n') // collapse excessive blank lines
            .replace(/[ \t]{2,}/g, ' ') // collapse multiple spaces/tabs
            .replace(/[^\x00-\x7F]/g, ' ') // remove non-ASCII chars (PDF artifacts)
            .trim();
    }
}
// Singleton export
exports.openAIService = new OpenAIService();

/**
 * Token Optimizer
 * Handles token estimation, smart text chunking, and cost calculation.
 */

// Token cost per 1000 tokens (in USD) — May 2025 pricing
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 0.0025, output: 0.01 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
};

// Context window limits per model
const MODEL_CONTEXT_LIMITS: Record<string, number> = {
  'gpt-4o': 128000,
  'gpt-4o-mini': 128000,
  'gpt-4-turbo': 128000,
  'gpt-3.5-turbo': 16385,
};

/**
 * Fast token estimation: ~4 characters per token (OpenAI approximation)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Get the max context window for a given model
 */
export function getModelContextLimit(model: string): number {
  return MODEL_CONTEXT_LIMITS[model] ?? 8192;
}

/**
 * Smart chunking: splits text at paragraph or sentence boundaries
 * to stay within `maxTokens` per chunk.
 */
export function chunkText(text: string, maxTokens: number = 3000): string[] {
  const maxChars = maxTokens * 4;

  if (text.length <= maxChars) {
    return [text];
  }

  const chunks: string[] = [];

  // Prefer paragraph splits first
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const candidate = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph;

    if (candidate.length <= maxChars) {
      currentChunk = candidate;
    } else {
      // Flush current chunk if it has content
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = paragraph;
      } else {
        // Single paragraph is too long — split at sentence boundaries
        const sentences = paragraph.match(/[^.!?]+[.!?]+/g) ?? [paragraph];
        for (const sentence of sentences) {
          const sentCandidate = currentChunk
            ? `${currentChunk} ${sentence}`
            : sentence;

          if (sentCandidate.length <= maxChars) {
            currentChunk = sentCandidate;
          } else {
            if (currentChunk) chunks.push(currentChunk.trim());
            // If a single sentence exceeds limit, hard truncate it
            currentChunk = sentence.slice(0, maxChars);
          }
        }
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Truncate text to a token limit, appending an ellipsis if truncated.
 */
export function truncateToLimit(text: string, maxTokens: number): string {
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 3) + '...';
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface CostEstimate {
  inputCost: number;  // USD
  outputCost: number; // USD
  totalCost: number;  // USD
  formattedCost: string;
}

/**
 * Calculate estimated cost for an API call.
 */
export function calculateCost(usage: TokenUsage, model: string): CostEstimate {
  const pricing = MODEL_PRICING[model] ?? MODEL_PRICING['gpt-4o-mini'];

  const inputCost = (usage.promptTokens / 1000) * pricing.input;
  const outputCost = (usage.completionTokens / 1000) * pricing.output;
  const totalCost = inputCost + outputCost;

  return {
    inputCost,
    outputCost,
    totalCost,
    formattedCost: `$${totalCost.toFixed(6)}`,
  };
}

/**
 * Determine if text needs chunking for a given model.
 */
export function needsChunking(
  text: string,
  model: string,
  reservedOutputTokens: number = 2000
): boolean {
  const contextLimit = getModelContextLimit(model);
  const safeInputLimit = contextLimit - reservedOutputTokens - 500; // 500 token buffer for system prompt
  return estimateTokens(text) > safeInputLimit;
}

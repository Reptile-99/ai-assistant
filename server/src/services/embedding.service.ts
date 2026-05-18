import { OpenAIEmbeddings } from '@langchain/openai';

class EmbeddingService {
  private embeddings: OpenAIEmbeddings | null = null;
  private model: string;
  private dimensions: number;

  constructor() {
    this.model = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
    this.dimensions = parseInt(process.env.EMBEDDING_DIMENSIONS || '1536', 10);

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key') {
      console.warn('OPENAI_API_KEY is not set or is a placeholder. EmbeddingService will be limited.');
      return;
    }

    try {
      this.embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: this.model,
        dimensions: this.dimensions,
        maxRetries: 3,
      });
    } catch (error) {
      console.error('Failed to initialize OpenAIEmbeddings:', error);
    }
  }

  /**
   * Embeds a single text string.
   */
  async embedText(text: string): Promise<number[]> {
    if (!this.embeddings) {
      console.error('Embeddings client not initialized.');
      return new Array(this.dimensions).fill(0);
    }
    return await this.embeddings.embedQuery(text);
  }

  /**
   * Embeds an array of text strings.
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    if (!this.embeddings) {
      console.error('Embeddings client not initialized.');
      return texts.map(() => new Array(this.dimensions).fill(0));
    }
    return await this.embeddings.embedDocuments(texts);
  }

  /**
   * Get model info.
   */
  getModelInfo() {
    return {
      model: this.model,
      dimensions: this.dimensions,
    };
  }
}

export const embeddingService = new EmbeddingService();

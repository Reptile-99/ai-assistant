"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.embeddingService = void 0;
const openai_1 = require("@langchain/openai");
class EmbeddingService {
    constructor() {
        this.model = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
        this.dimensions = parseInt(process.env.EMBEDDING_DIMENSIONS || '1536', 10);
        if (!process.env.OPENAI_API_KEY) {
            console.warn('OPENAI_API_KEY is not set. EmbeddingService will fail.');
        }
        this.embeddings = new openai_1.OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY,
            modelName: this.model,
            dimensions: this.dimensions,
            maxRetries: 3,
        });
    }
    /**
     * Embeds a single text string.
     */
    async embedText(text) {
        return await this.embeddings.embedQuery(text);
    }
    /**
     * Embeds an array of text strings.
     * LangChain handles batching internally, but we can also manage it if needed.
     */
    async embedBatch(texts) {
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
exports.embeddingService = new EmbeddingService();

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.embeddingService = void 0;
const generative_ai_1 = require("@google/generative-ai");
class EmbeddingService {
    constructor() {
        this.client = null;
        this.model = 'gemini-embedding-001';
        this.dimensions = parseInt(process.env.EMBEDDING_DIMENSIONS || '1536', 10);
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your_gemini_api_key') {
            console.warn('[EmbeddingService] GEMINI_API_KEY not set or placeholder. Service will be limited.');
            return;
        }
        try {
            this.client = new generative_ai_1.GoogleGenerativeAI(apiKey);
            console.log(`[EmbeddingService] ✅ Initialized with model: ${this.model}`);
        }
        catch (error) {
            console.error('[EmbeddingService] Failed to initialize GoogleGenerativeAI client:', error);
        }
    }
    /**
     * Embeds a single text string.
     * Generates a 3072-dim embedding from gemini-embedding-001 and truncates to 1536-dim (via MRL).
     */
    async embedText(text) {
        if (!this.client) {
            console.error('[EmbeddingService] Client not initialized.');
            return new Array(this.dimensions).fill(0);
        }
        try {
            const model = this.client.getGenerativeModel({ model: this.model });
            const result = await model.embedContent(text);
            const values = result.embedding.values;
            // Truncate to the requested dimensionality (Pinecone matches 1536)
            return values.slice(0, this.dimensions);
        }
        catch (error) {
            console.error('[EmbeddingService] Failed to generate embedding:', error);
            return new Array(this.dimensions).fill(0);
        }
    }
    /**
     * Embeds an array of text strings.
     */
    async embedBatch(texts) {
        if (!this.client) {
            console.error('[EmbeddingService] Client not initialized.');
            return texts.map(() => new Array(this.dimensions).fill(0));
        }
        try {
            // Sequential Promise.all to map texts to their sliced embeddings
            const promises = texts.map(text => this.embedText(text));
            return await Promise.all(promises);
        }
        catch (error) {
            console.error('[EmbeddingService] Failed to generate batch embeddings:', error);
            return texts.map(() => new Array(this.dimensions).fill(0));
        }
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

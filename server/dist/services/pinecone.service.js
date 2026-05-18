"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pineconeService = void 0;
const pinecone_1 = require("@pinecone-database/pinecone");
class PineconeService {
    constructor() {
        if (!process.env.PINECONE_API_KEY) {
            console.warn('PINECONE_API_KEY is not set. PineconeService will fail.');
        }
        this.pinecone = new pinecone_1.Pinecone({
            apiKey: process.env.PINECONE_API_KEY || '',
        });
        this.indexName = process.env.PINECONE_INDEX_NAME || 'study-assistant';
        this.namespace = process.env.PINECONE_NAMESPACE || 'documents';
    }
    /**
     * Batch upsert vectors into Pinecone.
     */
    async upsertChunks(vectors) {
        const index = this.pinecone.Index(this.indexName).namespace(this.namespace);
        // Pinecone recommends upserting in batches of ~100
        const batchSize = 100;
        for (let i = 0; i < vectors.length; i += batchSize) {
            const batch = vectors.slice(i, i + batchSize);
            await index.upsert(batch);
        }
    }
    /**
     * Query similar vectors.
     */
    async similaritySearch(queryEmbedding, topK, filter) {
        const index = this.pinecone.Index(this.indexName).namespace(this.namespace);
        const queryResponse = await index.query({
            topK,
            vector: queryEmbedding,
            includeMetadata: true,
            filter,
        });
        return queryResponse.matches;
    }
    /**
     * Delete all vectors for a specific document.
     */
    async deleteDocumentVectors(documentId, userId) {
        const index = this.pinecone.Index(this.indexName).namespace(this.namespace);
        const filter = { documentId };
        if (userId) {
            filter.userId = userId;
        }
        try {
            // Note: Delete by metadata filter is only supported on Starter/Serverless if you use the specific delete many endpoint or standard queries.
            // We will loop through deleting in batches if needed, but modern pinecone client supports deleteMany.
            // The current JS client version supports `deleteMany` with filter or just looping through matching IDs.
            // Usually it's better to fetch IDs first or use the new serverless deleteMany feature if enabled.
            // Here we assume deleteMany by filter works. If not, fallback to fetching topK and deleting by ID.
            // Let's implement fetch-then-delete to be safe for all Pinecone tiers, or rely on deleteMany if available.
            // To be safe, we'll try deleteMany. If your index does not support it, you might need to query and delete.
            // Attempt 1: Fetch all chunks for the document (assume max 1000 chunks for simplicity, or paginate)
            const queryResponse = await index.query({
                topK: 10000,
                vector: new Array(1536).fill(0), // Dummy vector
                includeValues: false,
                includeMetadata: false,
                filter,
            });
            const idsToDelete = queryResponse.matches.map(m => m.id);
            if (idsToDelete.length > 0) {
                // Delete in batches of 1000
                for (let i = 0; i < idsToDelete.length; i += 1000) {
                    const batch = idsToDelete.slice(i, i + 1000);
                    await index.deleteMany(batch);
                }
            }
        }
        catch (error) {
            console.error('Error deleting document vectors:', error);
            throw error;
        }
    }
    /**
     * Get index stats
     */
    async getIndexStats() {
        const index = this.pinecone.Index(this.indexName);
        return await index.describeIndexStats();
    }
}
exports.pineconeService = new PineconeService();

import { Pinecone, RecordMetadata } from '@pinecone-database/pinecone';

export interface DocumentChunkMetadata extends RecordMetadata {
  documentId: string;
  userId: string;
  chunkIndex: number;
  chunkText: string;
  documentTitle: string;
  pageCount: number;
  createdAt: string;
}

class PineconeService {
  private pinecone: Pinecone | null = null;
  private indexName: string;
  private namespace: string;

  constructor() {
    this.indexName = process.env.PINECONE_INDEX_NAME || 'study-assistant';
    this.namespace = process.env.PINECONE_NAMESPACE || 'documents';

    if (!process.env.PINECONE_API_KEY || process.env.PINECONE_API_KEY === 'your_pinecone_api_key') {
      console.warn('PINECONE_API_KEY is not set or is a placeholder. PineconeService will be disabled.');
      return;
    }
    
    try {
      this.pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
      });
    } catch (error) {
      console.error('Failed to initialize Pinecone:', error);
    }
  }

  private getIndex() {
    if (!this.pinecone) {
      console.error('Pinecone is not initialized. Please check your PINECONE_API_KEY.');
      return null;
    }
    return this.pinecone.Index(this.indexName).namespace(this.namespace);
  }

  /**
   * Batch upsert vectors into Pinecone.
   */
  async upsertChunks(vectors: { id: string; values: number[]; metadata: DocumentChunkMetadata }[]) {
    const index = this.getIndex();
    if (!index) return;
    
    // Pinecone recommends upserting in batches of ~100
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await index.upsert(batch as any);
    }
  }

  /**
   * Query similar vectors.
   */
  async similaritySearch(queryEmbedding: number[], topK: number, filter?: Record<string, any>) {
    const index = this.getIndex();
    if (!index) return [];
    
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
  async deleteDocumentVectors(documentId: string, userId?: string) {
    const index = this.getIndex();
    if (!index) return;
    
    const filter: Record<string, any> = { documentId };
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
    } catch (error) {
      console.error('Error deleting document vectors:', error);
      throw error;
    }
  }

  /**
   * Get index stats
   */
  async getIndexStats() {
    const index = this.getIndex();
    if (!index) return null;
    return await index.describeIndexStats();
  }
}

export const pineconeService = new PineconeService();

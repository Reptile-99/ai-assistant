"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ragService = void 0;
const uuid_1 = require("uuid");
const openai_1 = require("@langchain/openai");
const prompts_1 = require("@langchain/core/prompts");
const output_parsers_1 = require("@langchain/core/output_parsers");
const embedding_service_1 = require("./embedding.service");
const pinecone_service_1 = require("./pinecone.service");
const token_optimizer_1 = require("./token.optimizer");
const Document_1 = __importDefault(require("../models/Document"));
class RAGService {
    constructor() {
        this.chatModel = new openai_1.ChatOpenAI({
            openAIApiKey: process.env.OPENAI_API_KEY,
            modelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.3'),
            maxRetries: 3,
        });
    }
    /**
     * Process and index a document into Pinecone.
     * This is typically run asynchronously.
     */
    async indexDocument(document) {
        console.log(`[RAG] Starting indexing for document ${document._id}...`);
        try {
            // 1. Chunk the document text (using approx 500 tokens for RAG chunks)
            // The token.optimizer's chunkText is based on maxTokens. Let's aim for 500 maxTokens per chunk for better semantic retrieval.
            const chunks = (0, token_optimizer_1.chunkText)(document.content, 500);
            console.log(`[RAG] Document ${document._id} split into ${chunks.length} chunks.`);
            if (chunks.length === 0) {
                console.warn(`[RAG] Document ${document._id} has no valid text to index.`);
                return;
            }
            // 2. Generate embeddings for all chunks in batches
            // Embed documents handles batching internally (usually 512-2048 per batch)
            const embeddings = await embedding_service_1.embeddingService.embedBatch(chunks);
            if (embeddings.length !== chunks.length) {
                throw new Error('Mismatch between number of chunks and number of embeddings.');
            }
            // 3. Prepare Pinecone vectors
            const vectors = chunks.map((chunk, index) => {
                const chunkId = `${document._id.toString()}-chunk-${index}-${(0, uuid_1.v4)()}`;
                const metadata = {
                    documentId: document._id.toString(),
                    userId: document.userId.toString(),
                    chunkIndex: index,
                    chunkText: chunk,
                    documentTitle: document.title,
                    pageCount: document.pageCount || 0,
                    createdAt: new Date().toISOString(),
                };
                return {
                    id: chunkId,
                    values: embeddings[index],
                    metadata,
                };
            });
            // 4. Upsert to Pinecone
            await pinecone_service_1.pineconeService.upsertChunks(vectors);
            console.log(`[RAG] Successfully upserted ${vectors.length} vectors for document ${document._id}.`);
            // 5. Update MongoDB document
            await Document_1.default.findByIdAndUpdate(document._id, {
                isIndexed: true,
                chunkCount: vectors.length,
                indexedAt: new Date(),
            });
            return { chunkCount: vectors.length, success: true };
        }
        catch (error) {
            console.error(`[RAG] Failed to index document ${document._id}:`, error);
            throw error;
        }
    }
    /**
     * Query the index and generate an answer using LangChain.
     */
    async queryDocuments(question, options = {}) {
        const topK = options.topK || parseInt(process.env.RAG_TOP_K || '5', 10);
        const minScore = options.minScore || parseFloat(process.env.RAG_MIN_SCORE || '0.7');
        // 1. Embed the user's question
        const questionEmbedding = await embedding_service_1.embeddingService.embedText(question);
        // 2. Prepare filters
        const filter = {};
        if (options.userId)
            filter.userId = options.userId;
        if (options.documentId)
            filter.documentId = options.documentId;
        // 3. Retrieve relevant chunks from Pinecone
        const matches = await pinecone_service_1.pineconeService.similaritySearch(questionEmbedding, topK, filter);
        // Filter by score and extract sources
        const validMatches = matches.filter(match => (match.score || 0) >= minScore);
        if (validMatches.length === 0) {
            return {
                answer: "I couldn't find any relevant information in your documents to answer this question. Please try rephrasing or uploading more documents.",
                sources: [],
                model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            };
        }
        const sources = validMatches.map(match => {
            const metadata = match.metadata;
            return {
                text: metadata.chunkText,
                score: match.score || 0,
                documentTitle: metadata.documentTitle,
                pageCount: metadata.pageCount,
            };
        });
        // 4. Build context string
        const contextString = sources
            .map((source, idx) => `[Source ${idx + 1}: ${source.documentTitle}]\n${source.text}`)
            .join('\n\n');
        // 5. Generate Answer using LangChain
        const promptTemplate = prompts_1.PromptTemplate.fromTemplate(`
You are an expert AI study assistant. Your goal is to answer the user's question accurately based ONLY on the provided context from their uploaded documents.

If the context does not contain the answer, politely state that you cannot answer based on the provided documents. Do not hallucinate or use outside knowledge.
If you use information from the context, you can reference the source briefly (e.g., "According to [Document Title]...").

Context:
{context}

Question: {question}
Answer:
`);
        const chain = promptTemplate.pipe(this.chatModel).pipe(new output_parsers_1.StringOutputParser());
        const answer = await chain.invoke({
            context: contextString,
            question: question,
        });
        return {
            answer,
            sources,
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        };
    }
    /**
     * Delete document vectors and update MongoDB.
     */
    async deleteDocumentIndex(documentId, userId) {
        await pinecone_service_1.pineconeService.deleteDocumentVectors(documentId, userId);
        await Document_1.default.findByIdAndUpdate(documentId, {
            isIndexed: false,
            chunkCount: 0,
            $unset: { indexedAt: 1 }
        });
    }
}
exports.ragService = new RAGService();

import api from './api.client';

export type SummaryType = 'short' | 'detailed' | 'bullet' | 'key_concepts';

export interface SummaryTypeInfo {
  id: SummaryType;
  label: string;
  description: string;
  icon: string;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface CostEstimate {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  formattedCost: string;
}

export interface SummaryResult {
  summary: string;
  type: SummaryType;
  tokenUsage: TokenUsage;
  cost: CostEstimate;
  chunksProcessed: number;
  model: string;
  documentTitle: string;
  estimatedInputTokens: number;
  cached?: boolean;
  generatedAt?: string;
}

export interface RAGSource {
  text: string;
  score: number;
  documentTitle: string;
  pageCount?: number;
}

export interface RAGQueryResult {
  answer: string;
  sources: RAGSource[];
  model: string;
}

export interface Document {
  _id: string;
  title: string;
  fileUrl: string;
  fileSize: number;
  pageCount: number;
  createdAt: string;
  isIndexed?: boolean;
  summaries?: Record<SummaryType, { content: string; generatedAt: string; tokenUsage: number }>;
}

// Fetch all available summary type definitions
export async function getSummaryTypes(): Promise<SummaryTypeInfo[]> {
  const res = await api.get('/ai/summary-types');
  return res.data.data;
}

// Fetch all user documents
export async function getDocuments(): Promise<Document[]> {
  const res = await api.get('/documents');
  return res.data.data;
}

// Summarize a stored document
export async function summarizeDocument(
  documentId: string,
  summaryType: SummaryType
): Promise<{ data: SummaryResult; cached: boolean }> {
  const res = await api.post('/ai/summarize', { documentId, summaryType });
  return { data: res.data.data, cached: res.data.cached };
}

// Clear summary cache for a document
export async function clearSummaryCache(documentId: string, type?: SummaryType): Promise<void> {
  const params = type ? `?type=${type}` : '';
  await api.delete(`/ai/summarize/${documentId}/cache${params}`);
}

// Query RAG pipeline
export async function queryRAG(question: string, documentId?: string): Promise<RAGQueryResult> {
  const res = await api.post('/rag/query', { question, documentId });
  return res.data.data;
}

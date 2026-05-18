import api from './api.client';
import { Document } from './ai.service';

export interface Flashcard {
  _id: string;
  userId: string;
  documentId: string;
  deckName: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  mastered: boolean;
  createdAt: string;
}

export interface GenerateFlashcardsResponse {
  success: boolean;
  data: Flashcard[];
  tokenUsage: any;
}

export async function getFlashcards(): Promise<Flashcard[]> {
  const res = await api.get('/flashcards');
  return res.data.data;
}

export async function generateFlashcards(
  documentId: string,
  count: number,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<GenerateFlashcardsResponse> {
  const res = await api.post('/flashcards/generate', {
    documentId,
    count,
    difficulty,
  });
  return res.data;
}

export async function updateFlashcard(
  id: string,
  data: Partial<Flashcard>
): Promise<Flashcard> {
  const res = await api.put(`/flashcards/${id}`, data);
  return res.data.data;
}

export async function deleteFlashcard(id: string): Promise<void> {
  await api.delete(`/flashcards/${id}`);
}

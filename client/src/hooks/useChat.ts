'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { queryRAG, RAGSource, Document, getDocuments } from '@/services/ai.service';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: RAGSource[];
}

const TYPING_SPEED_MS = 10;
const CHARS_PER_TICK = 3;

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('all');
  
  // For simulating streaming
  const [displayedAssistantText, setDisplayedAssistantText] = useState('');
  const [currentAssistantSources, setCurrentAssistantSources] = useState<RAGSource[] | undefined>(undefined);
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load documents
  useEffect(() => {
    getDocuments()
      .then(docs => setDocuments(docs))
      .catch(console.error);
  }, []);

  // Cleanup interval
  useEffect(() => {
    return () => {
      if (typingRef.current) clearInterval(typingRef.current);
    };
  }, []);

  const simulateStreaming = useCallback((fullText: string, sources: RAGSource[]) => {
    if (typingRef.current) clearInterval(typingRef.current);
    
    setIsTyping(true);
    setDisplayedAssistantText('');
    setCurrentAssistantSources(sources);
    
    let index = 0;
    typingRef.current = setInterval(() => {
      index = Math.min(index + CHARS_PER_TICK, fullText.length);
      setDisplayedAssistantText(fullText.slice(0, index));

      if (index >= fullText.length) {
        if (typingRef.current) clearInterval(typingRef.current);
        
        // Add the finished message to the array
        setMessages(prev => [
          ...prev, 
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: fullText,
            timestamp: new Date(),
            sources: sources,
          }
        ]);
        
        setIsTyping(false);
        setDisplayedAssistantText('');
        setCurrentAssistantSources(undefined);
      }
    }, TYPING_SPEED_MS);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    
    try {
      const targetDocId = selectedDocId === 'all' ? undefined : selectedDocId;
      const result = await queryRAG(content, targetDocId);
      
      simulateStreaming(result.answer, result.sources);
    } catch (error) {
      console.error('Failed to query RAG:', error);
      
      // Fallback error message
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error while searching your documents. Please try again.',
          timestamp: new Date(),
        }
      ]);
      setIsTyping(false);
    }
  }, [selectedDocId, simulateStreaming]);

  const clearChat = useCallback(() => {
    if (typingRef.current) clearInterval(typingRef.current);
    setMessages([]);
    setDisplayedAssistantText('');
    setCurrentAssistantSources(undefined);
    setIsTyping(false);
  }, []);

  return {
    messages,
    input,
    setInput,
    isTyping,
    documents,
    selectedDocId,
    setSelectedDocId,
    displayedAssistantText,
    currentAssistantSources,
    sendMessage,
    clearChat,
  };
}

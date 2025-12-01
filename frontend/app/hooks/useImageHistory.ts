"use client";

import { useState, useEffect, useCallback } from 'react';
import { ImageFlowResult } from './useImageFlow';

export type HistoryItem = ImageFlowResult & {
  id: string;
  timestamp: number;
  userPrompt: string;
  aspectRatio: string;
  // Store keys for efficient restoration (inherited from ImageFlowResult but explicitly listed for clarity)
  baseImageKey?: string;
  referenceImageKeys?: string[];
  outputImageKey?: string;
};

const STORAGE_KEY = 'image-flow-history';
const MAX_HISTORY_ITEMS = 50; // Limit to prevent localStorage bloat

export const useImageHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as HistoryItem[];
        setHistory(parsed);
      }
    } catch (error) {
      console.error('Failed to load history from localStorage:', error);
    }
  }, []);

  // Save history to localStorage whenever it changes
  const saveHistory = useCallback((newHistory: HistoryItem[]) => {
    try {
      // Keep only the most recent items
      const limited = newHistory.slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
      setHistory(limited);
    } catch (error) {
      console.error('Failed to save history to localStorage:', error);
    }
  }, []);

  // Add a new item to history
  const addToHistory = useCallback(
    (result: ImageFlowResult, userPrompt: string, aspectRatio: string) => {
      const newItem: HistoryItem = {
        ...result,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        userPrompt,
        aspectRatio,
        // Store keys for efficient restoration
        baseImageKey: result.baseImageKey,
        referenceImageKeys: result.referenceImageKeys,
        outputImageKey: result.outputImageKey,
      };

      setHistory((prev) => {
        const updated = [newItem, ...prev];
        saveHistory(updated);
        return updated;
      });
    },
    [saveHistory],
  );

  // Remove an item from history
  const removeFromHistory = useCallback(
    (id: string) => {
      setHistory((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        saveHistory(updated);
        return updated;
      });
    },
    [saveHistory],
  );

  // Clear all history
  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }, []);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
};


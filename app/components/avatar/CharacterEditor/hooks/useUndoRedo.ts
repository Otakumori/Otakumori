'use client';

import { useState, useCallback } from 'react';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';

export function useUndoRedo(initialConfiguration: AvatarConfiguration) {
  const [history, setHistory] = useState<AvatarConfiguration[]>([initialConfiguration]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isDirty, setIsDirty] = useState(false);

  const addToHistory = useCallback((config: AvatarConfiguration) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(config);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setIsDirty(true);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setIsDirty(newIndex !== 0);
      return history[newIndex];
    }
    return null;
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setIsDirty(newIndex !== history.length - 1);
      return history[newIndex];
    }
    return null;
  }, [historyIndex, history]);

  const resetHistory = useCallback((config: AvatarConfiguration) => {
    setHistory([config]);
    setHistoryIndex(0);
    setIsDirty(false);
  }, []);

  return {
    history,
    historyIndex,
    isDirty,
    setIsDirty,
    addToHistory,
    undo,
    redo,
    resetHistory,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
}


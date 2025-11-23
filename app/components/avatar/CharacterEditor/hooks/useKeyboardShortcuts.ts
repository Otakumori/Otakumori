'use client';

import { useEffect, useCallback } from 'react';

type TabType = 'parts' | 'morphing' | 'materials' | 'lighting' | 'camera' | 'poses' | 'background' | 'rendering';

interface UseKeyboardShortcutsProps {
  setActiveTab: (tab: TabType) => void;
  setCameraRotation: (updater: (prev: { x: number; y: number }) => { x: number; y: number }) => void;
  setCameraZoom: (updater: (prev: number) => number) => void;
  resetCamera: () => void;
  undo: () => void;
  redo: () => void;
  handleSave: () => void;
  captureScreenshot: () => void;
  showComparison: boolean;
  comparisonConfig: unknown;
  setShowComparison: (show: boolean) => void;
}

export function useKeyboardShortcuts({
  setActiveTab,
  setCameraRotation,
  setCameraZoom,
  resetCamera,
  undo,
  redo,
  handleSave,
  captureScreenshot,
  showComparison,
  comparisonConfig,
  setShowComparison,
}: UseKeyboardShortcutsProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName;
        if (
          tagName === 'INPUT' ||
          tagName === 'TEXTAREA' ||
          tagName === 'SELECT' ||
          target.isContentEditable
        ) {
          return;
        }
      }

      if (event.key === 'Tab') {
        return;
      }

      // Camera controls
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setCameraRotation((prev) => ({ ...prev, y: prev.y - 15 }));
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        setCameraRotation((prev) => ({ ...prev, y: prev.y + 15 }));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setCameraRotation((prev) => ({ ...prev, x: prev.x - 15 }));
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setCameraRotation((prev) => ({ ...prev, x: prev.x + 15 }));
      }

      // Zoom controls
      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        setCameraZoom((prev) => Math.min(3, prev + 0.1));
      } else if (event.key === '-') {
        event.preventDefault();
        setCameraZoom((prev) => Math.max(0.5, prev - 0.1));
      }

      // Reset controls
      if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        resetCamera();
      }

      // Undo/Redo
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z' && !event.shiftKey) {
          event.preventDefault();
          undo();
        } else if (event.key === 'y' || (event.key === 'z' && event.shiftKey)) {
          event.preventDefault();
          redo();
        } else if (event.key === 's') {
          event.preventDefault();
          handleSave();
        }
      }

      // Tab switching
      if (event.key >= '1' && event.key <= '8') {
        event.preventDefault();
        const tabIndex = parseInt(event.key, 10) - 1;
        const tabs: TabType[] = [
          'parts',
          'morphing',
          'materials',
          'lighting',
          'camera',
          'poses',
          'background',
          'rendering',
        ];
        if (tabs[tabIndex]) {
          setActiveTab(tabs[tabIndex]);
        }
      }

      // Screenshot
      if (event.key === 'p' || event.key === 'P') {
        event.preventDefault();
        captureScreenshot();
      }

      // Toggle comparison
      if (event.key === 'c' || event.key === 'C') {
        event.preventDefault();
        if (comparisonConfig) {
          setShowComparison(!showComparison);
        }
      }
    },
    [
      setActiveTab,
      setCameraRotation,
      setCameraZoom,
      resetCamera,
      undo,
      redo,
      handleSave,
      captureScreenshot,
      comparisonConfig,
      showComparison,
      setShowComparison,
    ],
  );

  useEffect(() => {
    const listener = (event: KeyboardEvent) => handleKeyDown(event);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [handleKeyDown]);
}


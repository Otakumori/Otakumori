'use client';
import { useEffect } from 'react';

export default function HomeTreeToggle({ visible = true }: { visible?: boolean }) {
  useEffect(() => {
    const root = document.documentElement;
    const prev = getComputedStyle(root).getPropertyValue('--tree-opacity');
    if (visible) root.style.setProperty('--tree-opacity', '.96');
    return () => {
      root.style.setProperty('--tree-opacity', prev || '0');
    };
  }, [visible]);
  return null;
}

'use client';

type Handlers = {
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onSelect: () => void;
  onBack: () => void;
  onSettings?: () => void;
};

export function initInput(node: HTMLElement, h: Handlers) {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      h.onRotateLeft();
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      h.onRotateRight();
      e.preventDefault();
    } else if (e.key === 'Enter' || e.key === ' ') {
      h.onSelect();
      e.preventDefault();
    } else if (e.key === 'Escape') {
      h.onBack();
      e.preventDefault();
    } else if (e.key === 's' || e.key === 'S') {
      h.onSettings?.();
      e.preventDefault();
    }
  };
  node.addEventListener('keydown', onKey);

  // Basic touch handling
  let startX = 0;
  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) startX = e.touches[0].clientX;
  };
  const onTouchEnd = (e: TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const dx = endX - startX;
    if (Math.abs(dx) > 44) {
      if (dx < 0) h.onRotateRight();
      else h.onRotateLeft();
    } else {
      h.onSelect();
    }
  };
  node.addEventListener('touchstart', onTouchStart, { passive: true });
  node.addEventListener('touchend', onTouchEnd);

  return () => {
    node.removeEventListener('keydown', onKey);
    node.removeEventListener('touchstart', onTouchStart);
    node.removeEventListener('touchend', onTouchEnd);
  };
}

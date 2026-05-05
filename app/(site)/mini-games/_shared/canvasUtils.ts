/**
 * Utility functions for canvas initialization with DPI scaling
 * Uses design system variables for colors and spacing
 */

/**
 * Initialize canvas with proper DPI scaling for high-DPI displays
 * @param canvas - The canvas element to initialize
 * @param designWidth - Design width in CSS pixels
 * @param designHeight - Design height in CSS pixels
 * @returns The 2D rendering context, or null if initialization failed
 */
export function initScaledCanvas(
  canvas: HTMLCanvasElement,
  designWidth: number,
  designHeight: number,
): CanvasRenderingContext2D | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Get device pixel ratio
  const dpr = window.devicePixelRatio || 1;

  // Set actual canvas size in pixels (multiplied by DPR)
  canvas.width = designWidth * dpr;
  canvas.height = designHeight * dpr;

  // Set display size in CSS pixels (original design size)
  canvas.style.width = `${designWidth}px`;
  canvas.style.height = `${designHeight}px`;

  // Scale context to match device pixel ratio
  ctx.scale(dpr, dpr);

  // Set rendering hints for crisp rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  return ctx;
}

/**
 * Get CSS variable value from document root
 * @param variableName - CSS variable name (with or without -- prefix)
 * @param fallback - Fallback value if variable not found
 * @returns The CSS variable value or fallback
 */
export function getCSSVariable(variableName: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  
  const name = variableName.startsWith('--') ? variableName : `--${variableName}`;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  
  return value || fallback;
}

/**
 * Convert hex color to rgba string with opacity
 * @param hex - Hex color string (with or without #)
 * @param opacity - Opacity value 0-1
 * @returns RGBA string
 */
export function hexToRgba(hex: string, opacity: number): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}


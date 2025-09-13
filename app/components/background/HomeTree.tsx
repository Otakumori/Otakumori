import AnimatedTree from './AnimatedTree';

/**
 * Fixed, non-scrolling cherry tree with animations.
 * - Height = 100vh (full viewport), so it visually spans header→footer.
 * - Does NOT move on scroll.
 * - Sits above starfield (z-10) but below content (z-20).
 * - Features animated SVG tree with cherry blossoms.
 * - Respects prefers-reduced-motion for accessibility.
 */
export default function HomeTree() {
  return (
    <div 
      data-tree-root 
      aria-hidden 
      className="pointer-events-none fixed inset-0 z-0"
    >
      <AnimatedTree />
    </div>
  );
}

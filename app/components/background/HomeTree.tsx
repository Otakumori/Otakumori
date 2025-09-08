import Image from 'next/image';
import treePng from '@/public/assets/images/CherryTree.png';

/**
 * Fixed, non-scrolling cherry tree.
 * - Height = 100vh (full viewport), so it visually spans header→footer.
 * - Does NOT move on scroll.
 * - Sits above starfield (z-10) but below content (z-20).
 */
export default function HomeTree() {
  return (
    <div data-tree-root aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <Image
        src={treePng}
        alt=""
        priority
        draggable={false}
        fill
        className="object-contain object-bottom opacity-90"
        sizes="100vw"
      />
    </div>
  );
}

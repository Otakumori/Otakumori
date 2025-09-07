// app/components/background/HomeTree.tsx
import Image from 'next/image';
import treePng from '@/public/assets/images/CherryTree.png'; // your file

export default function HomeTree() {
  return (
    <div
      data-tree-root
      aria-hidden
      className="pointer-events-none fixed left-0 bottom-0 z-10"
      style={{
        height: '100vh', // match viewport height
        width: 'auto',
        transform: 'translateY(-4px)', // tiny nudge so canopy kisses nav; tweak as you like
      }}
    >
      <Image
        src={treePng}
        alt=""
        priority
        draggable={false}
        style={{
          height: '100vh',
          width: 'auto',
          objectFit: 'contain',
        }}
      />
    </div>
  );
}

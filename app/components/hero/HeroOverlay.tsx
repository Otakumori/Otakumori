'use client';

export default function HeroOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,100,180,0.16),transparent_68%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#080611]/80 via-[#080611]/24 to-transparent" />
    </div>
  );
}

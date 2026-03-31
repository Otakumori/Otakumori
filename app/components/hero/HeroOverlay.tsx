'use client';

export default function HeroOverlay() {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,100,180,0.12),transparent_70%)]" />
    </div>
  );
}

'use client';

export default function HeroOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className="absolute inset-0 bg-[#1a1418]/35" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(196,154,164,0.14),transparent_48%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(245,240,232,0.06),transparent_42%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#080611]/88 via-[#080611]/28 to-transparent" />
    </div>
  );
}

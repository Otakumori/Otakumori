'use client';

export default function HeroScene() {
  return (
    <div className="absolute inset-0 z-0">

      {/* Fallback gradient if no image yet */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#1a1026,transparent_60%),linear-gradient(to_bottom,#0a0713,#05030a)]" />

      {/* Optional image layer (add /public/hero/scene.jpg later) */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-80"
        style={{ backgroundImage: "url('/hero/scene.jpg')" }}
      />

    </div>
  );
}

export default function HeroOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,3,7,0.82),rgba(5,3,7,0.34)_38%,rgba(5,3,7,0.18)_62%,rgba(5,3,7,0.54)),linear-gradient(to_bottom,rgba(5,3,7,0.22),rgba(5,3,7,0.02)_35%,rgba(5,3,7,0.68))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,183,209,0.18),transparent_34%),radial-gradient(circle_at_72%_44%,rgba(255,225,185,0.16),transparent_32%),radial-gradient(circle_at_52%_72%,rgba(140,100,255,0.14),transparent_38%)]" />
      <div className="absolute inset-x-4 top-24 h-px bg-gradient-to-r from-transparent via-[#f7dcc7]/28 to-transparent md:inset-x-10" />
      <div className="absolute inset-x-4 bottom-7 h-px bg-gradient-to-r from-transparent via-[#f7dcc7]/22 to-transparent md:inset-x-10" />
      <div className="absolute left-4 top-24 bottom-7 w-px bg-gradient-to-b from-transparent via-[#f7dcc7]/18 to-transparent md:left-10" />
      <div className="absolute right-4 top-24 bottom-7 w-px bg-gradient-to-b from-transparent via-[#f7dcc7]/16 to-transparent md:right-10" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#080611] via-[#080611]/42 to-transparent" />
    </div>
  );
}

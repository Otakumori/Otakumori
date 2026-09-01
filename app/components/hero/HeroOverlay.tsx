export default function HeroOverlay() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[100svh]">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,2,6,0.18),rgba(3,2,6,0.04)_31%,rgba(3,2,6,0.2)_78%,rgba(3,2,6,0.42)),linear-gradient(to_bottom,rgba(5,3,10,0.22),transparent_20%,transparent_62%,rgba(9,5,7,0.66)_94%,rgba(7,4,7,0.82))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_71%_43%,rgba(3,2,6,0.42),transparent_25%),radial-gradient(circle_at_58%_67%,rgba(3,2,6,0.32),transparent_26%),radial-gradient(circle_at_22%_18%,rgba(255,183,209,0.05),transparent_32%)]" />
      <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#080611]/70 via-[#080611]/24 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[18svh] bg-[linear-gradient(to_bottom,transparent,rgba(8,5,7,0.32)_46%,rgba(7,4,7,0.58)_100%)]" />
    </div>
  );
}

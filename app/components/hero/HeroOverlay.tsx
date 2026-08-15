export default function HeroOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,2,6,0.18),rgba(3,2,6,0.04)_31%,rgba(3,2,6,0.2)_78%,rgba(3,2,6,0.42)),linear-gradient(to_bottom,rgba(5,3,10,0.26),transparent_20%,transparent_58%,rgba(9,5,7,0.88)_92%,#080611)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_71%_43%,rgba(3,2,6,0.5),transparent_25%),radial-gradient(circle_at_58%_67%,rgba(3,2,6,0.42),transparent_26%),radial-gradient(circle_at_22%_18%,rgba(255,183,209,0.08),transparent_32%)]" />
      <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#080611]/74 via-[#080611]/28 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[32svh] bg-[linear-gradient(to_bottom,transparent,rgba(12,7,7,0.82)_34%,#070509_88%)]" />
    </div>
  );
}

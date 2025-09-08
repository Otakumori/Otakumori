import { GachaPull } from "../../components/shop/GachaPull";

export default function PetalShopPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-white">Petal Shop</h1>
        <p className="text-zinc-300">Spend your hard-earned petals on exclusive cosmetics</p>
      </div>

      {/* Gacha Section */}
      <GachaPull />
    </div>
  );
}

'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = ProductCard;
const image_1 = __importDefault(require('next/image'));
const card_1 = require('@/components/ui/card');
const button_1 = require('@/components/ui/button');
function ProductCard({ id, name, price, image, category }) {
  return (
    <card_1.Card className="overflow-hidden border-pink-500/30 bg-white/10 transition-colors hover:border-pink-500/50">
      <div className="relative aspect-square">
        <image_1.default
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <card_1.CardContent className="p-4">
        <div className="space-y-1">
          <h3 className="font-semibold text-white">{name}</h3>
          <p className="text-sm text-pink-200">{category}</p>
          <p className="text-lg font-bold text-white">${price}</p>
        </div>
      </card_1.CardContent>
      <card_1.CardFooter className="p-4 pt-0">
        <button_1.Button className="w-full bg-pink-600 hover:bg-pink-700">
          Add to Cart
        </button_1.Button>
      </card_1.CardFooter>
    </card_1.Card>
  );
}

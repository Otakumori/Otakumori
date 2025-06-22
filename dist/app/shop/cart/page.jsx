'use strict';
'use client';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = CartPage;
const CartProvider_1 = require('@/components/cart/CartProvider');
const button_1 = require('@/components/ui/button');
const card_1 = require('@/components/ui/card');
const image_1 = __importDefault(require('next/image'));
const link_1 = __importDefault(require('next/link'));
const lucide_react_1 = require('lucide-react');
function CartPage() {
  const { items, total, updateQuantity, removeItem } = (0, CartProvider_1.useCart)();
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-900 pt-20">
        <div className="container mx-auto px-4 py-16">
          <card_1.Card className="border-pink-500/30 bg-white/10 p-8 text-center backdrop-blur-lg">
            <h1 className="mb-4 text-2xl font-bold text-white">Your Cart is Empty</h1>
            <p className="mb-8 text-pink-200">Add some items to your cart to start shopping</p>
            <link_1.default href="/shop">
              <button_1.Button className="bg-pink-500 hover:bg-pink-600">
                Continue Shopping
              </button_1.Button>
            </link_1.default>
          </card_1.Card>
        </div>
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-900 pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center">
          <link_1.default href="/shop" className="flex items-center text-pink-200 hover:text-white">
            <lucide_react_1.ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </link_1.default>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <card_1.Card className="border-pink-500/30 bg-white/10 p-6 backdrop-blur-lg">
              <h1 className="mb-6 text-2xl font-bold text-white">Shopping Cart</h1>
              <div className="space-y-6">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-6">
                    <div className="relative h-24 w-24">
                      <image_1.default
                        src={item.image}
                        alt={item.name}
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{item.name}</h3>
                      {item.selectedVariant && (
                        <p className="text-sm text-pink-200">{item.selectedVariant.title}</p>
                      )}
                      <p className="text-pink-200">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button_1.Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8 border-pink-500/30 text-pink-200 hover:bg-pink-500/10"
                      >
                        <lucide_react_1.Minus className="h-4 w-4" />
                      </button_1.Button>
                      <span className="w-8 text-center text-white">{item.quantity}</span>
                      <button_1.Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 border-pink-500/30 text-pink-200 hover:bg-pink-500/10"
                      >
                        <lucide_react_1.Plus className="h-4 w-4" />
                      </button_1.Button>
                    </div>
                    <button_1.Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-pink-200 hover:bg-pink-500/10 hover:text-white"
                    >
                      <lucide_react_1.Trash2 className="h-5 w-5" />
                    </button_1.Button>
                  </div>
                ))}
              </div>
            </card_1.Card>
          </div>

          {/* Order Summary */}
          <div>
            <card_1.Card className="border-pink-500/30 bg-white/10 p-6 backdrop-blur-lg">
              <h2 className="mb-6 text-2xl font-bold text-white">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-pink-200">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-pink-200">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-pink-200">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between border-t border-pink-500/30 pt-4 font-semibold text-white">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6">
                <link_1.default href="/shop/checkout">
                  <button_1.Button className="w-full bg-pink-500 hover:bg-pink-600">
                    Proceed to Checkout
                  </button_1.Button>
                </link_1.default>
              </div>
            </card_1.Card>
          </div>
        </div>
      </div>
    </main>
  );
}

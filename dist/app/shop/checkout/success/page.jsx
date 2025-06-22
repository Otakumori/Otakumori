'use strict';
'use client';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = CheckoutSuccessPage;
const react_1 = require('react');
const CartProvider_1 = require('@/components/cart/CartProvider');
const button_1 = require('@/components/ui/button');
const card_1 = require('@/components/ui/card');
const link_1 = __importDefault(require('next/link'));
const lucide_react_1 = require('lucide-react');
function CheckoutSuccessPage() {
  const { clearCart } = (0, CartProvider_1.useCart)();
  (0, react_1.useEffect)(() => {
    // Clear the cart when the success page is loaded
    clearCart();
  }, [clearCart]);
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-900 pt-20">
      <div className="container mx-auto px-4 py-16">
        <card_1.Card className="mx-auto max-w-2xl border-pink-500/30 bg-white/10 p-8 text-center backdrop-blur-lg">
          <div className="mb-6 flex justify-center">
            <lucide_react_1.CheckCircle2 className="h-16 w-16 text-pink-500" />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-white">Order Confirmed!</h1>
          <p className="mb-8 text-pink-200">
            Thank you for your purchase. We've sent a confirmation email with your order details.
            You can track your order status in your account dashboard.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <link_1.default href="/shop">
              <button_1.Button className="w-full bg-pink-500 hover:bg-pink-600 sm:w-auto">
                Continue Shopping
              </button_1.Button>
            </link_1.default>
            <link_1.default href="/account/orders">
              <button_1.Button
                variant="outline"
                className="w-full border-pink-500/30 text-pink-200 hover:bg-pink-500/10 sm:w-auto"
              >
                View Orders
              </button_1.Button>
            </link_1.default>
          </div>
        </card_1.Card>
      </div>
    </main>
  );
}

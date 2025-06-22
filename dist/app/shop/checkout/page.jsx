'use strict';
'use client';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = CheckoutPage;
const react_1 = require('react');
const CartProvider_1 = require('@/components/cart/CartProvider');
const button_1 = require('@/components/ui/button');
const card_1 = require('@/components/ui/card');
const input_1 = require('@/components/ui/input');
const image_1 = __importDefault(require('next/image'));
const link_1 = __importDefault(require('next/link'));
const lucide_react_1 = require('lucide-react');
function CheckoutPage() {
  const { items, total, clearCart } = (0, CartProvider_1.useCart)();
  const [shippingInfo, setShippingInfo] = (0, react_1.useState)({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const handleInputChange = e => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async e => {
    e.preventDefault();
    // TODO: Implement payment processing and order creation
    console.log('Processing order...', { items, shippingInfo });
    // clearCart();
  };
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-900 pt-20">
        <div className="container mx-auto px-4 py-16">
          <card_1.Card className="border-pink-500/30 bg-white/10 p-8 text-center backdrop-blur-lg">
            <h1 className="mb-4 text-2xl font-bold text-white">Your Cart is Empty</h1>
            <p className="mb-8 text-pink-200">Add some items to your cart to proceed to checkout</p>
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
          <link_1.default href="/cart" className="flex items-center text-pink-200 hover:text-white">
            <lucide_react_1.ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </link_1.default>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Shipping Form */}
          <div>
            <card_1.Card className="border-pink-500/30 bg-white/10 p-6 backdrop-blur-lg">
              <h2 className="mb-6 text-2xl font-bold text-white">Shipping Information</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm text-pink-200">First Name</label>
                    <input_1.Input
                      type="text"
                      name="firstName"
                      value={shippingInfo.firstName}
                      onChange={handleInputChange}
                      required
                      className="border-pink-500/30 bg-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-pink-200">Last Name</label>
                    <input_1.Input
                      type="text"
                      name="lastName"
                      value={shippingInfo.lastName}
                      onChange={handleInputChange}
                      required
                      className="border-pink-500/30 bg-white/10 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-pink-200">Email</label>
                  <input_1.Input
                    type="email"
                    name="email"
                    value={shippingInfo.email}
                    onChange={handleInputChange}
                    required
                    className="border-pink-500/30 bg-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-pink-200">Address</label>
                  <input_1.Input
                    type="text"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    required
                    className="border-pink-500/30 bg-white/10 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm text-pink-200">City</label>
                    <input_1.Input
                      type="text"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      required
                      className="border-pink-500/30 bg-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-pink-200">State</label>
                    <input_1.Input
                      type="text"
                      name="state"
                      value={shippingInfo.state}
                      onChange={handleInputChange}
                      required
                      className="border-pink-500/30 bg-white/10 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm text-pink-200">ZIP Code</label>
                    <input_1.Input
                      type="text"
                      name="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={handleInputChange}
                      required
                      className="border-pink-500/30 bg-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-pink-200">Country</label>
                    <input_1.Input
                      type="text"
                      name="country"
                      value={shippingInfo.country}
                      onChange={handleInputChange}
                      required
                      className="border-pink-500/30 bg-white/10 text-white"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button_1.Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600">
                    <lucide_react_1.Lock className="mr-2 h-4 w-4" />
                    Pay ${total.toFixed(2)}
                  </button_1.Button>
                </div>
              </form>
            </card_1.Card>
          </div>

          {/* Order Summary */}
          <div>
            <card_1.Card className="border-pink-500/30 bg-white/10 p-6 backdrop-blur-lg">
              <h2 className="mb-6 text-2xl font-bold text-white">Order Summary</h2>
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative h-20 w-20">
                      <image_1.default
                        src={item.image}
                        alt={item.name}
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{item.name}</h3>
                      <p className="text-pink-200">Quantity: {item.quantity}</p>
                      <p className="text-pink-200">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2 border-t border-pink-500/30 pt-6">
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
                <div className="flex justify-between border-t border-pink-500/30 pt-2 font-semibold text-white">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </card_1.Card>
          </div>
        </div>
      </div>
    </main>
  );
}

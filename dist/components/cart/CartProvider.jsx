'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.CartProvider = exports.useCart = void 0;
const react_1 = __importStar(require('react'));
const CartContext = (0, react_1.createContext)(undefined);
const useCart = () => {
  const ctx = (0, react_1.useContext)(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};
exports.useCart = useCart;
const CartProvider = ({ children }) => {
  const [cart, setCart] = (0, react_1.useState)([]);
  const [isOpen, setIsOpen] = (0, react_1.useState)(false);
  const addToCart = item => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
    setIsOpen(true);
  };
  const removeFromCart = id => {
    setCart(prev => prev.filter(item => item.id !== id));
  };
  const clearCart = () => setCart([]);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, isOpen, openCart, closeCart }}
    >
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
};
exports.CartProvider = CartProvider;
// Aesthetic Cart Drawer
const CartDrawer = () => {
  const { cart, isOpen, closeCart, removeFromCart, clearCart } = (0, exports.useCart)();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return (
    <div
      className={`fixed right-0 top-0 z-50 h-full w-96 max-w-full transform border-l border-pink-200 bg-gradient-to-br from-pink-100/90 to-purple-200/90 shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} backdrop-blur-lg`}
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="flex items-center justify-between border-b border-pink-200 px-6 py-4">
        <h2 className="text-2xl font-bold tracking-tight text-pink-600 drop-shadow">
          🛒 Your Cart
        </h2>
        <button
          onClick={closeCart}
          className="text-2xl text-pink-400 hover:text-pink-600 focus:outline-none"
          aria-label="Close cart"
        >
          &times;
        </button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
        {cart.length === 0 ? (
          <div className="mt-16 text-center text-pink-400">
            <span className="mb-2 block animate-bounce text-5xl">🌸</span>
            <p className="text-lg font-medium">Your cart is empty!</p>
            <p className="text-sm text-pink-300">Add some cute merch~</p>
          </div>
        ) : (
          cart.map(item => (
            <div
              key={item.id}
              className="group flex items-center rounded-xl bg-white/80 p-3 shadow transition hover:shadow-lg"
            >
              <img
                src={item.image}
                alt={item.name}
                className="mr-4 h-16 w-16 rounded-lg border-2 border-pink-200 object-cover shadow-sm"
              />
              <div className="flex-1">
                <div className="font-semibold text-pink-700 transition group-hover:text-pink-900">
                  {item.name}
                </div>
                <div className="text-sm text-pink-400">
                  ${item.price.toFixed(2)} × {item.quantity}
                </div>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="ml-2 text-xl text-pink-300 transition hover:text-pink-600"
                aria-label="Remove item"
              >
                &times;
              </button>
            </div>
          ))
        )}
      </div>
      <div className="border-t border-pink-200 bg-white/70 px-6 py-4">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-lg font-semibold text-pink-700">Total:</span>
          <span className="text-xl font-bold text-pink-600">${total.toFixed(2)}</span>
        </div>
        <button
          onClick={clearCart}
          className="mb-2 w-full rounded-lg bg-gradient-to-r from-pink-400 to-purple-400 py-2 font-bold text-white shadow transition hover:from-pink-500 hover:to-purple-500"
        >
          Clear Cart
        </button>
        <button className="w-full rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 py-2 font-bold text-white shadow-lg transition hover:from-pink-600 hover:to-purple-600">
          Checkout
        </button>
      </div>
    </div>
  );
};

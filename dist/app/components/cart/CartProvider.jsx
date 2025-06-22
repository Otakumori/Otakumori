'use strict';
'use client';
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
exports.CartProvider = CartProvider;
exports.useCart = useCart;
const react_1 = __importStar(require('react'));
const CartContext = (0, react_1.createContext)(undefined);
function CartProvider({ children }) {
  const [items, setItems] = (0, react_1.useState)([]);
  const [total, setTotal] = (0, react_1.useState)(0);
  const [itemCount, setItemCount] = (0, react_1.useState)(0);
  (0, react_1.useEffect)(() => {
    // Load cart from localStorage on mount
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setItems(parsedCart);
      updateTotals(parsedCart);
    }
  }, []);
  (0, react_1.useEffect)(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem('cart', JSON.stringify(items));
    updateTotals(items);
  }, [items]);
  const updateTotals = cartItems => {
    const newTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    setTotal(newTotal);
    setItemCount(newItemCount);
  };
  const addItem = newItem => {
    setItems(currentItems => {
      const existingItem = currentItems.find(
        item =>
          item.id === newItem.id &&
          (!item.selectedVariant ||
            !newItem.selectedVariant ||
            item.selectedVariant.id === newItem.selectedVariant.id)
      );
      if (existingItem) {
        return currentItems.map(item =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...currentItems, newItem];
    });
  };
  const removeItem = id => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  };
  const updateQuantity = (id, quantity) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }
    setItems(currentItems =>
      currentItems.map(item => (item.id === id ? { ...item, quantity } : item))
    );
  };
  const clearCart = () => {
    setItems([]);
    setTotal(0);
    setItemCount(0);
    localStorage.removeItem('cart');
  };
  return (
    <CartContext.Provider
      value={{
        items,
        total,
        itemCount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
function useCart() {
  const context = (0, react_1.useContext)(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

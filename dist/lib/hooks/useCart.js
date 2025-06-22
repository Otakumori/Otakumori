'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.useCart = useCart;
const react_1 = require('react');
function useCart() {
  const [cart, setCart] = (0, react_1.useState)([]);
  (0, react_1.useEffect)(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);
  (0, react_1.useEffect)(() => {
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  const addToCart = product => {
    setCart(prevCart => {
      const existingItem = prevCart.find(
        item => item.id === product.id && item.selectedVariant.id === product.selectedVariant.id
      );
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id && item.selectedVariant.id === product.selectedVariant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevCart,
        {
          id: product.id,
          title: product.title,
          images: product.images,
          selectedVariant: product.selectedVariant,
          quantity: 1,
        },
      ];
    });
  };
  const removeFromCart = productId => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };
  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item => (item.id === productId ? { ...item, quantity } : item))
    );
  };
  const clearCart = () => {
    setCart([]);
  };
  const getTotal = () => {
    return cart.reduce((total, item) => total + item.selectedVariant.price * item.quantity, 0);
  };
  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
  };
}

'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.useWishlist = useWishlist;
const react_1 = require('react');
function useWishlist() {
  const [wishlist, setWishlist] = (0, react_1.useState)([]);
  (0, react_1.useEffect)(() => {
    // Load wishlist from localStorage
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, []);
  (0, react_1.useEffect)(() => {
    // Save wishlist to localStorage
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);
  const addToWishlist = product => {
    setWishlist(prevWishlist => {
      if (prevWishlist.some(item => item.id === product.id)) {
        return prevWishlist;
      }
      return [
        ...prevWishlist,
        {
          id: product.id,
          title: product.title,
          price: product.variants[0].price,
          image: product.images[0],
        },
      ];
    });
  };
  const removeFromWishlist = productId => {
    setWishlist(prevWishlist => prevWishlist.filter(item => item.id !== productId));
  };
  const isInWishlist = productId => {
    return wishlist.some(item => item.id === productId);
  };
  const clearWishlist = () => {
    setWishlist([]);
  };
  return {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
  };
}

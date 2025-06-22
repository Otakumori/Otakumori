'use strict';
'use client';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = ProductPage;
const react_1 = require('react');
const image_1 = __importDefault(require('next/image'));
const navigation_1 = require('next/navigation');
const framer_motion_1 = require('framer-motion');
const lucide_react_1 = require('lucide-react');
const useCart_1 = require('@/lib/hooks/useCart');
const useWishlist_1 = require('@/lib/hooks/useWishlist');
const link_1 = __importDefault(require('next/link'));
function ProductPage() {
  const params = (0, navigation_1.useParams)();
  const productId = params?.id;
  const [product, setProduct] = (0, react_1.useState)(null);
  const [loading, setLoading] = (0, react_1.useState)(true);
  const [error, setError] = (0, react_1.useState)(null);
  const [selectedVariant, setSelectedVariant] = (0, react_1.useState)(0);
  const [quantity, setQuantity] = (0, react_1.useState)(1);
  const { addToCart } = (0, useCart_1.useCart)();
  const { addToWishlist, removeFromWishlist, isInWishlist } = (0, useWishlist_1.useWishlist)();
  (0, react_1.useEffect)(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/shop/products/${productId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.statusText}`);
        }
        const data = await response.json();
        if (!data.product) {
          throw new Error('Product not found');
        }
        setProduct(data.product);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    if (productId) {
      fetchProduct();
    }
  }, [productId]);
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }
  if (error || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-red-600">Error</h2>
          <p className="mb-6 text-gray-600">{error || 'Product not found'}</p>
          <link_1.default
            href="/shop"
            className="inline-block rounded bg-pink-500 px-6 py-3 text-white transition-colors hover:bg-pink-600"
          >
            Back to Shop
          </link_1.default>
        </div>
      </div>
    );
  }
  const handleAddToCart = () => {
    addToCart({
      ...product,
      selectedVariant: product.variants[selectedVariant],
    });
  };
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <link_1.default
          href="/shop"
          className="mb-8 inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <lucide_react_1.ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </link_1.default>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-4">
            <framer_motion_1.motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-square overflow-hidden rounded-lg bg-white shadow-lg"
            >
              <image_1.default
                src={product.images[0]}
                alt={product.title}
                fill
                className="object-cover"
              />
            </framer_motion_1.motion.div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.slice(1).map((image, index) => (
                <framer_motion_1.motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative aspect-square overflow-hidden rounded-lg bg-white shadow"
                >
                  <image_1.default
                    src={image}
                    alt={`${product.title} - Image ${index + 2}`}
                    fill
                    className="object-cover"
                  />
                </framer_motion_1.motion.div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <framer_motion_1.motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
              <p className="mt-2 text-lg text-gray-600">{product.description}</p>
            </div>

            {/* Price */}
            <div className="text-2xl font-bold text-pink-500">
              ${(product.variants[selectedVariant].price / 100).toFixed(2)}
            </div>

            {/* Variants */}
            {product.variants.length > 1 && (
              <div>
                <h3 className="mb-2 font-medium text-gray-900">Select Variant</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, index) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(index)}
                      className={`rounded-lg px-4 py-2 ${
                        selectedVariant === index
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {variant.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="mb-2 font-medium text-gray-900">Quantity</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded-lg bg-gray-100 px-3 py-1 hover:bg-gray-200"
                >
                  -
                </button>
                <span className="w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="rounded-lg bg-gray-100 px-3 py-1 hover:bg-gray-200"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center space-x-2 rounded-lg bg-pink-500 px-6 py-3 text-white hover:bg-pink-600"
              >
                <lucide_react_1.ShoppingCart className="h-5 w-5" />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={() =>
                  isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)
                }
                className="rounded-lg border border-gray-300 p-3 hover:bg-gray-50"
              >
                <lucide_react_1.Heart
                  className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-pink-500 text-pink-500' : 'text-gray-600'}`}
                />
              </button>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </framer_motion_1.motion.div>
        </div>
      </div>
    </main>
  );
}

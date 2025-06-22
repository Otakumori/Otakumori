'use strict';
'use client';
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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const react_1 = __importStar(require('react'));
const framer_motion_1 = require('framer-motion');
const image_1 = __importDefault(require('next/image'));
const CartProvider_1 = require('@/components/cart/CartProvider');
const button_1 = require('@/components/ui/button');
const card_1 = require('@/components/ui/card');
const input_1 = require('@/components/ui/input');
const select_1 = require('@/components/ui/select');
const lucide_react_1 = require('lucide-react');
// Mock product data (replace with your actual data fetching logic)
const mockProducts = [
  {
    id: 1,
    name: 'Anime Figure - Sakura',
    price: 49.99,
    image: '/assets/products/figure1.jpg',
    category: 'Figures',
    tags: ['sakura', 'figure', 'anime'],
  },
  {
    id: 2,
    name: 'Premium Manga Collection',
    price: 29.99,
    image: '/assets/products/manga1.jpg',
    category: 'Manga',
    tags: ['manga', 'collection'],
  },
  {
    id: 3,
    name: 'Anime Art Print',
    price: 19.99,
    image: '/assets/products/art1.jpg',
    category: 'Art',
    tags: ['art', 'print'],
  },
  {
    id: 4,
    name: 'Cosplay Costume - Hero',
    price: 89.99,
    image: '/assets/products/cosplay1.jpg',
    category: 'Cosplay',
    tags: ['cosplay', 'hero'],
  },
];
const categories = ['All', ...Array.from(new Set(mockProducts.map(product => product.category)))];
const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];
const ShopPage = () => {
  const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
  const [selectedCategory, setSelectedCategory] = (0, react_1.useState)('All');
  const [sortBy, setSortBy] = (0, react_1.useState)('popular');
  const { addItem } = (0, CartProvider_1.useCart)();
  const filteredProducts = (0, react_1.useMemo)(() => {
    return mockProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-900 pt-20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold text-white">Shop</h1>
          <p className="text-pink-200">Discover our collection of anime merchandise</p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="relative">
              <lucide_react_1.Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-pink-200" />
              <input_1.Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="border-pink-500/30 bg-white/10 pl-10 text-white placeholder-pink-200"
              />
            </div>
          </div>
          <select_1.Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="border-pink-500/30 bg-white/10 text-white"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select_1.Select>
          <select_1.Select
            value={sortBy}
            onValueChange={setSortBy}
            className="border-pink-500/30 bg-white/10 text-white"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select_1.Select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map(product => (
            <framer_motion_1.motion.div
              key={product.id}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <card_1.Card className="overflow-hidden border-pink-500/30 bg-white/10 backdrop-blur-lg">
                <div className="relative h-64">
                  <image_1.default
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  {product.tags.includes('New') && (
                    <div className="absolute right-2 top-2 rounded bg-pink-500 px-2 py-1 text-xs text-white">
                      New
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-sm text-pink-400">{product.category}</span>
                  <h3 className="mt-1 text-lg font-semibold text-white">{product.name}</h3>
                  <p className="mt-2 text-pink-200">${product.price}</p>
                  <button_1.Button
                    className="mt-4 w-full bg-pink-500 hover:bg-pink-600"
                    onClick={() => addItem(product)}
                  >
                    <lucide_react_1.ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </button_1.Button>
                </div>
              </card_1.Card>
            </framer_motion_1.motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-lg text-pink-200">No products found matching your criteria</p>
          </div>
        )}
      </div>
    </main>
  );
};
exports.default = ShopPage;

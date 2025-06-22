'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = ProductFilters;
const react_1 = require('react');
const button_1 = require('@/components/ui/button');
const input_1 = require('@/components/ui/input');
const label_1 = require('@/components/ui/label');
const slider_1 = require('@/components/ui/slider');
const navigation_1 = require('next/navigation');
function ProductFilters({ onFilterChange }) {
  const router = (0, navigation_1.useRouter)();
  const searchParams = (0, navigation_1.useSearchParams)();
  const [priceRange, setPriceRange] = (0, react_1.useState)([0, 100]);
  const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
  const [selectedCategory, setSelectedCategory] = (0, react_1.useState)(null);
  (0, react_1.useEffect)(() => {
    // Initialize filters from URL params
    const search = searchParams.get('search') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const category = searchParams.get('category');
    setSearchQuery(search);
    if (minPrice && maxPrice) {
      setPriceRange([Number(minPrice), Number(maxPrice)]);
    }
    setSelectedCategory(category);
  }, [searchParams]);
  const handlePriceChange = value => {
    setPriceRange(value);
    updateFilters(value, searchQuery, selectedCategory);
  };
  const handleSearch = e => {
    const value = e.target.value;
    setSearchQuery(value);
    updateFilters(priceRange, value, selectedCategory);
  };
  const handleCategoryClick = category => {
    const newCategory = selectedCategory === category ? null : category;
    setSelectedCategory(newCategory);
    updateFilters(priceRange, searchQuery, newCategory);
  };
  const updateFilters = (priceRange, search, category) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString());
    if (priceRange[1] < 100) params.set('maxPrice', priceRange[1].toString());
    if (category) params.set('category', category);
    router.push(`/shop?${params.toString()}`);
    onFilterChange({ search, priceRange, category });
  };
  return (
    <div className="space-y-6">
      <div>
        <label_1.Label htmlFor="search" className="mb-2 block text-white">
          Search Products
        </label_1.Label>
        <input_1.Input
          id="search"
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearch}
          className="border-pink-500/30 bg-white/20 text-white placeholder:text-pink-200"
        />
      </div>

      <div>
        <label_1.Label className="mb-2 block text-white">Price Range</label_1.Label>
        <slider_1.Slider
          value={priceRange}
          onValueChange={handlePriceChange}
          min={0}
          max={100}
          step={1}
          className="mb-2"
        />
        <div className="flex justify-between text-pink-200">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      <div>
        <label_1.Label className="mb-2 block text-white">Categories</label_1.Label>
        <div className="space-y-2">
          {['Apparel', 'Accessories', 'Figures', 'Art Prints'].map(category => (
            <button_1.Button
              key={category}
              variant="ghost"
              className={`w-full justify-start ${
                selectedCategory === category
                  ? 'bg-pink-500/20 text-white'
                  : 'text-pink-200 hover:bg-pink-500/20 hover:text-white'
              }`}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </button_1.Button>
          ))}
        </div>
      </div>

      <button_1.Button
        className="w-full bg-pink-600 hover:bg-pink-700"
        onClick={() => {
          setSearchQuery('');
          setPriceRange([0, 100]);
          setSelectedCategory(null);
          router.push('/shop');
          onFilterChange({ search: '', priceRange: [0, 100], category: null });
        }}
      >
        Reset Filters
      </button_1.Button>
    </div>
  );
}

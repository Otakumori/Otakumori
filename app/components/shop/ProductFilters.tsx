import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useRouter, useSearchParams } from 'next/navigation';

interface ProductFiltersProps {
  onFilterChange: (filters: {
    search: string;
    priceRange: number[];
    category: string | null;
  }) => void;
}

export default function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
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

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    updateFilters(value, searchQuery, selectedCategory);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    updateFilters(priceRange, value, selectedCategory);
  };

  const handleCategoryClick = (category: string) => {
    const newCategory = selectedCategory === category ? null : category;
    setSelectedCategory(newCategory);
    updateFilters(priceRange, searchQuery, newCategory);
  };

  const updateFilters = (priceRange: number[], search: string, category: string | null) => {
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
        <Label htmlFor="search" className="text-white mb-2 block">
          Search Products
        </Label>
        <Input
          id="search"
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearch}
          className="bg-white/20 border-pink-500/30 text-white placeholder:text-pink-200"
        />
      </div>

      <div>
        <Label className="text-white mb-2 block">
          Price Range
        </Label>
        <Slider
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
        <Label className="text-white mb-2 block">
          Categories
        </Label>
        <div className="space-y-2">
          {['Apparel', 'Accessories', 'Figures', 'Art Prints'].map((category) => (
            <Button
              key={category}
              variant="ghost"
              className={`w-full justify-start ${
                selectedCategory === category
                  ? 'bg-pink-500/20 text-white'
                  : 'text-pink-200 hover:text-white hover:bg-pink-500/20'
              }`}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <Button 
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
      </Button>
    </div>
  );
} 
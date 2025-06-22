'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.GET = GET;
const server_1 = require('next/server');
// Mock database
const products = [
  {
    id: '1',
    name: 'Anime T-Shirt',
    price: 29.99,
    image: '/images/products/placeholder.svg',
    category: 'Apparel',
    description: 'High-quality anime-themed t-shirt made from 100% cotton.',
    stock: 50,
  },
  {
    id: '2',
    name: 'Manga Keychain',
    price: 9.99,
    image: '/images/products/placeholder.svg',
    category: 'Accessories',
    description: 'Cute manga character keychain, perfect for your keys or bag.',
    stock: 100,
  },
  {
    id: '3',
    name: 'Figure Collection',
    price: 49.99,
    image: '/images/products/placeholder.svg',
    category: 'Figures',
    description: 'Detailed anime figure from your favorite series.',
    stock: 25,
  },
  {
    id: '4',
    name: 'Art Print',
    price: 19.99,
    image: '/images/products/placeholder.svg',
    category: 'Art Prints',
    description: 'High-quality art print featuring popular anime artwork.',
    stock: 75,
  },
];
async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const search = searchParams.get('search');
  let filteredProducts = [...products];
  // Apply filters
  if (category) {
    filteredProducts = filteredProducts.filter(product => product.category === category);
  }
  if (minPrice) {
    filteredProducts = filteredProducts.filter(product => product.price >= Number(minPrice));
  }
  if (maxPrice) {
    filteredProducts = filteredProducts.filter(product => product.price <= Number(maxPrice));
  }
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter(
      product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
    );
  }
  return server_1.NextResponse.json(filteredProducts);
}

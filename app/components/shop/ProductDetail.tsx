'use client';

import { useState } from 'react';
import Image from 'next/image';
import GlassPanel from '../GlassPanel';
import { useCart } from '@/app/components/cart/CartProvider';

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  description?: string;
  variants?: Array<{
    id: string;
    name: string;
    price: number;
    inStock: boolean;
  }>;
  images?: string[];
  inStock?: boolean;
  category?: string;
};

type ProductDetailProps = {
  product: Product;
};

export default function ProductDetail({ product }: ProductDetailProps) {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [added, setAdded] = useState(false);

  const images =
    product.images && product.images.length > 0
      ? product.images.filter((img) => img && !img.includes('placeholder') && !img.includes('seed:') && img.trim() !== '')
      : product.image && !product.image.includes('placeholder') && !product.image.includes('seed:') && product.image.trim() !== ''
        ? [product.image]
        : [];
  
  // Don't render if no valid images
  if (images.length === 0) {
    return null;
  }
  const currentPrice = selectedVariant?.price || product.price;
  const isInStock = selectedVariant?.inStock ?? product.inStock ?? true;

  const handleAddToCart = async () => {
    if (!isInStock) return;
    setIsAddingToCart(true);
    try {
      const imageUrl = images[0];
      if (!imageUrl) return;
      const cartItem = {
        id: product.id,
        name: product.name,
        price: currentPrice,
        quantity,
        image: imageUrl,
        ...(selectedVariant
          ? { selectedVariant: { id: selectedVariant.id, title: selectedVariant.name } }
          : {}),
      };
      addItem(cartItem);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2" data-testid="product-details">
      {/* Image Gallery */}
      <div className="space-y-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
          <Image
            src={images[selectedImage] ?? images[0]}
            alt={product.name}
            fill
            sizes="(max-width:1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>

        {images && images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images?.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative aspect-square overflow-hidden rounded-xl transition-opacity ${
                  selectedImage === index
                    ? 'ring-2 ring-fuchsia-400'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={image}
                  alt={`${product.name} view ${index + 1}`}
                  fill
                  sizes="(max-width:1024px) 25vw, 12.5vw"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white md:text-4xl" data-testid="product-name">
            {product.name}
          </h1>
          <p className="mt-2 text-2xl font-semibold text-fuchsia-300" data-testid="product-price">
            ${currentPrice}
          </p>
          {product.category && (
            <p className="mt-1 text-sm text-zinc-400">Category: {product.category}</p>
          )}
        </div>

        {/* Variants */}
        {product.variants && product.variants.length > 1 && (
          <div>
            <h3 className="mb-3 text-lg font-semibold text-white">Options</h3>
            <div className="grid grid-cols-2 gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    selectedVariant?.id === variant.id
                      ? 'border-fuchsia-400 bg-fuchsia-400/10 text-fuchsia-300'
                      : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  <div className="font-medium">{variant.name}</div>
                  <div className="text-sm text-zinc-400">${variant.price}</div>
                  {!variant.inStock && <div className="text-xs text-red-400">Out of Stock</div>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div>
          <div className="mb-2 block text-sm font-medium text-white">Quantity</div>
          <div className="flex items-center gap-2" role="group" aria-label="Quantity selector">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white hover:bg-white/10"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="w-12 text-center text-white" aria-live="polite">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white hover:bg-white/10"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={!isInStock || isAddingToCart}
          className={`w-full rounded-xl px-6 py-4 font-semibold transition-colors ${
            isInStock && !isAddingToCart
              ? 'bg-gradient-to-r from-primary to-accent text-white hover:from-primary-hover hover:to-accent-hover'
              : 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
          }`}
          data-testid="add-to-cart"
        >
          {isAddingToCart ? 'Adding...' : isInStock ? 'Add to Cart' : 'Out of Stock'}
        </button>

        {added && (
          <div className="text-sm text-green-300" data-testid="cart-success">
            Added to cart!
          </div>
        )}

        {/* Description */}
        {product.description && (
          <GlassPanel className="p-4">
            <h3 className="mb-3 text-lg font-semibold text-white">Description</h3>
            <p className="text-zinc-300 leading-relaxed">{product.description}</p>
          </GlassPanel>
        )}

        {/* Care Instructions */}
        <GlassPanel className="p-4">
          <h3 className="mb-3 text-lg font-semibold text-white">Care Instructions</h3>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li>• Machine wash cold with like colors</li>
            <li>• Tumble dry low heat</li>
            <li>• Do not bleach</li>
            <li>• Iron on low heat if needed</li>
          </ul>
        </GlassPanel>
      </div>
    </div>
  );
}

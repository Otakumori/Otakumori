'use client';
import { type Product } from '@/lib/z';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg opacity-70">No products found. Try adjusting your search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="group relative bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 hover:border-pink-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10"
        >
          <div className="aspect-square bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl mb-4 flex items-center justify-center">
            {product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="text-4xl opacity-50">
                <span role="img" aria-label="Gaming controller">
                  🎮
                </span>
              </div>
            )}
          </div>

          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-pink-200 transition-colors">
            {product.title}
          </h3>

          <p className="text-sm opacity-70 mb-4 line-clamp-2">{product.description}</p>

          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-pink-400">${product.price.toFixed(2)}</span>

            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                  In Stock ({product.stock})
                </span>
              ) : (
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span key={tag} className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>

          <button className="w-full mt-4 bg-pink-500 hover:bg-pink-600 text-black font-semibold py-2 px-4 rounded-xl transition-colors duration-200">
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}

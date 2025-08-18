import { prisma } from "@/app/lib/prisma";
import ReviewForm from "@/components/reviews/ReviewForm";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  title: string;
  description: string;
  images: string[];
  variants: {
    id: string;
    price: number;
    title: string;
  }[];
  tags: string[];
}

interface ProductParams {
  id: string;
}

export default async function ProductPage({ params }: { params: ProductParams }) {
  const { id } = params;

  // Fetch product data (you'll need to implement this based on your actual data structure)
  // For now, I'll use a placeholder - you should replace this with your actual product fetching logic
  const product: Product = {
    id,
    title: "Sample Product",
    description: "This is a sample product description",
    images: ["/images/placeholder.jpg"],
    variants: [{ id: "1", price: 2500, title: "Default" }],
    tags: ["sample", "product"]
  };

  // Fetch reviews for this product
  const reviews = await prisma.productReview.findMany({
    where: { productId: id, isApproved: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const { userId } = auth(); // to decide if we show the form

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-red-600">Error</h2>
          <p className="mb-6 text-gray-600">Product not found</p>
          <Link
            href="/shop"
            className="inline-block rounded bg-pink-500 px-6 py-3 text-white transition-colors hover:bg-pink-600"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link
          href="/shop"
          className="mb-8 inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-white shadow-lg">
              <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.slice(1).map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-lg bg-white shadow"
                >
                  <Image
                    src={image}
                    alt={`${product.title} - Image ${index + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
              <p className="mt-2 text-lg text-gray-600">{product.description}</p>
            </div>

            {/* Price */}
            <div className="text-2xl font-bold text-pink-500">
              ${(product.variants[0].price / 100).toFixed(2)}
            </div>

            {/* Variants */}
            {product.variants.length > 1 && (
              <div>
                <h3 className="mb-2 font-medium text-gray-900">Select Variant</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, index) => (
                    <button
                      key={variant.id}
                      className="rounded-lg px-4 py-2 bg-gray-100 text-gray-900 hover:bg-gray-200"
                    >
                      {variant.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-4">
              <button className="flex flex-1 items-center justify-center space-x-2 rounded-lg bg-pink-500 px-6 py-3 text-white hover:bg-pink-600">
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart</span>
              </button>
              <button className="rounded-lg border border-gray-300 p-3 hover:bg-gray-50">
                <Heart className="h-5 w-5 text-gray-600" />
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
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-12 space-y-6">
          <h2 className="text-xl font-semibold">Customer Reviews</h2>

          {userId ? (
            <ReviewForm productId={id} />
          ) : (
            <p className="text-sm text-zinc-400">Sign in to write a review.</p>
          )}

          <ul className="space-y-6">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-2xl border border-zinc-800/60 p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{r.title ?? "Review"}</div>
                  <div className="text-sm text-yellow-400">{r.rating} ★</div>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-200">{r.body}</p>

                {r.imageUrls.length > 0 && (
                  <div className="mt-3 flex gap-3">
                    {r.imageUrls.map((url) => (
                      <div key={url} className="relative h-24 w-24 overflow-hidden rounded-lg border border-zinc-700">
                        <Image src={url} alt="review photo" fill sizes="96px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-2 text-xs text-zinc-500">
                  {new Date(r.createdAt).toLocaleString()}
                </div>
              </li>
            ))}
            {reviews.length === 0 && <li className="text-sm text-zinc-500">No reviews yet.</li>}
          </ul>
        </section>
      </div>
    </main>
  );
}

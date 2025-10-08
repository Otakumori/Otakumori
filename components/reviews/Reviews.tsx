'use client';

import React from 'react';
import Image from 'next/image';
import { Star, Camera } from 'lucide-react';

interface ReviewImage {
  url: string;
  alt: string;
}

interface Review {
  id: string;
  userId: string;
  rating: number;
  title?: string;
  body?: string;
  images: ReviewImage[];
  createdAt: string;
}

interface ReviewsProps {
  reviews: Review[];
  productId: string;
}

export default function Reviews({ reviews, productId: _productId }: ReviewsProps) {
  if (reviews.length === 0) {
    return (
      <section className="mt-8" aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="text-2xl font-semibold mb-4">
          Customer Reviews
        </h2>
        <p className="text-white/60">No reviews yet. Be the first to review this product!</p>
      </section>
    );
  }

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const ratingCount = reviews.length;

  return (
    <section className="mt-8" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="text-2xl font-semibold mb-4">
        Customer Reviews
      </h2>

      {/* Rating Summary */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-black/20 rounded-lg border border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(averageRating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-white/30'
                }`}
              />
            ))}
          </div>
          <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
        </div>
        <span className="text-white/60">
          Based on {ratingCount} review{ratingCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="p-4 bg-black/20 rounded-lg border border-white/10"
            aria-labelledby={`review-${review.id}-title`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                {review.title && (
                  <h3 id={`review-${review.id}-title`} className="font-semibold mb-1">
                    {review.title}
                  </h3>
                )}
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating ? 'text-yellow-400 fill-current' : 'text-white/30'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-white/60">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {review.body && <p className="text-white/80 mb-4 leading-relaxed">{review.body}</p>}

            {/* Review Images */}
            {review.images.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="w-4 h-4 text-white/60" />
                  <span className="text-sm text-white/60">
                    {review.images.length} photo{review.images.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {review.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden bg-white/5"
                    >
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

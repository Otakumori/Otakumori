/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { Suspense } from 'react';
import BlogIndex from './BlogIndex';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">Otaku-mori Blog</h1>
          <p className="text-lg text-gray-300">
            Discover the latest insights, stories, and community highlights
          </p>
        </div>
        
        <Suspense fallback={
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        }>
          <BlogIndex />
        </Suspense>
      </div>
    </div>
  );
}
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Welcome to Otakumori
        </h1>
        <p className="text-center text-gray-600 text-lg">
          Your anime and gaming community awaits
        </p>
      </div>
    </main>
  );
}

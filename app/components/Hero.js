/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import CherryBlossomEffect from './CherryBlossomEffect';

export default function Hero() {
  const [collected, setCollected] = useState(0);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      setUserId(user.id);
      fetchPetalData();
    }
  }, [user, isLoaded]);

  const fetchPetalData = async () => {
    try {
      const response = await fetch('/api/petals');
      if (response.ok) {
        const result = await response.json();
        setCollected(result.data?.user?.petalBalance || 0);
      }
    } catch (error) {
      console.error('Error fetching petal data:', error);
    }
  };

  const handlePetalClick = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/petals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 1,
          reason: 'cherry_blossom_click',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setCollected(result.data.newBalance);
        // Add visual feedback
        const petal = document.createElement('div');
        petal.className = 'absolute text-2xl animate-bounce pointer-events-none';
        petal.textContent = '🌸';
        petal.style.left = Math.random() * window.innerWidth + 'px';
        petal.style.top = Math.random() * window.innerHeight + 'px';
        document.body.appendChild(petal);
        
        setTimeout(() => {
          document.body.removeChild(petal);
        }, 2000);
      }
    } catch (error) {
      console.error('Error collecting petal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden">
      {/* Background Image */}
      <Image
        src="/assets/cherry.jpg"
        alt="Cherry Blossom"
        fill
        style={{ objectFit: 'cover' }}
        className="z-0"
      />

      {/* Petal Animation */}
      <CherryBlossomEffect />

      {/* Petal Count Bar */}
      <div className="absolute bottom-10 rounded-lg bg-black/80 p-3 text-white shadow-lg">
        <div className="text-center">
          <div className="text-lg font-semibold">Community Petals Collected</div>
          <div className="text-2xl font-bold text-pink-400">{collected.toLocaleString()} / 10,000</div>
        </div>
      </div>

      {/* CTA */}
      <div className="absolute top-10 animate-pulse text-3xl text-white text-center">
        <div className="mb-4">Click the petals to collect rewards!</div>
        <button
          onClick={handlePetalClick}
          disabled={loading}
          className="px-6 py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-800 rounded-lg text-white font-semibold transition-colors disabled:cursor-not-allowed"
        >
          {loading ? 'Collecting...' : '🌸 Click to Collect 🌸'}
        </button>
      </div>
    </section>
  );
}

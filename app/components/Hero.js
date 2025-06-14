'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import CherryBlossomEffect from './CherryBlossomEffect';

// Setup Supabase
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Hero() {
  const [collected, setCollected] = useState(0);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      const { data: session } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        const { data, error } = await supabase
          .from('users')
          .select('petals_collected')
          .eq('id', session.user.id)
          .single();
        if (!error && data) {
          setCollected(data.petals_collected);
        }
      }
    }
    fetchUser();
  }, []);

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
        Community Petals Collected: {collected} / 10000
      </div>

      {/* CTA */}
      <div className="absolute top-10 animate-pulse text-3xl text-white">
        Click the petals to collect rewards!
      </div>
    </section>
  );
}

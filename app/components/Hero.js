"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";

// Supabase setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
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
          .from("users")
          .select("petals_collected")
          .eq("id", session.user.id)
          .single();
        if (!error && data) {
          setCollected(data.petals_collected);
        }
      }
    }
    fetchUser();
  }, []);

  return (
    <section className="hero-container relative w-full h-screen overflow-hidden flex justify-center items-center">
      {/* Background Image */}
      <Image
        src="/assets/cherry.jpg"
        alt="Cherry Blossom"
        layout="fill"
        objectFit="cover"
        className="z-0"
      />

      {/* Cherry Blossom Effect */}
      <CherryBlossomEffect />

      {/* Community Bar */}
      <div className="absolute bottom-10 bg-black/80 text-white p-3 rounded-lg shadow-lg">
        Community Petals Collected: {collected} / 10000
      </div>

      {/* CTA */}
      <div className="absolute top-10 text-white text-3xl animate-pulse">
        Click the petals to collect rewards! 
      </div>
    </section>
  );
}

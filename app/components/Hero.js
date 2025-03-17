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
  const [petals, setPetals] = useState([]);
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

    const interval = setInterval(() => {
      setPetals((prev) => [
        ...prev,
        {
          id: Math.random(),
          left: Math.random() * 100 + "vw",
          delay: Math.random() * 5 + "s",
        },
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const collectPetal = async (id) => {
    setPetals((prev) => prev.filter((petal) => petal.id !== id));
    const newCount = collected + 1;
    setCollected(newCount);

    if (userId) {
      await supabase.from("users").update({ petals_collected: newCount }).eq("id", userId);
    }
  };

  return (
    <section className="relative w-full h-screen overflow-hidden flex justify-center items-center">
      {/* Background Image */}
      <Image
        src="/assets/cherry.jpg"
        alt="Cherry Blossom"
        layout="fill"
        objectFit="cover"
        className="z-0"
      />

      {/* Floating Petals */}
      {petals.map((petal) => (
        <div
          key={petal.id}
          onClick={() => collectPetal(petal.id)}
          className="absolute text-pink-400 cursor-pointer transition-transform transform hover:scale-125"
          style={{
            top: "-10%",
            left: petal.left,
            animation: `fall ${petal.delay} linear forwards`,
          }}
        >
          🌸
        </div>
      ))}

      {/* Community Bar */}
      <div className="absolute bottom-10 bg-black/80 text-white p-3 rounded-lg">
        Community Petals Collected: {collected} / 10000
      </div>

      {/* CTA */}
      <div className="absolute top-10 text-white text-3xl animate-pulse">
        Click the petals to collect rewards! 
      </div>

      <style jsx>{`
        @keyframes fall {
          from {
            transform: translateY(-100px) rotate(0deg);
          }
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}</style>
    </section>
  );
}

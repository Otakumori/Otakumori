"use client";
import { useState, useEffect } from "react";

export default function CherryBlossomEffect() {
  const [petals, setPetals] = useState([]);

  useEffect(() => {
    // Load external sakura.js for natural sakura effects if desired
    const script = document.createElement("script");
    script.src = "https://jhammann.github.io/sakura/sakura.js";
    script.async = true;
    document.body.appendChild(script);

    // Create interactive petals on a set interval
    const interval = setInterval(() => {
      const newPetal = {
        id: Math.random().toString(36).substring(2, 9),
        left: Math.random() * 100 + "vw",
        delay: (Math.random() * 5 + 3) + "s", // Fall duration between 3s and 8s
        fading: false,
      };
      setPetals(prev => [...prev, newPetal]);
    }, 3000);

    return () => {
      clearInterval(interval);
      document.body.removeChild(script);
    };
  }, []);

  // When a petal is clicked, mark it as fading
  const handleClick = (id) => {
    setPetals(prev =>
      prev.map(p => p.id === id ? { ...p, fading: true } : p)
    );
    // TODO: Insert your Supabase update logic here if needed (e.g., update achievements)
  };

  // Once fade-out is complete, remove the petal
  const handleAnimationEnd = (id) => {
    setPetals(prev => prev.filter(p => p.id !== id));
  };

  return (
    <>
      {petals.map((petal) => (
        <div
          key={petal.id}
          onClick={() => handleClick(petal.id)}
          onAnimationEnd={() => {
            if (petal.fading) handleAnimationEnd(petal.id);
          }}
          className={`absolute text-pink-400 cursor-pointer transition-transform transform hover:scale-125 ${petal.fading ? 'fade-out' : ''}`}
          style={{
            top: "-10%",
            left: petal.left,
            animation: `fall ${petal.delay} linear forwards`,
            zIndex: 10,
          }}
        >
          🌸
        </div>
      ))}
      <style jsx>{`
        @keyframes fall {
          from {
            transform: translateY(-100px) rotate(0deg);
          }
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
        .fade-out {
          animation: fadeOut 0.5s forwards;
          /* Override the fall animation when fading */
          animation-delay: 0s !important;
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}

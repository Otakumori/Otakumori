"use client"; // Ensures Next.js loads this on the client side

import { useEffect } from "react";

export default function CherryBlossomEffect() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "/assets/sakura.js"; // Load from your assets folder
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        new Sakura("body", {
          blowAnimations: ["blow-soft-left", "blow-medium-right"],
          delay: 5000, // Slower petal animation
          colors: [
            { gradientColorStart: "rgba(255, 183, 197, 0.9)", gradientColorEnd: "rgba(255, 197, 208, 0.9)" },
          ],
        });
      };

      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  return null;
}

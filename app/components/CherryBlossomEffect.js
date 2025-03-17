"use client"; 

import { useEffect } from "react";

export default function SakuraEffect() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://jhammann.github.io/sakura/sakura.js"; // Link to original script
      script.async = true;
      document.body.appendChild(script);

      // Initialize Sakura effect
      script.onload = () => {
        if (window.Sakura) {
          new window.Sakura("body", {
            maxSize: 14,
            minSize: 9,
            delay: 500,
          });
        }
      };

      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  return null; // No visible UI elements, just adding the effect
}

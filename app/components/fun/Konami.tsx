"use client";
import { useEffect } from "react";

// up up down down left right left right b a
const seq = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];

export default function Konami() {
  useEffect(() => {
    let idx = 0;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === seq[idx]) {
        idx++;
        if (idx === seq.length) {
          idx = 0;
          document.dispatchEvent(new CustomEvent("om:konami"));
        }
      } else {
        idx = 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onKonami = () => {
      // Example: grant a tiny achievement or toggle a theme
      // fetch("/api/achievements/unlock", { method: "POST", body: JSON.stringify({ code: "KONAMI_DISCOVERED" }) });
      document.body.classList.add("ring-2","ring-fuchsia-500");
      setTimeout(() => document.body.classList.remove("ring-2","ring-fuchsia-500"), 1500);
    };
    document.addEventListener("om:konami", onKonami);
    return () => document.removeEventListener("om:konami", onKonami);
  }, []);

  return null;
}

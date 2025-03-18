"use client";
import { useEffect } from "react";

export default function CherryBlossomEffect() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://jhammann.github.io/sakura/sakura.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return null;
}

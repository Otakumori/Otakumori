"use client";
import { useEffect } from "react";

export default function CherryBlossomEffect() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("/assets/sakura.js").then((module) => {
        const sakura = new module.default(".hero-container", {
          blowAnimations: ["blow-soft-left", "blow-medium-right"],
          delay: 9000, // Slower falling rate
          colors: [
            { gradientColorStart: "rgba(255, 183, 197, 0.7)", gradientColorEnd: "rgba(255, 197, 208, 0.7)" },
          ],
        });

        // Make petals clickable
        document.addEventListener("click", function (event) {
          if (event.target.classList.contains("sakura-petal")) {
            event.target.remove();
            alert("🌸 You collected a petal!"); // Replace with API logic
          }
        });
      });
    }
  }, []);

  return null;
}

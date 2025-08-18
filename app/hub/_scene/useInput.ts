"use client";
import { useEffect } from "react";
import { useHub, ORDER } from "./store";
import { play } from "@/app/mini-games/_shared/audio-bus";

export function useHubInput() {
  const { face, rotate, confirm, isZooming, backToIdle } = useHub();
  
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isZooming) return;
      
      if (e.key === "ArrowRight" || e.key === "d") { 
        rotate(+1 as 1); 
        ping("move"); 
      } else if (e.key === "ArrowLeft" || e.key === "a") { 
        rotate(-1 as -1); 
        ping("move"); 
      } else if (e.key === "Enter" || e.key === " ") { 
        confirm(); 
        ping("select"); 
      } else if (e.key === "Escape") {
        // On non-front faces, Esc returns to front (no route change)
        if (face !== "front") { 
          location.hash = ""; 
          ping("back"); 
        }
      }
    }
    
    function ping(kind: "move" | "select" | "back") {
      const mp = { 
        move: "/assets/sfx/hub_move.ogg", 
        select: "/assets/sfx/hub_select.ogg", 
        back: "/assets/sfx/hub_back.ogg" 
      }[kind];
      play(mp, -14);
    }
    
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [face, isZooming, rotate, confirm]);

  // Basic gamepad support (D-pad/LS left-right, A=confirm, B=back)
  useEffect(() => {
    let raf = 0;
    let lastLR = 0 as -1 | 0 | 1;
    let lastTick = 0;
    let prevButtons: number[] = [];

    const DEADZONE = 0.45;
    const COOLDOWN_MS = 220;

    function step(ts: number) {
      const pads = navigator.getGamepads?.() || [];
      const p = pads[0];
      if (p && !isZooming) {
        const ax = (p.axes?.[0] ?? 0);
        const dpadLeft = p.buttons?.[14]?.pressed ? 1 : 0;
        const dpadRight = p.buttons?.[15]?.pressed ? 1 : 0;
        const aBtn = p.buttons?.[0]?.pressed ? 1 : 0; // A
        const bBtn = p.buttons?.[1]?.pressed ? 1 : 0; // B

        // Left/Right: either D-pad or left stick
        let lr: -1 | 0 | 1 = 0;
        if (dpadLeft) lr = -1; else if (dpadRight) lr = 1; else if (ax < -DEADZONE) lr = -1; else if (ax > DEADZONE) lr = 1;

        if (lr !== 0 && (lr !== lastLR || ts - lastTick > COOLDOWN_MS)) {
          rotate(lr);
          lastTick = ts;
        }
        lastLR = lr;

        // Edge-detect A/B
        if ((aBtn && !prevButtons[0])) confirm();
        if ((bBtn && !prevButtons[1])) {
          if (face !== "front") backToIdle();
        }
        prevButtons = [aBtn, bBtn];
      }
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [face, isZooming, rotate, confirm, backToIdle]);
}

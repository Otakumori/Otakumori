import { useEffect, useRef, useState } from 'react';

interface Wind {
  dirVec: { x: number; y: number };
  speed: number;
  gust: number;
  swayPhase: number;
}

function useWind(): Wind {
  const [wind, setWind] = useState<Wind>({
    dirVec: { x: 0.1, y: 0 },
    speed: 0.1,
    gust: 0,
    swayPhase: 0,
  });
  const frame = useRef(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let running = true;
    const loop = () => {
      if (!running) return;
      frame.current += 1;
      const t = frame.current / 60;
      // Sway phase: slow oscillation
      const swayPhase = t * 0.25;
      // Wind direction: slow, subtle change
      const angle = Math.sin(t * 0.03) * 0.3 + Math.cos(t * 0.01) * 0.1;
      const dirVec = { x: Math.cos(angle), y: Math.sin(angle) * 0.1 };
      // Speed: base + gentle oscillation
      const speed = 0.08 + Math.abs(Math.sin(t * 0.07)) * 0.04;
      // Gust: rare, short-lived spikes
      const gust = Math.abs(Math.sin(t * 0.013 + Math.cos(t * 0.007))) > 0.98 ? 0.2 : 0;
      setWind({ dirVec, speed, gust, swayPhase });
      requestAnimationFrame(loop);
    };
    loop();
    return () => {
      running = false;
    };
  }, []);
  return wind;
}

export default useWind;

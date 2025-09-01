'use client';
import { useEffect } from 'react';

const ORIG_W = 1024,
  ORIG_H = 1536; // source art size
const TRUNK_CENTER_PX = 512; // tweak ±10 if needed
const GUTTER_PX = 0; // set negative to tuck a hair outside

export default function TreeAligner() {
  useEffect(() => {
    const root = document.documentElement;

    const update = () => {
      const docH = document.body.scrollHeight;
      const scale = docH / ORIG_H; // same as background-size auto 100%
      const x = -(TRUNK_CENTER_PX * scale) + GUTTER_PX;
      root.style.setProperty('--tree-x', `${x}px`);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(document.body);
    addEventListener('resize', update);

    return () => {
      ro.disconnect();
      removeEventListener('resize', update);
    };
  }, []);

  return null;
}

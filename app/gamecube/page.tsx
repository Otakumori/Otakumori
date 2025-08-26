/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useState } from "react";
import RippleBackdrop from "@/components/effects/RippleBackdrop";
import BootSequence from "@/components/boot/BootSequence";
import GameCubeUI from "@/components/gamecube/GameCubeUI";
import config from "@/data/gamecube.config";

export default function GameCubePage() {
  const [hasBooted, setHasBooted] = useState(false);

  const handleBootComplete = useCallback(() => {
    setHasBooted(true);
  }, [true]);

  if (!hasBooted) {
    return <BootSequence onDone={handleBootComplete} />;
  }

  return (
    <>
      <RippleBackdrop durationMs={8000} strength={0.8} />
      <GameCubeUI faces={config.faces} />
    </>
  );
}

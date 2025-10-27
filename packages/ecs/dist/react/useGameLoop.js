/**
 * React hook for game loop integration
 */
import { useEffect, useRef, useState, useMemo } from 'react';
import { createGameLoop } from '../loop';
/**
 * React hook for managing game loop lifecycle
 */
export function useGameLoop(options) {
    const { world, systems, autoStart = false, fixedDt, maxAccumulator } = options;
    const loopRef = useRef(null);
    const [tick, setTick] = useState(0);
    const [fps, setFps] = useState(60);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    // Create game loop
    const loop = useMemo(() => {
        const options = {
            world,
            systems,
            onTick: (currentTick) => {
                setTick(currentTick);
                if (loopRef.current) {
                    setFps(loopRef.current.fps);
                }
            },
        };
        if (fixedDt !== undefined) {
            options.fixedDt = fixedDt;
        }
        if (maxAccumulator !== undefined) {
            options.maxAccumulator = maxAccumulator;
        }
        const newLoop = createGameLoop(options);
        loopRef.current = newLoop;
        return newLoop;
    }, [world, systems, fixedDt, maxAccumulator]);
    // Auto-start if requested
    useEffect(() => {
        if (autoStart) {
            loop.start();
            setIsRunning(true);
        }
        // Cleanup on unmount
        return () => {
            if (loopRef.current) {
                loopRef.current.stop();
            }
        };
    }, [autoStart, loop]);
    const start = () => {
        loop.start();
        setIsRunning(true);
        setIsPaused(false);
    };
    const pause = () => {
        loop.pause();
        setIsPaused(true);
    };
    const resume = () => {
        loop.resume();
        setIsPaused(false);
    };
    const stop = () => {
        loop.stop();
        setIsRunning(false);
        setIsPaused(false);
    };
    return {
        start,
        pause,
        resume,
        stop,
        isRunning,
        isPaused,
        currentTick: tick,
        fps,
    };
}

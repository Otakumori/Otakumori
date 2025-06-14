import { useEffect, useState } from 'react';
import { monitor } from '@/lib/monitor';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '@/lib/hooks/useSound';
import { useHaptic } from '@/lib/hooks/useHaptic';

interface FrontendMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  timeToInteractive: number;
  jsHeapSize: number;
  jsHeapSizeLimit: number;
  domNodes: number;
  resourcesLoaded: number;
  fps: number;
  droppedFrames: number;
}

export function FrontendMonitor() {
  const [metrics, setMetrics] = useState<FrontendMetrics | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const { playSound } = useSound();
  const { vibrate } = useHaptic();

  useEffect(() => {
    const collectFrontendMetrics = async () => {
      // Get performance metrics
      const performanceMetrics = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const memory = (performance as any).memory;
      const domNodes = document.getElementsByTagName('*').length;
      const resourcesLoaded = performance.getEntriesByType('resource').length;

      // Calculate FPS
      let frameCount = 0;
      let lastTime = performance.now();
      let fps = 0;
      let droppedFrames = 0;

      const calculateFPS = () => {
        const currentTime = performance.now();
        const elapsed = currentTime - lastTime;
        frameCount++;

        if (elapsed >= 1000) {
          fps = Math.round((frameCount * 1000) / elapsed);
          const expectedFrames = Math.round(elapsed / 16.67); // 60 FPS = 16.67ms per frame
          droppedFrames = Math.max(0, expectedFrames - frameCount);
          
          frameCount = 0;
          lastTime = currentTime;

          // Show notification for performance issues
          if (fps < 30 || droppedFrames > 10) {
            setShowNotification(true);
            playSound('warning');
            vibrate('medium');
            setTimeout(() => setShowNotification(false), 3000);
          }
        }

        requestAnimationFrame(calculateFPS);
      };

      requestAnimationFrame(calculateFPS);

      const newMetrics: FrontendMetrics = {
        pageLoadTime: performanceMetrics.loadEventEnd - performanceMetrics.startTime,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        timeToInteractive: performanceMetrics.domInteractive - performanceMetrics.startTime,
        jsHeapSize: memory?.usedJSHeapSize || 0,
        jsHeapSizeLimit: memory?.jsHeapSizeLimit || 0,
        domNodes,
        resourcesLoaded,
        fps,
        droppedFrames,
      };

      setMetrics(newMetrics);

      // Record metrics
      await monitor.collectMetrics();
    };

    // Collect metrics on page load
    collectFrontendMetrics();

    // Set up periodic collection
    const interval = setInterval(collectFrontendMetrics, 60000); // Every minute

    return () => clearInterval(interval);
  }, [playSound, vibrate]);

  return (
    <AnimatePresence>
      {showNotification && metrics && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="rounded-lg bg-red-500/90 p-4 text-white shadow-lg backdrop-blur-sm">
            <h3 className="font-semibold">Performance Warning</h3>
            <p className="text-sm">
              {metrics.fps < 30 ? 'Low FPS detected' : 'High frame drops detected'}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 
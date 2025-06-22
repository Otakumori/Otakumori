'use strict';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.FrontendMonitor = FrontendMonitor;
const react_1 = require('react');
const monitor_1 = require('@/lib/monitor');
const framer_motion_1 = require('framer-motion');
const useSound_1 = require('@/lib/hooks/useSound');
const useHaptic_1 = require('@/lib/hooks/useHaptic');
function FrontendMonitor() {
  const [metrics, setMetrics] = (0, react_1.useState)(null);
  const [showNotification, setShowNotification] = (0, react_1.useState)(false);
  const { playSound } = (0, useSound_1.useSound)();
  const { vibrate } = (0, useHaptic_1.useHaptic)();
  (0, react_1.useEffect)(() => {
    const collectFrontendMetrics = async () => {
      // Get performance metrics
      const performanceMetrics = performance.getEntriesByType('navigation')[0];
      const memory = performance.memory;
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
      const newMetrics = {
        pageLoadTime: performanceMetrics.loadEventEnd - performanceMetrics.startTime,
        firstContentfulPaint:
          performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
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
      await monitor_1.monitor.collectMetrics();
    };
    // Collect metrics on page load
    collectFrontendMetrics();
    // Set up periodic collection
    const interval = setInterval(collectFrontendMetrics, 60000); // Every minute
    return () => clearInterval(interval);
  }, [playSound, vibrate]);
  return (
    <framer_motion_1.AnimatePresence>
      {showNotification && metrics && (
        <framer_motion_1.motion.div
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
        </framer_motion_1.motion.div>
      )}
    </framer_motion_1.AnimatePresence>
  );
}

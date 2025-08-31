/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
export const monitor = {
  log: (...args: any[]) => console.log(...args),
  error: (error: any) => console.error(error),
  checkHealth: async () => ({
    status: 'healthy',
    message: 'All systems operational',
    lastChecked: new Date().toISOString(),
    metrics: {
      timestamp: Date.now(),
      cpu: 0,
      memory: 0,
      activeUsers: 0,
      requestsPerMinute: 0,
      errorRate: 0,
      avgResponseTime: 0,
      dbConnections: 0,
      cacheHitRate: 0,
      cacheSize: 0,
      frontendMetrics: {
        pageLoadTime: 0,
        firstContentfulPaint: 0,
        timeToInteractive: 0,
        jsHeapSize: 0,
        jsHeapSizeLimit: 0,
        domNodes: 0,
        resourcesLoaded: 0,
      },
      apiMetrics: [],
      gameMetrics: {
        activeGames: 0,
        averageSessionTime: 0,
        concurrentPlayers: 0,
        gameErrors: 0,
      },
      animationMetrics: {
        fps: 0,
        droppedFrames: 0,
        animationErrors: 0,
      },
    },
    services: {
      database: {
        status: 'healthy',
      },
      cache: {
        status: 'healthy',
      },
    },
  }),
  getMetrics: async () => ({
    timestamp: Date.now(),
    cpu: 0,
    memory: 0,
    activeUsers: 0,
    requestsPerMinute: 0,
    errorRate: 0,
    avgResponseTime: 0,
    dbConnections: 0,
    cacheHitRate: 0,
    cacheSize: 0,
    frontendMetrics: {
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      timeToInteractive: 0,
      jsHeapSize: 0,
      jsHeapSizeLimit: 0,
      domNodes: 0,
      resourcesLoaded: 0,
    },
    apiMetrics: [],
    gameMetrics: {
      activeGames: 0,
      averageSessionTime: 0,
      concurrentPlayers: 0,
      gameErrors: 0,
    },
    animationMetrics: {
      fps: 0,
      droppedFrames: 0,
      animationErrors: 0,
    },
  }),
  collectMetrics: async (metrics?: any) => {
    try {
      const page = window.location.pathname;
      const userAgent = navigator.userAgent;
      const payload = {
        metrics,
        page,
        userAgent,
        timestamp: Date.now(),
      };
      const res = await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to send metrics');
      const data = await res.json();
      monitor.log('Metrics sent:', data);
      return data;
    } catch (err) {
      monitor.error(err);
    }
  },
  recordGameMetrics: (metrics: any) => {
    monitor.log('Game metrics recorded:', metrics);
  },
};

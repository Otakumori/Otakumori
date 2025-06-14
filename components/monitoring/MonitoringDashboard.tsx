import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Users, Clock, Server, Database, Shield, Gamepad, Film } from 'lucide-react';
import { monitor } from '@/lib/monitor';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '@/lib/hooks/useSound';
import { useHaptic } from '@/lib/hooks/useHaptic';

interface SystemMetrics {
  timestamp: number;
  cpu: number;
  memory: number;
  activeUsers: number;
  requestsPerMinute: number;
  errorRate: number;
  avgResponseTime: number;
  dbConnections: number;
  cacheHitRate: number;
  cacheSize: number;
  frontendMetrics: {
    pageLoadTime: number;
    firstContentfulPaint: number;
    timeToInteractive: number;
    jsHeapSize: number;
    jsHeapSizeLimit: number;
    domNodes: number;
    resourcesLoaded: number;
  };
  apiMetrics: {
    endpoint: string;
    method: string;
    responseTime: number;
    statusCode: number;
    errorCount: number;
  }[];
  gameMetrics: {
    activeGames: number;
    averageSessionTime: number;
    concurrentPlayers: number;
    gameErrors: number;
  };
  animationMetrics: {
    fps: number;
    droppedFrames: number;
    animationErrors: number;
  };
}

interface HealthStatus {
  status: 'healthy' | 'warning' | 'error';
  message: string;
  lastChecked: string;
  metrics: SystemMetrics | null;
  services: {
    database: {
      status: string;
      error?: string;
    };
    cache: {
      status: string;
    };
  };
}

export function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { playSound } = useSound();
  const { vibrate } = useHaptic();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, healthRes] = await Promise.all([
          fetch('/api/metrics'),
          fetch('/api/health')
        ]);

        if (!metricsRes.ok || !healthRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [metricsData, healthData] = await Promise.all([
          metricsRes.json(),
          healthRes.json()
        ]);

        setMetrics(metricsData);
        setHealth(healthData);
        
        // Play subtle sound on data update
        playSound('notification');
        vibrate('light');
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);

    return () => clearInterval(interval);
  }, [playSound, vibrate]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    playSound('click');
    vibrate('light');
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[125px]" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
      </motion.div>
    );
  }

  const getHealthVariant = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const latestMetrics = metrics[metrics.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-bold"
      >
        System Monitoring
      </motion.h1>

      <AnimatePresence mode="wait">
        {health && (
          <motion.div
            key={health.status}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert variant={getHealthVariant(health.status)}>
              <AlertTitle>System Health</AlertTitle>
              <AlertDescription>
                <div className="space-y-2">
                  <p>{health.message} (Last checked: {new Date(health.lastChecked).toLocaleString()})</p>
                  <div className="flex gap-4">
                    <Badge variant={getHealthVariant(health.services.database.status)}>
                      Database: {health.services.database.status}
                    </Badge>
                    <Badge variant={getHealthVariant(health.services.cache.status)}>
                      Cache: {health.services.cache.status}
                    </Badge>
                  </div>
                  {health.services.database.error && (
                    <p className="text-sm text-red-500">{health.services.database.error}</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {/* System Metrics Cards */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <motion.div
                key={latestMetrics?.activeUsers}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl font-bold"
              >
                {latestMetrics?.activeUsers || 0}
              </motion.div>
              <p className="text-xs text-muted-foreground">
                {latestMetrics?.activeUsers > metrics[metrics.length - 2]?.activeUsers ? '+' : '-'}
                {Math.abs((latestMetrics?.activeUsers || 0) - (metrics[metrics.length - 2]?.activeUsers || 0))} from last check
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Response Time Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <motion.div
                key={latestMetrics?.avgResponseTime}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl font-bold"
              >
                {latestMetrics?.avgResponseTime || 0}ms
              </motion.div>
              <p className="text-xs text-muted-foreground">
                {latestMetrics?.avgResponseTime < metrics[metrics.length - 2]?.avgResponseTime ? '+' : '-'}
                {Math.abs((latestMetrics?.avgResponseTime || 0) - (metrics[metrics.length - 2]?.avgResponseTime || 0))}ms from last check
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* CPU Usage Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <motion.div
                key={latestMetrics?.cpu}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl font-bold"
              >
                {latestMetrics?.cpu || 0}%
              </motion.div>
              <p className="text-xs text-muted-foreground">
                {latestMetrics?.cpu < metrics[metrics.length - 2]?.cpu ? '+' : '-'}
                {Math.abs((latestMetrics?.cpu || 0) - (metrics[metrics.length - 2]?.cpu || 0))}% from last check
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Memory Usage Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <motion.div
                key={latestMetrics?.memory}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl font-bold"
              >
                {latestMetrics?.memory || 0}%
              </motion.div>
              <p className="text-xs text-muted-foreground">
                {latestMetrics?.memory < metrics[metrics.length - 2]?.memory ? '+' : '-'}
                {Math.abs((latestMetrics?.memory || 0) - (metrics[metrics.length - 2]?.memory || 0))}% from last check
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="frontend">Frontend</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value={activeTab} className="space-y-4">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={metrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="timestamp"
                          tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                        />
                        <YAxis />
                        <Tooltip
                          labelFormatter={(value) => new Date(value).toLocaleString()}
                        />
                        <Line
                          type="monotone"
                          dataKey="activeUsers"
                          stroke="#8884d8"
                          name="Active Users"
                        />
                        <Line
                          type="monotone"
                          dataKey="avgResponseTime"
                          stroke="#82ca9d"
                          name="Response Time (ms)"
                        />
                        <Line
                          type="monotone"
                          dataKey="cpu"
                          stroke="#ffc658"
                          name="CPU Usage (%)"
                        />
                        <Line
                          type="monotone"
                          dataKey="memory"
                          stroke="#ff8042"
                          name="Memory Usage (%)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </motion.div>
  );
} 
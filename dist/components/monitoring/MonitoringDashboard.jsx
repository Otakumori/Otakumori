'use strict';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.MonitoringDashboard = MonitoringDashboard;
const react_1 = require('react');
const card_1 = require('@/components/ui/card');
const recharts_1 = require('recharts');
const alert_1 = require('@/components/ui/alert');
const badge_1 = require('@/components/ui/badge');
const tabs_1 = require('@/components/ui/tabs');
const skeleton_1 = require('@/components/ui/skeleton');
const lucide_react_1 = require('lucide-react');
const framer_motion_1 = require('framer-motion');
const useSound_1 = require('@/lib/hooks/useSound');
const useHaptic_1 = require('@/lib/hooks/useHaptic');
function MonitoringDashboard() {
  const [metrics, setMetrics] = (0, react_1.useState)([]);
  const [health, setHealth] = (0, react_1.useState)(null);
  const [loading, setLoading] = (0, react_1.useState)(true);
  const [activeTab, setActiveTab] = (0, react_1.useState)('overview');
  const { playSound } = (0, useSound_1.useSound)();
  const { vibrate } = (0, useHaptic_1.useHaptic)();
  (0, react_1.useEffect)(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, healthRes] = await Promise.all([
          fetch('/api/metrics'),
          fetch('/api/health'),
        ]);
        if (!metricsRes.ok || !healthRes.ok) {
          throw new Error('Failed to fetch data');
        }
        const [metricsData, healthData] = await Promise.all([metricsRes.json(), healthRes.json()]);
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
  const handleTabChange = value => {
    setActiveTab(value);
    playSound('click');
    vibrate('light');
  };
  if (loading) {
    return (
      <framer_motion_1.motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <skeleton_1.Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <skeleton_1.Skeleton key={i} className="h-[125px]" />
          ))}
        </div>
        <skeleton_1.Skeleton className="h-[400px]" />
      </framer_motion_1.motion.div>
    );
  }
  const getHealthVariant = status => {
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
    <framer_motion_1.motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <framer_motion_1.motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-bold"
      >
        System Monitoring
      </framer_motion_1.motion.h1>

      <framer_motion_1.AnimatePresence mode="wait">
        {health && (
          <framer_motion_1.motion.div
            key={health.status}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <alert_1.Alert variant={getHealthVariant(health.status)}>
              <alert_1.AlertTitle>System Health</alert_1.AlertTitle>
              <alert_1.AlertDescription>
                <div className="space-y-2">
                  <p>
                    {health.message} (Last checked: {new Date(health.lastChecked).toLocaleString()})
                  </p>
                  <div className="flex gap-4">
                    <badge_1.Badge variant={getHealthVariant(health.services.database.status)}>
                      Database: {health.services.database.status}
                    </badge_1.Badge>
                    <badge_1.Badge variant={getHealthVariant(health.services.cache.status)}>
                      Cache: {health.services.cache.status}
                    </badge_1.Badge>
                  </div>
                  {health.services.database.error && (
                    <p className="text-sm text-red-500">{health.services.database.error}</p>
                  )}
                </div>
              </alert_1.AlertDescription>
            </alert_1.Alert>
          </framer_motion_1.motion.div>
        )}
      </framer_motion_1.AnimatePresence>

      <framer_motion_1.motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {/* System Metrics Cards */}
        <framer_motion_1.motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Active Users</card_1.CardTitle>
              <lucide_react_1.Users className="text-muted-foreground h-4 w-4" />
            </card_1.CardHeader>
            <card_1.CardContent>
              <framer_motion_1.motion.div
                key={latestMetrics?.activeUsers}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl font-bold"
              >
                {latestMetrics?.activeUsers || 0}
              </framer_motion_1.motion.div>
              <p className="text-muted-foreground text-xs">
                {latestMetrics?.activeUsers > metrics[metrics.length - 2]?.activeUsers ? '+' : '-'}
                {Math.abs(
                  (latestMetrics?.activeUsers || 0) -
                    (metrics[metrics.length - 2]?.activeUsers || 0)
                )}{' '}
                from last check
              </p>
            </card_1.CardContent>
          </card_1.Card>
        </framer_motion_1.motion.div>

        {/* Response Time Card */}
        <framer_motion_1.motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Response Time</card_1.CardTitle>
              <lucide_react_1.Clock className="text-muted-foreground h-4 w-4" />
            </card_1.CardHeader>
            <card_1.CardContent>
              <framer_motion_1.motion.div
                key={latestMetrics?.avgResponseTime}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl font-bold"
              >
                {latestMetrics?.avgResponseTime || 0}ms
              </framer_motion_1.motion.div>
              <p className="text-muted-foreground text-xs">
                {latestMetrics?.avgResponseTime < metrics[metrics.length - 2]?.avgResponseTime
                  ? '+'
                  : '-'}
                {Math.abs(
                  (latestMetrics?.avgResponseTime || 0) -
                    (metrics[metrics.length - 2]?.avgResponseTime || 0)
                )}
                ms from last check
              </p>
            </card_1.CardContent>
          </card_1.Card>
        </framer_motion_1.motion.div>

        {/* CPU Usage Card */}
        <framer_motion_1.motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">CPU Usage</card_1.CardTitle>
              <lucide_react_1.Activity className="text-muted-foreground h-4 w-4" />
            </card_1.CardHeader>
            <card_1.CardContent>
              <framer_motion_1.motion.div
                key={latestMetrics?.cpu}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl font-bold"
              >
                {latestMetrics?.cpu || 0}%
              </framer_motion_1.motion.div>
              <p className="text-muted-foreground text-xs">
                {latestMetrics?.cpu < metrics[metrics.length - 2]?.cpu ? '+' : '-'}
                {Math.abs((latestMetrics?.cpu || 0) - (metrics[metrics.length - 2]?.cpu || 0))}%
                from last check
              </p>
            </card_1.CardContent>
          </card_1.Card>
        </framer_motion_1.motion.div>

        {/* Memory Usage Card */}
        <framer_motion_1.motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Memory Usage</card_1.CardTitle>
              <lucide_react_1.Server className="text-muted-foreground h-4 w-4" />
            </card_1.CardHeader>
            <card_1.CardContent>
              <framer_motion_1.motion.div
                key={latestMetrics?.memory}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl font-bold"
              >
                {latestMetrics?.memory || 0}%
              </framer_motion_1.motion.div>
              <p className="text-muted-foreground text-xs">
                {latestMetrics?.memory < metrics[metrics.length - 2]?.memory ? '+' : '-'}
                {Math.abs(
                  (latestMetrics?.memory || 0) - (metrics[metrics.length - 2]?.memory || 0)
                )}
                % from last check
              </p>
            </card_1.CardContent>
          </card_1.Card>
        </framer_motion_1.motion.div>
      </framer_motion_1.motion.div>

      <tabs_1.Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="overview">Overview</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="frontend">Frontend</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="games">Games</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="api">API</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <framer_motion_1.AnimatePresence mode="wait">
          <tabs_1.TabsContent value={activeTab} className="space-y-4">
            <framer_motion_1.motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Metrics
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="h-[400px]">
                    <recharts_1.ResponsiveContainer width="100%" height="100%">
                      <recharts_1.LineChart data={metrics}>
                        <recharts_1.CartesianGrid strokeDasharray="3 3" />
                        <recharts_1.XAxis
                          dataKey="timestamp"
                          tickFormatter={value => new Date(value).toLocaleTimeString()}
                        />
                        <recharts_1.YAxis />
                        <recharts_1.Tooltip
                          labelFormatter={value => new Date(value).toLocaleString()}
                        />
                        <recharts_1.Line
                          type="monotone"
                          dataKey="activeUsers"
                          stroke="#8884d8"
                          name="Active Users"
                        />
                        <recharts_1.Line
                          type="monotone"
                          dataKey="avgResponseTime"
                          stroke="#82ca9d"
                          name="Response Time (ms)"
                        />
                        <recharts_1.Line
                          type="monotone"
                          dataKey="cpu"
                          stroke="#ffc658"
                          name="CPU Usage (%)"
                        />
                        <recharts_1.Line
                          type="monotone"
                          dataKey="memory"
                          stroke="#ff8042"
                          name="Memory Usage (%)"
                        />
                      </recharts_1.LineChart>
                    </recharts_1.ResponsiveContainer>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </framer_motion_1.motion.div>
          </tabs_1.TabsContent>
        </framer_motion_1.AnimatePresence>
      </tabs_1.Tabs>
    </framer_motion_1.motion.div>
  );
}

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Activity, Users, Clock, Server, Database, Shield } from "lucide-react"

interface SystemMetrics {
  timestamp: string
  activeUsers: number
  responseTime: number
  cpuUsage: number
  memoryUsage: number
  databaseConnections: number
}

interface HealthStatus {
  status: "healthy" | "warning" | "error"
  message: string
  lastChecked: string
}

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics[]>([])
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, healthRes] = await Promise.all([
          fetch("/api/metrics"),
          fetch("/api/health")
        ])

        if (!metricsRes.ok || !healthRes.ok) {
          throw new Error("Failed to fetch data")
        }

        const [metricsData, healthData] = await Promise.all([
          metricsRes.json(),
          healthRes.json()
        ])

        setMetrics(metricsData)
        setHealth(healthData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 60000) // Refresh every minute

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[125px]" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    )
  }

  const getHealthVariant = (status: string) => {
    switch (status) {
      case "healthy":
        return "success"
      case "warning":
        return "warning"
      case "error":
        return "destructive"
      default:
        return "default"
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">System Monitoring</h1>

      {health && (
        <Alert variant={getHealthVariant(health.status)}>
          <AlertTitle>System Health</AlertTitle>
          <AlertDescription>
            {health.message} (Last checked: {new Date(health.lastChecked).toLocaleString()})
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics[metrics.length - 1]?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics[metrics.length - 1]?.activeUsers > metrics[metrics.length - 2]?.activeUsers ? "+" : "-"}
              {Math.abs((metrics[metrics.length - 1]?.activeUsers || 0) - (metrics[metrics.length - 2]?.activeUsers || 0))} from last check
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics[metrics.length - 1]?.responseTime || 0}ms</div>
            <p className="text-xs text-muted-foreground">
              {metrics[metrics.length - 1]?.responseTime < metrics[metrics.length - 2]?.responseTime ? "+" : "-"}
              {Math.abs((metrics[metrics.length - 1]?.responseTime || 0) - (metrics[metrics.length - 2]?.responseTime || 0))}ms from last check
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics[metrics.length - 1]?.cpuUsage || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics[metrics.length - 1]?.cpuUsage < metrics[metrics.length - 2]?.cpuUsage ? "+" : "-"}
              {Math.abs((metrics[metrics.length - 1]?.cpuUsage || 0) - (metrics[metrics.length - 2]?.cpuUsage || 0))}% from last check
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics[metrics.length - 1]?.memoryUsage || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics[metrics.length - 1]?.memoryUsage < metrics[metrics.length - 2]?.memoryUsage ? "+" : "-"}
              {Math.abs((metrics[metrics.length - 1]?.memoryUsage || 0) - (metrics[metrics.length - 2]?.memoryUsage || 0))}% from last check
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Metrics</CardTitle>
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
                      dataKey="responseTime"
                      stroke="#82ca9d"
                      name="Response Time (ms)"
                    />
                    <Line
                      type="monotone"
                      dataKey="cpuUsage"
                      stroke="#ffc658"
                      name="CPU Usage (%)"
                    />
                    <Line
                      type="monotone"
                      dataKey="memoryUsage"
                      stroke="#ff8042"
                      name="Memory Usage (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
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
                      dataKey="responseTime"
                      stroke="#82ca9d"
                      name="Response Time (ms)"
                    />
                    <Line
                      type="monotone"
                      dataKey="cpuUsage"
                      stroke="#ffc658"
                      name="CPU Usage (%)"
                    />
                    <Line
                      type="monotone"
                      dataKey="memoryUsage"
                      stroke="#ff8042"
                      name="Memory Usage (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Metrics</CardTitle>
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
                      dataKey="databaseConnections"
                      stroke="#8884d8"
                      name="Database Connections"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
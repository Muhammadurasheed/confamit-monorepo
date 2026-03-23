import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Zap 
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface UsageStats {
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  requestsThisMonth: number;
  requestsLastMonth: number;
}

interface UsageAnalyticsProps {
  businessId: string;
  stats?: UsageStats;
}

// Mock data - would come from backend in production
const generateMockData = () => {
  const dailyUsage = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    dailyUsage.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      receiptScans: Math.floor(Math.random() * 50) + 20,
      accountChecks: Math.floor(Math.random() * 80) + 30,
      successful: Math.floor(Math.random() * 100) + 80,
      failed: Math.floor(Math.random() * 10) + 2,
    });
  }
  return dailyUsage;
};

const mockHourlyData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  requests: Math.floor(Math.random() * 30) + 5,
}));

const mockEndpointData = [
  { endpoint: '/receipts/scan', requests: 1247, avgTime: '4.2s', success: 98.5 },
  { endpoint: '/accounts/check', requests: 892, avgTime: '1.8s', success: 99.2 },
  { endpoint: '/business/:id', requests: 354, avgTime: '0.9s', success: 99.8 },
];

export const UsageAnalytics = ({ businessId, stats }: UsageAnalyticsProps) => {
  const dailyData = generateMockData();
  
  const defaultStats: UsageStats = stats || {
    totalRequests: 1247,
    successRate: 98.2,
    avgResponseTime: 4.2,
    requestsThisMonth: 892,
    requestsLastMonth: 654,
  };

  const growth = ((defaultStats.requestsThisMonth - defaultStats.requestsLastMonth) / defaultStats.requestsLastMonth * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{defaultStats.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
            <Badge variant="outline" className="mt-2 bg-success/10 text-success border-success">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{growth}%
            </Badge>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{defaultStats.successRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Successful requests</p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{defaultStats.avgResponseTime}s</div>
            <p className="text-xs text-muted-foreground mt-1">Average response time</p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">99.9%</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily Usage</TabsTrigger>
          <TabsTrigger value="hourly">Hourly Pattern</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>API Usage (Last 30 Days)</CardTitle>
              <CardDescription>
                Track your API requests and success rates over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorReceipts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAccounts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs text-muted-foreground"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis className="text-xs text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="receiptScans"
                    name="Receipt Scans"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorReceipts)"
                  />
                  <Area
                    type="monotone"
                    dataKey="accountChecks"
                    name="Account Checks"
                    stroke="hsl(var(--success))"
                    fillOpacity={1}
                    fill="url(#colorAccounts)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Success vs Failed Requests</CardTitle>
              <CardDescription>
                Monitor request success rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyData.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs text-muted-foreground"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis className="text-xs text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="successful" name="Successful" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="failed" name="Failed" fill="hsl(var(--danger))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hourly">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Hourly Request Pattern</CardTitle>
              <CardDescription>
                Understand peak usage hours for your API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={mockHourlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="hour" 
                    className="text-xs text-muted-foreground"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis className="text-xs text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="requests"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Endpoint Performance</CardTitle>
              <CardDescription>
                Detailed metrics for each API endpoint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockEndpointData.map((endpoint, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-mono text-sm font-medium">{endpoint.endpoint}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{endpoint.requests.toLocaleString()} requests</span>
                        <span>•</span>
                        <span>{endpoint.avgTime} avg</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge 
                        variant="outline" 
                        className={
                          endpoint.success >= 99 
                            ? "bg-success/10 text-success border-success"
                            : endpoint.success >= 95
                            ? "bg-warning/10 text-warning border-warning"
                            : "bg-danger/10 text-danger border-danger"
                        }
                      >
                        {endpoint.success}% success
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

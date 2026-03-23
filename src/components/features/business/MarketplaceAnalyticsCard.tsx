import { Eye, MousePointerClick, Navigation, Phone, MessageCircle, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { MarketplaceAnalytics } from "@/types";

interface MarketplaceAnalyticsCardProps {
  analytics: MarketplaceAnalytics;
}

const MarketplaceAnalyticsCard = ({ analytics }: MarketplaceAnalyticsCardProps) => {
  // Handle undefined analytics gracefully
  if (!analytics) {
    return (
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="text-lg">Marketplace Analytics</CardTitle>
          <CardDescription className="mt-1">
            Complete your marketplace profile to start tracking analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No analytics data available yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalInteractions = (analytics.websiteClicks || 0) + 
                           (analytics.directionRequests || 0) + 
                           (analytics.phoneClicks || 0) + 
                           (analytics.whatsappClicks || 0);

  const stats = [
    {
      label: "Profile Views",
      value: analytics.views,
      icon: Eye,
      color: "text-primary",
      bgColor: "bg-primary/10",
      change: "+12%",
      trending: "up"
    },
    {
      label: "Website Clicks",
      value: analytics.websiteClicks,
      icon: MousePointerClick,
      color: "text-success",
      bgColor: "bg-success/10",
      change: "+8%",
      trending: "up"
    },
    {
      label: "Direction Requests",
      value: analytics.directionRequests,
      icon: Navigation,
      color: "text-warning",
      bgColor: "bg-warning/10",
      change: "+5%",
      trending: "up"
    },
    {
      label: "Phone Calls",
      value: analytics.phoneClicks || 0,
      icon: Phone,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      change: "+3%",
      trending: "up"
    }
  ];

  const conversionRate = analytics.views > 0 
    ? ((totalInteractions / analytics.views) * 100).toFixed(1)
    : "0.0";

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Marketplace Analytics</CardTitle>
            <CardDescription className="mt-1">
              Last 30 days performance
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            {conversionRate}% conversion
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trending === "up" ? TrendingUp : TrendingDown;
            
            return (
              <div key={stat.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${stat.trending === 'up' ? 'text-success' : 'text-danger'}`}>
                    <TrendIcon className="h-3 w-3" />
                    <span>{stat.change}</span>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Total Interactions */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Interactions</p>
            <p className="text-3xl font-bold text-foreground mt-1">{totalInteractions}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Engagement Rate</p>
            <p className="text-lg font-bold text-success">{conversionRate}%</p>
          </div>
        </div>

        {/* Last Viewed */}
        {analytics.lastViewedAt && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Last viewed: {new Date(analytics.lastViewedAt).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketplaceAnalyticsCard;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import { ApiKeysManagement } from "@/components/features/business/ApiKeysManagement";
import { UsageAnalytics } from "@/components/features/business/UsageAnalytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Key, BookOpen, BarChart3, AlertCircle, ArrowRight } from "lucide-react";
import { generateApiKey, getBusinessStats } from "@/services/business";
import { toast } from "sonner";

const API = () => {
  // In a real app, get businessId from auth context or URL params
  // For demo purposes, using a mock businessId
  const [businessId] = useState("BUS-DEMO-001");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getBusinessStats(businessId);
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        // Don't show error toast, just use mock data
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [businessId]);

  const handleGenerateApiKey = async () => {
    try {
      const result = await generateApiKey(businessId);
      return result.api_key;
    } catch (error: any) {
      throw new Error(error.message || "Failed to generate API key");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 bg-gradient-to-b from-background to-muted/20">
        <Container>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">API Integration</h1>
            <p className="text-muted-foreground text-lg">
              Integrate ConfirmIT verification into your applications with our powerful REST API
            </p>
          </div>

          {/* Feature Overview Cards */}
          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            <Card className="shadow-elegant hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                  <Key className="h-5 w-5 text-primary" />
                  API Keys
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generate and manage production and test API keys for secure authentication
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Documentation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Complete guides, code examples, and API reference in multiple languages
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Usage Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Monitor API usage, performance metrics, and success rates in real-time
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Getting Started Alert */}
          <Alert className="mb-8 border-primary/50 bg-primary/5">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="font-semibold text-primary mb-1">New to ConfirmIT API?</p>
                  <p className="text-sm text-muted-foreground">
                    Start by testing our verification features before integrating into your application
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/quick-scan')}
                  >
                    Try QuickScan <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/account-check')}
                  >
                    Try AccountCheck <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* API Keys Management Component */}
          <div className="mb-8">
            <ApiKeysManagement
              businessId={businessId}
              onGenerateKey={handleGenerateApiKey}
              existingKeys={[
                // These would come from backend in production
                // { keyId: "abc123", environment: "live", createdAt: new Date('2025-01-15') }
              ]}
            />
          </div>

          {/* Usage Analytics Component */}
          <div>
            <h2 className="text-2xl font-bold mb-4">API Usage Analytics</h2>
            <p className="text-muted-foreground mb-6">
              Monitor your API performance, track usage patterns, and optimize your integration
            </p>
            {loading ? (
              <Card className="shadow-elegant">
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-sm text-muted-foreground">Loading analytics...</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <UsageAnalytics 
                businessId={businessId}
                stats={stats}
              />
            )}
          </div>

          {/* Additional Resources */}
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-lg">🚀 Quick Integration</CardTitle>
                <CardDescription>
                  Get started in 5 minutes with our SDK
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-3 rounded font-mono text-sm">
                  npm install @confirmit/sdk
                </div>
                <p className="text-sm text-muted-foreground">
                  Our TypeScript SDK makes integration seamless with full type safety and auto-complete support
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-lg">💬 Need Help?</CardTitle>
                <CardDescription>
                  Our support team is here to assist
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Join our developer community or reach out to our technical support team for integration assistance
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    📖 View Docs
                  </Button>
                  <Button variant="outline" size="sm">
                    💬 Join Discord
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default API;

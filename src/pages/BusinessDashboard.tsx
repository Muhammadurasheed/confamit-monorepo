import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import TrustScoreGauge from "@/components/shared/TrustScoreGauge";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import TrustIdNftCard from "@/components/shared/TrustIdNftCard";
import { ApiKeysManagement } from "@/components/features/business/ApiKeysManagement";
import { UsageAnalytics } from "@/components/features/business/UsageAnalytics";
import { WebhookManagement } from "@/components/features/business/WebhookManagement";
import MarketplaceStatusCard from "@/components/features/business/MarketplaceStatusCard";
import MarketplaceAnalyticsCard from "@/components/features/business/MarketplaceAnalyticsCard";
import MarketplaceProfileEditor from "@/components/features/business/MarketplaceProfileEditor";
import MarketplaceProfilePreview from "@/components/features/business/MarketplaceProfilePreview";
import BusinessSettingsForm from "@/components/features/business/BusinessSettingsForm";
import { getBusiness, getBusinessStats } from "@/services/business";
import { Business, BusinessStats } from "@/types";
import {
  Eye,
  Shield,
  TrendingUp,
  Users,
  Share2,
  Code,
  ExternalLink,
  QrCode,
  Star,
  CheckCircle2,
  AlertCircle,
  Clock,
  BarChart3,
  Store,
  Settings,
  Key,
  Webhook,
  Building2,
  ArrowUpRight,
} from "lucide-react";

const BusinessDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [stats, setStats] = useState<BusinessStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const businessData = await getBusiness(id);
        setBusiness(businessData.data);

        if (businessData.data.verification?.status === 'approved') {
          try {
            const statsData = await getBusinessStats(id);
            setStats(statsData.stats);
          } catch (statsError) {
            console.warn('Stats not available:', statsError);
            setStats({
              profileViews: 0,
              verifications: 0,
              successfulTransactions: 0,
            });
          }
        } else {
          setStats({
            profileViews: 0,
            verifications: 0,
            successfulTransactions: 0,
          });
        }
      } catch (error: any) {
        toast.error("Failed to load business data", {
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/business/${id}`;
    navigator.clipboard.writeText(profileUrl);
    toast.success("Profile link copied to clipboard!");
  };

  const handleCopyEmbedCode = () => {
    const embedCode = `<div data-legit-business="${id}" data-legit-widget="badge"></div>\n<script src="${window.location.origin}/widget.js"></script>`;
    navigator.clipboard.writeText(embedCode);
    toast.success("Embed code copied! Paste it in your website.");
  };

  const daysActive = business?.createdAt 
    ? Math.floor((Date.now() - new Date(business.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-success text-success-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      case "under_review":
        return "bg-primary text-primary-foreground";
      case "rejected":
        return "bg-danger text-danger-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-4 w-4" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </main>
        <Footer />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Business Not Found</CardTitle>
              <CardDescription>
                The business you're looking for doesn't exist or you don't have access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/business">Back to Business Directory</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (business.verification?.status !== 'approved') {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-warning/10 p-4 rounded-full">
                  <Clock className="h-12 w-12 text-warning" />
                </div>
              </div>
              <CardTitle className="text-2xl">Application Under Review</CardTitle>
              <CardDescription className="text-base mt-2">
                Your business registration is being reviewed by our team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm mb-2"><strong>Business Name:</strong> {business.name}</p>
                <p className="text-sm mb-2"><strong>Business ID:</strong> <code className="bg-background px-2 py-1 rounded text-xs">{id}</code></p>
                <div className="text-sm">
                  <strong>Status:</strong>
                  <Badge variant="outline" className="ml-2 bg-warning/10 text-warning border-warning capitalize">
                    {business.verification?.status || 'Pending'}
                  </Badge>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>✓ Payment confirmed</p>
                <p>⏳ Verification in progress (24-48 hours)</p>
                <p>📧 You'll receive an email once approved</p>
              </div>
              <div className="pt-4 flex gap-3">
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/">Back to Home</Link>
                </Button>
                <Button asChild className="flex-1" disabled>
                  <span>View Public Profile (Available after approval)</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const navigationItems = [
    { id: "overview", label: "Overview", icon: Building2 },
    { id: "marketplace", label: "Marketplace", icon: Store },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "api", label: "API Keys", icon: Key },
    { id: "webhooks", label: "Webhooks", icon: Webhook },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Ensure trust score is at least 50 for display if it's 0
  const displayTrustScore = business.trustScore === 0 ? 50 : business.trustScore;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-subtle">
      <Header />
      <main className="flex-1 py-8">
        <Container className="max-w-[1400px]">
          {/* Modern Header with Hero Stats */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {/* Business Identity Section */}
            <div className="bg-card rounded-xl p-6 shadow-elegant border mb-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    {business.logo && (
                      <img 
                        src={business.logo} 
                        alt={business.name}
                        className="w-16 h-16 rounded-lg object-cover border-2 border-border"
                      />
                    )}
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold mb-2">{business.name}</h1>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="outline" className="text-sm">
                          {business.category}
                        </Badge>
                        <Badge className={getVerificationStatusColor(business.verification.status)}>
                          {getVerificationIcon(business.verification.status)}
                          <span className="ml-2 capitalize">{business.verification.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={handleShareProfile}>
                      <Share2 className="h-3.5 w-3.5 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCopyEmbedCode}>
                      <Code className="h-3.5 w-3.5 mr-2" />
                      Embed Badge
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.open(`/business/${id}`, '_blank')}>
                      <ExternalLink className="h-3.5 w-3.5 mr-2" />
                      Public Profile
                    </Button>
                  </div>
                </div>

                {/* Trust Score Hero */}
                <div className="flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/20">
                  <TrustScoreGauge score={(business as any).trust_score || business.trustScore || displayTrustScore} size="lg" showLabel={false} />
                  <p className="text-sm font-medium text-muted-foreground mt-2">Trust Score</p>
                  <p className="text-xs text-success mt-1">+15% this month</p>
                </div>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Eye className="h-5 w-5 text-primary" />
                    <ArrowUpRight className="h-4 w-4 text-success" />
                  </div>
                  <div className="text-2xl font-bold">{stats?.profileViews || 0}</div>
                  <p className="text-xs text-muted-foreground">Profile Views</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Shield className="h-5 w-5 text-success" />
                    <ArrowUpRight className="h-4 w-4 text-success" />
                  </div>
                  <div className="text-2xl font-bold">{stats?.verifications || 0}</div>
                  <p className="text-xs text-muted-foreground">Verifications</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-5 w-5 text-warning" />
                    <ArrowUpRight className="h-4 w-4 text-success" />
                  </div>
                  <div className="text-2xl font-bold">{business.reviewCount || 0}</div>
                  <p className="text-xs text-muted-foreground">Reviews</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">{daysActive}</div>
                  <p className="text-xs text-muted-foreground">Days Active</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Main Content - Side Navigation Layout */}
          <div className="grid lg:grid-cols-[240px_1fr] gap-6">
            {/* Side Navigation */}
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Content Area */}
            <div className="space-y-6">
              {activeSection === "overview" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Marketplace Status at Top */}
                  <MarketplaceStatusCard
                    businessId={id!}
                    marketplaceStatus={business.marketplace}
                    onStatusUpdate={() => {
                      setShowProfileEditor(true);
                      setActiveSection("marketplace");
                    }}
                  />

                  {/* Trust ID NFT */}
                  {business.hedera?.trustIdNft && (
                    <TrustIdNftCard
                      tokenId={business.hedera.trustIdNft.tokenId}
                      serialNumber={business.hedera.trustIdNft.serialNumber}
                      explorerUrl={business.hedera.trustIdNft.explorerUrl}
                      trustScore={displayTrustScore}
                      verificationTier={business.verification.tier}
                      businessName={business.name}
                    />
                  )}

                  {/* Recent Activity - Real Data */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Activity</CardTitle>
                      <CardDescription>Latest interactions with your business</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {stats && stats.verifications > 0 ? (
                          <>
                            <div className="flex items-start gap-4">
                              <div className="p-2 rounded-full bg-success/10">
                                <CheckCircle2 className="h-4 w-4 text-success" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{stats.verifications} account verifications</p>
                                <p className="text-xs text-muted-foreground">Customers verified your account</p>
                              </div>
                            </div>
                            {business.marketplace?.status === 'active' && business.marketplace?.analytics && (
                              <>
                                <Separator />
                                <div className="flex items-start gap-4">
                                  <div className="p-2 rounded-full bg-primary/10">
                                    <Eye className="h-4 w-4 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{business.marketplace.analytics.views || 0} marketplace views</p>
                                    <p className="text-xs text-muted-foreground">Profile discovered on marketplace</p>
                                  </div>
                                </div>
                              </>
                            )}
                            {business.reviewCount > 0 && (
                              <>
                                <Separator />
                                <div className="flex items-start gap-4">
                                  <div className="p-2 rounded-full bg-warning/10">
                                    <Star className="h-4 w-4 text-warning" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{business.reviewCount} reviews received</p>
                                    <p className="text-xs text-muted-foreground">Average: {business.rating?.toFixed(1) || 'N/A'} stars</p>
                                  </div>
                                </div>
                              </>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No activity yet</p>
                            <p className="text-xs mt-1">Activity will appear once customers verify your account</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeSection === "marketplace" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {showProfileEditor ? (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold">Marketplace Profile</h2>
                        <Button variant="outline" onClick={() => setShowProfileEditor(false)}>
                          Back to Status
                        </Button>
                      </div>
                      <MarketplaceProfileEditor
                        businessId={id!}
                        currentProfile={business.marketplace?.profile}
                        onUpdate={async () => {
                          toast.success("Profile updated!");
                          // Refetch business data
                          const updatedBusiness = await getBusiness(id!);
                          setBusiness(updatedBusiness.data);
                          setShowProfileEditor(false);
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <MarketplaceProfilePreview
                        business={business}
                        onEdit={() => setShowProfileEditor(true)}
                      />
                      <MarketplaceStatusCard
                        businessId={id!}
                        marketplaceStatus={business.marketplace}
                        onStatusUpdate={() => setShowProfileEditor(true)}
                      />
                      {business.marketplace?.status === 'active' && (
                        <MarketplaceAnalyticsCard
                          analytics={business.marketplace?.analytics || {
                            views: 0,
                            websiteClicks: 0,
                            directionRequests: 0,
                            phoneClicks: 0,
                            whatsappClicks: 0,
                            reviewsCount: 0,
                            lastViewedAt: new Date().toISOString()
                          }}
                        />
                      )}
                    </>
                  )}
                </motion.div>
              )}

              {activeSection === "analytics" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <UsageAnalytics businessId={id!} />
                </motion.div>
              )}

              {activeSection === "api" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <ApiKeysManagement
                    businessId={id!}
                    existingKeys={business.apiKeys || []}
                    onGenerateKey={async () => {
                      const { generateApiKey } = await import("@/services/business");
                      const response = await generateApiKey(id!);
                      return response.api_key;
                    }}
                  />
                </motion.div>
              )}

              {activeSection === "webhooks" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <WebhookManagement businessId={id!} />
                </motion.div>
              )}

              {activeSection === "settings" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <BusinessSettingsForm 
                    business={business} 
                    onUpdate={async () => {
                      const updatedBusiness = await getBusiness(id!);
                      setBusiness(updatedBusiness.data);
                    }} 
                  />
                </motion.div>
              )}
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessDashboard;

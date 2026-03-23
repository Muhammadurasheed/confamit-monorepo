import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import TrustScoreGauge from "@/components/shared/TrustScoreGauge";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import TrustIdNftCard from "@/components/shared/TrustIdNftCard";
import { BusinessReviewModal } from "@/components/features/business/BusinessReviewModal";
import { getBusiness } from "@/services/business";
import { Business } from "@/types";
import {
  MapPin,
  Phone,
  Mail,
  Building2,
  CheckCircle2,
  Shield,
  ExternalLink,
  Star,
  Eye,
  Clock,
  MessageSquare,
  Linkedin as LinkedinIcon
} from "lucide-react";

/**
 * Public Business Profile Page
 * 
 * Shows verified business information to the public.
 * Different from BusinessDashboard which is owner-only view.
 */
const BusinessProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!id) return;

      try {
        const response = await getBusiness(id);
        setBusiness(response.data);
      } catch (error: any) {
        toast.error("Failed to load business profile", {
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [id]);

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
                The business you're looking for doesn't exist or is not yet verified.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/business/directory">Browse Directory</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Only show public profiles for approved businesses
  if (business.verification.status !== 'approved') {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Business Under Review</CardTitle>
              <CardDescription>
                This business is currently under verification review.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/business/directory">Browse Verified Businesses</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-subtle">
      <Header />
      <main className="flex-1 py-12">
        <Container>
          {/* Hero Section with Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Business Logo */}
              {business.logo && (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden border-2 border-primary/20 flex-shrink-0">
                  <img
                    src={business.logo}
                    alt={`${business.name} logo`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Business Header */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{business.name}</h1>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="outline" className="text-sm">
                        <Building2 className="h-3 w-3 mr-1" />
                        {business.category}
                      </Badge>
                      <Badge className="bg-success text-success-foreground">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified Business
                      </Badge>
                      <Badge variant="secondary">
                        Tier {business.verification.tier}
                      </Badge>
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(business.trustScore / 20)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Trust Score: {business.trustScore}/100
                      </span>
                    </div>
                  </div>

                  {/* Trust Score */}
                  <TrustScoreGauge score={business.trustScore || 0} size="lg" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Contact & Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {business.contact.address}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <a
                        href={`tel:${business.contact.phone}`}
                        className="text-sm text-primary hover:underline mt-1 block"
                      >
                        {business.contact.phone}
                      </a>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <a
                        href={`mailto:${business.contact.email}`}
                        className="text-sm text-primary hover:underline mt-1 block"
                      >
                        {business.contact.email}
                      </a>
                    </div>
                  </div>

                  {business.website && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-3">
                        <ExternalLink className="h-5 w-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">Website</p>
                          <a
                            href={business.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline mt-1 block"
                          >
                            {business.website}
                          </a>
                        </div>
                      </div>
                    </>
                  )}

                  {business.linkedin && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-3">
                        <LinkedinIcon className="h-5 w-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">LinkedIn</p>
                          <a
                            href={business.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline mt-1 block"
                          >
                            View LinkedIn Profile
                          </a>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Business Bio */}
              {business.bio && (
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle>About {business.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {business.bio}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Business Stats */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>Business Statistics</CardTitle>
                  <CardDescription>
                    Public performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="flex justify-center mb-2">
                        <Eye className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-2xl font-bold">{business.stats?.profileViews || business.profileViews || 0}</p>
                      <p className="text-xs text-muted-foreground">Profile Views</p>
                    </div>
                    <div>
                      <div className="flex justify-center mb-2">
                        <Shield className="h-5 w-5 text-success" />
                      </div>
                      <p className="text-2xl font-bold">{business.stats?.verifications || business.verifications || 0}</p>
                      <p className="text-xs text-muted-foreground">Verifications</p>
                    </div>
                    <div>
                      <div className="flex justify-center mb-2">
                        <Clock className="h-5 w-5 text-purple-500" />
                      </div>
                      <p className="text-2xl font-bold">
                        {business.createdAt ? 
                          Math.max(0, Math.round((Date.now() - (typeof business.createdAt === 'object' && (business.createdAt as any)._seconds ? (business.createdAt as any)._seconds * 1000 : new Date(business.createdAt as string).getTime())) / (1000 * 60 * 60 * 24)))
                          : 0
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">Days Active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bank Account (if verified) */}
              {business.bankAccount?.verified && (
                <Card className="shadow-elegant border-success/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      Verified Bank Account
                    </CardTitle>
                    <CardDescription>
                      This business has a verified Nigerian bank account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Account Name</p>
                        <p className="text-sm font-semibold">{business.bankAccount.accountName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Bank</p>
                        <p className="text-sm">{business.bankAccount.bankCode}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Trust ID NFT & Verification */}
            <div className="space-y-6">
              {/* Trust ID NFT */}
              {(business.hedera?.trustIdNft || business.hedera?.trust_id_nft) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <TrustIdNftCard
                    tokenId={(business.hedera.trustIdNft?.tokenId || business.hedera.trust_id_nft?.token_id) as string}
                    serialNumber={(business.hedera.trustIdNft?.serialNumber || business.hedera.trust_id_nft?.serial_number) as string}
                    explorerUrl={(business.hedera.trustIdNft?.explorerUrl || business.hedera.trust_id_nft?.explorer_url) as string}
                    trustScore={business.trustScore}
                    verificationTier={business.verification.tier}
                    businessName={business.name}
                  />
                </motion.div>
              )}

              {/* Leave a Review */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-base">Community Feedback</CardTitle>
                  <CardDescription>Help others by sharing your experience</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setShowReviewModal(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Write a Review
                  </Button>
                </CardContent>
              </Card>

              {/* Verification Details */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>Verification Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge className="bg-success text-success-foreground">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Approved
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tier</span>
                    <Badge variant="outline">Tier {business.verification.tier}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Verified Date</span>
                    <span className="text-sm">
                      {(() => {
                        const verifiedAt = business.verification.verifiedAt || business.createdAt;
                        if (!verifiedAt) return 'N/A';
                        
                        // Handle Firestore timestamp
                        if (typeof verifiedAt === 'object' && (verifiedAt as any)._seconds) {
                          return new Date((verifiedAt as any)._seconds * 1000).toLocaleDateString();
                        }
                        
                        // Handle ISO string or Date object
                        return new Date(verifiedAt as string).toLocaleDateString();
                      })()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Verified by Legit (ConfirmIT)</span>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Score Breakdown */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-base">Trust Score Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Document Verification</span>
                      <span className="font-medium">✅ Passed</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Bank Account Verified</span>
                      <span className="font-medium">
                        {business.bankAccount?.verified ? '✅ Verified' : '❌ Not Verified'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Blockchain Anchored</span>
                      <span className="font-medium">
                        {business.hedera?.trustIdNft ? '✅ Yes' : '❌ No'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Community Reports</span>
                      <span className="font-medium">{business.fraudReports || 0} Reports</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-center"
          >
            <Card className="shadow-elegant border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="py-8">
                <h3 className="text-xl font-bold mb-2">Want to get verified?</h3>
                <p className="text-muted-foreground mb-4">
                  Join hundreds of verified businesses on Legit
                </p>
                <Button asChild size="lg">
                  <Link to="/business/register">
                    Register Your Business
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </main>
      <Footer />

      {/* Review Modal */}
      <BusinessReviewModal
        open={showReviewModal}
        onOpenChange={setShowReviewModal}
        businessId={business.businessId}
        businessName={business.name}
      />
    </div>
  );
};

export default BusinessProfile;

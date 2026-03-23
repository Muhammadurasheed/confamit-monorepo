import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, ArrowLeft, MapPin, Tag, Briefcase, Globe, Phone, Mail } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import BusinessPhotoGallery from "@/components/features/marketplace/BusinessPhotoGallery";
import BusinessHoursDisplay from "@/components/features/marketplace/BusinessHoursDisplay";
import BusinessContactButtons from "@/components/features/marketplace/BusinessContactButtons";
import TrustScoreGauge from "@/components/shared/TrustScoreGauge";
import TrustIdNftCard from "@/components/shared/TrustIdNftCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { getMarketplaceBusinessProfile } from "@/services/marketplace";
import { toast } from "sonner";

const MarketplaceBusinessProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [business, setBusinessness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchBusiness();
    }
  }, [id]);

  const fetchBusiness = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await getMarketplaceBusinessProfile(id);
      setBusinessness(response.data);
    } catch (error) {
      console.error('Failed to fetch business:', error);
      toast.error('Failed to load business profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Loading business profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Business not found</p>
            <Link to="/marketplace">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Marketplace
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const profile = business.profile || {};

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <Container>
          {/* Back Button */}
          <Link to="/marketplace" className="inline-block mb-6">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Marketplace
            </Button>
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Photo Gallery */}
              {profile.photos && (
                <BusinessPhotoGallery
                  photos={profile.photos}
                  businessName={business.name}
                />
              )}

              {/* Business Header */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">{business.name}</h1>
                    {profile.tagline && (
                      <p className="text-lg text-muted-foreground mt-2">{profile.tagline}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-success border-success">
                    Verified
                  </Badge>
                </div>

                {/* Category & Location */}
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  <span className="text-lg font-medium text-foreground">{business.category}</span>
                  {profile.location && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.location.area}, {profile.location.city}</span>
                      </div>
                    </>
                  )}
                </div>

              {/* Description */}
              {profile.description && (
                <Card className="bg-muted/30">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-3">About {business.name}</h3>
                    <p className="text-foreground leading-relaxed">{profile.description}</p>
                  </CardContent>
                </Card>
              )}
              </div>

              {/* Products & Services */}
              {(profile.products?.length > 0 || profile.services?.length > 0) && (
                <Card>
                  <CardContent className="p-6 space-y-6">
                    {profile.products?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Tag className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold text-lg">Products</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {profile.products.map((product: string) => (
                            <Badge key={product} variant="secondary">
                              {product}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {profile.services?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Briefcase className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold text-lg">Services</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {profile.services.map((service: string) => (
                            <Badge key={service} variant="outline">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Business Hours */}
              {profile.hours && (
                <Card>
                  <CardContent className="p-6">
                    <BusinessHoursDisplay hours={profile.hours} />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trust Score */}
              <Card>
                <CardContent className="p-6 text-center">
                  <TrustScoreGauge score={business.trust_score || business.trustScore || 50} size="lg" />
                  <Separator className="my-4" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rating</span>
                      <span className="font-medium">★ {(business.rating || 0).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reviews</span>
                      <span className="font-medium">{business.review_count || business.reviewCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tier</span>
                      <span className="font-medium">
                        {(business.verification?.tier || business.tier) === 3 ? 'Premium' : 
                         (business.verification?.tier || business.tier) === 2 ? 'Verified' : 'Basic'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              {profile.contact && (
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      Get in Touch
                    </h3>
                    
                    {/* Contact Details */}
                    <div className="space-y-3 mb-6 bg-background/50 rounded-lg p-4">
                      {profile.contact.website && (
                        <div className="flex items-center gap-3 text-sm">
                          <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                          <a 
                            href={profile.contact.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline truncate"
                          >
                            {profile.contact.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                      {profile.contact.phone && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="truncate">{profile.contact.phone}</span>
                        </div>
                      )}
                      {profile.contact.email && (
                        <div className="flex items-center gap-3 text-sm">
                          <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="truncate">{profile.contact.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {profile.location && (
                      <BusinessContactButtons
                        businessId={business.businessId}
                        businessName={business.name}
                        contact={profile.contact}
                        location={profile.location}
                      />
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Trust ID NFT */}
              {business.hedera?.trust_id_nft && (
                <TrustIdNftCard
                  tokenId={business.hedera.trust_id_nft.token_id}
                  serialNumber={business.hedera.trust_id_nft.serial_number}
                  explorerUrl={business.hedera.trust_id_nft.explorer_url}
                  trustScore={business.trust_score || business.trustScore || 50}
                  verificationTier={business.verification?.tier || business.tier || 1}
                  businessName={business.name}
                />
              )}
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default MarketplaceBusinessProfile;

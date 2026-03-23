import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Star, Award, TrendingUp, MapPin, Phone, Mail, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { getBusinessDirectory, type BusinessListing, type BusinessDirectoryFilters } from "@/services/businessDirectory";
import TrustScoreGauge from "@/components/shared/TrustScoreGauge";

const BusinessDirectory = () => {
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<BusinessDirectoryFilters>({
    search: "",
    category: "",
    verifiedOnly: false,
    tier: undefined,
    page: 1,
    limit: 12,
  });

  useEffect(() => {
    fetchBusinesses();
  }, [filters.category, filters.verifiedOnly, filters.tier, filters.page]);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const result = await getBusinessDirectory(filters);
      setBusinesses(result.data);
      setTotal(result.total);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load businesses");
      console.error("Fetch businesses error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, page: 1 });
    fetchBusinesses();
  };

  const getTierBadgeColor = (tier: number) => {
    switch (tier) {
      case 3:
        return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white";
      case 2:
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTierLabel = (tier: number) => {
    switch (tier) {
      case 3:
        return "Premium";
      case 2:
        return "Verified";
      default:
        return "Basic";
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gradient-subtle">
        <Container className="py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Business Directory</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover {total.toLocaleString()}+ verified businesses with proven track records
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-8 shadow-elegant">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search businesses..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="flex-1"
                    />
                    <Button onClick={handleSearch}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Category Filter */}
                <Select
                  value={filters.category || "all"}
                  onValueChange={(value) => setFilters({ ...filters, category: value === "all" ? "" : value, page: 1 })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="food">Food & Beverage</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="fashion">Fashion</SelectItem>
                    <SelectItem value="real-estate">Real Estate</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                  </SelectContent>
                </Select>

                {/* Tier Filter */}
                <Select
                  value={filters.tier?.toString() || "all"}
                  onValueChange={(value) => setFilters({ ...filters, tier: value === "all" ? undefined : parseInt(value), page: 1 })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Tiers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="3">Premium Only</SelectItem>
                    <SelectItem value="2">Verified Only</SelectItem>
                    <SelectItem value="1">Basic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Verified Toggle */}
              <div className="mt-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="verifiedOnly"
                  checked={filters.verifiedOnly}
                  onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked, page: 1 })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="verifiedOnly" className="text-sm font-medium cursor-pointer">
                  Show verified businesses only
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Business Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : businesses.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No businesses found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search terms
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {businesses.map((business, index) => (
                  <motion.div
                    key={business.business_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="h-full hover:shadow-elegant transition-shadow duration-300">
                      <CardHeader>
                        <div className="flex items-start gap-4 mb-3">
                          {/* Business Logo */}
                          {business.logo ? (
                            <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-primary/10 flex-shrink-0">
                              <img
                                src={business.logo}
                                alt={`${business.name} logo`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-2xl font-bold text-primary">
                                {business.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-xl mb-2">{business.name}</CardTitle>
                              {business.verified && (
                                <Award className="h-6 w-6 text-success flex-shrink-0" />
                              )}
                            </div>
                            <Badge variant="outline" className="mb-2">
                              {business.category}
                            </Badge>
                          </div>
                        </div>
                        <Badge className={getTierBadgeColor(business.tier)}>
                          {getTierLabel(business.tier)}
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Trust Score */}
                        <div>
                          <TrustScoreGauge score={business.trust_score} size="sm" />
                        </div>

                        {/* Rating */}
                        {business.review_count > 0 && (
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold">{business.rating.toFixed(1)}</span>
                            <span className="text-sm text-muted-foreground">
                              ({business.review_count} reviews)
                            </span>
                          </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t">
                          <div>
                            <div className="text-sm font-semibold">{business.stats.profile_views}</div>
                            <div className="text-xs text-muted-foreground">Views</div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{business.stats.verifications}</div>
                            <div className="text-xs text-muted-foreground">Checks</div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{business.stats.successful_transactions}</div>
                            <div className="text-xs text-muted-foreground">Success</div>
                          </div>
                        </div>

                        {/* Contact */}
                        <div className="space-y-1 text-sm">
                          {business.location && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{business.location.city}, {business.location.state}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{business.contact.phone}</span>
                          </div>
                        </div>

                        {/* View Profile Button */}
                        <Button asChild className="w-full" variant="outline">
                          <Link to={`/business/${business.business_id}`}>
                            View Profile
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {total > (filters.limit || 12) && (
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={filters.page === 1}
                    onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-2 px-4">
                    <span className="text-sm text-muted-foreground">
                      Page {filters.page} of {Math.ceil(total / (filters.limit || 12))}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    disabled={(filters.page || 1) >= Math.ceil(total / (filters.limit || 12))}
                    onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessDirectory;

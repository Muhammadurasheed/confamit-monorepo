import { Link } from "react-router-dom";
import { MapPin, Star, Shield, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistance } from "@/services/marketplace";
import { motion } from "framer-motion";

interface MarketplaceBusinessCardProps {
  businessId: string;
  name: string;
  tagline: string;
  trustScore: number;
  products: string[];
  services: string[];
  distance: number | null;
  rating: number;
  reviewCount: number;
  thumbnail: string;
  location: {
    area: string;
    city: string;
  };
  index?: number;
}

const MarketplaceBusinessCard = ({
  businessId,
  name,
  tagline,
  trustScore,
  products,
  services,
  distance,
  rating,
  reviewCount,
  thumbnail,
  location,
  index = 0,
}: MarketplaceBusinessCardProps) => {
  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 50) return "text-warning";
    return "text-danger";
  };

  const getTrustScoreBg = (score: number) => {
    if (score >= 80) return "bg-success/10";
    if (score >= 50) return "bg-warning/10";
    return "bg-danger/10";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link to={`/marketplace/business/${businessId}`}>
        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
              {/* Thumbnail */}
              <div className="relative w-full sm:w-48 h-48 overflow-hidden bg-muted">
                <img
                  src={thumbnail || "/placeholder.svg"}
                  alt={name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Trust Score Badge - Fixed for visibility */}
                <div className={`absolute top-3 right-3 ${getTrustScoreBg(trustScore || 50)} backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-md border border-white/30`}>
                  <Shield className={`h-4 w-4 ${getTrustScoreColor(trustScore || 50)}`} />
                  <span className={`font-bold text-sm ${getTrustScoreColor(trustScore || 50)}`}>
                    {trustScore || 50}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div className="space-y-2">
                  {/* Name & Tagline */}
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2 group-hover:text-primary transition-colors">
                      {name}
                      <Badge variant="outline" className="text-xs">
                        Verified
                      </Badge>
                    </h3>
                    {tagline && (
                      <p className="text-sm text-muted-foreground mt-1">{tagline}</p>
                    )}
                  </div>

                  {/* Products/Services Tags */}
                  <div className="flex flex-wrap gap-2">
                    {products.slice(0, 3).map((product) => (
                      <span
                        key={product}
                        className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary"
                      >
                        {product}
                      </span>
                    ))}
                    {products.length > 3 && (
                      <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                        +{products.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Location & Rating */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{location.area}, {location.city}</span>
                    </div>
                    {distance !== null && (
                      <span className="font-medium text-foreground">
                        • {formatDistance(distance)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-medium">{rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">
                      ({reviewCount} reviews)
                    </span>
                  </div>
                </div>

                {/* View Profile Link */}
                <div className="flex items-center gap-2 text-primary font-medium mt-4 group-hover:gap-3 transition-all">
                  View Profile
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default MarketplaceBusinessCard;

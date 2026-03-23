import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MapPin, 
  Star, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  MessageCircle,
  ExternalLink,
  Bookmark
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface BusinessProfileCardProps {
  business: {
    business_id: string;
    name: string;
    verified: boolean;
    trust_score: number;
    verification_date: string;
    category?: string;
    location?: string;
    rating?: number;
    review_count?: number;
    successful_transactions?: number;
    active_complaints?: number;
    response_rate?: number;
  };
  onViewProfile?: () => void;
  onSaveBusiness?: () => void;
}

export const BusinessProfileCard = ({ 
  business, 
  onViewProfile, 
  onSaveBusiness 
}: BusinessProfileCardProps) => {
  // Mock reviews
  const recentReviews = [
    {
      id: "1",
      rating: 5,
      text: "Fast delivery, legit seller. Very satisfied!",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      author: "Customer",
    },
    {
      id: "2",
      rating: 5,
      text: "Trusted seller, authentic products",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      author: "Verified Buyer",
    },
    {
      id: "3",
      rating: 4,
      text: "Good service, slight delay but worth it",
      date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      author: "Customer",
    },
  ];

  const getTierBadge = () => {
    if (business.trust_score >= 90) return { label: "Tier 3 Verified", variant: "default" as const };
    if (business.trust_score >= 70) return { label: "Tier 2 Verified", variant: "secondary" as const };
    return { label: "Tier 1 Verified", variant: "outline" as const };
  };

  const tier = getTierBadge();

  return (
    <Card className="border-success/50 shadow-xl">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold">{business.name}</h3>
              {business.verified && (
                <CheckCircle2 className="h-6 w-6 text-success" />
              )}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{business.location || "Lagos, Nigeria"}</span>
            </div>
          </div>
          <Badge variant={tier.variant} className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {tier.label}
          </Badge>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 fill-warning text-warning" />
            <span className="text-xl font-bold">
              {business.rating?.toFixed(1) || "4.8"}
            </span>
          </div>
          <span className="text-muted-foreground">
            from {business.review_count?.toLocaleString() || "1,247"} reviews
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Separator />

        {/* Account Details */}
        <div className="space-y-3">
          <h4 className="font-semibold">Account Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Registered</span>
              </div>
              <p className="font-medium">
                {format(new Date(business.verification_date), "MMM yyyy")}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Successful Transactions</span>
              </div>
              <p className="font-medium">
                {business.successful_transactions?.toLocaleString() || "1,247"}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>Active Complaints</span>
              </div>
              <p className="font-medium text-success">
                {business.active_complaints || 0}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                <span>Response Rate</span>
              </div>
              <p className="font-medium">
                {business.response_rate || 98}%
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Recent Reviews */}
        <div className="space-y-3">
          <h4 className="font-semibold">Recent Reviews</h4>
          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-3">
              {recentReviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-warning text-warning"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(review.date, "MMM d, yyyy")}
                    </span>
                  </div>
                  <p className="text-sm">{review.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    - {review.author}
                  </p>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        {/* Recommendation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-lg bg-success/10 border border-success/20"
        >
          <p className="text-sm font-medium text-success">
            💡 This account appears safe
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            You can proceed with confidence based on our analysis
          </p>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onViewProfile}
            variant="default"
            className="flex-1 gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            View Full Profile
          </Button>
          <Button
            onClick={onSaveBusiness}
            variant="outline"
            className="flex-1 gap-2"
          >
            <Bookmark className="h-4 w-4" />
            Save Business
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

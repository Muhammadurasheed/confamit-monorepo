import { motion } from "framer-motion";
import { CheckCircle, Star, MapPin, Calendar, ExternalLink, Shield, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TrustScoreGauge from "@/components/shared/TrustScoreGauge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

interface VerifiedResultProps {
  accountNumber: string;
  trustScore: number;
  business: {
    business_id: string;
    name: string;
    verified: boolean;
    trust_score: number;
    rating: number;
    review_count: number;
    location?: string;
    tier: number;
    verification_date?: string | Date | null; // Can be ISO string or Date
    reviews?: Array<{
      rating: number;
      comment: string;
      reviewer_name: string;
      verified_purchase: boolean;
      created_at: Date;
    }>;
  };
  checkCount: number;
  proceedRate?: number;
}

const getTierBadge = (tier: number) => {
  const tierConfig = {
    1: { label: "Basic Verified", color: "bg-blue-500" },
    2: { label: "Verified Business", color: "bg-purple-500" },
    3: { label: "Premium Verified", color: "bg-amber-500" },
  };
  return tierConfig[tier as keyof typeof tierConfig] || tierConfig[1];
};

export const VerifiedResult = ({
  accountNumber,
  trustScore,
  business,
  checkCount,
  proceedRate = 0.87,
}: VerifiedResultProps) => {
  const tierInfo = getTierBadge(business.tier);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Success Alert */}
      <Alert className="border-2 border-success bg-success/5">
        <CheckCircle className="h-5 w-5 text-success" />
        <AlertDescription className="text-base font-semibold ml-2 text-success">
          ✅ VERIFIED BUSINESS - Safe to Proceed
        </AlertDescription>
      </Alert>

      {/* Main Verified Card */}
      <Card className="border-success/50 bg-success/5">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge className={`${tierInfo.color} text-white`}>
                  <Shield className="h-3 w-3 mr-1" />
                  {tierInfo.label}
                </Badge>
                <Badge variant="outline" className="border-success text-success">
                  <Award className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
              <CardTitle className="text-2xl mb-2">{business.name}</CardTitle>
              {business.location && (
                <p className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {business.location}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Trust Score Gauge */}
          <div className="flex justify-center">
            <TrustScoreGauge score={trustScore} size="lg" />
          </div>

          {/* Verification Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-background rounded-lg p-4 border border-success/20">
              <div className="flex items-center gap-2 text-success mb-2">
                <Star className="h-5 w-5 fill-success" />
                <span className="font-semibold">Rating</span>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {business.rating.toFixed(1)}/5
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                from {business.review_count} reviews
              </p>
            </div>

            <div className="bg-background rounded-lg p-4 border border-success/20">
              <div className="flex items-center gap-2 text-success mb-2">
                <Shield className="h-5 w-5" />
                <span className="font-semibold">Trust Score</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{business.trust_score}</p>
              <p className="text-sm text-muted-foreground mt-1">Excellent standing</p>
            </div>

            <div className="bg-background rounded-lg p-4 border border-success/20">
              <div className="flex items-center gap-2 text-primary mb-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Fraud Reports</span>
              </div>
              <p className="text-3xl font-bold text-success">0</p>
              <p className="text-sm text-muted-foreground mt-1">Clean record</p>
            </div>
          </div>

          {/* Verification Checklist */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Verification Status:
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                <span>CAC Registration Verified</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                <span>Bank Account Verified</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                <span>Business Documents Approved</span>
              </div>
              {business.verification_date && (() => {
                try {
                  // Safely parse the date
                  const date = typeof business.verification_date === 'string' 
                    ? new Date(business.verification_date) 
                    : business.verification_date;
                  
                  // Validate the date is valid
                  if (!date || isNaN(date.getTime())) {
                    return null; // Skip rendering if invalid date
                  }
                  
                  return (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">
                        Verified since {format(date, "MMMM yyyy")}
                      </span>
                    </div>
                  );
                } catch (error) {
                  console.error('Date formatting error:', error);
                  return null; // Skip rendering on error
                }
              })()}
            </div>
          </div>

          {/* Recent Reviews */}
          {business.reviews && business.reviews.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-warning fill-warning" />
                Recent Reviews:
              </h4>
              <div className="space-y-3">
                {business.reviews.slice(0, 3).map((review, index) => (
                  <div key={index} className="bg-background rounded-lg p-4 border">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={undefined} />
                          <AvatarFallback className="text-xs bg-primary/10">
                            {review.reviewer_name[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{review.reviewer_name}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating
                                    ? "text-warning fill-warning"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.verified_purchase && (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Community Stats */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Community Trust</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Times Checked:</span>
                <p className="font-semibold">{checkCount}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Proceed Rate:</span>
                <p className="font-semibold text-success">{Math.round(proceedRate * 100)}%</p>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <Alert className="border-success bg-success/5">
            <CheckCircle className="h-4 w-4 text-success" />
            <AlertDescription className="ml-2">
              <strong className="text-success">💡 This account is verified and safe to proceed</strong>
              <p className="mt-2 text-sm">
                This business has been verified by ConfirmIT with {business.review_count} positive
                reviews and a {business.rating.toFixed(1)}/5 rating. Zero fraud reports on record.
                Safe to transact.
              </p>
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="default"
              className="flex-1"
              onClick={() => window.open(`/business/${business.business_id}`, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Full Profile
            </Button>
            <Button variant="outline" className="flex-1">
              <Star className="h-4 w-4 mr-2" />
              Save to Trusted
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Why This Matters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">✨ Why Verified Businesses Matter</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">✓</span>
              <span>Legal CAC registration confirmed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">✓</span>
              <span>Bank account ownership verified</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">✓</span>
              <span>Regular monitoring and compliance checks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">✓</span>
              <span>Community-verified track record</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

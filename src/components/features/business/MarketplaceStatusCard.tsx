import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Calendar, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { initializeMarketplaceRenewal, verifyMarketplaceRenewal } from "@/services/marketplace";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";

interface MarketplaceStatusCardProps {
  businessId: string;
  marketplaceStatus?: {
    status: 'active' | 'expired' | 'inactive';
    expiryDate?: string;
    registeredAt?: string;
  };
  onStatusUpdate?: () => void;
}

const MarketplaceStatusCard = ({ 
  businessId, 
  marketplaceStatus,
  onStatusUpdate 
}: MarketplaceStatusCardProps) => {
  const [renewing, setRenewing] = useState(false);
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const isActive = marketplaceStatus?.status === 'active';
  const isExpired = marketplaceStatus?.status === 'expired';
  
  // Parse expiry date safely - handle Firestore Timestamp or ISO string
  let expiryDate: Date | null = null;
  if (marketplaceStatus?.expiryDate) {
    const expiry = marketplaceStatus.expiryDate as any;
    if (typeof expiry === 'object' && ('seconds' in expiry || '_seconds' in expiry)) {
      const seconds = expiry.seconds || expiry._seconds;
      expiryDate = new Date(seconds * 1000);
    } else {
      expiryDate = new Date(expiry);
    }
  }
    
  const daysRemaining = expiryDate && !isNaN(expiryDate.getTime())
    ? Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) 
    : 0;

  // Check for payment callback
  useEffect(() => {
    const reference = searchParams.get('reference');
    const renewalSuccess = searchParams.get('renewal');
    
    if (reference && renewalSuccess === 'success') {
      verifyPayment(reference);
      // Clean up URL
      setSearchParams({});
    }
  }, [searchParams]);

  const verifyPayment = async (reference: string) => {
    try {
      toast.loading("Verifying payment...");
      await verifyMarketplaceRenewal(businessId, reference);
      toast.dismiss();
      toast.success("Payment verified! Subscription renewed.", {
        description: "Your marketplace listing is now active for another month."
      });
      onStatusUpdate?.();
    } catch (error: any) {
      toast.dismiss();
      toast.error("Payment verification failed", {
        description: error.message
      });
    }
  };

  const handleRenew = async () => {
    if (!user?.email) {
      toast.error("Email required", {
        description: "Please update your profile with an email address"
      });
      return;
    }

    setRenewing(true);
    try {
      const result = await initializeMarketplaceRenewal(businessId, user.email);
      
      // Redirect to Paystack payment page
      window.location.href = result.authorization_url;
    } catch (error: any) {
      toast.error("Failed to initialize payment", {
        description: error.message
      });
      setRenewing(false);
    }
  };

  const handleCompleteProfile = () => {
    console.log('Complete Profile button clicked, calling onStatusUpdate');
    onStatusUpdate?.();
  };

  if (!marketplaceStatus || marketplaceStatus.status === 'inactive') {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            Marketplace Discovery - Free First Month
          </CardTitle>
          <CardDescription>
            Your business is not listed in the marketplace yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Complete your marketplace profile to appear in search results and attract customers. You get <strong>1 month free</strong>, then just ₦1,000/month to stay visible.
            </p>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-1">
              <p className="text-sm font-medium">What you'll get:</p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                <li>✓ Appear in customer searches</li>
                <li>✓ Enhanced profile with photos & products</li>
                <li>✓ Contact info & business hours display</li>
                <li>✓ Analytics on profile views & clicks</li>
              </ul>
            </div>
            <Button className="w-full" onClick={handleCompleteProfile}>
              Complete Marketplace Profile (Free 1 Month)
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className={`shadow-elegant ${isActive ? 'border-success/50' : 'border-warning/50'}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {isActive ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    Marketplace Listing Active
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-warning" />
                    Marketplace Listing Expired
                  </>
                )}
              </CardTitle>
              <CardDescription className="mt-2">
                {isActive 
                  ? "Your business appears in marketplace searches"
                  : "Renew to regain visibility in marketplace searches"
                }
              </CardDescription>
            </div>
            <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-success" : "bg-warning"}>
              {isActive ? "Active" : "Expired"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isActive && expiryDate && (
            <>
              {/* Days Remaining Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Days Remaining</span>
                  <span className="font-bold text-foreground">{daysRemaining} days</span>
                </div>
                <Progress 
                  value={(daysRemaining / 30) * 100} 
                  className="h-2"
                />
              </div>

              {/* Expiry Info */}
              {expiryDate && !isNaN(expiryDate.getTime()) && (
                <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg p-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Expires on{" "}
                    <span className="font-medium text-foreground">
                      {expiryDate.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </span>
                </div>
              )}

              {/* Warning if expiring soon */}
              {daysRemaining <= 7 && (
                <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-warning">Expiring Soon</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Renew now to maintain uninterrupted marketplace visibility
                    </p>
                  </div>
                </div>
              )}

              {/* Renew Early Button */}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleRenew}
                disabled={renewing}
              >
                {renewing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting to payment...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Renew Early - ₦1,000
                  </>
                )}
              </Button>
            </>
          )}

          {isExpired && (
            <>
              {/* Expired Message */}
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Listing Expired</p>
                    {expiryDate && !isNaN(expiryDate.getTime()) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Expired on {expiryDate.toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>✓ Your verification remains valid</p>
                  <p>✗ Not appearing in marketplace searches</p>
                  <p>✗ Enhanced features locked</p>
                </div>

                {/* Renew Now Button */}
                <Button 
                  className="w-full" 
                  onClick={handleRenew}
                  disabled={renewing}
                >
                  {renewing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirecting to payment...
                    </>
                  ) : (
                    "Renew Now - ₦1,000"
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Edit Profile Button for Active Listings */}
          {isActive && (
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={handleCompleteProfile}
            >
              Edit Marketplace Profile
            </Button>
          )}

          {/* Subscription Info */}
          <div className="text-xs text-center text-muted-foreground pt-2 border-t">
            Monthly subscription: ₦1,000 • First month free with registration
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MarketplaceStatusCard;

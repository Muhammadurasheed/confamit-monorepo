import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Shield, Sparkles, TrendingUp } from "lucide-react";
import { BUSINESS_REGISTRATION } from "@/lib/constants";

interface TierSelectorProps {
  onSelectTier: (tier: 1 | 2 | 3) => void;
}

const TierSelector = ({ onSelectTier }: TierSelectorProps) => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-block mb-4">
          <Badge className="bg-success/10 text-success border-success/20 text-base px-4 py-2">
            Simple & Transparent Pricing
          </Badge>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold">Get Verified. Build Trust.</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          One-time registration, optional monthly marketplace listing
        </p>
      </motion.div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Registration Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden border-2 border-primary/20 hover:shadow-elegant transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-[100px]" />
            
            <CardHeader className="space-y-4 relative">
              <div className="flex justify-between items-start">
                <div className="rounded-full bg-primary/10 p-3">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <Badge variant="outline" className="bg-background">
                  One-Time
                </Badge>
              </div>
              
              <div>
                <CardTitle className="text-2xl mb-2">Business Verification</CardTitle>
                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    ₦{BUSINESS_REGISTRATION.oneTimeVerification.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">One-time registration fee</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                {[
                  'Full KYC verification (CAC, bank, ID)',
                  'Trust ID NFT minted on blockchain',
                  'Basic business profile created',
                  'Verified badge on ConfirmIT',
                  `${BUSINESS_REGISTRATION.freeTrialDays}-day marketplace trial included`,
                  'One-time payment, verified forever',
                ].map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => onSelectTier(1)}
                className="w-full"
                size="lg"
              >
                Get Verified
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Marketplace Subscription Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="relative overflow-hidden border-2 border-success/20 hover:shadow-elegant transition-all">
            <div className="absolute top-0 right-0">
              <Badge className="bg-gradient-primary text-white px-6 py-2 rounded-bl-lg rounded-tr-lg shadow-lg">
                Optional Add-on
              </Badge>
            </div>
            
            <CardHeader className="space-y-4 relative pt-16">
              <div className="flex justify-between items-start">
                <div className="rounded-full bg-success/10 p-3">
                  <TrendingUp className="h-8 w-8 text-success" />
                </div>
              </div>
              
              <div>
                <CardTitle className="text-2xl mb-2">Marketplace Listing</CardTitle>
                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    ₦{BUSINESS_REGISTRATION.monthlySubscription.toLocaleString()}
                    <span className="text-lg text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-success font-medium">
                    FREE for first {BUSINESS_REGISTRATION.freeTrialDays} days
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                {[
                  'Appear in customer searches',
                  'Enhanced profile with photos',
                  'Products & services showcase',
                  'Business hours & location',
                  'Analytics dashboard',
                  'Customer reviews & ratings',
                  'Multiple contact methods',
                  'Priority in search rankings',
                ].map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> Marketplace listing is optional. 
                  Your verification and Trust ID remain valid forever, even without an active subscription.
                </p>
              </div>

              <Button
                onClick={() => onSelectTier(1)}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Start with Verification
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Value Proposition */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="bg-gradient-to-br from-primary/5 to-background border-primary/20">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">₦10K</div>
                <p className="text-sm text-muted-foreground">One-time verification</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-success mb-2">30 Days</div>
                <p className="text-sm text-muted-foreground">Free marketplace trial</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground mb-2">₦1K/mo</div>
                <p className="text-sm text-muted-foreground">Optional listing fee</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TierSelector;

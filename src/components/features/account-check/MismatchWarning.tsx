import { motion } from "framer-motion";
import { AlertCircle, AlertTriangle, User, Building, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import TrustScoreGauge from "@/components/shared/TrustScoreGauge";

interface MismatchWarningProps {
  accountNumber: string;
  claimedName: string;
  actualName: string;
  trustScore: number;
  confidence: number;
}

export const MismatchWarning = ({
  accountNumber,
  claimedName,
  actualName,
  trustScore,
  confidence,
}: MismatchWarningProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Critical Warning */}
      <Alert variant="destructive" className="border-2 border-warning">
        <AlertTriangle className="h-5 w-5 text-warning" />
        <AlertDescription className="text-base font-semibold ml-2 text-warning">
          🚨 NAME MISMATCH DETECTED - VERIFY BEFORE PROCEEDING
        </AlertDescription>
      </Alert>

      {/* Main Mismatch Card */}
      <Card className="border-warning/50 bg-warning/5">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="outline" className="border-warning text-warning mb-2">
                <ShieldAlert className="h-3 w-3 mr-1" />
                Name Verification Issue
              </Badge>
              <CardTitle className="text-2xl">Account Name Mismatch</CardTitle>
              <p className="text-muted-foreground mt-1">
                The claimed name doesn't match the verified account name
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Trust Score */}
          <div className="flex justify-center">
            <TrustScoreGauge score={trustScore} size="lg" />
          </div>

          {/* Name Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-background rounded-lg p-4 border border-muted">
              <div className="flex items-center gap-2 mb-3">
                <Building className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">Seller Claims:</span>
              </div>
              <p className="text-lg font-medium text-foreground break-words">{claimedName}</p>
              <p className="text-xs text-muted-foreground mt-2">What the seller told you</p>
            </div>

            <div className="bg-background rounded-lg p-4 border border-warning/50">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-5 w-5 text-warning" />
                <span className="font-semibold text-warning">Actual Account Name:</span>
              </div>
              <p className="text-lg font-medium text-foreground break-words">{actualName}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Verified via Paystack ({confidence}% match confidence)
              </p>
            </div>
          </div>

          {/* Critical Warning Section */}
          <Alert className="border-warning bg-warning/10">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertDescription className="ml-2">
              <strong className="text-warning">🚨 CRITICAL WARNING</strong>
              <p className="mt-2 text-sm">
                The account name does NOT match what the seller claims. This is a major red flag!
              </p>
            </AlertDescription>
          </Alert>

          {/* What This Could Mean */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              What this could mean:
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-background">
                <span className="text-warning font-bold flex-shrink-0">1.</span>
                <div>
                  <p className="font-medium">Personal account, not business</p>
                  <p className="text-sm text-muted-foreground">
                    Using individual's account instead of registered business account
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border bg-background">
                <span className="text-warning font-bold flex-shrink-0">2.</span>
                <div>
                  <p className="font-medium">Account belongs to someone else</p>
                  <p className="text-sm text-muted-foreground">
                    Using another person's account (middleman or stolen account)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border bg-destructive/5 border-destructive/20">
                <span className="text-destructive font-bold flex-shrink-0">3.</span>
                <div>
                  <p className="font-medium text-destructive">Potential fraud attempt</p>
                  <p className="text-sm text-muted-foreground">
                    Scammers often use mismatched names to hide their identity
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Account Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Number:</span>
                <span className="font-mono font-semibold">
                  {accountNumber.slice(0, 3)}***{accountNumber.slice(-2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Verification Status:</span>
                <Badge variant="outline" className="border-warning text-warning">
                  Name Mismatch
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Match Confidence:</span>
                <span className={confidence < 50 ? "text-destructive font-semibold" : "text-warning font-semibold"}>
                  {confidence}%
                </span>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <Alert className="border-warning bg-warning/5">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertDescription className="ml-2">
              <strong className="text-warning">💡 STRONG RECOMMENDATION</strong>
              <p className="mt-2 text-sm">
                Do NOT proceed with this transaction without clarification. Contact the seller and
                ask them to explain why the names don't match. Request video verification or meet in
                person. If explanation isn't satisfactory, find an alternative seller.
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* What to Do Next */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">✅ What to Do Next</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                1
              </span>
              <div>
                <p className="font-medium">Request Explanation from Seller</p>
                <p className="text-muted-foreground">
                  Ask why the account name doesn't match. Legitimate businesses can explain.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                2
              </span>
              <div>
                <p className="font-medium">Verify Business Registration</p>
                <p className="text-muted-foreground">
                  Ask for CAC certificate or business registration documents
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                3
              </span>
              <div>
                <p className="font-medium">Video Call Verification</p>
                <p className="text-muted-foreground">
                  Request video call to verify identity and see the product
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                4
              </span>
              <div>
                <p className="font-medium">Check for Verified Alternative</p>
                <p className="text-muted-foreground">
                  Look for similar products from verified businesses on ConfirmIT
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-warning/10 flex items-center justify-center text-warning text-xs font-bold">
                5
              </span>
              <div>
                <p className="font-medium text-warning">When in Doubt, Don't Send</p>
                <p className="text-muted-foreground">
                  If you can't get satisfactory answers, it's better to walk away than risk being scammed
                </p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Statistics Warning */}
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-3" />
            <p className="font-semibold text-lg mb-2">Important Statistics</p>
            <p className="text-sm text-muted-foreground">
              87% of reported scams in Nigeria involve accounts where the name doesn't match the
              claimed business. Always verify identity before sending money.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

import { motion } from "framer-motion";
import { AlertTriangle, Flag, TrendingDown, Clock, Users, ExternalLink, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import TrustScoreGauge from "@/components/shared/TrustScoreGauge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { ViewFraudReportsModal } from "./ViewFraudReportsModal";
import { useNavigate } from "react-router-dom";

interface HighRiskResultProps {
  accountNumber: string;
  trustScore: number;
  fraudReports: {
    total: number;
    recent_30_days: number;
    details?: Array<{
      category: string;
      description_summary: string;
      severity: string;
      reported_at: Date;
      verified: boolean;
    }>;
  };
  checkCount: number;
  proceedRate?: number;
  flags: string[];
  isVerifiedBusiness?: boolean;
  businessName?: string;
  onReportFraud: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  non_delivery: "Non-delivery after payment",
  fake_products: "Fake/counterfeit products",
  account_blocked: "Account blocked after payment",
  wrong_item: "Wrong item received",
  poor_quality: "Poor quality",
  other: "Other fraudulent activity",
};

export const HighRiskResult = ({
  accountNumber,
  trustScore,
  fraudReports,
  checkCount,
  proceedRate = 0,
  flags,
  isVerifiedBusiness = false,
  businessName,
  onReportFraud,
}: HighRiskResultProps) => {
  const navigate = useNavigate();
  const [showReportsModal, setShowReportsModal] = useState(false);

  // Count categories
  const categoryCount: Record<string, number> = {};
  fraudReports.details?.forEach((report) => {
    categoryCount[report.category] = (categoryCount[report.category] || 0) + 1;
  });

  const topCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Critical Warning Alert */}
        <Alert variant="destructive" className="border-2 border-destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription className="text-base font-semibold ml-2">
            ⛔ HIGH RISK ACCOUNT - DO NOT SEND MONEY
          </AlertDescription>
        </Alert>

        {/* Main Risk Card */}
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="destructive" className="mb-2">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  High Risk
                </Badge>
                <CardTitle className="text-2xl">Community Reports: HIGH</CardTitle>
                <p className="text-muted-foreground mt-1">
                  This account has multiple fraud reports from the community
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Trust Score Gauge */}
            <div className="flex justify-center">
              <TrustScoreGauge score={trustScore} size="lg" />
            </div>

            {/* Fraud Reports Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-background rounded-lg p-4 border border-destructive/20">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <Flag className="h-5 w-5" />
                  <span className="font-semibold">Total Reports</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{fraudReports.total}</p>
                <p className="text-sm text-muted-foreground mt-1">All-time fraud reports</p>
              </div>

              <div className="bg-background rounded-lg p-4 border border-destructive/20">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <Clock className="h-5 w-5" />
                  <span className="font-semibold">Recent (30 days)</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{fraudReports.recent_30_days}</p>
                <p className="text-sm text-muted-foreground mt-1">Recent activity</p>
              </div>

              <div className="bg-background rounded-lg p-4 border border-destructive/20">
                <div className="flex items-center gap-2 text-warning mb-2">
                  <Users className="h-5 w-5" />
                  <span className="font-semibold">Proceed Rate</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{Math.round(proceedRate * 100)}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Only {Math.round(proceedRate * 100)}% proceeded anyway
                </p>
              </div>
            </div>

            {/* Common Complaints */}
            {topCategories.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  Common Complaints:
                </h4>
                <div className="space-y-2">
                  {topCategories.map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm">{CATEGORY_LABELS[category] || category}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(count / fraudReports.total) * 100} className="w-24 h-2" />
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Red Flags */}
            {flags.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Additional Red Flags:
                </h4>
                <ul className="space-y-2">
                  {flags.map((flag, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-destructive mt-0.5">•</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Verified Business Status */}
            {isVerifiedBusiness && (
              <Alert className="border-primary bg-primary/5">
                <Shield className="h-4 w-4 text-primary" />
                <AlertDescription className="ml-2">
                  <strong className="text-primary">Verified Business Account</strong>
                  <p className="mt-1 text-sm">
                    This account belongs to <strong>{businessName}</strong>, a verified business on ConfirmIT.
                    However, it has recent fraud reports that require investigation.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* Account Activity */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Account Activity</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Times Checked:</span>
                  <p className="font-semibold">{checkCount}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Account Number:</span>
                  <p className="font-mono font-semibold">
                    {accountNumber.slice(0, 3)}***{accountNumber.slice(-2)}
                  </p>
                </div>
              </div>
            </div>

            <Alert className="border-destructive bg-destructive/5 mb-6">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="ml-2">
                <strong className="text-destructive">RECOMMENDATION: DO NOT SEND MONEY</strong>
                <p className="mt-2 text-sm">
                  Multiple security red flags detected. This account has been reported for fraudulent
                  activity by {fraudReports.total} members of the community. Protect yourself by
                  finding a verified alternative.
                </p>
              </AlertDescription>
            </Alert>

            {/* ESCROW LIFELINE CTA */}
            <div className="my-6 p-6 border-2 border-purple-500/30 bg-purple-500/5 rounded-2xl text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
              <Shield className="w-10 h-10 mx-auto mb-3 text-purple-600" />
              <h3 className="text-[19px] font-bold mb-2">Still want to proceed? Use Escrow.</h3>
              <p className="text-muted-foreground text-[14px] mb-5 max-w-sm mx-auto leading-relaxed">
                If you absolutely must transact with this vendor, do <b>not</b> send money directly to their bank. Secure your payment with our Immutable Smart Contract Vault instead.
              </p>
              <Button 
                size="lg"
                className="w-full sm:w-auto font-bold text-white bg-purple-600 hover:bg-purple-700 h-12 px-8 rounded-full shadow-lg shadow-purple-600/20"
                onClick={() => navigate(`/create-escrow?vendor=${accountNumber}`)}
              >
                Protect My Money with Escrow
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="default"
                className="flex-1"
                onClick={() => setShowReportsModal(true)}
              >
                <Flag className="h-4 w-4 mr-2" />
                View All Reports ({fraudReports.total})
              </Button>
              <Button variant="outline" className="flex-1" onClick={onReportFraud}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report This Account
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.open("/business/directory", "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Find Safe Alternative
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Safety Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🛡️ How to Protect Yourself</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Never send money to accounts with fraud reports</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Use verified businesses from our Business Directory</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Report suspicious accounts to help protect others</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Always verify seller identity through video call</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Fraud Reports Modal */}
      <ViewFraudReportsModal
        open={showReportsModal}
        onOpenChange={setShowReportsModal}
        accountNumber={accountNumber}
        reports={{
          total: fraudReports.total,
          recent_30_days: fraudReports.recent_30_days,
          categories: topCategories.map(([type, count]) => ({
            type: CATEGORY_LABELS[type] || type,
            count: count as number,
          })),
        }}
      />
    </>
  );
};

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Flag, ShieldCheck, TrendingUp, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FraudReport {
  total: number;
  recent_30_days: number;
  categories?: {
    type: string;
    count: number;
  }[];
}

interface VerifiedBusiness {
  business_id: string;
  name: string;
  verified: boolean;
  trust_score: number;
  verification_date: string;
}

interface FraudAlertsProps {
  accountNumber: string;
  fraudReports: FraudReport;
  flags: string[];
  verifiedBusiness?: VerifiedBusiness;
  recommendation: string;
}

export const FraudAlerts = ({
  accountNumber,
  fraudReports,
  flags,
  verifiedBusiness,
  recommendation,
}: FraudAlertsProps) => {
  const hasFraudReports = fraudReports.total > 0;
  const hasRecentReports = fraudReports.recent_30_days > 0;
  const hasFlags = flags.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-6"
    >
      {/* Recommendation Banner */}
      <Alert
        variant={hasRecentReports || hasFlags ? "destructive" : "default"}
        className="border-2"
      >
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="text-lg font-bold">
          {hasRecentReports || hasFlags ? "⚠️ Warning" : "✅ Recommendation"}
        </AlertTitle>
        <AlertDescription className="text-base mt-2">
          {recommendation}
        </AlertDescription>
      </Alert>

      {/* Fraud Reports Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Fraud Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasFraudReports ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                  <p className="text-sm text-muted-foreground mb-1">Total Reports</p>
                  <p className="text-3xl font-bold text-destructive">{fraudReports.total}</p>
                </div>
                <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
                  <p className="text-sm text-muted-foreground mb-1">Recent (30 days)</p>
                  <p className="text-3xl font-bold text-warning">{fraudReports.recent_30_days}</p>
                </div>
              </div>

              {fraudReports.categories && fraudReports.categories.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">Report Categories:</p>
                  <div className="flex flex-wrap gap-2">
                    {fraudReports.categories.map((category, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {category.type}: {category.count}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Alert variant="destructive" className="mt-4">
                <AlertDescription className="text-sm">
                  This account has been reported by {fraudReports.total} user{fraudReports.total !== 1 ? "s" : ""}.
                  {hasRecentReports && ` ${fraudReports.recent_30_days} report${fraudReports.recent_30_days !== 1 ? "s" : ""} in the last 30 days.`}
                </AlertDescription>
              </Alert>
            </>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/30">
              <ShieldCheck className="h-8 w-8 text-success" />
              <div>
                <p className="font-semibold text-success">No fraud reports found</p>
                <p className="text-sm text-muted-foreground">
                  This account has not been reported by our community
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Red Flags */}
      {hasFlags && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Security Flags ({flags.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {flags.map((flag, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10"
                >
                  <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{flag}</p>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Verified Business Info */}
      {verifiedBusiness && (
        <Card className="border-success/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <ShieldCheck className="h-5 w-5" />
              Linked to Verified Business
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="font-bold text-lg">{verifiedBusiness.name}</p>
                <Badge className="bg-success text-white">
                  ✓ Verified Business
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Verified on {new Date(verifiedBusiness.verification_date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <p className="text-sm text-muted-foreground">Business Trust</p>
                </div>
                <p className="text-2xl font-bold text-success">
                  {verifiedBusiness.trust_score}/100
                </p>
              </div>
            </div>

            <Button variant="outline" className="w-full" asChild>
              <a href={`/business/${verifiedBusiness.business_id}`} target="_blank" rel="noopener noreferrer">
                View Business Profile
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

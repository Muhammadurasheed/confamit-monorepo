import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import TrustScoreGauge from "@/components/shared/TrustScoreGauge";

interface TrustScoreProps {
  score: number;
  riskLevel: "low" | "medium" | "high";
  checkCount: number;
  lastChecked?: string;
}

export const TrustScore = ({ score, riskLevel, checkCount, lastChecked }: TrustScoreProps) => {
  const getRiskConfig = (level: string) => {
    switch (level) {
      case "low":
        return {
          color: "text-success",
          bgColor: "bg-success/10",
          borderColor: "border-success/30",
          icon: CheckCircle,
          label: "Low Risk",
          message: "This account appears safe based on our analysis",
        };
      case "medium":
        return {
          color: "text-warning",
          bgColor: "bg-warning/10",
          borderColor: "border-warning/30",
          icon: AlertTriangle,
          label: "Medium Risk",
          message: "Proceed with caution. Verify recipient details before sending money.",
        };
      case "high":
        return {
          color: "text-destructive",
          bgColor: "bg-destructive/10",
          borderColor: "border-destructive/30",
          icon: XCircle,
          label: "High Risk",
          message: "Warning! Multiple red flags detected. Do NOT send money to this account.",
        };
      default:
        return {
          color: "text-muted-foreground",
          bgColor: "bg-muted/10",
          borderColor: "border-muted/30",
          icon: Shield,
          label: "Unknown",
          message: "Unable to determine risk level",
        };
    }
  };

  const riskConfig = getRiskConfig(riskLevel);
  const RiskIcon = riskConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`border-2 ${riskConfig.borderColor}`}>
        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Trust Score Gauge */}
            <div className="flex flex-col items-center justify-center">
              <TrustScoreGauge score={score} size="lg" />
              <p className="text-sm text-muted-foreground mt-4">
                Based on {checkCount} verification{checkCount !== 1 ? "s" : ""}
              </p>
              {lastChecked && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last checked: {new Date(lastChecked).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Right: Risk Assessment */}
            <div className="space-y-6">
              {/* Risk Badge */}
              <div className="flex items-start gap-3">
                <div className={`p-3 rounded-full ${riskConfig.bgColor}`}>
                  <RiskIcon className={`h-8 w-8 ${riskConfig.color}`} />
                </div>
                <div className="flex-1">
                  <Badge
                    variant={riskLevel === "low" ? "default" : "destructive"}
                    className="mb-2 text-sm px-3 py-1"
                  >
                    {riskConfig.label}
                  </Badge>
                  <p className={`text-sm font-medium ${riskConfig.color}`}>
                    {riskConfig.message}
                  </p>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Trust Score</span>
                  <span className="text-sm font-semibold">{score}/100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Risk Level</span>
                  <Badge variant="outline" className={riskConfig.color}>
                    {riskConfig.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Community Checks</span>
                  <span className="text-sm font-semibold">{checkCount}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

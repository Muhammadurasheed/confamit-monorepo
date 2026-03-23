import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import TrustScoreGauge from "@/components/shared/TrustScoreGauge";
import { ShieldCheck, AlertTriangle, AlertCircle, Calendar, TrendingUp, FileText } from "lucide-react";
import { format } from "date-fns";

interface AccountCheckData {
  id: string;
  account_number_masked: string;
  trust_score: number;
  risk_level: 'low' | 'medium' | 'high';
  verdict: 'safe' | 'caution' | 'high_risk';
  fraud_reports_count: number;
  is_verified_business: boolean;
  business_name?: string | null;
  created_at: any;
}

interface ViewAccountResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: AccountCheckData;
}

export const ViewAccountResultModal = ({ open, onOpenChange, data }: ViewAccountResultModalProps) => {
  const getRiskLevelColor = () => {
    switch (data.risk_level) {
      case 'low':
        return 'bg-success text-success-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRiskLevelIcon = () => {
    switch (data.risk_level) {
      case 'low':
        return <ShieldCheck className="h-5 w-5" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5" />;
      case 'high':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <ShieldCheck className="h-5 w-5" />;
    }
  };

  const getRiskLevelText = () => {
    switch (data.risk_level) {
      case 'low':
        return 'Safe to Proceed';
      case 'medium':
        return 'Proceed with Caution';
      case 'high':
        return 'High Risk - Exercise Caution';
      default:
        return 'Unknown';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Account Check Result
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Account Number */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Account Number</p>
            <p className="text-2xl font-bold tracking-wider">{data.account_number_masked}</p>
            <p className="text-xs text-muted-foreground mt-1">
              <Calendar className="h-3 w-3 inline mr-1" />
              Checked on {data.created_at?.toDate ? 
                format(data.created_at.toDate(), "PPp") :
                format(new Date(data.created_at), "PPp")
              }
            </p>
          </div>

          {/* Trust Score */}
          <div className="flex flex-col items-center gap-4 p-6 bg-muted/50 rounded-lg">
            <TrustScoreGauge score={data.trust_score} size="lg" />
            <Badge className={`${getRiskLevelColor()} text-base px-4 py-2`}>
              {getRiskLevelIcon()}
              <span className="ml-2">{getRiskLevelText()}</span>
            </Badge>
          </div>

          {/* Verified Business Section */}
          {data.is_verified_business && data.business_name ? (
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-success/20 rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-success mb-1">Verified Business</h3>
                  <p className="text-sm mb-2">
                    This account belongs to <span className="font-semibold">{data.business_name}</span>, 
                    a verified business on ConfirmIT.
                  </p>
                  <ul className="text-xs space-y-1 text-success/80">
                    <li>✓ CAC Registration Verified</li>
                    <li>✓ Bank Account Verified</li>
                    <li>✓ Documents Authenticated</li>
                    <li>✓ Trust ID NFT Minted on Hedera</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-muted border rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted-foreground/10 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Not a Registered Business</h3>
                  <p className="text-sm text-muted-foreground">
                    This account is not registered as a verified business on ConfirmIT. 
                    This doesn't necessarily mean it's unsafe, but exercise caution.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Fraud Reports Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Community Reports</p>
              </div>
              <p className="text-2xl font-bold">
                {data.fraud_reports_count}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {data.fraud_reports_count === 0 ? 'No fraud reports' : 'fraud reports found'}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Community Trust</p>
              </div>
              <p className="text-2xl font-bold">
                {data.risk_level === 'low' ? 'HIGH' : 
                 data.risk_level === 'medium' ? 'MEDIUM' : 'LOW'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Based on {data.fraud_reports_count} reports
              </p>
            </div>
          </div>

          {/* Recommendation */}
          <div className={`p-4 rounded-lg border ${
            data.risk_level === 'low' ? 'bg-success/5 border-success/20' :
            data.risk_level === 'medium' ? 'bg-warning/5 border-warning/20' :
            'bg-destructive/5 border-destructive/20'
          }`}>
            <h3 className="font-semibold mb-2">💡 Recommendation</h3>
            <p className="text-sm">
              {data.risk_level === 'low' && data.is_verified_business && (
                "This account belongs to a verified business with no fraud reports. It's safe to proceed with your transaction."
              )}
              {data.risk_level === 'low' && !data.is_verified_business && (
                "No fraud reports found, but this account is not a verified business. Proceed with standard caution."
              )}
              {data.risk_level === 'medium' && (
                "Some concerns detected. Review the fraud reports and verify the business independently before proceeding."
              )}
              {data.risk_level === 'high' && (
                "Multiple fraud reports or high-risk flags detected. We strongly recommend avoiding transactions with this account."
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {data.is_verified_business && (
              <Button variant="outline" className="flex-1">
                View Business Profile
              </Button>
            )}
            {data.fraud_reports_count > 0 && (
              <Button variant="outline" className="flex-1">
                View Fraud Reports
              </Button>
            )}
            <Button onClick={() => onOpenChange(false)} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

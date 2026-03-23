import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Calendar, TrendingUp, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface FraudReport {
  id: string;
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  pattern: string;
  reported_at: string;
  verified: boolean;
}

interface FraudReportsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountNumber: string;
  reports: {
    total: number;
    recent_30_days: number;
    categories?: Array<{
      type: string;
      count: number;
    }>;
  };
}

export const ViewFraudReportsModal = ({ open, onOpenChange, accountNumber, reports }: FraudReportsModalProps) => {
  const [detailedReports, setDetailedReports] = useState<FraudReport[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && accountNumber) {
      fetchDetailedReports();
    }
  }, [open, accountNumber]);

  const fetchDetailedReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/accounts/fraud-reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountNumber }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch fraud reports');
      }

      const data = await response.json();
      setDetailedReports(data.data?.reports || []);
    } catch (error) {
      console.error('Fetch fraud reports error:', error);
      toast.error('Failed to load detailed reports');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive" as const;
      case "medium":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            Fraud Reports
          </DialogTitle>
          <DialogDescription>
            Community-reported fraudulent activity for this account
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(80vh-120px)] pr-4 overflow-x-hidden">
          <div className="space-y-6 pb-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-destructive/5 border-destructive/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium">Total Reports</span>
                </div>
                <p className="text-3xl font-bold text-destructive">{reports.total}</p>
              </div>
              <div className="p-4 rounded-lg border bg-warning/5 border-warning/20">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium">Last 30 Days</span>
                </div>
                <p className="text-3xl font-bold text-warning">{reports.recent_30_days}</p>
              </div>
            </div>

            {/* Report Categories */}
            {reports.categories && reports.categories.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold px-1">Common Scam Patterns</h4>
                <div className="flex flex-wrap gap-2">
                  {reports.categories.map((cat, index) => (
                    <Badge key={index} variant="outline" className="gap-2 bg-background/50">
                      <span>{cat.type}</span>
                      <span className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                        {cat.count}
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Reports */}
            <div className="space-y-3">
              <h4 className="font-semibold px-1">Recent Reports (Anonymized)</h4>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                </div>
              ) : detailedReports.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                  No detailed reports available
                </div>
              ) : (
                <div className="space-y-3">
                  {detailedReports.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 rounded-[16px] border bg-card hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant={getSeverityColor(report.severity)} className="capitalize">
                          {report.severity} risk
                        </Badge>
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                          {format(new Date(report.reported_at), "MMM d, yyyy")}
                        </span>
                      </div>
                      <p className="font-bold text-[15px] mb-1 text-foreground">{report.category}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {report.description || report.pattern}
                      </p>
                      {report.verified && (
                        <div className="flex items-center gap-1.5 mt-3 text-[10px] font-bold text-primary uppercase tracking-widest">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          Verified Report
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="p-4 rounded-[16px] bg-muted/50 border border-muted/50">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Note:</strong> All reports are anonymized to protect user privacy. Reports are verified by our system before being counted. Similar account patterns are analyzed to detect fraud networks.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

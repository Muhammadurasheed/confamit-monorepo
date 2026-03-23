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

        <div className="space-y-6">
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
              <h4 className="font-semibold">Common Scam Patterns</h4>
              <div className="flex flex-wrap gap-2">
                {reports.categories.map((cat, index) => (
                  <Badge key={index} variant="outline" className="gap-2">
                    <span>{cat.type}</span>
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {cat.count}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Recent Reports */}
          <div className="space-y-2">
            <h4 className="font-semibold">Recent Reports (Anonymized)</h4>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : detailedReports.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No detailed reports available
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {detailedReports.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant={getSeverityColor(report.severity)}>
                          {report.severity} risk
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(report.reported_at), "MMM d, yyyy")}
                        </span>
                      </div>
                      <p className="font-medium mb-1">{report.category}</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {report.description || report.pattern}
                      </p>
                      {report.verified && (
                        <Badge variant="outline" className="mt-2">
                          Verified Report
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Disclaimer */}
          <div className="p-4 rounded-lg bg-muted/50 border border-muted">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> All reports are anonymized to protect user privacy. Reports are verified by our system before being counted. Similar account patterns are analyzed to detect fraud networks.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

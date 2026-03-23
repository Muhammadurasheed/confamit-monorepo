import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Eye, Bot, AlertTriangle, CheckCircle, Store } from "lucide-react";
import { ForensicFindingsDisplay } from "./ForensicFindingsDisplay";
import { OCRTextDisplay } from "./OCRTextDisplay";
import TrustScoreGauge from "@/components/shared/TrustScoreGauge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ForensicDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptId: string;
  receiptImageUrl?: string;
  forensicDetails: {
    ocr_confidence: number;
    manipulation_score: number;
    metadata_flags: string[];
    forensic_findings?: Array<{
      category: string;
      severity: 'pass' | 'medium' | 'high' | 'critical';
      finding: string;
      explanation: string;
    }>;
    forensic_progress?: Array<{
      stage: string;
      message: string;
      progress: number;
      details?: Record<string, any>;
      agent?: string;
    }>;
    technical_details?: {
      ela_analysis?: {
        manipulation_detected?: boolean;
        statistics?: {
          mean_error: number;
          max_error: number;
          std_error: number;
          bright_pixel_ratio: number;
        };
        suspicious_regions?: Array<{
          x: number;
          y: number;
          width: number;
          height: number;
          severity: number;
          mean_error: number;
          max_error: number;
        }>;
        heatmap?: number[][];
        image_dimensions?: { width: number; height: number };
        techniques?: string[];
        pixel_diff?: {
          diff_map: number[][];
          dimensions: { width: number; height: number };
          statistics: {
            changed_pixels: number;
            total_pixels: number;
            change_percentage: number;
            max_difference: number;
            mean_difference: number;
          };
          hotspots: Array<{
            x: number;
            y: number;
            width: number;
            height: number;
            intensity: number;
            changed_pixels: number;
          }>;
        };
      };
      pixel_results?: any;
      template_results?: any;
      metadata_results?: any;
      vision_data?: {
        total_amount?: string;
        receipt_date?: string;
        merchant_name?: string;
      };
    };
    agent_logs?: Array<{
      agent: string;
      status: string;
      confidence?: number;
      manipulation_score?: number;
      flags?: number;
      accounts_checked?: number;
    }>;
  };
  ocrText?: string;
  merchant?: {
    name: string;
    verified: boolean;
    trust_score: number;
  } | null;
}

export const ForensicDetailsModal = ({
  open,
  onOpenChange,
  receiptId,
  receiptImageUrl,
  forensicDetails,
  ocrText,
  merchant,
}: ForensicDetailsModalProps) => {
  const visionData = forensicDetails.technical_details?.vision_data;
  const merchantName = visionData?.merchant_name;
  const totalAmount = visionData?.total_amount;
  const receiptDate = visionData?.receipt_date;
  const agentLogs = forensicDetails.agent_logs;

  const agentActivities = (forensicDetails.forensic_progress || []).reduce((acc, curr) => {
    const agent = curr.agent || 'unknown';
    if (!acc[agent]) acc[agent] = [];
    acc[agent].push(curr);
    return acc;
  }, {} as Record<string, NonNullable<typeof forensicDetails.forensic_progress>>);

  // Try to get ELA data from nested structure first, then fallback to flattened
  const elaAnalysis = forensicDetails.technical_details?.ela_analysis || {
    suspicious_regions: (forensicDetails as any).suspicious_regions,
    image_dimensions: (forensicDetails as any).image_dimensions,
    statistics: (forensicDetails as any).statistics,
    pixel_diff: (forensicDetails as any).pixel_diff,
    manipulation_detected: (forensicDetails as any).manipulation_detected,
    techniques: (forensicDetails as any).techniques_detected || [],
  };

  // Check for ELA data
  const hasELAData = elaAnalysis && (
    (Array.isArray(elaAnalysis.suspicious_regions) && elaAnalysis.suspicious_regions.length > 0) ||
    (elaAnalysis.statistics && Object.keys(elaAnalysis.statistics).length > 0)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-5 w-5 text-primary" />
            Forensic Analysis Details
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="findings" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="findings">Findings</TabsTrigger>
            <TabsTrigger value="ocr">OCR Text</TabsTrigger>
            <TabsTrigger value="merchant">Merchant</TabsTrigger>
            <TabsTrigger value="agents">AI Agents</TabsTrigger>
          </TabsList>

          <TabsContent value="findings" className="space-y-6 mt-6">
            <ForensicFindingsDisplay
              findings={forensicDetails.forensic_findings || []}
              manipulationScore={forensicDetails.manipulation_score}
              metadataFlags={forensicDetails.metadata_flags}
            />

            {hasELAData && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Error Level Analysis (ELA)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Analysis Statistics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Mean Error:</span>
                          <span>{elaAnalysis.statistics?.mean_error?.toFixed(4) || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max Error:</span>
                          <span>{elaAnalysis.statistics?.max_error?.toFixed(4) || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bright Pixel Ratio:</span>
                          <span>{((elaAnalysis.statistics?.bright_pixel_ratio || 0) * 100).toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                    {elaAnalysis.manipulation_detected && (
                      <div className="flex items-center justify-center p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                        <div className="text-center">
                          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                          <p className="font-semibold text-destructive">Manipulation Detected</p>
                          <p className="text-xs text-destructive/80 mt-1">
                            High error rates in localized regions
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* OCR Text Tab */}
          <TabsContent value="ocr" className="space-y-6 mt-6">
            <OCRTextDisplay
              ocrText={ocrText || ''}
              confidence={forensicDetails.ocr_confidence}
              merchant={merchantName}
              amount={totalAmount}
              date={receiptDate}
            />
          </TabsContent>

          {/* Merchant Info Tab */}
          <TabsContent value="merchant" className="space-y-6 mt-6">
            {merchant || merchantName ? (
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{merchant?.name || merchantName}</h3>
                      {merchant && (
                        <Badge variant={merchant.verified ? "default" : "secondary"} className="gap-1">
                          {merchant.verified && <CheckCircle className="h-3 w-3" />}
                          {merchant.verified ? 'Verified Merchant' : 'Unverified'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {merchant?.trust_score !== undefined && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">Merchant Trust Score</p>
                      <TrustScoreGauge score={merchant.trust_score} size="sm" />
                    </div>
                  )}
                  {(totalAmount || receiptDate) && (
                    <div className="pt-4 border-t space-y-2">
                      <h4 className="font-semibold text-sm">Transaction Details</h4>
                      {totalAmount && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Amount:</span>
                          <span className="text-sm font-medium">{totalAmount}</span>
                        </div>
                      )}
                      {receiptDate && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Date:</span>
                          <span className="text-sm font-medium">{receiptDate}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <Store className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No merchant information available</p>
              </Card>
            )}
          </TabsContent>

          {/* AI Agents Tab */}
          <TabsContent value="agents" className="space-y-6 mt-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Agent Execution & Activities
                </h3>

                {agentLogs && Array.isArray(agentLogs) && agentLogs.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {agentLogs.map((log, idx) => {
                      const agentName = log.agent;
                      const activities = agentActivities[agentName] || [];

                      return (
                        <AccordionItem key={idx} value={`agent-${idx}`}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-3">
                                <Bot className="h-4 w-4 text-primary" />
                                <span className="font-medium capitalize">{agentName} Agent</span>
                                <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                                  {log.status}
                                </Badge>
                              </div>
                              {activities.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {activities.length} activities
                                </span>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pt-2">
                              {/* Agent Summary */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                                {log.confidence !== undefined && (
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1">Confidence</div>
                                    <div className="font-semibold">{log.confidence}%</div>
                                  </div>
                                )}
                                {log.manipulation_score !== undefined && (
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1">Manipulation</div>
                                    <div className="font-semibold">{log.manipulation_score}%</div>
                                  </div>
                                )}
                                {log.flags !== undefined && (
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1">Flags</div>
                                    <div className="font-semibold">{log.flags}</div>
                                  </div>
                                )}
                                {log.accounts_checked !== undefined && (
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1">Accounts</div>
                                    <div className="font-semibold">{log.accounts_checked}</div>
                                  </div>
                                )}
                              </div>

                              {/* Detailed Activities */}
                              {activities.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                                    Detailed Activities
                                  </h4>
                                  <div className="space-y-2">
                                    {activities.map((step, stepIdx) => (
                                      <div key={stepIdx} className="p-3 rounded-lg border bg-card">
                                        <div className="flex items-start justify-between mb-1">
                                          <span className="text-xs font-semibold uppercase text-primary">
                                            {step.stage?.replace(/_/g, ' ')}
                                          </span>
                                          <span className="text-xs text-muted-foreground">
                                            {step.progress}%
                                          </span>
                                        </div>
                                        <p className="text-sm">{step.message}</p>
                                        {step.details && Object.keys(step.details).length > 0 && (
                                          <div className="mt-2 flex flex-wrap gap-1">
                                            {Object.entries(step.details).map(([key, value]) => (
                                              <span key={key} className="text-xs px-2 py-0.5 rounded bg-muted">
                                                {key}: <span className="font-medium">{String(value)}</span>
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {activities.length === 0 && (
                                <div className="text-center py-4 text-sm text-muted-foreground">
                                  No detailed activity logs available for this agent
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No agent execution logs available</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
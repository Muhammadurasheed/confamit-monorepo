import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ForensicFinding {
  category: string;
  severity: 'pass' | 'medium' | 'high' | 'critical';
  finding: string;
  explanation: string;
}

interface ForensicFindingsDisplayProps {
  findings: ForensicFinding[];
  manipulationScore: number;
  metadataFlags?: string[];
}

const getSeverityConfig = (severity: string) => {
  switch (severity) {
    case 'critical':
      return {
        icon: XCircle,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-500/10',
        badgeVariant: 'destructive' as const,
        label: 'CRITICAL',
      };
    case 'high':
      return {
        icon: AlertTriangle,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-500/10',
        badgeVariant: 'destructive' as const,
        label: 'HIGH RISK',
      };
    case 'medium':
      return {
        icon: ShieldAlert,
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        badgeVariant: 'default' as const,
        label: 'WARNING',
      };
    case 'pass':
      return {
        icon: CheckCircle,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-500/10',
        badgeVariant: 'secondary' as const,
        label: 'PASS',
      };
    default:
      return {
        icon: AlertTriangle,
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-500/10',
        badgeVariant: 'secondary' as const,
        label: 'UNKNOWN',
      };
  }
};

export const ForensicFindingsDisplay = ({ findings, manipulationScore, metadataFlags }: ForensicFindingsDisplayProps) => {
  if (!findings || findings.length === 0) {
    return (
      <Alert>
        <AlertDescription>No detailed forensic findings available</AlertDescription>
      </Alert>
    );
  }

  const criticalFindings = findings.filter(f => f.severity === 'critical' || f.severity === 'high');
  const passedFindings = findings.filter(f => f.severity === 'pass');

  return (
    <div className="space-y-4">
      {/* Summary Banner */}
      <Card className={`p-4 border-l-4 ${manipulationScore >= 70 ? 'border-l-red-500' : manipulationScore >= 40 ? 'border-l-yellow-500' : 'border-l-green-500'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold mb-1">Forensic Analysis Summary</h4>
            <p className="text-sm text-muted-foreground">
              {criticalFindings.length > 0
                ? `${criticalFindings.length} critical issue(s) detected`
                : `All ${passedFindings.length} forensic checks passed`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{manipulationScore}/100</div>
            <div className="text-xs text-muted-foreground">Manipulation Score</div>
          </div>
        </div>
      </Card>

      {/* Metadata Flags */}
      {metadataFlags && metadataFlags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {metadataFlags.map((flag, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {flag}
            </Badge>
          ))}
        </div>
      )}

      {/* Detailed Findings */}
      <div className="space-y-3">
        {findings.map((finding, index) => {
          const config = getSeverityConfig(finding.severity);
          const Icon = config.icon;

          return (
            <Card key={index} className={`overflow-hidden ${config.bgColor}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${config.bgColor} flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={config.badgeVariant} className="text-xs">
                            {config.label}
                          </Badge>
                          <span className="font-semibold text-sm">{finding.category}</span>
                        </div>
                        <p className="text-sm font-medium">{finding.finding}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {finding.explanation}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

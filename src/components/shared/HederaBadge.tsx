import { Shield, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HederaBadgeProps {
  transactionId?: string;
  explorerUrl?: string;
  consensusTimestamp?: string;
  variant?: "receipt" | "business" | "account";
  size?: "sm" | "md" | "lg";
}

const HederaBadge = ({
  transactionId,
  explorerUrl,
  consensusTimestamp,
  variant = "receipt",
  size = "md",
}: HederaBadgeProps) => {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const labels = {
    receipt: "Verified on Hedera",
    business: "Trust ID NFT",
    account: "Blockchain Verified",
  };

  if (!transactionId) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-2">
            <Badge
              variant="outline"
              className={`${sizeClasses[size]} border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-300`}
            >
              <Shield className={`${iconSizes[size]} mr-1 fill-primary`} />
              {labels[variant]}
            </Badge>
            {explorerUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 hover:bg-primary/10"
                asChild
              >
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <ExternalLink className={iconSizes[size]} />
                </a>
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold text-primary">
              Immutably Verified on Hedera
            </p>
            <p className="text-xs text-muted-foreground">
              This {variant} has been cryptographically anchored to the Hedera
              distributed ledger, ensuring permanent, tamper-proof verification.
            </p>
            {consensusTimestamp && (
              <p className="text-xs text-muted-foreground">
                <strong>Consensus Time:</strong> {new Date(consensusTimestamp).toLocaleString()}
              </p>
            )}
            {transactionId && (
              <p className="text-xs text-muted-foreground break-all">
                <strong>TX ID:</strong> {transactionId}
              </p>
            )}
            <p className="text-xs text-primary font-medium">
              Click the link icon to view on Hedera explorer →
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default HederaBadge;

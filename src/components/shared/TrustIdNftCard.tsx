import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Award, Sparkles, Copy, Check, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import HederaBadge from "./HederaBadge";
import confirmitLogo from "@/assets/confirmit-logo.png";

interface TrustIdNftCardProps {
  tokenId: string;
  serialNumber: string;
  explorerUrl: string;
  trustScore: number;
  verificationTier: number;
  businessName: string;
}

const TrustIdNftCard = ({
  tokenId,
  serialNumber,
  explorerUrl,
  trustScore,
  verificationTier,
  businessName,
}: TrustIdNftCardProps) => {
  const tierNames = {
    1: "Basic",
    2: "Verified",
    3: "Premium",
  };

  const tierColors = {
    1: "bg-slate-500",
    2: "bg-blue-500",
    3: "bg-gradient-to-r from-amber-500 to-orange-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden border-2 border-primary/30 shadow-elegant">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-pulse" />
        
        <CardHeader className="relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Trust ID NFT</CardTitle>
                <CardDescription>Hedera Token Service</CardDescription>
              </div>
            </div>
            <Badge className={`${tierColors[verificationTier]} text-white`}>
              {tierNames[verificationTier]}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {/* NFT Visual Representation */}
          <div className="p-6 rounded-lg bg-gradient-to-br from-primary/20 via-accent/10 to-primary/10 border border-primary/20">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-4 rounded-full bg-background/80 backdrop-blur-sm">
                <img src={confirmitLogo} alt="ConfirmIT" className="h-12 w-12" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{trustScore}</p>
                <p className="text-xs text-muted-foreground">Trust Score</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                <span>NFT Serial #{serialNumber}</span>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Business</p>
              <p className="font-semibold">{businessName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Token ID</p>
              <p className="text-sm font-mono break-all">{tokenId}</p>
            </div>
          </div>

          {/* View on Explorer */}
          <Button
            className="w-full"
            variant="outline"
            asChild
          >
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View on Hedera Explorer
            </a>
          </Button>

          {/* Features */}
          <div className="pt-4 border-t space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              <span>Immutable on-chain identity</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4 text-primary" />
              <span>Cryptographically verified trust</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Real-time reputation tracking</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TrustIdNftCard;

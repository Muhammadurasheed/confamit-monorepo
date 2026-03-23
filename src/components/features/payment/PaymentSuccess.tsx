import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Download, ExternalLink, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface PaymentSuccessProps {
  amount: string;
  reference: string;
  paymentMethod: string;
  businessId: string;
  transactionHash?: string;
  explorerUrl?: string;
}

export const PaymentSuccess = ({
  amount,
  reference,
  paymentMethod,
  businessId,
  transactionHash,
  explorerUrl,
}: PaymentSuccessProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger confetti animation
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      confetti({
        particleCount: 3,
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleDownloadReceipt = () => {
    // TODO: Implement receipt download
    console.log("Download receipt:", reference);
  };

  const handleGoToDashboard = () => {
    navigate(`/business/dashboard/${businessId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <Card className="shadow-2xl border-success/50">
        <CardContent className="p-8 text-center space-y-6">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center"
          >
            <div className="rounded-full bg-success/10 p-6">
              <CheckCircle className="h-20 w-20 text-success" />
            </div>
          </motion.div>

          {/* Success Message */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-success">Payment Successful!</h2>
            <p className="text-muted-foreground">
              Your business verification payment has been confirmed
            </p>
          </div>

          {/* Payment Details */}
          <Card className="bg-muted/50">
            <CardContent className="p-4 space-y-3 text-left">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Amount Paid</span>
                <span className="font-bold text-lg">{amount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Reference</span>
                <span className="font-mono text-sm">{reference}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Payment Method</span>
                <Badge variant="outline">{paymentMethod}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="text-sm">{new Date().toLocaleDateString()}</span>
              </div>
              {transactionHash && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Transaction</span>
                  <span className="font-mono text-xs">{transactionHash.slice(0, 16)}...</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Blockchain Explorer Link */}
          {explorerUrl && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(explorerUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Blockchain Explorer
            </Button>
          )}

          {/* Success Badge */}
          <div className="flex flex-col items-center gap-2">
            <Badge className="bg-success text-white px-6 py-2 text-base">
              🎉 Business Verified - Tier 3 Premium
            </Badge>
            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to your registered address
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button variant="outline" onClick={handleDownloadReceipt} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
            <Button onClick={handleGoToDashboard} className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Clock, AlertCircle } from "lucide-react";

interface PaymentPendingProps {
  paymentMethod: string;
  status: 'initializing' | 'pending' | 'confirming';
  message?: string;
  onCancel?: () => void;
}

export const PaymentPending = ({
  paymentMethod,
  status,
  message,
  onCancel,
}: PaymentPendingProps) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'initializing':
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin text-primary" />,
          title: 'Initializing Payment...',
          description: 'Please wait while we set up your payment',
        };
      case 'pending':
        return {
          icon: <Clock className="h-8 w-8 text-warning animate-pulse" />,
          title: 'Waiting for Payment...',
          description: 'Please complete your payment to continue',
        };
      case 'confirming':
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin text-primary" />,
          title: 'Confirming Payment...',
          description: 'Verifying your payment on the blockchain',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex justify-center items-center min-h-[400px]"
    >
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          {/* Animated Icon */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex justify-center"
          >
            <div className="rounded-full bg-primary/10 p-6">
              {statusInfo.icon}
            </div>
          </motion.div>

          {/* Status Text */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">{statusInfo.title}</h3>
            <p className="text-muted-foreground">{statusInfo.description}</p>
            {message && (
              <p className="text-sm text-muted-foreground">{message}</p>
            )}
          </div>

          {/* Loading Bar */}
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-primary"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ width: '50%' }}
            />
          </div>

          {/* Info Alert */}
          {status === 'pending' && paymentMethod === 'crypto' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                After sending, confirmation may take 3-5 minutes on the blockchain network.
                Please do not close this window.
              </AlertDescription>
            </Alert>
          )}

          {/* Payment Method Badge */}
          <div className="text-sm text-muted-foreground">
            Payment Method: <span className="font-semibold">{paymentMethod}</span>
          </div>

          {/* Cancel Button (only for initializing) */}
          {status === 'initializing' && onCancel && (
            <Button variant="outline" onClick={onCancel} className="w-full">
              Cancel
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

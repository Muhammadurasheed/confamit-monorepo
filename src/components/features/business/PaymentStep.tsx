import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CreditCard, Building2, Sparkles, Copy, QrCode, CheckCircle, Loader2 } from "lucide-react";
import { BUSINESS_TIERS } from "@/lib/constants";
import { toast } from "sonner";

interface PaymentStepProps {
  tier: 1 | 2 | 3;
  onPaymentComplete: (paymentMethod: string, transactionId: string) => void;
}

const PaymentStep = ({ tier, onPaymentComplete }: PaymentStepProps) => {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer" | "hedera">("hedera");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "waiting" | "confirmed">("idle");

  const tierInfo = BUSINESS_TIERS[tier];
  const basePrice = tierInfo.price;
  
  // Hedera discount: 15% off
  const hederaDiscount = 0.15;
  const hederaPrice = Math.round(basePrice * (1 - hederaDiscount));
  const hederaSavings = basePrice - hederaPrice;
  
  // USD conversion (approximate rate: 1 USD = ₦1,550)
  const usdRate = 1550;
  const usdAmount = Math.round(hederaPrice / usdRate);

  const hederaAddress = "0.0.1234567"; // Demo address
  
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(hederaAddress);
    toast.success("Address copied to clipboard!");
  };

  // This component is now deprecated - payment happens on dedicated payment page
  // Keep for backward compatibility but navigate to new flow
  const handlePayment = () => {
    toast.info("Redirecting to payment page...");
    // Will be replaced with actual navigation in BusinessRegister
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold">Complete Payment</h3>
        <p className="text-muted-foreground">
          Tier {tier} {tierInfo.name} Verification
        </p>
      </div>

      {/* Payment Method Selection */}
      <Card>
        <CardContent className="pt-6">
          <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
            <div className="space-y-4">
              {/* Hedera Payment - Featured */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  paymentMethod === "hedera"
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setPaymentMethod("hedera")}
              >
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-gradient-primary text-white shadow-lg">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Save ₦{hederaSavings.toLocaleString()} (15% OFF)
                  </Badge>
                </div>
                
                <div className="flex items-start gap-4">
                  <RadioGroupItem value="hedera" id="hedera" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="hedera" className="flex items-center gap-2 cursor-pointer">
                      <img
                        src="https://hedera.com/favicon.ico"
                        alt="Hedera"
                        className="h-5 w-5"
                      />
                      <span className="font-semibold">Pay with USDT on Hedera</span>
                    </Label>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-primary">
                          ${usdAmount} USDT
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          ₦{basePrice.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ≈ ₦{hederaPrice.toLocaleString()} at current rate
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          ⚡ Instant confirmation
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          🔒 Blockchain secured
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          💰 Best price
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card Payment */}
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  paymentMethod === "card"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setPaymentMethod("card")}
              >
                <div className="flex items-start gap-4">
                  <RadioGroupItem value="card" id="card" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="h-5 w-5" />
                      <span className="font-semibold">Card Payment</span>
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      ₦{basePrice.toLocaleString()}/year
                    </p>
                  </div>
                </div>
              </div>

              {/* Bank Transfer */}
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  paymentMethod === "transfer"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setPaymentMethod("transfer")}
              >
                <div className="flex items-start gap-4">
                  <RadioGroupItem value="transfer" id="transfer" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="transfer" className="flex items-center gap-2 cursor-pointer">
                      <Building2 className="h-5 w-5" />
                      <span className="font-semibold">Bank Transfer</span>
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      ₦{basePrice.toLocaleString()}/year
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Hedera Payment Details */}
      <AnimatePresence mode="wait">
        {paymentMethod === "hedera" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Send USDT to:</p>
                  <div className="flex items-center justify-center gap-2 bg-muted p-3 rounded-lg">
                    <code className="text-lg font-mono">{hederaAddress}</code>
                    <Button variant="ghost" size="sm" onClick={handleCopyAddress}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="outline" size="sm">
                    <QrCode className="h-4 w-4 mr-2" />
                    Show QR Code
                  </Button>
                </div>

                {paymentStatus === "waiting" && (
                  <Alert>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertDescription>
                      Waiting for blockchain confirmation...
                    </AlertDescription>
                  </Alert>
                )}

                {paymentStatus === "confirmed" && (
                  <Alert className="border-success bg-success/10">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <AlertDescription className="text-success">
                      ✓ Payment confirmed on Hedera blockchain!
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <Button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : paymentMethod === "hedera" ? (
          <>Pay ${usdAmount} USDT</>
        ) : (
          <>Pay ₦{basePrice.toLocaleString()}</>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        By proceeding, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
};

export default PaymentStep;

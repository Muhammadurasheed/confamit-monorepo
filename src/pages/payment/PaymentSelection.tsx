import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentMethodCard } from "@/components/features/payment/PaymentMethodCard";
import { usePaymentStore } from "@/store/paymentStore";
import { paymentService } from "@/services/payment";
import { BUSINESS_TIERS } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";

const PaymentSelection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const businessId = searchParams.get('businessId');
  const businessName = searchParams.get('businessName');
  const tier = parseInt(searchParams.get('tier') || '1');
  
  
  const [pricing, setPricing] = useState<{ ngn: number; usd: number; discountedUsd: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    selectedMethod,
    setPaymentMethod,
    setBusinessContext,
    setPaymentStatus,
  } = usePaymentStore();

  useEffect(() => {
    // Validate required params
    if (!businessId || !businessName) {
      toast.error("Missing payment information");
      navigate('/business/register');
      return;
    }

    // Fetch pricing
    const fetchPricing = async () => {
      try {
        const tierPricing = await paymentService.getTierPricing(tier);
        setPricing(tierPricing);
        
        // Set business context
        setBusinessContext({
          businessId,
          businessName,
          tier,
          amount: { ngn: tierPricing.ngn, usd: tierPricing.discountedUsd },
        });
      } catch (error) {
        toast.error("Failed to fetch pricing");
        console.error(error);
      }
    };

    fetchPricing();
  }, [businessId, businessName, tier, setBusinessContext, navigate]);

  const handlePaystackPayment = async () => {
    if (!user?.email) {
      toast.error("Please sign in to continue");
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setPaymentMethod('paystack');
    setPaymentStatus('initializing');

    try {
      const response = await paymentService.initializePaystackPayment({
        businessId: businessId!,
        email: user.email,
        tier,
      });

      if (response.success && response.authorization_url) {
        // Redirect to Paystack checkout
        window.location.href = response.authorization_url;
      } else {
        throw new Error("Failed to initialize payment");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payment initialization failed");
      setPaymentStatus('failed');
    } finally {
      setIsLoading(false);
    }
  };


  if (!pricing) {
    return <div>Loading...</div>;
  }

  const tierInfo = BUSINESS_TIERS[tier as 1 | 2 | 3];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-subtle">
      <Header />
      <main className="flex-1 py-12">
        <Container className="max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold mb-3">Complete Payment</h1>
            <p className="text-xl text-muted-foreground">
              {businessName} - Tier {tier} {tierInfo.name} Verification
            </p>
          </motion.div>

          {/* Payment Methods */}
          <Card className="shadow-elegant mb-6">
            <CardHeader>
              <CardTitle>Choose Payment Method</CardTitle>
              <CardDescription>
                Select how you'd like to pay for your business verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Card Payment - Primary Option */}
              <PaymentMethodCard
                icon={CreditCard}
                title="Pay with Card or Bank Transfer"
                description="Debit card, credit card, or bank transfer via Paystack"
                amount={`₦${pricing.ngn.toLocaleString()}`}
                badges={["💳 All cards accepted", "🏦 Bank transfer", "⚡ Instant verification"]}
                isRecommended={true}
                isSelected={selectedMethod === 'paystack'}
                onClick={handlePaystackPayment}
              />
            </CardContent>
          </Card>

          {/* Benefits Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold">Secure Payment via Paystack</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✓ Instant payment confirmation</li>
                    <li>✓ Multiple payment options (Card, Bank Transfer, USSD)</li>
                    <li>✓ Bank-grade security and encryption</li>
                    <li>✓ Automatic activation after payment</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </Container>
      </main>
      <Footer />

    </div>
  );
};

export default PaymentSelection;

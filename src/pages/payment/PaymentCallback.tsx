import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import { PaymentPending } from "@/components/features/payment/PaymentPending";
import { PaymentSuccess } from "@/components/features/payment/PaymentSuccess";
import { usePaymentStore } from "@/store/paymentStore";
import { paymentService } from "@/services/payment";

const PaymentCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [paymentData, setPaymentData] = useState<any>(null);
  const [actualBusinessId, setActualBusinessId] = useState<string | null>(null);
  
  const { businessId, tier, setPaymentStatus, setBusinessContext } = usePaymentStore();
  
  // Extract payment reference from URL
  const paystackReference = searchParams.get('reference') || searchParams.get('trxref');
  const nowpaymentsInvoiceId = searchParams.get('invoice_id') || searchParams.get('payment_id');
  const paymentStatus = searchParams.get('payment_status'); // NOWPayments sends this

  useEffect(() => {
    const verifyPayment = async () => {
      // Determine payment method and reference
      const paymentMethod = paystackReference ? 'paystack' : 'nowpayments';
      const reference = paystackReference || nowpaymentsInvoiceId;
      
      if (!reference) {
        toast.error("No payment reference found");
        setVerificationStatus('failed');
        setTimeout(() => navigate('/business/register'), 2000);
        return;
      }

      setPaymentStatus('confirming');

      try {
        // For NOWPayments, if status is not 'finished', start polling
        if (paymentMethod === 'nowpayments' && paymentStatus !== 'finished') {
          // Poll for payment status
          let attempts = 0;
          const maxAttempts = 60; // Poll for up to 5 minutes (60 * 5 seconds)
          
          const pollStatus = async () => {
            try {
              const statusResponse = await paymentService.getPaymentStatus(businessId);
              
              if (statusResponse.status === 'completed' || statusResponse.status === 'finished') {
                // Verify the payment
                const verifyResponse = await paymentService.verifyPayment({
                  businessId,
                  paymentMethod,
                  reference,
                });
                
                if (verifyResponse.success) {
                  setPaymentData(verifyResponse.payment);
                  setVerificationStatus('success');
                  setPaymentStatus('success');
                  toast.success("Crypto payment confirmed on blockchain!");
                  
                  setTimeout(() => {
                    navigate(`/business/dashboard/${businessId}`);
                  }, 5000);
                }
                return true;
              } else if (statusResponse.status === 'failed' || statusResponse.status === 'expired') {
                throw new Error("Payment failed or expired");
              }
              
              // Continue polling
              attempts++;
              if (attempts < maxAttempts) {
                setTimeout(pollStatus, 5000);
              } else {
                throw new Error("Payment confirmation timeout. Please contact support.");
              }
            } catch (error) {
              console.error("Polling error:", error);
              throw error;
            }
          };
          
          await pollStatus();
        } else {
          // Direct verification for Paystack
          // Extract businessId from URL if not in store (Paystack includes it in metadata)
          let bizId = businessId;
          
          if (!bizId && paymentMethod === 'paystack') {
            // Extract businessId from reference. Reference format is:
            // "BIZ-${businessId}-${timestamp}" and businessId itself starts with "BIZ-"
            // Example: BIZ-BIZ-MHBNZECR4NKMDP4-1730179736957
            const match = reference.match(/BIZ-(BIZ-[A-Z0-9]+)/i);
            if (match && match[1]) {
              bizId = match[1];
            } else {
              // Fallback: split and reconstruct
              const parts = reference.split('-');
              const bizIndex = parts.findIndex(p => p.toUpperCase() === 'BIZ');
              if (bizIndex !== -1 && parts[bizIndex + 1]) {
                bizId = `BIZ-${parts[bizIndex + 1]}`;
              }
            }
          }
          
          if (!bizId) {
            toast.error("Business information missing");
            setVerificationStatus('failed');
            setTimeout(() => navigate('/business/register'), 2000);
            return;
          }
          
          const response = await paymentService.verifyPayment({
            businessId: bizId,
            paymentMethod,
            reference,
          });

          if (response.success) {
            setPaymentData(response.payment);
            setActualBusinessId(bizId);
            setVerificationStatus('success');
            setPaymentStatus('success');
            toast.success("Payment verified successfully!");
            
            // Update businessId in store if it wasn't there
            if (!businessId) {
              setBusinessContext({
                businessId: bizId,
                businessName: '',
                tier: tier || 1,
                amount: { ngn: 0, usd: 0 },
              });
            }
            
            // Payment successful - redirect to business dashboard for rich UX
            toast.success("Payment verified! Taking you to your dashboard...");
            
            setTimeout(() => {
              navigate(`/business/dashboard/${bizId}`);
            }, 2000);
          } else {
            throw new Error(response.message || "Payment verification failed");
          }
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        toast.error(error instanceof Error ? error.message : "Payment verification failed");
        setVerificationStatus('failed');
        setPaymentStatus('failed');
        
        setTimeout(() => {
          navigate(`/payment?businessId=${businessId}&tier=${tier}`);
        }, 3000);
      }
    };

    verifyPayment();
  }, [paystackReference, nowpaymentsInvoiceId, paymentStatus, businessId, tier, setPaymentStatus, setBusinessContext, navigate]);

  const getDisplayAmount = () => {
    if (!paymentData) return '';
    
    if (paymentData.currency === 'NGN') {
      return `₦${paymentData.amount?.toLocaleString()}`;
    } else {
      return `${paymentData.pay_amount || paymentData.amount} ${paymentData.pay_currency?.toUpperCase() || paymentData.currency}`;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-subtle">
      <Header />
      <main className="flex-1 py-12">
        <Container className="max-w-2xl">
          {verificationStatus === 'verifying' && (
            <PaymentPending
              paymentMethod={paystackReference ? 'Paystack' : 'Crypto'}
              status="confirming"
              message="Please wait while we confirm your payment..."
            />
          )}

          {verificationStatus === 'success' && paymentData && (
            <PaymentSuccess
              amount={getDisplayAmount()}
              reference={paystackReference || nowpaymentsInvoiceId || ''}
              paymentMethod={paystackReference ? 'Paystack' : 'Crypto'}
              businessId={actualBusinessId || businessId || ''}
              transactionHash={paymentData.txn_id || paymentData.transaction}
              explorerUrl={
                paymentData.txn_id
                  ? `https://hashscan.io/testnet/transaction/${paymentData.txn_id}`
                  : undefined
              }
            />
          )}

          {verificationStatus === 'failed' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-destructive mb-4">Payment Verification Failed</h2>
              <p className="text-muted-foreground mb-6">
                We couldn't verify your payment. You'll be redirected to try again.
              </p>
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentCallback;

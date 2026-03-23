import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShieldCheck, TrendingDown, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AccountInputWithBankResolution } from "@/components/features/account-check/AccountInputWithBankResolution";
import { AccountCheckProgress } from "@/components/features/account-check/AccountCheckProgress";
import { HighRiskResult } from "@/components/features/account-check/HighRiskResult";
import { VerifiedResult } from "@/components/features/account-check/VerifiedResult";
import { NoDataResult } from "@/components/features/account-check/NoDataResult";
import { accountsService, type AccountCheckResult } from "@/services/accounts";

const AccountCheck = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<AccountCheckResult | null>(null);
  const [currentAccountNumber, setCurrentAccountNumber] = useState<string>("");

  const handleCheckAccount = async (
    accountNumber: string,
    bankCode?: string,
    businessName?: string
  ) => {
    setIsChecking(true);
    setCurrentAccountNumber(accountNumber);

    try {
      const checkResult = await accountsService.checkAccount({
        accountNumber,
        bankCode,
        businessName,
      });

      setResult(checkResult);
      
      // Save to account check history
      await accountsService.saveAccountCheckToHistory(checkResult.data, accountNumber);
      
      toast.success("Account check complete!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Account check failed");
      console.error("Account check error:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleReset = () => {
    setResult(null);
  };

  const handleReportFraud = () => {
    navigate("/report-fraud", { 
      state: { accountNumber: currentAccountNumber } 
    });
  };

  const handleRequestVerification = () => {
    navigate("/business/register");
  };

  // Determine which result component to render based on the check outcome
  const renderResult = () => {
    if (!result) return null;

    const { data } = result;
    const hasRecentReports = data.checks.fraud_reports.recent_30_days > 0;
    const hasFlags = data.checks.flags.length > 0;
    const trustScore = data.trust_score;
    const isHighRisk = hasRecentReports || hasFlags || trustScore < 40;
    const isVerifiedBusiness = !!data.verified_business;
    const hasAnyData = data.checks.fraud_reports.total > 0 || data.checks.check_count > 10 || isVerifiedBusiness;

    // Outcome A: HIGH RISK (has fraud reports or flags or low trust score)
    if (isHighRisk) {
      return (
        <HighRiskResult
          accountNumber={currentAccountNumber}
          trustScore={trustScore}
          fraudReports={{
            total: data.checks.fraud_reports.total,
            recent_30_days: data.checks.fraud_reports.recent_30_days,
            details: data.checks.fraud_reports.details,
          }}
          checkCount={data.checks.check_count}
          proceedRate={0.09}
          flags={data.checks.flags}
          isVerifiedBusiness={isVerifiedBusiness}
          businessName={data.verified_business?.name}
          onReportFraud={handleReportFraud}
        />
      );
    }

    // Outcome B: VERIFIED BUSINESS (safe)
    if (isVerifiedBusiness && data.verified_business) {
      return (
        <VerifiedResult
          accountNumber={currentAccountNumber}
          trustScore={trustScore}
          business={{
            business_id: data.verified_business.business_id,
            name: data.verified_business.name,
            verified: data.verified_business.verified,
            trust_score: data.verified_business.trust_score,
            rating: data.verified_business.rating || 4.8,
            review_count: data.verified_business.review_count || 127,
            location: data.verified_business.location || "Ikeja, Lagos",
            tier: data.verified_business.tier || 3,
            verification_date: data.verified_business.verification_date, // Pass ISO string directly
            reviews: data.verified_business.reviews || [],
          }}
          checkCount={data.checks.check_count}
        />
      );
    }

    // Outcome C: NO DATA (most common - no significant history)
    return (
      <NoDataResult
        accountNumber={currentAccountNumber}
        checkCount={data.checks.check_count}
        onReportFraud={handleReportFraud}
        onRequestVerification={handleRequestVerification}
      />
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      <main className="flex-1">
        <Container className="py-8 md:py-12">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">
              <ShieldCheck className="h-3 w-3 mr-1" />
              AI-Powered Account Verification
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Account Check
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Verify any bank account before sending money. Check for fraud reports and trust scores instantly.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12"
          >
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <ShieldCheck className="h-8 w-8 text-success mb-2" />
                <CardTitle className="text-lg">Trust Score</CardTitle>
                <CardDescription className="text-sm">
                  Instant risk assessment based on historical data
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <AlertTriangle className="h-8 w-8 text-warning mb-2" />
                <CardTitle className="text-lg">Fraud Reports</CardTitle>
                <CardDescription className="text-sm">
                  Community-reported scams and suspicious activity
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <TrendingDown className="h-8 w-8 text-destructive mb-2" />
                <CardTitle className="text-lg">Risk Analysis</CardTitle>
                <CardDescription className="text-sm">
                  AI-powered pattern detection for known scams
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Main Content */}
          <AnimatePresence mode="wait">
            {!result && !isChecking && (
              <motion.div
                key="input"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="shadow-2xl border-primary/10">
                  <CardHeader>
                    <CardTitle className="text-2xl">Check Account Number</CardTitle>
                    <CardDescription className="text-base">
                      Enter a 10-digit Nigerian bank account number to verify
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AccountInputWithBankResolution onSubmit={handleCheckAccount} isLoading={isChecking} />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {isChecking && (
              <motion.div
                key="checking"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <AccountCheckProgress />
              </motion.div>
            )}

            {result && !isChecking && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                {/* Back Button */}
                <Button onClick={handleReset} variant="outline" size="lg">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Check Another Account
                </Button>

                {/* Render appropriate result component based on outcome */}
                {renderResult()}
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default AccountCheck;

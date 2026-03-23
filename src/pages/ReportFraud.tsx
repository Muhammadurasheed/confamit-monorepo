import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Shield, Users, TrendingUp, CheckCircle2, Loader2, AlertCircle, Lock, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { accountsService } from "@/services/accounts";
import { fraudStatsService, type FraudStats } from "@/services/fraudStats";
import { BankSearchSelect } from "@/components/shared/BankSearchSelect";

const ReportFraud = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [hederaProof, setHederaProof] = useState<{ transactionId: string, explorerUrl: string, timestamp: string } | null>(null);
  const [isOtherBank, setIsOtherBank] = useState(false);
  const [stats, setStats] = useState<FraudStats>({
    scamAccountsReported: 0,
    peopleProtected: 0,
    averageReviewTimeHours: 24,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const [formData, setFormData] = useState({
    accountNumber: "",
    bankCode: "",
    bankName: "",
    businessName: "",
    category: "",
    description: "",
    amountLost: "",
    transactionDate: "",
    confirmed: false,
  });

  useEffect(() => {
    const loadStats = async () => {
      setStatsLoading(true);
      const fraudStats = await fraudStatsService.getFraudStats();
      setStats(fraudStats);
      setStatsLoading(false);
    };
    loadStats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.accountNumber || formData.accountNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit account number");
      return;
    }

    if (!formData.bankCode) {
      toast.error("Please select a bank");
      return;
    }

    if (!formData.category) {
      toast.error("Please select a fraud category");
      return;
    }

    if (!formData.description || formData.description.length < 20) {
      toast.error("Please provide a detailed description (minimum 20 characters)");
      return;
    }

    if (formData.description.length > 1000) {
      toast.error("Description cannot exceed 1000 characters");
      return;
    }

    // For "Other" banks, require manual bank name entry
    if (isOtherBank && !formData.bankName?.trim()) {
      toast.error("Please enter the bank name");
      return;
    }

    if (!formData.confirmed) {
      toast.error("Please confirm that the information is accurate");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await accountsService.reportFraud(
        formData.accountNumber,
        formData.category,
        formData.description,
        formData.businessName || undefined
      );

      if (result.success) {
        setReportId(result.report_id);
        if (result.hedera_anchor) {
          setHederaProof({
            transactionId: result.hedera_anchor.transactionId || result.hedera_anchor.transaction_id,
            explorerUrl: result.hedera_anchor.explorerUrl || result.hedera_anchor.explorer_url,
            timestamp: result.hedera_anchor.consensusTimestamp || result.hedera_anchor.timestamp || new Date().toISOString()
          });
        }
        setIsSuccess(true);
        toast.success("Report submitted successfully! Thank you for protecting the community.");
      } else {
        toast.error(result.message || "Failed to submit report");
      }
    } catch (error) {
      console.error("Report fraud error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData(prev => ({ ...prev, accountNumber: value }));
  };

  if (isSuccess && reportId) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-muted/20">
        <Header />
        <main className="flex-1">
          <Container className="py-12 md:py-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-6">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Report Submitted!</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Thank you for helping protect the community. Your report has been received and will be reviewed within 24-48 hours.
              </p>

              <Card className="border-primary/20 mb-8">
                <CardHeader>
                  <CardTitle>Report ID</CardTitle>
                  <CardDescription>Save this for your records</CardDescription>
                </CardHeader>
                <CardContent>
                  <code className="text-lg font-mono bg-muted px-4 py-2 rounded">
                    {reportId}
                  </code>
                </CardContent>
              </Card>

              {hederaProof && (
                <Card className="border-purple-500/30 bg-purple-500/5 mb-8 overflow-hidden relative shadow-lg shadow-purple-500/5">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-400 to-purple-600" />
                  <CardHeader className="pb-3 flex flex-row items-center gap-4">
                    <div className="p-2.5 bg-background shadow-sm border border-border/50 rounded-xl">
                      <Lock className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-[19px] text-left flex items-center gap-2.5 font-bold text-foreground/90">
                        Immutable Blockchain Proof
                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none font-semibold text-xs py-0.5">Hedera HCS</Badge>
                      </CardTitle>
                      <CardDescription className="text-left mt-1 text-sm font-medium">
                        Secured cryptographically on the public ledger
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-background rounded-xl p-3.5 border shadow-sm text-left">
                      <p className="text-[11px] text-muted-foreground mb-1.5 uppercase tracking-wider font-bold">Hedera Transaction ID</p>
                      <div className="flex items-center justify-between gap-3">
                        <code className="text-[15px] font-mono font-semibold text-foreground/90 break-all bg-muted/50 px-2 py-0.5 rounded">
                          {hederaProof.transactionId}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 flex-shrink-0 hover:bg-purple-100 hover:text-purple-700"
                          onClick={() => {
                            navigator.clipboard.writeText(hederaProof.transactionId);
                            toast.success("Transaction ID copied to clipboard!");
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                        Copy this ID to independently verify your report via our <a href="/verify" onClick={(e) => { e.preventDefault(); navigate('/verify'); }} className="text-purple-600 hover:underline font-semibold cursor-pointer">Cross-Chain Verify</a> portal.
                      </p>
                    </div>
                    <Button asChild variant="outline" className="w-full border-purple-200 hover:bg-purple-50 hover:text-purple-700 transition-all font-semibold shadow-sm h-11 text-base">
                      <a href={hederaProof.explorerUrl} target="_blank" rel="noopener noreferrer">
                        Verify on HashScan Explorer <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4 text-left mb-8">
                <h2 className="text-xl font-semibold">What Happens Next?</h2>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">1</div>
                    <div>
                      <p className="font-medium">Verification</p>
                      <p className="text-sm text-muted-foreground">Our team will verify the report details</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">2</div>
                    <div>
                      <p className="font-medium">Investigation</p>
                      <p className="text-sm text-muted-foreground">We'll cross-reference with other reports</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">3</div>
                    <div>
                      <p className="font-medium">Update Community</p>
                      <p className="text-sm text-muted-foreground">Verified reports will appear in account checks</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => navigate("/account-check")} size="lg">
                  Check Another Account
                </Button>
                <Button onClick={() => navigate("/")} variant="outline" size="lg">
                  Back to Home
                </Button>
              </div>
            </motion.div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

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
              <AlertTriangle className="h-3 w-3 mr-1" />
              Community Protection
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-destructive to-destructive/60 bg-clip-text text-transparent">
              Report Fraud
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Help build Nigeria's largest community-driven fraud database. Your report could save thousands from being scammed.
            </p>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12"
          >
            <Card className="border-destructive/20">
              <CardHeader>
                <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
                <CardTitle className="text-2xl">
                  {statsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    stats.scamAccountsReported.toLocaleString()
                  )}
                </CardTitle>
                <CardDescription>Scam accounts reported</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-success/20">
              <CardHeader>
                <Shield className="h-8 w-8 text-success mb-2" />
                <CardTitle className="text-2xl">
                  {statsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    stats.peopleProtected.toLocaleString()
                  )}
                </CardTitle>
                <CardDescription>People protected</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-primary/20">
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-2xl">
                  {statsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    `${stats.averageReviewTimeHours}hrs`
                  )}
                </CardTitle>
                <CardDescription>Average review time</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Report Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-2xl border-destructive/10 max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl">Submit Fraud Report</CardTitle>
                <CardDescription className="text-base">
                  All fields marked with * are required. Your report helps protect others.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Section 1: Account Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold">1</span>
                      Account Information
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number *</Label>
                      <Input
                        id="accountNumber"
                        placeholder="Enter 10-digit account number"
                        value={formData.accountNumber}
                        onChange={handleAccountNumberChange}
                        maxLength={10}
                        required
                      />
                      {formData.accountNumber.length === 10 && (
                        <p className="text-sm text-success flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Valid account number
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bankCode">Bank *</Label>
                      <BankSearchSelect
                        value={formData.bankCode}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, bankCode: value }))}
                        onOtherSelected={(isOther) => {
                          setIsOtherBank(isOther);
                          if (isOther) {
                            setFormData(prev => ({ ...prev, bankName: "" }));
                          }
                        }}
                        placeholder="Select bank"
                      />
                    </div>

                    {/* Manual Bank Name Input (shown when "Other" is selected) */}
                    {isOtherBank && (
                      <div className="space-y-2">
                        <Label htmlFor="bankName">Enter Bank Name *</Label>
                        <Input
                          id="bankName"
                          placeholder="e.g., Renmoney, VFD, etc."
                          value={formData.bankName}
                          onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                          required={isOtherBank}
                        />
                        <p className="text-sm text-muted-foreground">
                          Enter the exact bank name as provided
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business/Seller Name (Optional)</Label>
                      <Input
                        id="businessName"
                        placeholder="Enter business or seller name if known"
                        value={formData.businessName}
                        onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Section 2: Fraud Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold">2</span>
                      Fraud Details
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="category">Fraud Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fraud type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="non_delivery">Paid but never received item</SelectItem>
                          <SelectItem value="fake_products">Received fake/counterfeit product</SelectItem>
                          <SelectItem value="account_blocked">Account blocked after payment</SelectItem>
                          <SelectItem value="wrong_item">Received wrong/different item</SelectItem>
                          <SelectItem value="poor_quality">Extremely poor quality</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amountLost">Amount Lost (Optional)</Label>
                        <Input
                          id="amountLost"
                          type="number"
                          placeholder="e.g., 50000"
                          value={formData.amountLost}
                          onChange={(e) => setFormData(prev => ({ ...prev, amountLost: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="transactionDate">Transaction Date (Optional)</Label>
                        <Input
                          id="transactionDate"
                          type="date"
                          value={formData.transactionDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, transactionDate: e.target.value }))}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Full Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe what happened in detail. Include how you contacted the seller, what was agreed, and what went wrong. (Minimum 20 characters, maximum 1000 characters)"
                        value={formData.description}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 1000) {
                            setFormData(prev => ({ ...prev, description: value }));
                          }
                        }}
                        rows={6}
                        required
                        maxLength={1000}
                        className="resize-none"
                      />
                      <p className={`text-sm ${formData.description.length > 1000 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {formData.description.length}/1000 characters {formData.description.length < 20 ? '(minimum 20)' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Section 3: Confirmation */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold">3</span>
                      Confirmation
                    </h3>

                    <Card className="bg-muted/50">
                      <CardContent className="pt-4">
                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="confirmed"
                            checked={formData.confirmed}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, confirmed: checked as boolean }))}
                          />
                          <div className="space-y-1 leading-none">
                            <label
                              htmlFor="confirmed"
                              className="text-sm font-medium leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              I confirm this information is accurate *
                            </label>
                            <p className="text-sm text-muted-foreground">
                              False reports may result in account suspension
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting || !formData.confirmed}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting Report...
                      </>
                    ) : (
                      "Submit Report"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Info Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 max-w-3xl mx-auto">
              <Card className="border-primary/20">
                <CardHeader>
                  <TrendingUp className="h-6 w-6 text-primary mb-2" />
                  <CardTitle className="text-lg">Why Report Fraud?</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span>Protect others from falling victim</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span>Build community intelligence</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span>Help law enforcement track patterns</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span>Earn trust points for accurate reports</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader>
                  <Shield className="h-6 w-6 text-primary mb-2" />
                  <CardTitle className="text-lg">Your Privacy is Protected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Your personal information is never shared publicly</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Reports show anonymized data only</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Your report is confidential and secure</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default ReportFraud;

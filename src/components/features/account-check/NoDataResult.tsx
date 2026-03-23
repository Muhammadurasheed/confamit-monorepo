import { motion } from "framer-motion";
import { HelpCircle, Shield, Video, FileText, Users, Eye, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

interface NoDataResultProps {
  accountNumber: string;
  checkCount: number;
  onReportFraud: () => void;
  onRequestVerification: () => void;
}

export const NoDataResult = ({
  accountNumber,
  checkCount,
  onReportFraud,
  onRequestVerification,
}: NoDataResultProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Main No Data Card */}
      <Card className="border-muted bg-muted/10">
        <CardHeader>
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <HelpCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <Badge variant="outline" className="mb-2">
              <Eye className="h-3 w-3 mr-1" />
              No Data Available
            </Badge>
            <CardTitle className="text-2xl">Community Trust: UNKNOWN</CardTitle>
            <p className="text-muted-foreground mt-2">
              We don't have information about this account yet
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* What We Checked */}
          <div>
            <h4 className="font-semibold mb-3 text-center">What we checked:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-background">
                <CheckCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Community Reports</p>
                  <p className="text-xs text-muted-foreground">No fraud reports found</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-background">
                <CheckCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Verified Businesses</p>
                  <p className="text-xs text-muted-foreground">Not a registered business</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-background">
                <CheckCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Suspicious Patterns</p>
                  <p className="text-xs text-muted-foreground">No patterns detected</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-background">
                <CheckCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Check History</p>
                  <p className="text-xs text-muted-foreground">
                    Checked {checkCount} {checkCount === 1 ? "time" : "times"} before
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <Alert className="border-warning bg-warning/5">
            <HelpCircle className="h-4 w-4 text-warning" />
            <AlertDescription className="ml-2">
              <strong className="text-warning">This doesn't mean it's safe!</strong>
              <p className="mt-2 text-sm">
                Absence of reports doesn't guarantee safety. This could be a new account, a personal
                account, or simply hasn't been checked enough times. Always verify independently.
              </p>
            </AlertDescription>
          </Alert>

          <div className="bg-muted/50 rounded-lg p-4 text-center mt-6">
            <p className="text-sm text-muted-foreground mb-1">Account Number</p>
            <p className="font-mono font-semibold text-lg">
              {accountNumber.slice(0, 3)}***{accountNumber.slice(-2)}
            </p>
          </div>

          {/* ESCROW LIFELINE CTA */}
          <div className="mt-8 p-6 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl text-white shadow-xl shadow-purple-500/20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <Shield className="w-10 h-10 mx-auto mb-3 text-purple-100" />
            <h3 className="text-xl font-bold mb-2">Uncertain about this vendor?</h3>
            <p className="text-purple-100 text-[15px] mb-6 max-w-sm mx-auto leading-relaxed">
              Don't risk your money. Use ConfirmIT's Trustless Escrow. Your funds are secured on the Hedera blockchain and only released upon successful delivery verification.
            </p>
            <Button 
              size="lg"
              className="w-full sm:w-auto font-bold text-purple-700 bg-white hover:bg-gray-100 h-12 px-8 rounded-full shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5"
              onClick={() => navigate(`/create-escrow?vendor=${accountNumber}`)}
            >
              Protect My Money with Escrow
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* How to Protect Yourself */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🛡️ How to Protect Yourself</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                1
              </div>
              <div>
                <p className="font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Ask seller to verify their business
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Legitimate businesses can register on ConfirmIT for free verification
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="px-0 h-auto mt-1"
                  onClick={onRequestVerification}
                >
                  Request Seller Verification →
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                2
              </div>
              <div>
                <p className="font-medium flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Request a video call before payment
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Verify the seller's identity and see the product before sending money
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                3
              </div>
              <div>
                <p className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Use escrow services for high-value items
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Protect yourself with payment protection services for transactions over ₦50,000
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                4
              </div>
              <div>
                <p className="font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Start with a small test payment
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  For new sellers, send a small amount first to verify legitimacy
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                5
              </div>
              <div>
                <p className="font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Meet in person for high-value transactions
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  For large purchases, arrange to meet in a safe public location
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help the Community */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">📣 Help the Community</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            After your transaction, let us know if it was safe or fraudulent. Your feedback helps
            protect thousands of others from potential scams.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1" onClick={onReportFraud}>
              Report if Fraudulent
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onClick={() => navigate("/business/directory")}
            >
              Find Verified Businesses
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Safety Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">⚠️ Red Flags to Watch For</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-0.5">•</span>
              <span>Seller pressures you to pay immediately without proper verification</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-0.5">•</span>
              <span>Price is significantly lower than market value ("too good to be true")</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-0.5">•</span>
              <span>Seller refuses video calls or meeting in person</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-0.5">•</span>
              <span>Account name doesn't match business or seller name</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-0.5">•</span>
              <span>Communication only through social media, no official contact</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

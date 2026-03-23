import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Mail, Home } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";

const PaymentPending = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get("businessId");

  useEffect(() => {
    // If no businessId in URL, redirect to home
    if (!businessId) {
      navigate("/");
    }
  }, [businessId, navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <Container className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-2xl border-primary/20">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-success/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative bg-success/10 p-6 rounded-full">
                      <CheckCircle2 className="h-16 w-16 text-success" />
                    </div>
                  </div>
                </div>
                <CardTitle className="text-3xl mb-2">
                  Payment Successful! 🎉
                </CardTitle>
                <CardDescription className="text-lg">
                  Your business registration has been submitted
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Status Section */}
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-warning/10 p-2 rounded-full">
                        <Clock className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <p className="font-semibold">Application Status</p>
                        <p className="text-sm text-muted-foreground">Under Review</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
                      Pending
                    </Badge>
                  </div>

                  {businessId && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Business ID</p>
                      <code className="text-sm bg-background px-3 py-2 rounded border font-mono">
                        {businessId}
                      </code>
                    </div>
                  )}
                </div>

                {/* What's Next Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">What happens next?</h3>
                  
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="bg-primary/10 p-2 rounded-full h-fit">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">We'll Review Your Application</p>
                        <p className="text-sm text-muted-foreground">
                          Our team will verify your business documents and information within 24-48 hours.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="bg-primary/10 p-2 rounded-full h-fit">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">You'll Receive Confirmation</p>
                        <p className="text-sm text-muted-foreground">
                          Once approved, you'll get an email with access to your business dashboard and Trust ID NFT.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Alert */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm">
                    <strong>Need help?</strong> If you have questions about your application, 
                    contact us at <a href="mailto:support@legit.africa" className="text-primary hover:underline">support@legit.africa</a>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={() => navigate("/")}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                  {businessId && (
                    <Button
                      onClick={() => navigate(`/business/${businessId}`)}
                      size="lg"
                      className="flex-1"
                    >
                      View Public Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentPending;

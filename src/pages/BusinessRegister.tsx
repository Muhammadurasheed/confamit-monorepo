import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import RegistrationForm from "@/components/features/business/RegistrationForm";
import TierSelector from "@/components/features/business/TierSelector";
import BankAccountStep from "@/components/features/business/BankAccountStep";
import PaymentStep from "@/components/features/business/PaymentStep";
import { registerBusiness } from "@/services/business";
import { Building2, CheckCircle2, Loader2 } from "lucide-react";
import { Form } from "@/components/ui/form";
import { BUSINESS_TIERS } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";

const steps = [
  { id: 1, title: "Basic Information", description: "Tell us about your business" },
  { id: 2, title: "Bank Details", description: "Account information for verification" },
  { id: 3, title: "Documents", description: "Upload verification documents" },
  { id: 4, title: "Review & Payment", description: "Review and complete payment" },
];

export const businessSchema = z.object({
  // Step 1: Basic Information
  name: z.string().min(2, "Business name must be at least 2 characters").max(100),
  category: z.string().min(1, "Please select a category"),
  logo: z.string().url().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  bio: z.string().max(1000, "Bio must be less than 1000 characters").optional().or(z.literal("")),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Invalid phone number"),
  address: z.string().min(10, "Please provide a complete address"),
  
  // Step 2: Bank Account Details
  accountNumber: z.string().regex(/^\d{10}$/, "Account number must be 10 digits"),
  bankCode: z.string().min(1, "Please select a bank"),
  accountName: z.string().min(2, "Account name is required"),
  
  // Step 3: Verification Documents
  cacCertificate: z.string().url().optional(),
  governmentId: z.string().url().optional(),
  proofOfAddress: z.string().url().optional(),
  bankStatement: z.string().url().optional(),
  
  // Step 4: Tier Selection
  tier: z.enum(["1", "2", "3"]).default("1"),
});

export type BusinessFormData = z.infer<typeof businessSchema>;

const BusinessRegister = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showTierSelector, setShowTierSelector] = useState(true);
  const [selectedTier, setSelectedTier] = useState<1 | 2 | 3 | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: "",
      category: "",
      logo: "",
      website: "",
      linkedin: "",
      bio: "",
      email: "",
      phone: "",
      address: "",
      accountNumber: "",
      bankCode: "",
      accountName: "",
      tier: "1",
    },
    mode: "onChange",
  });

  const handleNext = async () => {
    let fieldsToValidate: (keyof BusinessFormData)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ["name", "category", "website", "linkedin", "bio", "email", "phone", "address"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["accountNumber", "bankCode", "accountName"];
    }

    const isValid = await form.trigger(fieldsToValidate);
    
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTierSelection = (tier: 1 | 2 | 3) => {
    setSelectedTier(tier);
    setShowTierSelector(false);
    form.setValue("tier", tier.toString() as "1" | "2" | "3");
  };

  const handleProceedToPayment = async () => {
    // First, register the business (without payment)
    setIsSubmitting(true);

    const data = form.getValues();
    
    try {
      const response = await registerBusiness({
        name: data.name,
        category: data.category,
        logo: data.logo,
        website: data.website,
        linkedin: data.linkedin,
        bio: data.bio,
        email: data.email,
        phone: data.phone,
        address: data.address,
        accountNumber: data.accountNumber,
        bankCode: data.bankCode,
        accountName: data.accountName,
        tier: parseInt(data.tier),
        userId: user?.uid, // Link business to authenticated user
        documents: {
          cacCertificate: data.cacCertificate,
          governmentId: data.governmentId,
          proofOfAddress: data.proofOfAddress,
          bankStatement: data.bankStatement,
        },
      });

      if (response.success) {
        // Navigate to payment page with business details
        navigate(`/payment?businessId=${response.business_id}&businessName=${encodeURIComponent(data.name)}&tier=${data.tier}`);
      }
    } catch (error: any) {
      toast.error("Registration failed", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  // Show tier selector first
  if (showTierSelector) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-subtle">
        <Header />
        <main className="flex-1 py-12">
          <Container className="max-w-6xl">
            <TierSelector onSelectTier={handleTierSelection} />
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-subtle">
      <Header />
      <main className="flex-1 py-12">
        <Container className="max-w-4xl">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Building2 className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-3">Register Your Business</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tier {selectedTier} {selectedTier && BUSINESS_TIERS[selectedTier].name} Verification
            </p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Progress value={progress} className="h-2 mb-6" />
            <div className="grid grid-cols-4 gap-4">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`text-center transition-colors ${
                    currentStep >= step.id
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <div className="flex justify-center mb-2">
                    <div
                      className={`rounded-full w-10 h-10 flex items-center justify-center font-bold transition-all ${
                        currentStep > step.id
                          ? "bg-success text-success-foreground"
                          : currentStep === step.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {currentStep > step.id ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        step.id
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-medium mb-1">{step.title}</p>
                  <p className="text-xs hidden sm:block">{step.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Registration Form */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>Step {currentStep}: {steps[currentStep - 1].title}</CardTitle>
                  <CardDescription>{steps[currentStep - 1].description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    {currentStep === 2 ? (
                      <BankAccountStep form={form} />
                    ) : (
                      <RegistrationForm
                        form={form}
                        currentStep={currentStep}
                        onSubmit={form.handleSubmit(() => {})}
                      />
                    )}
                  </Form>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentStep === 1 || isSubmitting}
                    >
                      Back
                    </Button>

                    <Button
                      type="button"
                      onClick={currentStep === 4 ? handleProceedToPayment : handleNext}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : currentStep === 4 ? (
                        "Proceed to Payment"
                      ) : (
                        "Next"
                      )}
                    </Button>
                  </div>

                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessRegister;

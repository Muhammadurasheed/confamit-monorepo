import { UseFormReturn } from "react-hook-form";
import { BusinessFormData } from "@/pages/BusinessRegister";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DocumentUpload from "./DocumentUpload";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Globe, Linkedin } from "lucide-react";
import { BUSINESS_TIERS, BUSINESS_REGISTRATION } from "@/lib/constants";
import { LogoUpload } from "./LogoUpload";
import { PhoneInput } from "@/components/shared/PhoneInput";

interface RegistrationFormProps {
  form: UseFormReturn<BusinessFormData>;
  currentStep: number;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

const BUSINESS_CATEGORIES = [
  "Electronics & Technology",
  "Fashion & Apparel",
  "Food & Beverages",
  "Health & Beauty",
  "Home & Garden",
  "Automotive",
  "Real Estate",
  "Professional Services",
  "Education & Training",
  "Entertainment & Media",
  "Travel & Hospitality",
  "Financial Services",
  "Manufacturing",
  "Retail & E-commerce",
  "Other",
];

const NIGERIAN_BANKS = [
  { code: "044", name: "Access Bank" },
  { code: "063", name: "Access Bank (Diamond)" },
  { code: "050", name: "Ecobank Nigeria" },
  { code: "070", name: "Fidelity Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "214", name: "First City Monument Bank" },
  { code: "058", name: "Guaranty Trust Bank" },
  { code: "030", name: "Heritage Bank" },
  { code: "301", name: "Jaiz Bank" },
  { code: "082", name: "Keystone Bank" },
  { code: "526", name: "Parallex Bank" },
  { code: "076", name: "Polaris Bank" },
  { code: "101", name: "Providus Bank" },
  { code: "221", name: "Stanbic IBTC Bank" },
  { code: "068", name: "Standard Chartered Bank" },
  { code: "232", name: "Sterling Bank" },
  { code: "100", name: "Suntrust Bank" },
  { code: "032", name: "Union Bank of Nigeria" },
  { code: "033", name: "United Bank for Africa" },
  { code: "215", name: "Unity Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "057", name: "Zenith Bank" },
];

const RegistrationForm = ({ form, currentStep, onSubmit }: RegistrationFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your business name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Category *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BUSINESS_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Logo (Optional)</FormLabel>
                  <FormControl>
                    <LogoUpload
                      onLogoUploaded={field.onChange}
                      currentLogo={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Website (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="url" 
                        placeholder="https://www.yourbusiness.com" 
                        className="pl-10"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormDescription>Your business website or social media page</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn URL (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="url" 
                        placeholder="https://www.linkedin.com/company/yourbusiness" 
                        className="pl-10"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormDescription>Your business LinkedIn profile</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Bio (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your business, what you do, and what makes you unique..."
                      className="resize-none"
                      rows={4}
                      maxLength={1000}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/1000 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="business@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <PhoneInput 
                        value={field.value} 
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Address *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your complete business address"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Include street address, city, state, and postal code
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Step 2: Bank Account Details */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
              <p className="text-sm text-muted-foreground">
                We'll use this information to verify your business. All account details are encrypted and stored securely.
              </p>
            </div>

            <FormField
              control={form.control}
              name="bankCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your bank" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {NIGERIAN_BANKS.map((bank) => (
                        <SelectItem key={bank.code} value={bank.code}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0000000000"
                      maxLength={10}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>10-digit account number</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Account holder name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Must match the name registered with your bank
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Step 3: Document Upload */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Required Documents</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>CAC Certificate (Corporate Affairs Commission registration)</li>
                <li>Government-issued ID (Driver's license, NIN, Int'l passport)</li>
                <li>Proof of Address (Utility bill not older than 3 months)</li>
                <li>Bank Statement (Last 3 months)</li>
              </ul>
            </div>

            <FormField
              control={form.control}
              name="cacCertificate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CAC Certificate</FormLabel>
                  <FormControl>
                    <DocumentUpload
                      value={field.value}
                      onChange={field.onChange}
                      accept="application/pdf,image/*"
                      label="Upload CAC Certificate"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="governmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Government ID</FormLabel>
                  <FormControl>
                    <DocumentUpload
                      value={field.value}
                      onChange={field.onChange}
                      accept="image/*,application/pdf"
                      label="Upload Government ID"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="proofOfAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proof of Address</FormLabel>
                  <FormControl>
                    <DocumentUpload
                      value={field.value}
                      onChange={field.onChange}
                      accept="image/*,application/pdf"
                      label="Upload Proof of Address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bankStatement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Statement</FormLabel>
                  <FormControl>
                    <DocumentUpload
                      value={field.value}
                      onChange={field.onChange}
                      accept="application/pdf"
                      label="Upload Bank Statement (PDF)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Step 4: Review & Tier Selection */}
        {currentStep === 4 && (
          <div className="space-y-6">
            {/* Review Section */}
            <Card>
              <CardHeader>
                <CardTitle>Review Your Information</CardTitle>
                <CardDescription>
                  Please verify all details before submitting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Business Name</p>
                  <p className="text-sm">{form.watch("name")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="text-sm">{form.watch("category")}</p>
                </div>
                {form.watch("website") && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Website</p>
                    <p className="text-sm truncate">{form.watch("website")}</p>
                  </div>
                )}
                {form.watch("linkedin") && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">LinkedIn</p>
                    <p className="text-sm truncate">{form.watch("linkedin")}</p>
                  </div>
                )}
                {form.watch("bio") && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Business Bio</p>
                    <p className="text-sm line-clamp-3">{form.watch("bio")}</p>
                  </div>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-sm">{form.watch("email")}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="text-sm">{form.watch("phone")}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bank Account</p>
                  <p className="text-sm">
                    {NIGERIAN_BANKS.find(b => b.code === form.watch("bankCode"))?.name} - {form.watch("accountNumber")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tier Selection */}
            <FormField
              control={form.control}
              name="tier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Select Verification Tier</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid gap-4 md:grid-cols-3"
                    >
                      {Object.entries(BUSINESS_TIERS).map(([tier, info]) => (
                        <label
                          key={tier}
                          htmlFor={`tier-${tier}`}
                          className={`cursor-pointer ${
                            field.value === tier ? "ring-2 ring-primary" : ""
                          }`}
                        >
                          <Card className="h-full hover:border-primary transition-colors">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-lg">{info.name}</CardTitle>
                                  <CardDescription className="text-2xl font-bold mt-2">
                                    {info.price === BUSINESS_REGISTRATION.oneTimeVerification ? `₦${info.price.toLocaleString()}` : "Free"}
                                  </CardDescription>
                                </div>
                                <RadioGroupItem value={tier} id={`tier-${tier}`} />
                              </div>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {info.features.map((feature, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        </label>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </form>
    </Form>
  );
};

export default RegistrationForm;

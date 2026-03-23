import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Search, CheckCircle } from "lucide-react";
import { paystackService } from "@/services/paystack";
import { toast } from "sonner";
import { BankSearchSelect } from "@/components/shared/BankSearchSelect";

const accountSchema = z.object({
  accountNumber: z.string().regex(/^\d{10}$/, "Account number must be 10 digits"),
  bankCode: z.string().min(1, "Please select a bank"),
  bankName: z.string().optional(), // For manual entry when "Other" is selected
  accountName: z.string().optional(),
  businessName: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountInputWithBankResolutionProps {
  onSubmit: (accountNumber: string, bankCode?: string, businessName?: string) => void;
  isLoading: boolean;
}

export const AccountInputWithBankResolution = ({
  onSubmit,
  isLoading,
}: AccountInputWithBankResolutionProps) => {
  const [isResolving, setIsResolving] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const [isOtherBank, setIsOtherBank] = useState(false);

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      accountNumber: "",
      bankCode: "",
      bankName: "",
      accountName: "",
      businessName: "",
    },
  });

  const accountNumber = form.watch("accountNumber");
  const bankCode = form.watch("bankCode");
  const accountName = form.watch("accountName");

  const handleResolveAccount = async (accNum?: string, bnkCode?: string) => {
    const accountNum = accNum || accountNumber;
    const bankCd = bnkCode || bankCode;
    
    if (!accountNum || !bankCd) {
      return;
    }

    if (accountNum.length !== 10) {
      return;
    }

    setIsResolving(true);
    setIsResolved(false);

    try {
      const result = await paystackService.resolveAccountNumber({ 
        accountNumber: accountNum, 
        bankCode: bankCd 
      });
      
      if (result.success && result.data?.account_name) {
        form.setValue("accountName", result.data.account_name);
        setIsResolved(true);
        toast.success("Account resolved successfully!");
      } else {
        toast.error(result.message || "Could not resolve account name");
        setIsResolved(false);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to resolve account");
      console.error("Account resolution error:", error);
      setIsResolved(false);
    } finally {
      setIsResolving(false);
    }
  };

  const handleSubmit = (data: AccountFormData) => {
    // For "Other" banks, require manual bank name entry
    if (isOtherBank && !data.bankName?.trim()) {
      toast.error("Please enter the bank name");
      return;
    }
    
    // Allow submission even if Paystack resolution hasn't completed
    // Backend doesn't require resolved account name to function
    onSubmit(data.accountNumber, data.bankCode, data.businessName);
  };

  // Auto-resolve when both account and bank are filled
  const handleAccountNumberChange = (value: string) => {
    form.setValue("accountNumber", value);
    setIsResolved(false);
    form.setValue("accountName", "");
    
    // Auto-resolve if bank is already selected and account is 10 digits
    if (value.length === 10 && bankCode) {
      setTimeout(() => handleResolveAccount(value, bankCode), 500);
    }
  };

  const handleBankChange = (value: string) => {
    form.setValue("bankCode", value);
    setIsResolved(false);
    form.setValue("accountName", "");
    
    // Don't auto-resolve for "Other" banks
    if (value === "OTHER") {
      return;
    }
    
    // Auto-resolve if account is already 10 digits
    if (accountNumber.length === 10) {
      setTimeout(() => handleResolveAccount(accountNumber, value), 500);
    }
  };

  const handleOtherBankSelected = (isOther: boolean) => {
    setIsOtherBank(isOther);
    if (isOther) {
      // For "Other" banks, mark as resolved since we skip Paystack
      setIsResolved(true);
      form.setValue("accountName", "");
      form.setValue("bankName", "");
    } else {
      setIsResolved(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Bank Selection with Search */}
        <FormField
          control={form.control}
          name="bankCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name</FormLabel>
              <FormControl>
                <BankSearchSelect
                  value={field.value}
                  onValueChange={handleBankChange}
                  onOtherSelected={handleOtherBankSelected}
                  disabled={isLoading || isResolving}
                  placeholder="Search and select bank"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Manual Bank Name Input (shown when "Other" is selected) */}
        {isOtherBank && (
          <FormField
            control={form.control}
            name="bankName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enter Bank Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., Renmoney, VFD, etc."
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground">
                  Enter the exact bank name as provided
                </p>
              </FormItem>
            )}
          />
        )}

        {/* Account Number */}
        <FormField
          control={form.control}
          name="accountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Number</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter 10-digit account number"
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  onChange={(e) => handleAccountNumberChange(e.target.value)}
                  disabled={isLoading || isResolving}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Account Name (Auto-filled) */}
        {accountName && (
          <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <Label className="text-success font-semibold">Account Name</Label>
                <p className="text-base font-medium">{accountName}</p>
              </div>
            </div>
          </div>
        )}

        {/* Business Name (Optional) */}
        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name (Optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter business name to check"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Checking Account...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Check Account
            </>
          )}
        </Button>

        {!isOtherBank && !isResolved && accountNumber.length === 10 && bankCode && (
          <p className="text-sm text-muted-foreground text-center">
            Account resolution will happen automatically
          </p>
        )}
        
        {isOtherBank && (
          <p className="text-sm text-warning text-center">
            ⚠️ Account name cannot be auto-verified for unlisted banks
          </p>
        )}
      </form>
    </Form>
  );
};

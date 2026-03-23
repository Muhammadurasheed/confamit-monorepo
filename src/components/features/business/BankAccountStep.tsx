import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { BusinessFormData } from "@/pages/BusinessRegister";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { resolveAccountNumber, validateAccountNameMatch } from "@/services/paystack";
import { toast } from "sonner";
import { BankSearchSelect } from "@/components/shared/BankSearchSelect";

interface BankAccountStepProps {
  form: UseFormReturn<BusinessFormData>;
}

const BankAccountStep = ({ form }: BankAccountStepProps) => {
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedName, setResolvedName] = useState<string>("");
  const [nameMatch, setNameMatch] = useState<{
    matches: boolean;
    confidence: number;
    warning?: string;
  } | null>(null);

  const accountNumber = form.watch("accountNumber");
  const bankCode = form.watch("bankCode");
  const accountName = form.watch("accountName");
  const businessName = form.watch("name");

  // Auto-resolve account name when account number and bank are provided
  const handleResolveAccount = async () => {
    if (!accountNumber || accountNumber.length !== 10 || !bankCode) {
      return;
    }

    setIsResolving(true);
    setNameMatch(null);

    try {
      const result = await resolveAccountNumber({
        accountNumber,
        bankCode,
      });

      if (result.success && result.data) {
        setResolvedName(result.data.account_name);
        form.setValue("accountName", result.data.account_name);
        toast.success("Account verified successfully!");

        // Check if account name matches business name
        if (businessName) {
          const matchResult = validateAccountNameMatch(
            result.data.account_name,
            businessName
          );
          setNameMatch(matchResult);
        }
      } else {
        toast.error(result.message || "Could not verify account");
        setResolvedName("");
      }
    } catch (error) {
      toast.error("Failed to verify account. Please try again.");
      setResolvedName("");
    } finally {
      setIsResolving(false);
    }
  };

  // Auto-trigger resolution when both fields are filled
  useEffect(() => {
    if (accountNumber?.length === 10 && bankCode) {
      const debounce = setTimeout(() => {
        handleResolveAccount();
      }, 500);
      return () => clearTimeout(debounce);
    }
  }, [accountNumber, bankCode]);

  // Validate match when account name changes
  useEffect(() => {
    if (accountName && businessName && resolvedName) {
      const matchResult = validateAccountNameMatch(accountName, businessName);
      setNameMatch(matchResult);
    }
  }, [accountName, businessName, resolvedName]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Primary Bank Account</h3>
        <p className="text-sm text-muted-foreground">
          We'll verify this account matches your business name
        </p>
      </div>

      <FormField
        control={form.control}
        name="bankCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bank *</FormLabel>
            <FormControl>
              <BankSearchSelect
                value={field.value}
                onValueChange={field.onChange}
                disabled={isResolving}
                placeholder="Search and select your bank"
              />
            </FormControl>
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
              <div className="relative">
                <Input
                  {...field}
                  placeholder="0123456789"
                  maxLength={10}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    field.onChange(value);
                  }}
                />
                {isResolving && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
                )}
              </div>
            </FormControl>
            <FormDescription>10-digit Nigerian account number</FormDescription>
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
              <div className="relative">
                <Input
                  {...field}
                  placeholder="Account name will auto-fill"
                  disabled={isResolving}
                />
                {resolvedName && !isResolving && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success" />
                )}
              </div>
            </FormControl>
            <FormDescription>
              {resolvedName ? "Verified via Paystack" : "We'll verify this automatically"}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Verification Status Alerts */}
      {nameMatch && !nameMatch.matches && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{nameMatch.warning}</AlertDescription>
        </Alert>
      )}

      {nameMatch && nameMatch.matches && nameMatch.warning && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{nameMatch.warning}</AlertDescription>
        </Alert>
      )}

      {nameMatch && nameMatch.matches && !nameMatch.warning && (
        <Alert className="border-success/50 bg-success/10">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">
            ✓ Account name matches business name ({nameMatch.confidence}% match)
          </AlertDescription>
        </Alert>
      )}

      {/* Manual Retry Button */}
      {!isResolving && accountNumber?.length === 10 && bankCode && !resolvedName && (
        <Button
          type="button"
          variant="outline"
          onClick={handleResolveAccount}
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Account Verification
        </Button>
      )}

      <div className="pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          🔒 Bank details are encrypted and used only for verification
        </p>
      </div>
    </div>
  );
};

export default BankAccountStep;

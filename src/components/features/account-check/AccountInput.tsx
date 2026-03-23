import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Lock, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import banksData from "@/data/banks.json";

export interface AccountInputProps {
  onSubmit: (accountNumber: string, bankCode?: string, businessName?: string) => void;
  isLoading: boolean;
}

// Load banks from JSON data
const NIGERIAN_BANKS = banksData.map(bank => ({
  code: bank.code,
  name: bank.name,
  logo: bank.logo,
  prefixes: [] as string[]
}));

export const AccountInput = ({ onSubmit, isLoading }: AccountInputProps) => {
  const [accountNumber, setAccountNumber] = useState("");
  const [rawAccountNumber, setRawAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState<string>("");
  const [businessName, setBusinessName] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [errors, setErrors] = useState<{ accountNumber?: string }>({});

  // Auto-detect bank from account number patterns
  useEffect(() => {
    if (rawAccountNumber.length >= 3) {
      const prefix = rawAccountNumber.substring(0, 3);
      const detectedBank = NIGERIAN_BANKS.find(bank => 
        bank.prefixes.some(p => prefix.startsWith(p))
      );
      if (detectedBank && !bankCode) {
        setBankCode(detectedBank.code);
      }
    }
  }, [rawAccountNumber, bankCode]);

  const validateAccountNumber = (number: string): boolean => {
    // Nigerian account numbers are 10 digits
    const cleaned = number.replace(/\s/g, "");
    return /^\d{10}$/.test(cleaned);
  };

  const formatAccountNumber = (value: string): string => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, "");
    
    // Limit to 10 digits
    const limited = cleaned.substring(0, 10);
    
    // Format as: XXXX XXX XXX
    if (limited.length <= 4) return limited;
    if (limited.length <= 7) return `${limited.slice(0, 4)} ${limited.slice(4)}`;
    return `${limited.slice(0, 4)} ${limited.slice(4, 7)} ${limited.slice(7)}`;
  };

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = value.replace(/\D/g, "");
    
    setRawAccountNumber(cleaned);
    setAccountNumber(formatAccountNumber(value));
    
    if (cleaned.length === 10) {
      const valid = validateAccountNumber(cleaned);
      setIsValid(valid);
      if (!valid) {
        setErrors({ accountNumber: "Invalid account number format" });
      } else {
        setErrors({});
      }
    } else if (cleaned.length > 0) {
      setIsValid(false);
      setErrors({});
    } else {
      setIsValid(false);
      setErrors({});
    }
  };

  const handleSubmit = () => {
    const cleaned = rawAccountNumber;
    
    if (!validateAccountNumber(cleaned)) {
      setErrors({ accountNumber: "Please enter a valid 10-digit account number" });
      return;
    }

    onSubmit(cleaned, bankCode || undefined, businessName || undefined);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isValid && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Number Field */}
      <div className="space-y-2">
        <Label htmlFor="accountNumber" className="text-base font-semibold">
          Account Number <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="accountNumber"
            type="text"
            value={accountNumber}
            onChange={handleAccountNumberChange}
            onKeyPress={handleKeyPress}
            placeholder="0123 456 789"
            className={`pr-10 text-lg font-mono ${
              isValid ? "border-success" : errors.accountNumber ? "border-destructive" : ""
            }`}
            disabled={isLoading}
            maxLength={12} // 10 digits + 2 spaces
          />
          <AnimatePresence>
            {isValid && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <CheckCircle2 className="h-5 w-5 text-success" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {errors.accountNumber && (
          <p className="text-sm text-destructive">{errors.accountNumber}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Enter a 10-digit Nigerian bank account number
        </p>
      </div>

      {/* Bank Selection */}
      <div className="space-y-2">
        <Label htmlFor="bank" className="text-base font-semibold">
          Bank <span className="text-muted-foreground text-sm font-normal">(Optional)</span>
        </Label>
        <Select value={bankCode} onValueChange={setBankCode} disabled={isLoading}>
          <SelectTrigger id="bank" className="text-base">
            <SelectValue placeholder="Select Bank" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {NIGERIAN_BANKS.map((bank) => (
              <SelectItem key={bank.code} value={bank.code} className="text-base">
                <div className="flex items-center gap-2">
                  <img src={bank.logo} alt={bank.name} className="h-5 w-5 object-contain" />
                  <span>{bank.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Helps us provide more accurate verification
        </p>
      </div>

      {/* Business Name Field */}
      <div className="space-y-2">
        <Label htmlFor="businessName" className="text-base font-semibold">
          Business Name <span className="text-muted-foreground text-sm font-normal">(Optional)</span>
        </Label>
        <Input
          id="businessName"
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="e.g. TechHub Lagos"
          className="text-base"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          If you know the business name, we can cross-check it
        </p>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!isValid || isLoading}
        size="lg"
        className="w-full text-base font-semibold"
      >
        {isLoading ? "Checking..." : "Check Account Trust"}
      </Button>

      {/* Trust Indicators */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4 text-primary" />
          <span>Your data is encrypted and never shared</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span>Join 89,342 people who checked accounts this month</span>
        </div>
      </div>

      {/* Detection Badge */}
      <AnimatePresence>
        {bankCode && rawAccountNumber.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Badge variant="outline" className="gap-2">
              <img 
                src={NIGERIAN_BANKS.find(b => b.code === bankCode)?.logo} 
                alt="" 
                className="h-4 w-4 object-contain"
              />
              Bank detected: {NIGERIAN_BANKS.find(b => b.code === bankCode)?.name}
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

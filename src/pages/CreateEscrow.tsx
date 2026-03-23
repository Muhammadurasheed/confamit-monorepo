import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck as ShieldIcon, Lock, ChevronRight, Zap, Fingerprint, Loader2, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL, PAYSTACK_CONFIG } from "@/lib/constants";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import GlobalHeader from "@/components/layout/Header";
import GlobalFooter from "@/components/layout/Footer";
import { BankSearchSelect } from "@/components/shared/BankSearchSelect";
import { paystackService } from "@/services/paystack";
import banks from "@/data/banks.json";
import paystackLogo from "@/assets/paystack.png";
import hederaLogo from "@/assets/hedera.png";
import { useAuth } from "@/hooks/useAuth";

// Declare global window property for TypeScript
declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function CreateEscrow() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialVendor = searchParams.get('vendor') || "";

  const [vendorAccount, setVendorAccount] = useState(initialVendor);
  const [vendorName, setVendorName] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [resolvedAccountName, setResolvedAccountName] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [buyerEmail, setBuyerEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [formattedAmount, setFormattedAmount] = useState("");
  const [itemName, setItemName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'hbar'>('paystack');
  const { user, credits } = useAuth();

  // Persistence Layer
  const stateRef = useRef({
    vendorAccount,
    vendorName,
    vendorEmail,
    bankName,
    bankCode,
    accountNumber,
    buyerEmail,
    amount,
    itemName,
    paymentMethod
  });

  useEffect(() => {
    stateRef.current = {
      vendorAccount,
      vendorName,
      vendorEmail,
      bankName,
      bankCode,
      accountNumber,
      buyerEmail,
      amount,
      itemName,
      paymentMethod
    };
  }, [vendorAccount, vendorName, vendorEmail, bankName, bankCode, accountNumber, buyerEmail, amount, itemName, paymentMethod]);

  const handleResolveAccount = async (accNum: string, bnkCode: string) => {
    if (accNum.length !== 10 || !bnkCode) return;
    setIsResolving(true);
    try {
      const result = await paystackService.resolveAccountNumber({ 
        accountNumber: accNum, 
        bankCode: bnkCode 
      });
      if (result.success && result.data?.account_name) {
        setResolvedAccountName(result.data.account_name);
        toast.success(`Account verified: ${result.data.account_name}`);
      } else {
        setResolvedAccountName("");
      }
    } catch (e) {
      console.error("Resolution failed", e);
      setResolvedAccountName("");
    } finally {
      setIsResolving(false);
    }
  };

  const handleCreateVault = async (paystackReference?: string) => {
    console.log("🚀 Establishing Vault. Reference:", paystackReference);
    setIsCreating(true);
    
    const { vendorAccount, vendorName, vendorEmail, bankName, bankCode, accountNumber, buyerEmail, amount, itemName, paymentMethod } = stateRef.current;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const payload = {
        buyerEmail: buyerEmail,
        vendorAccount: paymentMethod === 'hbar' ? vendorAccount : '0.0.0',
        vendorName: resolvedAccountName || vendorName || 'Generic Vendor',
        amount: Number(amount),
        itemName: itemName,
        paymentMethod: paymentMethod,
        paystackReference: paymentMethod === 'paystack' ? paystackReference : undefined,
        bankName: paymentMethod === 'paystack' ? bankName : undefined,
        bankAccountNumber: paymentMethod === 'paystack' ? accountNumber : undefined,
        uid: user?.uid
      };

      const response = await fetch(`${API_BASE_URL}/escrow/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify(payload),
      });

      clearTimeout(timeoutId);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to finalize escrow vault");
      }
      
      const data = await response.json();
      console.log("🎉 SUCCESS:", data.id);
      toast.success(paymentMethod === 'hbar' ? "HBAR Vault Anchored on Hedera Mainnet." : "Deposit Verified. Trustless Vault established on Hedera.");
      navigate(`/escrow/${data.id}`);
    } catch (err: any) {
      setIsCreating(false);
      toast.error(err.message || "An error occurred during finalization");
      console.error("❌ Finalization Error:", err);
    }
  };

  // NATIVE PAYSTACK PROTOCOL (V1 SDK - Gold Standard)
  const handlePaystackPayment = () => {
    const { buyerEmail, amount } = stateRef.current;
    
    if (!window.PaystackPop) {
      toast.error("Paystack SDK not loaded. Please refresh the page.");
      setIsCreating(false); // Use isCreating
      return;
    }

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_CONFIG.publicKey,
      email: buyerEmail,
      amount: (Number(amount) || 0) * 100,
      currency: "NGN",
      ref: (new Date()).getTime().toString(),
      callback: (response: any) => {
        window.alert("✅ Paystack Response Received! Establishing Vault...");
        console.log("✅ NATIVE CALLBACK SUCCESS:", response);
        handleCreateVault(response.reference);
      },
      onClose: () => {
        setIsCreating(false);
        console.log("ℹ️ Native Modal Closed");
        toast.error("Payment modal closed.");
      }
    });

    handler.openIframe();
  };

  // Currency formatting helper
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (!value) {
      setAmount("");
      setFormattedAmount("");
      return;
    }
    const numericValue = parseInt(value, 10);
    setAmount(value);
    setFormattedAmount(
      new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 0,
      }).format(numericValue)
    );
  };

  const handleStartProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerEmail || !amount || !itemName || !vendorName) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    if (credits < 200) {
      toast.error("Insufficient Trust Credits. You need at least 200 CTT to establish a vault.");
      return;
    }

    setIsCreating(true);
    if (paymentMethod === 'paystack') {
      if (!PAYSTACK_CONFIG.publicKey || PAYSTACK_CONFIG.publicKey.includes('xxx')) {
        toast.error("Environment Configuration Error: VITE_PAYSTACK_PUBLIC_KEY is missing.");
        setIsCreating(false);
        return;
      }
      console.log("💳 Launching Native Paystack UI...");
      handlePaystackPayment();
    } else {
      handleCreateVault();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FBFBFD]">
      <GlobalHeader />
      <main className="flex-1 py-16 md:py-24 selection:bg-[#007AFF]/10">
        <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* Left Column: The Vision */}
          <div className="flex-1 space-y-8 text-left max-w-[540px] relative">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#007AFF]/5 rounded-full blur-[100px] -z-10" />
            <div className="absolute top-1/2 -right-12 w-64 h-64 bg-[#34C759]/5 rounded-full blur-[80px] -z-10" />
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge variant="outline" className="mb-6 bg-white shadow-sm border-black/[0.05] text-[#007AFF] px-4 py-1.5 text-sm font-semibold rounded-full tracking-tight">
                <Fingerprint className="w-4 h-4 mr-2" /> Payment Settlement
              </Badge>
              <h1 className="text-[52px] md:text-[64px] font-bold leading-[1.05] tracking-tight text-[#1D1D1F] mb-8">
                The Standard for <br />
                Trustless Payments.
              </h1>
              <p className="text-[20px] text-[#86868B] font-medium leading-relaxed mb-10">
                Secure your purchase with a Paystack-backed Hedera Vault. Funds are only released to the vendor when you share your secret handshake PIN.
              </p>
            </motion.div>

            <div className="space-y-6">
              {[
                { 
                  icon: ShieldIcon, 
                  title: "Zero-Knowledge Handshake", 
                  desc: "Exchange a secure 4-digit PIN only when the item is in your hands." 
                },
                { 
                  icon: Lock, 
                  title: "Immutable Vaults", 
                  desc: "Funds are programmatically locked on Hedera's decentralized ledger." 
                },
                { 
                  icon: Zap, 
                  title: "Instant Settlement", 
                  desc: "Payments resolve in milliseconds once the handshake is complete." 
                }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 * (i + 1) }}
                  className="flex gap-5 items-start"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-white rounded-2xl shadow-sm border border-black/[0.03] flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-[#1D1D1F]" />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-bold text-[#1D1D1F] mb-1">{item.title}</h3>
                    <p className="text-[15px] text-[#86868B] leading-snug font-medium max-w-[340px]">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: The Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-[480px]"
          >
            <Card className="rounded-[40px] border-none shadow-[0_30px_60px_rgba(0,0,0,0.06)] bg-white overflow-hidden p-2">
              <div className="p-8 md:p-10 space-y-8">
                <div className="space-y-2 text-center lg:text-left">
                  <h2 className="text-[32px] font-bold tracking-tight text-[#1D1D1F]">Establish Vault</h2>
                  <p className="text-[17px] text-[#86868B] font-medium leading-relaxed">Secure your trustless deposit.</p>
                </div>

                <form onSubmit={handleStartProcess} className="space-y-8">
                  <div className="space-y-6">
                    <div className="p-6 bg-[#F5F5F7] rounded-[32px] space-y-6 border border-black/[0.02]">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[11px] font-bold text-[#86868B] uppercase tracking-[0.2em] ml-1">
                          {paymentMethod === 'hbar' ? 'Web3 Destination' : 'Bank Settlement Context'}
                        </h4>
                        <Badge variant="outline" className="text-[10px] bg-white border-black/5 text-[#86868B]">
                          {paymentMethod === 'hbar' ? 'HCS ID Required' : 'Fiat Rail'}
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="vendorName" className="text-[13px] font-bold text-[#1D1D1F]/60 ml-1">Vendor/Merchant Name</Label>
                          <Input
                            id="vendorName"
                            required
                            placeholder="e.g. Apple Nigeria"
                            value={vendorName}
                            onChange={(e) => setVendorName(e.target.value)}
                            className="h-[58px] rounded-2xl border-none bg-white px-5 text-[16px] font-medium shadow-sm focus:ring-4 focus:ring-[#007AFF]/10 transition-all"
                          />
                        </div>

                        {paymentMethod === 'paystack' ? (
                          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                             <div className="space-y-2">
                              <Label htmlFor="bankName" className="text-[13px] font-bold text-[#1D1D1F]/60 ml-1">Bank Name</Label>
                              <BankSearchSelect
                                value={bankCode}
                                onValueChange={(code) => {
                                  setBankCode(code);
                                  const bank = banks.find(b => b.code === code);
                                  if (bank) setBankName(bank.name);
                                  if (accountNumber.length === 10) handleResolveAccount(accountNumber, code);
                                }}
                                onOtherSelected={(isOther) => {
                                  if (isOther) {
                                    setBankCode("OTHER");
                                    setBankName("Other Bank");
                                  }
                                }}
                                disabled={isCreating || isResolving}
                                placeholder="Search and select bank"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="accountNumber" className="text-[13px] font-bold text-[#1D1D1F]/60 ml-1">Account Number</Label>
                              <div className="relative">
                                <Input
                                  id="accountNumber"
                                  required
                                  maxLength={10}
                                  placeholder="0123456789"
                                  value={accountNumber}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setAccountNumber(val);
                                    if (val.length === 10 && bankCode) handleResolveAccount(val, bankCode);
                                    else setResolvedAccountName("");
                                  }}
                                  className="h-[58px] rounded-2xl border-none bg-white px-5 text-[16px] font-medium shadow-sm focus:ring-4 focus:ring-[#007AFF]/10 transition-all"
                                />
                                {isResolving && (
                                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <Loader2 className="w-4 h-4 animate-spin text-[#007AFF]" />
                                  </div>
                                )}
                              </div>
                            </div>

                            {resolvedAccountName && (
                              <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-[#34C759]/10 border border-[#34C759]/20 rounded-2xl flex items-center gap-3"
                              >
                                <CheckCircle className="w-5 h-5 text-[#34C759]" />
                                <div>
                                  <p className="text-[11px] font-bold text-[#34C759] uppercase tracking-wider">Verified Account Name</p>
                                  <p className="text-[15px] font-bold text-[#1D1D1F]">{resolvedAccountName}</p>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <Label htmlFor="vendor" className="text-[13px] font-bold text-[#1D1D1F]/60 ml-1">Vendor Hedera ID</Label>
                            <Input
                              id="vendor"
                              required
                              placeholder="0.0.xxxxx"
                              value={vendorAccount}
                              onChange={(e) => setVendorAccount(e.target.value)}
                              className="h-[58px] rounded-2xl border-none bg-white px-5 text-[16px] font-medium shadow-sm focus:ring-4 focus:ring-[#007AFF]/10 transition-all"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="item" className="text-[13px] font-bold text-[#1D1D1F]/60 ml-1 uppercase tracking-widest">Project/Item Name</Label>
                      <Input
                        id="item"
                        required
                        placeholder="e.g. MacBook Air M3"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        className="h-[58px] rounded-2xl border-none bg-[#F5F5F7] px-5 text-[16px] font-medium focus:ring-4 focus:ring-[#007AFF]/10 focus:bg-white transition-all placeholder:text-[#1D1D1F]/20"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount" className="text-[13px] font-bold text-[#1D1D1F]/60 ml-1 uppercase tracking-widest">Amount</Label>
                        <Input
                          id="amount"
                          required
                          placeholder="₦0.00"
                          value={formattedAmount}
                          onChange={handleAmountChange}
                          className="h-[58px] rounded-2xl border-none bg-[#F5F5F7] px-5 text-[18px] font-bold text-[#007AFF] focus:ring-4 focus:ring-[#007AFF]/10 focus:bg-white transition-all placeholder:text-[#007AFF]/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-[13px] font-bold text-[#1D1D1F]/60 ml-1 uppercase tracking-widest">Your Email</Label>
                        <Input
                          id="email"
                          required
                          type="email"
                          placeholder="For deposit receipt"
                          value={buyerEmail}
                          onChange={(e) => setBuyerEmail(e.target.value)}
                          className="h-[58px] rounded-2xl border-none bg-[#F5F5F7] px-5 text-[16px] font-medium focus:ring-4 focus:ring-[#007AFF]/10 focus:bg-white transition-all placeholder:text-[#1D1D1F]/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[13px] font-bold text-[#1D1D1F]/60 ml-1 uppercase tracking-widest">Select Settlement Method</Label>
                    <div className="grid grid-cols-1 gap-3">
                      <div 
                        onClick={() => setPaymentMethod('paystack')}
                        className={`p-5 rounded-[24px] border-2 transition-all hover:scale-[1.01] cursor-pointer flex items-center justify-between ${paymentMethod === 'paystack' ? 'bg-white border-[#007AFF] shadow-[0_15px_40px_rgba(0,122,255,0.08)]' : 'bg-[#F5F5F7] border-transparent'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden ${paymentMethod === 'paystack' ? 'bg-[#007AFF]/05' : 'bg-white'}`}>
                            <img src={paystackLogo} alt="Paystack" className="w-10 h-10 object-contain" />
                          </div>
                          <div>
                            <p className="text-[16px] font-bold text-[#1D1D1F]">Paystack Gateway</p>
                            <p className="text-[13px] text-[#86868B] font-medium">30+ Local Banks (GTB, Opay, etc.)</p>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-[6px] transition-all ${paymentMethod === 'paystack' ? 'border-[#007AFF] bg-white' : 'border-black/5 bg-transparent'}`} />
                      </div>
                      
                      <div 
                        onClick={() => setPaymentMethod('hbar')}
                        className={`p-5 rounded-[24px] border-2 transition-all hover:scale-[1.01] cursor-pointer flex items-center justify-between ${paymentMethod === 'hbar' ? 'bg-white border-[#007AFF] shadow-[0_15px_40px_rgba(0,122,255,0.08)]' : 'bg-[#F5F5F7] border-transparent'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden ${paymentMethod === 'hbar' ? 'bg-[#007AFF]/05' : 'bg-white'}`}>
                            <img src={hederaLogo} alt="Hedera" className="w-10 h-10 object-contain" />
                          </div>
                          <div>
                            <p className="text-[16px] font-bold text-[#1D1D1F]">HBAR Native Vault</p>
                            <p className="text-[13px] text-[#86868B] font-medium">Decentralized Asset Flow (Hedera)</p>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-[6px] transition-all ${paymentMethod === 'hbar' ? 'border-[#007AFF] bg-white' : 'border-black/5 bg-transparent'}`} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10 mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider">Service Fee</span>
                    </div>
                    <span className="text-[15px] font-bold text-primary">200 CTT</span>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isCreating || credits < 200}
                    className="w-full h-[64px] rounded-[24px] bg-[#007AFF] hover:bg-[#0071E3] text-[18px] font-bold text-white shadow-[0_20px_40px_rgba(0,122,255,0.2)] transition-all active:scale-[0.98] border-none group"
                  >
                    {isCreating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                      <span className="flex items-center justify-center gap-2">
                        {credits < 200 ? 'Insufficient Credits' : (paymentMethod === 'hbar' ? 'Authorize HBAR Vault' : 'Initialize Secure Vault')}
                        <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </span>
                    )}
                  </Button>
                </form>

                <p className="text-[12px] text-[#86868B] text-center font-medium leading-relaxed px-8">
                  By clicking initialize, you agree to lock {formattedAmount || "funds"} in a trustless Hedera HCS-anchored vault until the handshake PIN is verified.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
      </main>
      <GlobalFooter />
    </div>
  );
}

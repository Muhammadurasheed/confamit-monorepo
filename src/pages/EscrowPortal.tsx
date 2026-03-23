import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Lock, ShieldCheck, CheckCircle2, KeyRound, Loader2, Copy, ExternalLink, Link2, Eye, EyeOff, User, Store, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/constants";
import { toast } from "sonner";
import GlobalHeader from "@/components/layout/Header";
import GlobalFooter from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";

export default function EscrowPortal() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [escrow, setEscrow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [isPeeked, setIsPeeked] = useState(false);
  
  // Detect role from URL query param: /escrow/:id?role=vendor
  const roleParam = searchParams.get('role');
  const viewMode = roleParam === 'vendor' ? 'vendor' : 'buyer';

  const fetchEscrow = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/escrow/${id}`);
      const data = await res.json();
      if (res.ok) setEscrow(data);
    } catch (err) {
      toast.error("Failed to load vault");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscrow();
    const interval = setInterval(fetchEscrow, 5000); 
    return () => clearInterval(interval);
  }, [id]);

  const handleReleaseWithPin = async () => {
    if (pinInput.length !== 4) {
      toast.error("PIN must be 4 digits.");
      return;
    }
    setActionLoading(true);
    try {
      toast.loading("Verifying cryptographic PIN via Hedera...", { id: "pin-verify" });
      
      const res = await fetch(`${API_BASE_URL}/escrow/${id}/release-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinInput }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to release funds");
      
      toast.success("PIN Verified! Vault unlocked and funds routed to your account.", { id: "pin-verify" });
      await fetchEscrow();
    } catch (err: any) {
      toast.error(err.message, { id: "pin-verify" });
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFD]">
      <GlobalHeader />
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#007AFF]" />
          <p className="text-[17px] font-medium text-[#86868B] animate-pulse">Synchronizing with Hedera HCS...</p>
        </div>
      </div>
      <GlobalFooter />
    </div>
  );
  
  if (!escrow) return <div className="min-h-screen flex items-center justify-center font-semibold text-lg">Vault not found</div>;

  return (
    <div className="flex min-h-screen flex-col bg-[#FBFBFD]">
      <GlobalHeader />
      <main className="flex-1 py-12 md:py-20 px-4 selection:bg-[#007AFF]/10">
        <div className="container mx-auto max-w-4xl">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-black/[0.03]">
            <ShieldCheck className="w-5 h-5 text-[#007AFF]" />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-[#1D1D1F] leading-tight">Secure Vault</h1>
            <p className="text-[14px] text-[#86868B] font-medium font-mono uppercase tracking-wider">{escrow.id.substring(0, 8)}...</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-black/[0.04] text-[#1D1D1F] text-[14px] font-bold">
          {viewMode === 'buyer' ? (
            <><User className="w-4 h-4 text-[#007AFF]" /> Buyer Access</>
          ) : (
            <><Store className="w-4 h-4 text-[#34C759]" /> Vendor Access</>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Overview Card */}
        <div className="lg:col-span-12">
          <Card className="rounded-[40px] border-none shadow-[0_20px_60px_rgba(0,0,0,0.03)] bg-white overflow-hidden p-8 md:p-12 mb-8">
            <div className="flex flex-col md:flex-row justify-between gap-10">
              <div className="space-y-6 flex-1">
                <Badge className={`px-4 py-1.5 rounded-full text-[13px] font-bold tracking-tight uppercase border-none shadow-sm ${
                  escrow.status === 'RELEASED' 
                  ? 'bg-green-500/10 text-green-600' 
                  : 'bg-[#007AFF]/10 text-[#007AFF]'
                }`}>
                  {escrow.status === 'RELEASED' ? '✅ Transaction Settled' : '🔐 Funds Secured on Hedera'}
                </Badge>
                
                <div className="space-y-2">
                  <h2 className="text-[42px] md:text-[54px] font-bold tracking-tight text-[#1D1D1F]">
                    {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(escrow.amount)}
                  </h2>
                  <p className="text-[20px] text-[#86868B] font-medium leading-relaxed">
                    Locked for <span className="text-[#1D1D1F] font-bold">{escrow.itemName}</span> from <span className="text-[#1D1D1F] font-bold">{escrow.vendorName}</span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="h-[52px] px-6 rounded-2xl border-none bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[15px] font-bold text-[#1D1D1F] transition-all"
                    onClick={() => copyToClipboard(`${window.location.origin}${window.location.pathname}?role=vendor`, "Vendor Vault Link")}
                  >
                    <Link2 className="w-4 h-4 mr-2" /> Share Vault Link
                  </Button>
                  {escrow.lastLockProofUrl && (
                    <Button asChild variant="ghost" className="h-[52px] px-6 rounded-2xl text-[15px] font-bold text-[#007AFF] hover:bg-[#007AFF]/5">
                      <a href={escrow.lastLockProofUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" /> Hedera Proof
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <div className="w-full md:w-auto">
                <div className="p-8 bg-[#F5F5F7] rounded-[32px] space-y-4 min-w-[280px]">
                  <h4 className="text-[13px] font-bold text-[#86868B] uppercase tracking-widest">Trust Details</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start text-[15px] font-medium">
                      <span className="text-[#86868B] mt-1">Vendor Destination</span>
                      <div className="text-right">
                        {escrow.bankAccountNumber ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[#1D1D1F] font-bold">{escrow.bankName}</span>
                            <span className="text-[#86868B] font-mono text-[13px]">{escrow.bankAccountNumber}</span>
                          </div>
                        ) : (
                          <>
                            <span className={`${!escrow.vendorAccount || escrow.vendorAccount === '0.0.0' ? 'text-[#86868B]' : 'text-[#1D1D1F]'} font-mono`}>
                              {!escrow.vendorAccount || escrow.vendorAccount === '0.0.0' ? '0.0.0 (Unassigned)' : escrow.vendorAccount}
                            </span>
                            <div className="mt-4 space-y-2">
                              <div className="p-3 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Zap className="h-4 w-4 text-primary" />
                                  <span className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider">Protocol Service Margin</span>
                                </div>
                                <Badge variant="outline" className="bg-white border-primary/20 text-primary font-bold">200 CTT PAID</Badge>
                              </div>

                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground ml-1">
                                <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                                Fee settlement anchored to Hedera Topic
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[15px] font-medium">
                      <span className="text-[#86868B]">Network Status</span>
                      <span className="text-[#34C759] flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Anchored</span>
                    </div>
                    <div className="flex justify-between items-center text-[15px] font-medium">
                      <span className="text-[#86868B]">Settlement Rail</span>
                      <span className="text-[#1D1D1F] flex items-center gap-1.5 uppercase tracking-tighter text-[12px] font-bold">
                        {escrow.paymentMethod === 'hbar' ? (
                          <><ShieldCheck className="w-3.5 h-3.5 text-[#007AFF]" /> HBAR Native</>
                        ) : (
                          <><Zap className="w-3.5 h-3.5 text-[#007AFF]" /> Paystack Fiat</>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Handshake Interaction */}
        {escrow.status === 'FUNDS_LOCKED' && (
          <div className="lg:col-span-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Buyer Side: The Secret */}
              <Card className={`rounded-[40px] border-none shadow-[0_15px_40px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-500 ${viewMode === 'buyer' ? 'bg-[#1D1D1F] text-white ring-4 ring-[#007AFF]/20' : 'bg-[#1D1D1F]/5 opacity-60'}`}>
                <div className="p-10 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${viewMode === 'buyer' ? 'bg-white/10 border-white/10' : 'bg-black/5 border-black/5'}`}>
                        <Lock className={`w-5 h-5 ${viewMode === 'buyer' ? 'text-white' : 'text-[#86868B]'}`} />
                      </div>
                      <h3 className="text-[20px] font-bold tracking-tight italic">Handshake PIN</h3>
                    </div>
                    {viewMode === 'buyer' && (
                       <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-white/40 hover:text-white hover:bg-white/10 rounded-xl"
                        onClick={() => copyToClipboard(escrow.releasePin, "Secret PIN")}
                       >
                         <Copy className="w-4 h-4" />
                       </Button>
                    )}
                  </div>

                  <div className="space-y-6">
                    <p className={`text-[17px] font-medium leading-relaxed ${viewMode === 'buyer' ? 'text-white/60' : 'text-[#86868B]'}`}>
                      {viewMode === 'buyer' 
                        ? "Reveal this PIN to the vendor ONLY after you have received and verified your items." 
                        : "The buyer holds a secret 4-digit PIN required to release these funds to you."}
                    </p>
                    
                    <div className="flex justify-center items-center gap-3 py-2">
                      {escrow.releasePin.split('').map((digit: string, i: number) => (
                        <motion.div 
                          key={i}
                          initial={false}
                          animate={{ scale: isPeeked && viewMode === 'buyer' ? 1 : 0.95 }}
                          className={`w-[60px] h-[75px] rounded-[24px] flex items-center justify-center text-[34px] font-bold shadow-sm transition-all duration-300 ${
                            isPeeked && viewMode === 'buyer' ? 'bg-white text-[#1D1D1F]' : 'bg-white/5 text-white/20 border border-white/10'
                          }`}
                        >
                           {isPeeked && viewMode === 'buyer' ? digit : '•'}
                        </motion.div>
                      ))}
                    </div>

                    {viewMode === 'buyer' && (
                      <div className="pt-4">
                        <Button 
                          onClick={() => setIsPeeked(!isPeeked)}
                          className={`w-full h-[58px] rounded-2xl font-bold text-[16px] transition-all border-none ${
                            isPeeked 
                            ? 'bg-[#007AFF] text-white hover:bg-[#0071E3] shadow-[0_8px_24px_rgba(0,122,255,0.3)]' 
                            : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          {isPeeked ? <><EyeOff className="w-4 h-4 mr-2" /> Hide Private PIN</> : <><Eye className="w-4 h-4 mr-2" /> Peek Secret PIN</>}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Vendor Side: The Redemption */}
              <Card className={`rounded-[40px] border-none shadow-[0_15px_40px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-500 relative ${viewMode === 'vendor' ? 'bg-white ring-4 ring-[#34C759]/20' : 'bg-[#F2F2F7]/50 border border-black/[0.03]'}`}>
                {viewMode === 'buyer' && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center mb-4">
                      <Lock className="w-7 h-7 text-[#86868B]" />
                    </div>
                    <h4 className="text-[18px] font-bold text-[#1D1D1F] mb-2">Vendor Interaction Portal</h4>
                    <p className="text-[14px] text-[#86868B] font-medium max-w-[240px]">This side is reserved for the vendor to enter the handshake PIN.</p>
                  </div>
                )}
                
                <div className="p-10 space-y-8">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${viewMode === 'vendor' ? 'bg-[#34C759]/10' : 'bg-[#86868B]/10'}`}>
                      <KeyRound className={`w-5 h-5 ${viewMode === 'vendor' ? 'text-[#34C759]' : 'text-[#86868B]'}`} />
                    </div>
                    <h3 className="text-[20px] font-bold text-[#1D1D1F] tracking-tight">Vendor Payout</h3>
                  </div>

                  <div className="space-y-6">
                    <p className="text-[17px] text-[#86868B] font-medium leading-relaxed">
                      Enter the 4-digit Handshake PIN provided by the buyer to instantly authorize the Hedera Vault release.
                    </p>
                    
                    <div className="flex flex-col gap-5">
                      <Input 
                        placeholder="••••" 
                        className={`h-[75px] text-center text-[32px] tracking-[0.5em] font-bold rounded-[24px] border-none px-5 transition-all focus:ring-4 focus:ring-[#34C759]/10 focus:bg-white bg-[#F5F5F7] ${
                          viewMode === 'vendor' ? 'opacity-100' : 'opacity-30'
                        }`}
                        maxLength={4}
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                        disabled={viewMode !== 'vendor' || actionLoading}
                      />
                      <Button 
                        size="lg" 
                        className={`w-full h-[62px] rounded-2xl text-[17px] font-bold shadow-lg transition-all border-none ${
                          viewMode === 'vendor' ? 'bg-[#34C759] hover:bg-[#2FB34F] text-white shadow-[0_8px_24px_rgba(52,199,89,0.3)]' : 'bg-[#86868B] text-white/50'
                        }`}
                        onClick={handleReleaseWithPin} 
                        disabled={viewMode !== 'vendor' || actionLoading || pinInput.length !== 4}
                      >
                        {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ShieldCheck className="w-5 h-5 mr-2" />}
                        Complete Settlement
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

            </div>
          </div>
        )}

        {/* Released (Settled) */}
        {escrow.status === 'RELEASED' && (
          <div className="lg:col-span-12 animate-in zoom-in-95 duration-700">
            <Card className="rounded-[40px] border-none shadow-[0_25px_70px_rgba(52,199,89,0.1)] bg-white overflow-hidden">
              <div className="p-12 text-center space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#34C759]/5 rounded-full blur-3xl" />
                
                <div className="w-24 h-24 bg-[#34C759]/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-[#34C759]/20">
                  <CheckCircle2 className="w-12 h-12 text-[#34C759]" />
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-[36px] font-bold tracking-tight text-[#1D1D1F]">Handshake Complete.</h2>
                  <p className="text-[19px] text-[#86868B] font-medium max-w-lg mx-auto leading-relaxed">
                    The ZK-PIN is verified. The programmatic vault has released the funds to <span className="text-[#1D1D1F] font-bold">{escrow.vendorName}</span>.
                  </p>
                </div>
                
                <div className="max-w-xl mx-auto bg-[#F5F5F7] rounded-[32px] p-8 text-left space-y-6">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-white text-[#86868B] border-none shadow-sm px-4 py-1.5 rounded-full font-bold">Hedera Settlement Proof</Badge>
                    <span className="text-[13px] font-bold text-[#34C759] uppercase tracking-widest">Finalized</span>
                  </div>
                  
                  <div className="space-y-4 font-mono text-[13px]">
                    <div className="flex justify-between items-center bg-white/40 rounded-2xl p-4 transition-all hover:bg-white/60">
                      <span className="text-[#86868B]">Transaction Hash</span>
                      <code className="text-[#1D1D1F] font-bold">{escrow.finalProofTx?.substring(0, 16)}...</code>
                    </div>
                    <div className="flex justify-between items-center bg-white/40 rounded-2xl p-4">
                      <span className="text-[#86868B]">Settlement Method</span>
                      <span className="text-[#1D1D1F] font-bold">{escrow.paymentMethod === 'hbar' ? 'Native HBAR Protocol' : 'Paystack Multi-Bank'}</span>
                    </div>
                  </div>

                  {escrow.finalProofUrl && (
                    <Button asChild className="w-full h-[58px] mt-4 rounded-2xl bg-[#1D1D1F] hover:bg-black text-[16px] font-bold text-white transition-all border-none">
                      <a href={escrow.finalProofUrl} target="_blank" rel="noopener noreferrer">
                        View on Hedera HashScan <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  )}
                </div>

                <p className="text-[14px] text-[#86868B] font-medium">
                  This transaction is immutable and permanently anchored on the Hedera decentralized ledger.
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>

      <div className="text-center mt-12 text-[14px] text-[#86868B] font-medium flex items-center justify-center gap-2">
        <Lock className="w-4 h-4" /> Zero-Knowledge Security via Hedera Hashgraph Native HCS
      </div>
        </div>
      </main>
      <GlobalFooter />
    </div>
  );
}

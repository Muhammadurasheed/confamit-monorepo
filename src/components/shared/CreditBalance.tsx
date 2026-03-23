import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  ChevronRight, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/constants';

export const CreditBalance = () => {
  const { user, credits } = useAuth();
  const [isRecharging, setIsRecharging] = useState(false);

  if (!user) return null;

  const handleTopUp = (amount: number) => {
    setIsRecharging(true);
    
    // @ts-ignore
    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxx',
      email: user.email,
      amount: amount * 100, // Naira to Kobo
      currency: 'NGN',
      callback: (response: any) => {
        console.log("✅ Recharge Payment Success:", response);
        // Use a separate async function to handle the backend sync
        const syncRecharge = async () => {
          try {
            const res = await fetch(`${API_BASE_URL}/accounts/recharge`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                uid: user.uid,
                amount,
                reference: response.reference
              })
            });
            const result = await res.json();
            if (result.success) {
              toast.success(`Successfully recharged ${amount} credits!`);
            } else {
              toast.error('Recharge failed. Please contact support.');
            }
          } catch (e) {
            toast.error('Sync error. Your balance will update shortly.');
          } finally {
            setIsRecharging(false);
          }
        };
        syncRecharge();
      },
      onClose: () => setIsRecharging(false)
    });
    handler.openIframe();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9 px-3 bg-white hover:bg-primary text-primary hover:text-white border-primary/20 flex items-center gap-2 rounded-full shadow-sm transition-all hover:scale-105 group"
        >
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 group-hover:bg-white/20 transition-colors">
            <Zap className="h-3 w-3 text-primary fill-primary group-hover:text-white group-hover:fill-white transition-colors" />
          </div>
          <span className="font-semibold text-sm text-foreground group-hover:text-white transition-colors">
            {credits.toLocaleString()} <span className="text-[10px] text-muted-foreground ml-0.5 group-hover:text-white/70 transition-colors">CTT</span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64 p-2 shadow-2xl border-primary/10 bg-background/95 backdrop-blur-xl">
        <DropdownMenuLabel className="p-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">ConfirmIT Trust Credits</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-bold">{credits.toLocaleString()}</span>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Used for service margins and AI audit fees.
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-primary/5" />
        
        <div className="p-2 grid grid-cols-2 gap-2">
          {[1000, 2500, 5000, 10000].map((amt) => (
            <Button 
              key={amt}
              variant="ghost" 
              size="sm"
              onClick={() => handleTopUp(amt)}
              disabled={isRecharging}
              className="text-xs border border-primary/5 hover:bg-primary/5 hover:text-primary h-12 flex flex-col items-center justify-center gap-0.5"
            >
              <span className="font-bold">+{amt.toLocaleString()}</span>
              <span className="text-[9px] opacity-60">₦{amt.toLocaleString()}</span>
            </Button>
          ))}
        </div>

        <DropdownMenuItem 
          className="mt-2 rounded-lg bg-primary text-primary-foreground focus:bg-primary/90 focus:text-primary-foreground p-3 flex justify-between group cursor-pointer"
          onClick={() => handleTopUp(2000)}
        >
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="font-medium text-sm">Quick Recharge</span>
          </div>
          <ChevronRight className="h-4 w-4 opacity-50 group-hover:translate-x-1 transition-transform" />
        </DropdownMenuItem>
        
        <div className="mt-3 p-3 rounded-xl bg-muted/30 border border-primary/5">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <ShieldCheck className="h-3 w-3 text-green-500" />
            Audit trail anchored to Hedera
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

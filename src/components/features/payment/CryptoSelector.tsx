import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { CryptoCurrency } from "@/store/paymentStore";

interface CryptoSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (crypto: CryptoCurrency) => void;
  usdAmount: number;
}

interface CryptoOption {
  id: CryptoCurrency;
  name: string;
  symbol: string;
  icon: string;
  amount: string;
  network?: string;
  description: string;
}

export const CryptoSelector = ({
  open,
  onClose,
  onSelect,
  usdAmount,
}: CryptoSelectorProps) => {
  const [selected, setSelected] = useState<CryptoCurrency | null>(null);

  const cryptoOptions: CryptoOption[] = [
    {
      id: "hbar",
      name: "Hedera HBAR",
      symbol: "HBAR",
      icon: "⚡",
      amount: `${(usdAmount / 0.05).toFixed(2)} HBAR`, // Approx conversion
      network: "Hedera Mainnet",
      description: "Lightning-fast, low-fee transactions",
    },
    {
      id: "usdthbar",
      name: "USDT",
      symbol: "USDT",
      icon: "💵",
      amount: `${usdAmount.toFixed(2)} USDT`,
      network: "Hedera Network",
      description: "Stablecoin pegged to USD",
    },
    {
      id: "btc",
      name: "Bitcoin",
      symbol: "BTC",
      icon: "₿",
      amount: `${(usdAmount / 100000).toFixed(8)} BTC`, // Approx conversion
      network: "Bitcoin Network",
      description: "The original cryptocurrency",
    },
    {
      id: "eth",
      name: "Ethereum",
      symbol: "ETH",
      icon: "⟠",
      amount: `${(usdAmount / 3500).toFixed(6)} ETH`, // Approx conversion
      network: "Ethereum Mainnet",
      description: "Smart contract platform",
    },
  ];

  const handleSelect = (crypto: CryptoCurrency) => {
    setSelected(crypto);
  };

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Cryptocurrency</DialogTitle>
          <DialogDescription>
            Choose your preferred cryptocurrency for payment (≈ ${usdAmount} USD)
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {cryptoOptions.map((option) => (
            <motion.div
              key={option.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer transition-all border-2 ${
                  selected === option.id
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => handleSelect(option.id)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{option.icon}</span>
                        <div>
                          <h4 className="font-bold">{option.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {option.network}
                          </p>
                        </div>
                      </div>
                      {option.id === "hbar" && (
                        <Badge variant="outline" className="text-xs">
                          Recommended
                        </Badge>
                      )}
                    </div>

                    <div className="text-xl font-bold text-primary">
                      {option.amount}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selected}>
            Continue with {selected ? cryptoOptions.find(o => o.id === selected)?.name : 'Crypto'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

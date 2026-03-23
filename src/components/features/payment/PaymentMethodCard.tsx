import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface PaymentMethodCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  amount: string;
  originalAmount?: string;
  discount?: string;
  badges?: string[];
  isRecommended?: boolean;
  isSelected?: boolean;
  onClick: () => void;
}

export const PaymentMethodCard = ({
  icon: Icon,
  title,
  description,
  amount,
  originalAmount,
  discount,
  badges = [],
  isRecommended = false,
  isSelected = false,
  onClick,
}: PaymentMethodCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card
        className={`relative cursor-pointer transition-all border-2 ${
          isSelected
            ? "border-primary shadow-lg bg-primary/5"
            : "border-border hover:border-primary/50 hover:shadow-md"
        }`}
        onClick={onClick}
      >
        {isRecommended && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-gradient-primary text-white shadow-lg px-4 py-1">
              ⭐ Recommended
            </Badge>
          </div>
        )}

        {discount && (
          <div className="absolute -top-3 right-4">
            <Badge variant="outline" className="bg-success text-success-foreground border-success shadow-md">
              {discount} OFF
            </Badge>
          </div>
        )}

        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>

            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>

              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-3xl font-bold text-primary">{amount}</span>
                {originalAmount && (
                  <span className="text-lg text-muted-foreground line-through">
                    {originalAmount}
                  </span>
                )}
              </div>

              {badges.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {badges.map((badge, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {badge}
                    </Badge>
                  ))}
                </div>
              )}

              <Button
                className="w-full mt-4"
                variant={isSelected ? "default" : "outline"}
              >
                {isSelected ? "Selected" : "Select"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

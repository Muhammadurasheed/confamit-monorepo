import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TrustScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const TrustScoreGauge = ({ score, size = "md", showLabel = true }: TrustScoreGaugeProps) => {
  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const getScoreColor = (score: number) => {
    if (score === 0) return "text-muted-foreground";
    if (score >= 80) return "text-success";
    if (score >= 50) return "text-warning";
    return "text-danger";
  };

  const getStrokeColor = (score: number) => {
    if (score === 0) return "hsl(var(--muted-foreground))";
    if (score >= 80) return "hsl(142 76% 36%)"; // Success green with strong contrast
    if (score >= 50) return "hsl(38 92% 50%)"; // Warning yellow/orange
    return "hsl(0 84% 60%)"; // Danger red with good contrast
  };

  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn("relative", sizeClasses[size])}>
        <svg className="transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="10"
            opacity="0.2"
          />
          {/* Animated progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={getStrokeColor(score)}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className={cn("font-bold", textSizeClasses[size], getScoreColor(score))}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {score === 0 ? "N/A" : score}
          </motion.span>
        </div>
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-muted-foreground">Trust Score</span>
      )}
    </div>
  );
};

export default TrustScoreGauge;

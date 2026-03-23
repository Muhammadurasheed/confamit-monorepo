import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Step {
  id: string;
  label: string;
  duration: number;
}

const STEPS: Step[] = [
  { id: "validate", label: "Validating format", duration: 500 },
  { id: "fraud", label: "Checking fraud reports", duration: 1000 },
  { id: "business", label: "Searching verified businesses", duration: 800 },
  { id: "patterns", label: "Analyzing transaction patterns", duration: 700 },
];

export const AccountCheckProgress = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    const totalDuration = STEPS.reduce((sum, step) => sum + step.duration, 0);
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += 100;
      
      let accumulatedTime = 0;
      for (let i = 0; i < STEPS.length; i++) {
        accumulatedTime += STEPS[i].duration;
        if (elapsed >= accumulatedTime && !completedSteps.includes(STEPS[i].id)) {
          setCompletedSteps(prev => [...prev, STEPS[i].id]);
          if (i < STEPS.length - 1) {
            setCurrentStep(i + 1);
          }
        }
      }

      if (elapsed >= totalDuration) {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="border-primary/20 shadow-xl">
      <CardContent className="p-8 md:p-12">
        <div className="flex flex-col items-center space-y-8">
          {/* Animated Shield Icon */}
          <motion.div
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <Shield className="h-24 w-24 text-primary" />
              
              {/* Scanning waves */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary"
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary"
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 0.7,
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary"
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 1.4,
                }}
              />
            </div>
          </motion.div>

          {/* Status Text */}
          <motion.h3
            className="text-2xl font-bold text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Checking Account Intelligence...
          </motion.h3>

          {/* Progress Steps */}
          <div className="w-full max-w-md space-y-3">
            {STEPS.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = currentStep === index;

              return (
                <motion.div
                  key={step.id}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="h-5 w-5 text-primary animate-spin flex-shrink-0" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted flex-shrink-0" />
                  )}
                  <span
                    className={`text-sm md:text-base ${
                      isCompleted
                        ? "text-muted-foreground line-through"
                        : isCurrent
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Time Estimate */}
          <motion.p
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            This usually takes 2-3 seconds
          </motion.p>
        </div>
      </CardContent>
    </Card>
  );
};

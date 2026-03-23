import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

const tips = [
  "73% of fake receipts have font inconsistencies",
  "Most fraudulent receipts show signs of image manipulation",
  "Metadata analysis can reveal if a document was edited",
  "Legit checks over 50 forensic markers in every receipt",
  "AI can detect tampering invisible to the human eye"
];

export const EducationalTips = () => {
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-muted">
      <Lightbulb className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
      <div className="flex-1 overflow-hidden">
        <p className="text-xs font-medium text-muted-foreground mb-1">Did you know?</p>
        <AnimatePresence mode="wait">
          <motion.p
            key={currentTip}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-sm font-medium"
          >
            {tips[currentTip]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

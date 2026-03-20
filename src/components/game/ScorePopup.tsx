import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface ScorePopupProps {
  score: number;
  prevScore: number;
}

export default function ScorePopup({ score, prevScore }: ScorePopupProps) {
  const [showPopup, setShowPopup] = useState(false);
  const diff = score - prevScore;

  useEffect(() => {
    if (diff > 0) {
      setShowPopup(true);
      const t = setTimeout(() => setShowPopup(false), 1200);
      return () => clearTimeout(t);
    }
  }, [score, diff]);

  return (
    <div className="relative inline-block">
      <motion.span
        key={score}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="text-3xl font-display font-black text-primary tabular-nums"
      >
        {score}
      </motion.span>
      <AnimatePresence>
        {showPopup && (
          <motion.span
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -24 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute -top-2 -right-6 text-safe font-display font-black text-sm"
          >
            +{diff}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

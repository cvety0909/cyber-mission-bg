import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CountdownScreenProps {
  onComplete: () => void;
}

const STEPS = ["Подгответе се...", "3", "2", "1"];
const STEP_MS = 1000;

export default function CountdownScreen({ onComplete }: CountdownScreenProps) {
  const [step, setStep] = useState(0);

  const safeComplete = useCallback(() => {
    try { onComplete(); } catch { /* never crash */ }
  }, [onComplete]);

  useEffect(() => {
    if (step < STEPS.length - 1) {
      const t = setTimeout(() => setStep(s => s + 1), STEP_MS);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(safeComplete, STEP_MS);
      return () => clearTimeout(t);
    }
  }, [step, safeComplete]);

  const isNumber = step > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 50% 60%, hsla(199,89%,48%,0.1) 0%, hsla(222,47%,6%,1) 65%)",
      }}
    >
      {/* Grid */}
      <div className="absolute inset-0 grid-bg opacity-20" />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.15 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative z-10 text-center"
        >
          <span
            className={`font-display font-black uppercase tracking-tight text-foreground ${
              isNumber ? "text-8xl md:text-9xl" : "text-2xl md:text-4xl"
            }`}
            style={{ textShadow: "0 0 30px hsla(199,89%,48%,0.4)" }}
          >
            {STEPS[step]}
          </span>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

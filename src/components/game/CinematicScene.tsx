import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SkipForward } from "lucide-react";

interface CinematicSceneProps {
  lines: [string, string];
  waveIndex: number; // 0-4
  onComplete: () => void;
}

const WAVE_GRADIENTS = [
  // Wave 0 - intro: digital network grid
  "radial-gradient(ellipse at 50% 50%, hsla(199,89%,48%,0.12) 0%, hsla(222,47%,4%,1) 70%)",
  // Wave 1 - after 5: falling symbols
  "radial-gradient(ellipse at 30% 70%, hsla(45,93%,47%,0.1) 0%, hsla(222,47%,4%,1) 70%)",
  // Wave 2 - after 10: neon digital city
  "radial-gradient(ellipse at 70% 30%, hsla(280,80%,60%,0.1) 0%, hsla(222,47%,4%,1) 70%)",
  // Wave 3 - after 15: digital storm
  "radial-gradient(ellipse at 50% 50%, hsla(0,84%,60%,0.08) 0%, hsla(222,47%,4%,1) 70%)",
  // Wave 4 - final: energy shield
  "radial-gradient(ellipse at 50% 50%, hsla(142,71%,45%,0.12) 0%, hsla(222,47%,4%,1) 70%)",
];

const WAVE_ACCENT_COLORS = [
  "hsla(199,89%,48%,0.6)",
  "hsla(45,93%,47%,0.6)",
  "hsla(280,80%,60%,0.6)",
  "hsla(0,84%,60%,0.6)",
  "hsla(142,71%,45%,0.6)",
];

export default function CinematicScene({ lines, waveIndex, onComplete }: CinematicSceneProps) {
  const [lineIdx, setLineIdx] = useState(0);
  const [glitch, setGlitch] = useState(false);

  // Auto-advance lines then complete
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setGlitch(true);
      setTimeout(() => {
        setGlitch(false);
        setLineIdx(1);
      }, 300);
    }, 3500);

    const timer2 = setTimeout(() => {
      onComplete();
    }, 7500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  const accent = WAVE_ACCENT_COLORS[waveIndex] || WAVE_ACCENT_COLORS[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: WAVE_GRADIENTS[waveIndex] || WAVE_GRADIENTS[0] }}
    >
      {/* Animated grid lines */}
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 2 + Math.random() * 3,
              height: 2 + Math.random() * 3,
              background: accent,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30 - Math.random() * 40, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Scan line effect */}
      <motion.div
        className="absolute left-0 right-0 h-px pointer-events-none"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        animate={{ top: ["-5%", "105%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />

      {/* Subtitle text */}
      <div className="relative z-10 text-center px-8 max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.p
            key={lineIdx}
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              x: glitch ? [0, -3, 3, -1, 0] : 0,
            }}
            exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
            transition={{ duration: 0.6 }}
            className="text-xl md:text-3xl lg:text-4xl font-body text-foreground leading-relaxed"
            style={{ textShadow: `0 0 30px ${accent}` }}
          >
            {lines[lineIdx]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-0.5 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: accent }}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 7.5, ease: "linear" }}
        />
      </div>

      {/* Skip button */}
      <button
        onClick={onComplete}
        className="absolute bottom-8 right-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-body z-20"
      >
        Пропусни <SkipForward className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

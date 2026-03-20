import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SkipForward } from "lucide-react";

interface CinematicSceneProps {
  lines: [string, string];
  waveIndex: number; // 0-4
  onComplete: () => void;
}

const WAVE_GRADIENTS = [
  // Wave 0 - intro: cyber grid, neon blue
  "radial-gradient(ellipse at 50% 60%, hsla(199,89%,48%,0.14) 0%, hsla(222,47%,6%,1) 65%)",
  // Wave 1 - school network: teal nodes
  "radial-gradient(ellipse at 40% 50%, hsla(174,72%,46%,0.12) 0%, hsla(222,47%,6%,1) 65%)",
  // Wave 2 - personal data: violet shields
  "radial-gradient(ellipse at 60% 40%, hsla(262,68%,56%,0.12) 0%, hsla(222,47%,6%,1) 65%)",
  // Wave 3 - digital city: amber glow
  "radial-gradient(ellipse at 50% 70%, hsla(38,92%,50%,0.1) 0%, hsla(222,47%,6%,1) 65%)",
  // Wave 4 - victory: bright green stabilised
  "radial-gradient(ellipse at 50% 50%, hsla(142,71%,45%,0.14) 0%, hsla(222,47%,6%,1) 65%)",
];

const WAVE_ACCENT = [
  "hsla(199,89%,48%,0.55)",
  "hsla(174,72%,46%,0.55)",
  "hsla(262,68%,56%,0.55)",
  "hsla(38,92%,50%,0.55)",
  "hsla(142,71%,45%,0.55)",
];

const DURATION_MS = 5000;
const LINE_SWITCH_MS = 2400;

export default function CinematicScene({ lines, waveIndex, onComplete }: CinematicSceneProps) {
  const [lineIdx, setLineIdx] = useState(0);
  const [glitch, setGlitch] = useState(false);

  const safeComplete = useCallback(() => {
    try { onComplete(); } catch { /* never crash */ }
  }, [onComplete]);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setGlitch(true);
      setTimeout(() => { setGlitch(false); setLineIdx(1); }, 250);
    }, LINE_SWITCH_MS);

    const t2 = setTimeout(safeComplete, DURATION_MS);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [safeComplete]);

  const accent = WAVE_ACCENT[waveIndex] ?? WAVE_ACCENT[0];

  const particles = useMemo(() =>
    Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      w: 1.5 + Math.random() * 2.5,
      x: Math.random() * 100,
      y: Math.random() * 100,
      dur: 3 + Math.random() * 3,
      del: Math.random() * 2,
    })),
  []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: WAVE_GRADIENTS[waveIndex] ?? WAVE_GRADIENTS[0] }}
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.w,
              height: p.w,
              background: accent,
              left: `${p.x}%`,
              top: `${p.y}%`,
            }}
            animate={{
              y: [0, -18 - Math.random() * 22, 0],
              opacity: [0.15, 0.6, 0.15],
            }}
            transition={{
              duration: p.dur,
              repeat: Infinity,
              delay: p.del,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Scan line */}
      <motion.div
        className="absolute left-0 right-0 h-px pointer-events-none"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        animate={{ top: ["-5%", "105%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />

      {/* Subtle zoom container */}
      <motion.div
        className="relative z-10 text-center px-8 max-w-2xl"
        initial={{ scale: 1 }}
        animate={{ scale: 1.03 }}
        transition={{ duration: DURATION_MS / 1000, ease: "easeOut" }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={lineIdx}
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              x: glitch ? [0, -2, 2, -1, 0] : 0,
            }}
            exit={{ opacity: 0, y: -16, filter: "blur(4px)" }}
            transition={{ duration: 0.5 }}
            className="text-xl md:text-3xl lg:text-4xl font-body text-foreground leading-relaxed"
            style={{ textShadow: `0 0 24px ${accent}` }}
          >
            {lines[lineIdx]}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* Progress bar */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-0.5 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: accent }}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: DURATION_MS / 1000, ease: "linear" }}
        />
      </div>

      {/* Skip button — top right */}
      <button
        onClick={safeComplete}
        className="absolute top-6 right-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-body z-20 active:scale-95"
      >
        Пропусни <SkipForward className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

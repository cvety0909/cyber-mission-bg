import { motion } from "framer-motion";
import { useMemo } from "react";

interface WaveBackgroundProps {
  missionIdx: number;
}

const WAVE_CONFIGS = [
  // Wave 1 (0-4): network grid - calm blue
  { color: "hsla(199,89%,48%,0.04)", accentColor: "hsla(199,89%,48%,0.15)", particleCount: 8 },
  // Wave 2 (5-9): falling symbols - amber warning
  { color: "hsla(45,93%,47%,0.04)", accentColor: "hsla(45,93%,47%,0.15)", particleCount: 12 },
  // Wave 3 (10-14): neon city - purple
  { color: "hsla(280,80%,60%,0.04)", accentColor: "hsla(280,80%,60%,0.15)", particleCount: 15 },
  // Wave 4 (15-19): digital storm - red energy
  { color: "hsla(0,84%,60%,0.04)", accentColor: "hsla(0,84%,60%,0.15)", particleCount: 18 },
];

function getWaveConfig(missionIdx: number) {
  if (missionIdx < 5) return WAVE_CONFIGS[0];
  if (missionIdx < 10) return WAVE_CONFIGS[1];
  if (missionIdx < 15) return WAVE_CONFIGS[2];
  return WAVE_CONFIGS[3];
}

export default function WaveBackground({ missionIdx }: WaveBackgroundProps) {
  const config = getWaveConfig(missionIdx);

  const particles = useMemo(() =>
    Array.from({ length: config.particleCount }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2.5,
      duration: 4 + Math.random() * 4,
      delay: Math.random() * 3,
    })),
    [config.particleCount]
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Ambient glow */}
      <motion.div
        key={missionIdx}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 80%, ${config.accentColor} 0%, transparent 60%)`,
        }}
      />

      {/* Subtle floating particles */}
      {particles.map(p => (
        <motion.div
          key={`${missionIdx}-${p.id}`}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: config.accentColor,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: [0, -20 - Math.random() * 20, 0],
            opacity: [0.15, 0.5, 0.15],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

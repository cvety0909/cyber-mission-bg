import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { useMemo } from "react";

const PARTICLE_COUNT = 20;

export default function PreGameWaiting() {
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1.5 + Math.random() * 2,
        dur: 5 + Math.random() * 4,
        delay: Math.random() * 3,
      })),
    []
  );

  const gridLines = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        isHorizontal: i < 6,
        offset: 10 + (i % 6) * 16,
        delay: i * 0.3,
      })),
    []
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background">
      {/* Cyber grid */}
      <div className="absolute inset-0 pointer-events-none">
        {gridLines.map((line) => (
          <motion.div
            key={line.id}
            className="absolute"
            style={
              line.isHorizontal
                ? { left: 0, right: 0, top: `${line.offset}%`, height: 1 }
                : { top: 0, bottom: 0, left: `${line.offset}%`, width: 1 }
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.06, 0.03] }}
            transition={{
              duration: 3,
              delay: line.delay,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          >
            <div className="w-full h-full bg-primary" />
          </motion.div>
        ))}
      </div>

      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 60%, hsla(199,89%,48%,0.08) 0%, transparent 60%)",
        }}
      />

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: 0.15,
          }}
          animate={{
            y: [0, -15 - Math.random() * 15, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Central content */}
      <div className="relative z-10 text-center px-6 max-w-xl">
        {/* Pulsing shield */}
        <motion.div
          className="mx-auto mb-8 w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            background:
              "radial-gradient(circle, hsla(199,89%,48%,0.15) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Shield className="w-12 h-12 text-primary" />
        </motion.div>

        <motion.h1
          className="text-3xl md:text-4xl font-display font-black uppercase tracking-tight text-foreground mb-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Киберсистемите се подготвят…
        </motion.h1>

        <motion.p
          className="text-lg text-primary font-body mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Очаква се старт на мисията.
        </motion.p>

        <motion.p
          className="text-sm text-muted-foreground font-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Учителят ще стартира играта.
        </motion.p>

        {/* Scan line */}
        <motion.div
          className="mt-10 mx-auto h-px w-48 rounded-full"
          style={{ background: "hsla(199,89%,48%,0.3)" }}
          animate={{ opacity: [0.2, 0.8, 0.2], scaleX: [0.6, 1, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

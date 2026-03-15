import { motion } from "framer-motion";
import { ReactNode } from "react";

type CyberVariant = "primary" | "stop" | "warn" | "safe" | "ghost";

const variantClasses: Record<CyberVariant, string> = {
  primary: "bg-primary text-primary-foreground cyber-glow-primary hover:brightness-110",
  stop: "bg-destructive text-destructive-foreground cyber-glow-stop hover:brightness-110",
  warn: "bg-warn text-warn-foreground cyber-glow-warn hover:brightness-110",
  safe: "bg-safe text-safe-foreground cyber-glow-safe hover:brightness-110",
  ghost: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
};

interface CyberButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: CyberVariant;
  className?: string;
  disabled?: boolean;
}

export default function CyberButton({ children, onClick, variant = "primary", className = "", disabled = false }: CyberButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`px-8 py-4 rounded-xl font-display font-bold uppercase tracking-wider transition-all duration-200 ${variantClasses[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
    >
      {children}
    </motion.button>
  );
}

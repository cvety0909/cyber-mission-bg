import { motion } from "framer-motion";
import { Users, ArrowLeft } from "lucide-react";
import { useGame } from "@/context/GameContext";
import CyberButton from "./CyberButton";

const TEAM_COLORS = [
  "hover:shadow-[0_0_30px_hsla(199,89%,48%,0.4)] hover:border-primary",
  "hover:shadow-[0_0_30px_hsla(142,71%,45%,0.4)] hover:border-safe",
  "hover:shadow-[0_0_30px_hsla(45,93%,47%,0.4)] hover:border-warn",
  "hover:shadow-[0_0_30px_hsla(280,80%,55%,0.4)] hover:border-[hsl(280,80%,55%)]",
];

export default function TeamSelect() {
  const { selectTeam, setView, setRole } = useGame();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 grid-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <button
          onClick={() => { setView("landing"); setRole(null); }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Назад
        </button>

        <h2 className="text-3xl md:text-4xl font-display font-bold mb-2 uppercase tracking-widest text-center text-foreground">
          Избери своя отбор
        </h2>
        <p className="text-muted-foreground text-center mb-10 font-body">
          Присъедини се към един от трите отбора
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((num, i) => (
            <motion.button
              key={num}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectTeam(num)}
              className={`group cyber-surface p-12 border-2 border-transparent transition-all text-center cursor-pointer ${TEAM_COLORS[i]}`}
            >
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-2xl font-display font-black uppercase text-foreground">
                Отбор {num}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

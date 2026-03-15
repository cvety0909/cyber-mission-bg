import { motion, AnimatePresence } from "framer-motion";
import { Shield, Clock, CheckCircle } from "lucide-react";
import CyberButton from "./CyberButton";
import { useGame } from "@/context/GameContext";

export default function StudentGame() {
  const { selectedTeam, phase, currentMission, currentMissionIdx, totalMissions, hasVoted, submitVote } = useGame();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 grid-bg">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-sm uppercase tracking-widest text-foreground">Отбор {selectedTeam}</span>
        </div>
        <span className="text-xs text-muted-foreground font-body">
          Мисия {currentMissionIdx + 1}/{totalMissions}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {phase === "waiting" && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <div className="inline-block p-5 rounded-full bg-primary/10 mb-6 animate-pulse-glow">
              <Clock className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-2 text-foreground">Отбор {selectedTeam} е в готовност</h2>
            <p className="text-muted-foreground font-body">Изчакай учителя да стартира мисията...</p>
          </motion.div>
        )}

        {(phase === "active" || phase === "revealed" || phase === "explained") && !hasVoted && (
          <motion.div
            key="voting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center w-full max-w-lg"
          >
            <span className="text-primary font-display font-bold uppercase tracking-widest text-sm mb-4 block">
              Мисия {currentMissionIdx + 1}: {currentMission.title}
            </span>
            <p className="text-xl md:text-2xl font-body text-foreground mb-10 leading-relaxed">
              "{currentMission.scenario}"
            </p>
            <div className="flex flex-col gap-4">
              <CyberButton variant="stop" onClick={() => submitVote("STOP")} className="py-6 text-2xl w-full">
                🛑 STOP
              </CyberButton>
              <CyberButton variant="warn" onClick={() => submitVote("ВНИМАНИЕ")} className="py-6 text-2xl w-full">
                ⚠️ ВНИМАНИЕ
              </CyberButton>
              <CyberButton variant="safe" onClick={() => submitVote("БЕЗОПАСНО")} className="py-6 text-2xl w-full">
                ✅ БЕЗОПАСНО
              </CyberButton>
            </div>
          </motion.div>
        )}

        {hasVoted && (
          <motion.div
            key="voted"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <div className="cyber-surface p-8 max-w-sm mx-auto border border-safe/20">
              <CheckCircle className="w-16 h-16 text-safe mx-auto mb-4" />
              <p className="text-xl font-display font-bold text-foreground">Отговорът е изпратен!</p>
              <p className="text-sm text-muted-foreground mt-2 font-body">Очаквай резултатите на екрана.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { motion, AnimatePresence } from "framer-motion";
import { Shield, Clock, CheckCircle, BookOpen, MessageCircle } from "lucide-react";
import CyberButton from "./CyberButton";
import PreGameWaiting from "./PreGameWaiting";
import { useGame } from "@/context/GameContext";

export default function StudentGame() {
  const { selectedTeam, teamNames, phase, currentMission, currentMissionIdx, totalMissions, hasVoted, submitVote, sessionCode } = useGame();

  const difficultyLabel = currentMission.difficulty === "discussion" ? "Дискусия" : "Бърза";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 grid-bg relative z-10">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-sm uppercase tracking-widest text-foreground">
            {teamNames[selectedTeam!] || `Отбор ${selectedTeam}`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {sessionCode && (
            <span className="text-xs text-muted-foreground font-body bg-secondary px-2 py-1 rounded">
              Код: {sessionCode}
            </span>
          )}
          <span className="text-xs text-muted-foreground font-body">
            Мисия {currentMissionIdx + 1}/{totalMissions}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === "waiting" && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PreGameWaiting />
          </motion.div>
        )}

        {phase === "active" && !hasVoted && (
          <motion.div
            key="voting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center w-full max-w-lg"
          >
            <span className="text-primary font-display font-bold uppercase tracking-widest text-sm mb-2 block">
              Мисия {currentMissionIdx + 1}: {currentMission.title}
            </span>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground font-body uppercase">
                {difficultyLabel}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground font-body">
                {currentMission.category}
              </span>
            </div>
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

        {phase === "active" && hasVoted && (
          <motion.div
            key="voted-waiting"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <div className="cyber-surface p-8 max-w-sm mx-auto border border-safe/20">
              <CheckCircle className="w-16 h-16 text-safe mx-auto mb-4" />
              <p className="text-xl font-display font-bold text-foreground">Отговорът е изпратен!</p>
              <p className="text-sm text-muted-foreground mt-2 font-body">Изчакай учителя да покаже резултатите...</p>
            </div>
          </motion.div>
        )}

        {phase === "revealed" && (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center w-full max-w-lg"
          >
            <span className="text-primary font-display font-bold uppercase tracking-widest text-sm mb-4 block">
              Мисия {currentMissionIdx + 1}: {currentMission.title}
            </span>
            <p className="text-lg font-body text-foreground/80 mb-6">
              "{currentMission.scenario}"
            </p>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="cyber-surface p-6 border border-safe/30"
            >
              <CheckCircle className="w-10 h-10 text-safe mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-body mb-1">Верен отговор:</p>
              <p className="text-3xl font-display font-black text-safe">{currentMission.answer}</p>
              <p className="text-xs text-muted-foreground font-body mt-2">
                {currentMission.difficulty === "discussion" ? "+2 точки" : "+1 точка"} за верен отговор
              </p>
            </motion.div>
          </motion.div>
        )}

        {phase === "explained" && (
          <motion.div
            key="explained"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center w-full max-w-lg"
          >
            <span className="text-primary font-display font-bold uppercase tracking-widest text-sm mb-4 block">
              Мисия {currentMissionIdx + 1}: {currentMission.title}
            </span>
            <div className="cyber-surface p-6 border border-primary/20 mb-4">
              <BookOpen className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-sm font-bold uppercase text-primary font-body mb-2">Обяснение</p>
              <p className="text-foreground/90 font-body leading-relaxed">{currentMission.explanation}</p>
            </div>
            <div className="inline-block px-4 py-2 rounded-lg bg-safe/10 border border-safe/20">
              <span className="text-sm font-bold text-safe font-body">Верен отговор: {currentMission.answer}</span>
            </div>
          </motion.div>
        )}

        {phase === "discussion" && (
          <motion.div
            key="discussion"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center w-full max-w-lg"
          >
            <span className="text-primary font-display font-bold uppercase tracking-widest text-sm mb-4 block">
              Мисия {currentMissionIdx + 1}: Дискусия
            </span>
            <div className="cyber-surface p-6 border border-warn/20">
              <MessageCircle className="w-8 h-8 text-warn mx-auto mb-3" />
              <p className="text-sm font-bold uppercase text-warn font-body mb-3">Въпрос за дискусия</p>
              <p className="text-xl font-body text-foreground leading-relaxed">
                {currentMission.discussionQuestion || "Няма въпрос за дискусия."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

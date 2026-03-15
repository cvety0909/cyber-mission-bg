import { motion } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";
import { useGame } from "@/context/GameContext";

export default function ProjectorView() {
  const { currentMission, currentMissionIdx, totalMissions, phase, votes, setView } = useGame();

  const getVoteCount = (answer: string) => votes.filter((v) => v.answer === answer).length;

  return (
    <div className="min-h-screen flex flex-col p-8 lg:p-16 grid-bg">
      <button
        onClick={() => setView("teacher-dash")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors self-start"
      >
        <ArrowLeft className="w-4 h-4" /> Обратно към панела
      </button>

      <div className="flex-grow flex flex-col items-center justify-center text-center">
        <div className="mb-4 flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <span className="text-primary font-display font-bold uppercase tracking-widest text-lg">
            Мисия {currentMissionIdx + 1} / {totalMissions}
          </span>
        </div>

        <h1 className="text-4xl lg:text-6xl font-display font-black uppercase tracking-tight mb-8 text-foreground">
          {currentMission.title}
        </h1>

        <p className="text-2xl lg:text-4xl font-body text-foreground/90 max-w-4xl leading-relaxed mb-12">
          "{currentMission.scenario}"
        </p>

        {/* Vote bars */}
        <div className="w-full max-w-2xl space-y-4">
          {(["STOP", "ВНИМАНИЕ", "БЕЗОПАСНО"] as const).map((type) => {
            const count = getVoteCount(type);
            const colorClass = type === "STOP" ? "bg-destructive" : type === "ВНИМАНИЕ" ? "bg-warn" : "bg-safe";
            const isCorrect = (phase === "revealed" || phase === "explained") && currentMission.answer === type;

            return (
              <div
                key={type}
                className={`relative h-20 rounded-2xl bg-secondary overflow-hidden transition-all ${
                  isCorrect ? "ring-2 ring-safe shadow-[0_0_20px_hsla(142,71%,45%,0.4)]" : ""
                }`}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((count / 3) * 100, 100)}%` }}
                  className={`absolute inset-0 opacity-25 ${colorClass}`}
                />
                <div className="absolute inset-0 flex justify-between items-center px-8">
                  <span className="font-display font-black uppercase tracking-wider text-xl text-foreground">{type}</span>
                  <span className="text-3xl font-display font-black text-foreground">{count}</span>
                </div>
              </div>
            );
          })}
        </div>

        {phase === "explained" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 p-6 rounded-2xl bg-primary/10 border border-primary/20 max-w-2xl"
          >
            <p className="text-lg font-body text-foreground/90">{currentMission.explanation}</p>
            <span className="inline-block mt-3 px-4 py-1.5 bg-primary/20 text-primary rounded-lg text-sm font-bold uppercase font-body">
              Верен отговор: {currentMission.answer}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

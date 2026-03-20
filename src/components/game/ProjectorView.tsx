import { motion } from "framer-motion";
import { Shield, ArrowLeft, Trophy, BookOpen, MessageCircle, CheckCircle } from "lucide-react";
import { useGame } from "@/context/GameContext";
import ScorePopup from "./ScorePopup";
import PreGameWaiting from "./PreGameWaiting";

export default function ProjectorView() {
  const { currentMission, currentMissionIdx, totalMissions, phase, currentMissionVotes, scores, prevScores, teamNames, sessionCode, setView } = useGame();

  const getVoteCount = (answer: string) => currentMissionVotes.filter((v) => v.answer === answer).length;
  const difficultyLabel = currentMission.difficulty === "discussion" ? "Дискусия" : "Бърза";

  return (
    <div className="min-h-screen flex flex-col p-8 lg:p-16 grid-bg relative z-10">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => setView("teacher-dash")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Обратно към панела
        </button>

        {/* Scores bar */}
        <div className="flex items-center gap-4">
          <Trophy className="w-5 h-5 text-warn" />
          {[1, 2, 3, 4].map(num => (
            <div key={num} className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase text-muted-foreground font-body">{teamNames[num]}</span>
              <ScorePopup score={scores[num]} prevScore={prevScores[num]} />
            </div>
          ))}
        </div>

        {sessionCode && (
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-body block">Код</span>
            <span className="text-2xl font-display font-black text-primary tracking-[0.15em]">{sessionCode}</span>
          </div>
        )}
      </div>

      <div className="flex-grow flex flex-col items-center justify-center text-center">
        <div className="mb-4 flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <span className="text-primary font-display font-bold uppercase tracking-widest text-lg">
            Мисия {currentMissionIdx + 1} / {totalMissions}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground font-body uppercase">
            {difficultyLabel}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground font-body">
            {currentMission.category}
          </span>
        </div>

        <h1 className="text-4xl lg:text-6xl font-display font-black uppercase tracking-tight mb-8 text-foreground">
          {currentMission.title}
        </h1>

        {(phase === "active" || phase === "revealed") && (
          <p className="text-2xl lg:text-4xl font-body text-foreground/90 max-w-4xl leading-relaxed mb-12">
            "{currentMission.scenario}"
          </p>
        )}

        {/* Vote bars */}
        {(phase === "active" || phase === "revealed" || phase === "explained" || phase === "discussion") && (
          <div className="w-full max-w-2xl space-y-4 mb-8">
            {(["STOP", "ВНИМАНИЕ", "БЕЗОПАСНО"] as const).map((type) => {
              const count = getVoteCount(type);
              const colorClass = type === "STOP" ? "bg-destructive" : type === "ВНИМАНИЕ" ? "bg-warn" : "bg-safe";
              const isCorrect = (phase === "revealed" || phase === "explained" || phase === "discussion") && currentMission.answer === type;

              return (
                <div
                  key={type}
                  className={`relative h-20 rounded-2xl bg-secondary overflow-hidden transition-all ${
                    isCorrect ? "ring-2 ring-safe shadow-[0_0_20px_hsla(142,71%,45%,0.4)]" : ""
                  }`}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((count / 4) * 100, 100)}%` }}
                    className={`absolute inset-0 opacity-25 ${colorClass}`}
                  />
                  <div className="absolute inset-0 flex justify-between items-center px-8">
                    <span className="font-display font-black uppercase tracking-wider text-xl text-foreground">
                      {type} {isCorrect && <CheckCircle className="w-5 h-5 text-safe inline ml-2" />}
                    </span>
                    <span className="text-3xl font-display font-black text-foreground">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {phase === "revealed" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="p-6 rounded-2xl bg-safe/10 border border-safe/20 max-w-2xl"
          >
            <p className="text-2xl font-display font-black text-safe">
              Верен отговор: {currentMission.answer}
            </p>
            <p className="text-sm text-muted-foreground font-body mt-1">
              {currentMission.difficulty === "discussion" ? "+2 точки" : "+1 точка"} за верен отговор
            </p>
          </motion.div>
        )}

        {phase === "explained" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-primary/10 border border-primary/20 max-w-2xl"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="font-display font-bold uppercase text-primary text-sm tracking-widest">Обяснение</span>
            </div>
            <p className="text-lg font-body text-foreground/90">{currentMission.explanation}</p>
            <span className="inline-block mt-3 px-4 py-1.5 bg-safe/20 text-safe rounded-lg text-sm font-bold uppercase font-body">
              Верен отговор: {currentMission.answer}
            </span>
          </motion.div>
        )}

        {phase === "discussion" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl bg-warn/10 border border-warn/20 max-w-2xl"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <MessageCircle className="w-6 h-6 text-warn" />
              <span className="font-display font-bold uppercase text-warn text-lg tracking-widest">Въпрос за дискусия</span>
            </div>
            <p className="text-2xl lg:text-3xl font-body text-foreground leading-relaxed">
              {currentMission.discussionQuestion || "Няма въпрос за дискусия."}
            </p>
          </motion.div>
        )}

        {phase === "waiting" && (
          <div className="text-center">
            <p className="text-2xl text-muted-foreground font-body">Изчакваме учителя да започне играта...</p>
          </div>
        )}
      </div>
    </div>
  );
}
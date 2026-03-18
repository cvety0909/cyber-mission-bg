import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Shield, ChevronRight, Eye, BookOpen, RotateCcw, Play, Projector, Pencil, Check, X } from "lucide-react";
import CyberButton from "./CyberButton";
import { useGame } from "@/context/GameContext";

export default function TeacherDashboard() {
  const {
    currentMission, currentMissionIdx, totalMissions,
    phase, currentMissionVotes, scores, sessionCode, teamNames,
    startGame, nextMission, revealAnswers, showExplanation,
    awardPoints, renameTeam, resetGame, setView,
  } = useGame();

  const [editingTeam, setEditingTeam] = useState<number | null>(null);
  const [teamNameInput, setTeamNameInput] = useState("");

  const getVoteCount = (answer: string) => currentMissionVotes.filter((v) => v.answer === answer).length;
  const getTeamVote = (team: number) => currentMissionVotes.find((v) => v.team === team);

  const startRename = (team: number) => {
    setEditingTeam(team);
    setTeamNameInput(teamNames[team] || `Отбор ${team}`);
  };

  const confirmRename = () => {
    if (editingTeam !== null && teamNameInput.trim()) {
      renameTeam(editingTeam, teamNameInput.trim());
    }
    setEditingTeam(null);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 gap-0">
      {/* Sidebar */}
      <div className="lg:col-span-3 bg-card p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-border">
        {/* Session Code */}
        {sessionCode && (
          <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
            <span className="text-xs font-bold uppercase text-primary tracking-widest font-body block mb-1">
              Код на сесията
            </span>
            <span className="text-4xl font-display font-black text-primary tracking-[0.2em]">
              {sessionCode}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 mb-6">
          <Trophy className="text-warn" />
          <h2 className="text-xl font-display font-black uppercase italic tracking-tighter text-foreground">Класиране</h2>
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="cyber-surface p-5">
              <div className="flex justify-between items-end mb-3">
                {editingTeam === num ? (
                  <div className="flex items-center gap-1">
                    <input
                      value={teamNameInput}
                      onChange={e => setTeamNameInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && confirmRename()}
                      className="bg-background border border-border rounded px-2 py-0.5 text-xs text-foreground font-body w-24 focus:outline-none focus:border-primary"
                      autoFocus
                    />
                    <button onClick={confirmRename} className="text-safe p-0.5"><Check className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setEditingTeam(null)} className="text-muted-foreground p-0.5"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground font-bold uppercase text-xs tracking-widest font-body">
                      {teamNames[num] || `Отбор ${num}`}
                    </span>
                    <button onClick={() => startRename(num)} className="text-muted-foreground hover:text-foreground p-0.5 transition-colors">
                      <Pencil className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
                <span className="text-3xl font-display font-black text-primary tabular-nums">{scores[num]}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => awardPoints(num, 2)}
                  className="flex-1 bg-safe/10 hover:bg-safe/20 text-safe text-[10px] py-1.5 rounded-md uppercase font-bold transition-colors font-body"
                >
                  +2 Точки
                </button>
                <button
                  onClick={() => awardPoints(num, 1)}
                  className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] py-1.5 rounded-md uppercase font-bold transition-colors font-body"
                >
                  +1 Бонус
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-2">
          <CyberButton variant="ghost" className="w-full text-xs py-3" onClick={() => setView("projector")}>
            <Projector className="w-3 h-3 mr-2 inline" /> Режим за прожектиране
          </CyberButton>
          <CyberButton variant="ghost" className="w-full text-xs py-3" onClick={resetGame}>
            <RotateCcw className="w-3 h-3 mr-2 inline" /> Нулирай играта
          </CyberButton>
        </div>
      </div>

      {/* Main */}
      <div className="lg:col-span-9 p-6 lg:p-10 flex flex-col grid-bg">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <span className="text-primary font-bold tracking-widest uppercase text-sm font-body">
              Мисия {currentMissionIdx + 1} от {totalMissions}
            </span>
            <h1 className="text-3xl lg:text-4xl font-display font-black uppercase tracking-tight text-foreground">
              {currentMission.title}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {phase === "waiting" && (
              <CyberButton onClick={startGame} className="text-sm py-3">
                <Play className="w-4 h-4 mr-2 inline" /> Старт на играта
              </CyberButton>
            )}
            {phase === "active" && (
              <CyberButton variant="ghost" onClick={revealAnswers} className="text-sm py-3">
                <Eye className="w-4 h-4 mr-2 inline" /> Покажи отговорите
              </CyberButton>
            )}
            {phase === "revealed" && (
              <CyberButton variant="ghost" onClick={showExplanation} className="text-sm py-3">
                <BookOpen className="w-4 h-4 mr-2 inline" /> Покажи обяснение
              </CyberButton>
            )}
            {(phase === "revealed" || phase === "explained") && (
              <CyberButton onClick={nextMission} className="text-sm py-3">
                Следваща <ChevronRight className="w-4 h-4 ml-1 inline" />
              </CyberButton>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-secondary rounded-full mb-8">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${((currentMissionIdx + 1) / totalMissions) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow">
          {/* Scenario */}
          <div className="cyber-surface-deep p-8 lg:p-10 relative overflow-hidden">
            <div className="absolute top-4 right-4 opacity-5">
              <Shield size={120} />
            </div>
            <p className="text-2xl lg:text-3xl leading-relaxed font-body text-foreground relative z-10">
              "{currentMission.scenario}"
            </p>

            {phase === "explained" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-5 rounded-xl bg-primary/10 border border-primary/20 relative z-10"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="font-display font-bold uppercase text-primary text-sm tracking-widest">Обяснение</span>
                </div>
                <p className="text-secondary-foreground leading-relaxed font-body">{currentMission.explanation}</p>
                <div className="mt-3 inline-block px-3 py-1 rounded-md bg-primary/20 text-primary text-xs font-bold uppercase font-body">
                  Верен отговор: {currentMission.answer}
                </div>
              </motion.div>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-col gap-4">
            <div className="cyber-surface p-6 lg:p-8">
              <h3 className="text-muted-foreground font-bold uppercase text-xs tracking-widest mb-5 font-body">
                Гласове в реално време
              </h3>
              <div className="space-y-3">
                {(["STOP", "ВНИМАНИЕ", "БЕЗОПАСНО"] as const).map((type) => {
                  const count = getVoteCount(type);
                  const colorClass = type === "STOP" ? "bg-destructive" : type === "ВНИМАНИЕ" ? "bg-warn" : "bg-safe";
                  const isCorrect = (phase === "revealed" || phase === "explained") && currentMission.answer === type;

                  return (
                    <div
                      key={type}
                      className={`relative h-14 rounded-xl bg-secondary overflow-hidden transition-all ${
                        isCorrect ? "ring-2 ring-safe shadow-[0_0_15px_hsla(142,71%,45%,0.3)]" : ""
                      }`}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((count / 4) * 100, 100)}%` }}
                        className={`absolute inset-0 opacity-20 ${colorClass}`}
                      />
                      <div className="absolute inset-0 flex justify-between items-center px-5">
                        <span className="font-display font-black uppercase tracking-wider text-sm text-foreground">{type}</span>
                        <span className="text-xl font-display font-black text-foreground">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="cyber-surface p-6 lg:p-8 flex-grow">
              <h3 className="text-muted-foreground font-bold uppercase text-xs tracking-widest mb-4 font-body">
                Статус на отборите
              </h3>
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((num) => {
                  const voted = getTeamVote(num);
                  return (
                    <div
                      key={num}
                      className={`flex-1 p-4 rounded-xl transition-all ${
                        voted
                          ? "bg-primary/10 ring-1 ring-primary/30 text-primary"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      <div className="text-[10px] font-bold uppercase mb-1 font-body">{teamNames[num] || `Отбор ${num}`}</div>
                      <div className="text-xs font-display font-black">{voted ? "ГОТОВ" : "МИСЛИ..."}</div>
                      {voted && (phase === "revealed" || phase === "explained") && (
                        <div className="text-[10px] mt-1 font-body opacity-80">{voted.answer}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

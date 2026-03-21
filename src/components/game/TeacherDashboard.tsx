import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Shield, ChevronRight, Eye, BookOpen, MessageCircle, RotateCcw, Play, Projector, Pencil, Check, X, Settings2, Film, Volume2, VolumeX } from "lucide-react";
import CyberButton from "./CyberButton";
import ScorePopup from "./ScorePopup";
import { useGame } from "@/context/GameContext";

export default function TeacherDashboard() {
  const {
    currentMission, currentMissionIdx, totalMissions,
    phase, currentMissionVotes, scores, prevScores, sessionCode, teamNames,
    startGame, nextMission, revealAnswers, showExplanation, showDiscussion,
    awardPoints, renameTeam, resetGame, setView,
    teacherSettings, updateTeacherSettings, connectedTeams,
  } = useGame();

  const [editingTeam, setEditingTeam] = useState<number | null>(null);
  const [teamNameInput, setTeamNameInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);

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

  const difficultyLabel = currentMission.difficulty === "discussion" ? "Дискусия" : "Бърза";
  const pointsLabel = currentMission.difficulty === "discussion" ? "2 т." : "1 т.";

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 gap-0 relative z-10">
      {/* Sidebar */}
      <div className="lg:col-span-3 bg-card p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-border">
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
                <ScorePopup score={scores[num]} prevScore={prevScores[num]} />
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
          {/* Settings toggle */}
          <CyberButton variant="ghost" className="w-full text-xs py-3" onClick={() => setShowSettings(!showSettings)}>
            <Settings2 className="w-3 h-3 mr-2 inline" /> Настройки
          </CyberButton>

          {showSettings && (
            <div className="cyber-surface p-4 space-y-3 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-2 text-muted-foreground font-body">
                  <Film className="w-3.5 h-3.5" /> Кинематични сцени
                </span>
                <button
                  onClick={() => updateTeacherSettings({ cinematicsEnabled: !teacherSettings.cinematicsEnabled })}
                  className={`w-9 h-5 rounded-full transition-colors ${teacherSettings.cinematicsEnabled ? "bg-primary" : "bg-secondary"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-foreground transition-transform mx-0.5 ${teacherSettings.cinematicsEnabled ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-2 text-muted-foreground font-body">
                  {teacherSettings.musicEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />} Фонова музика
                </span>
                <button
                  onClick={() => updateTeacherSettings({ musicEnabled: !teacherSettings.musicEnabled })}
                  className={`w-9 h-5 rounded-full transition-colors ${teacherSettings.musicEnabled ? "bg-primary" : "bg-secondary"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-foreground transition-transform mx-0.5 ${teacherSettings.musicEnabled ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </label>
            </div>
          )}

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
        {phase === "waiting" ? (
          /* Pre-game preparation screen */
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center max-w-lg px-6">
              <motion.div
                className="mx-auto mb-8 w-28 h-28 rounded-full flex items-center justify-center"
                style={{
                  background: "radial-gradient(circle, hsla(var(--primary) / 0.12) 0%, transparent 70%)",
                }}
                animate={{ scale: [1, 1.06, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Shield className="w-14 h-14 text-primary" />
              </motion.div>

              <motion.h1
                className="text-3xl lg:text-4xl font-display font-black uppercase tracking-tight text-foreground mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Подгответе се за мисията
              </motion.h1>

              <motion.p
                className="text-lg text-muted-foreground font-body mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Учителят ще стартира играта след малко.
              </motion.p>

              <CyberButton onClick={startGame} className="text-sm py-3">
                <Play className="w-4 h-4 mr-2 inline" /> Старт на играта
              </CyberButton>
            </div>
          </div>
        ) : (
          <>
            {/* Top bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-primary font-bold tracking-widest uppercase text-sm font-body">
                    Мисия {currentMissionIdx + 1} от {totalMissions}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground font-body uppercase">
                    {difficultyLabel} ({pointsLabel})
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground font-body">
                    {currentMission.category}
                  </span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-display font-black uppercase tracking-tight text-foreground">
                  {currentMission.title}
                </h1>
              </div>
              <div className="flex flex-wrap gap-2">
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
                {phase === "explained" && currentMission.discussionQuestion && (
                  <CyberButton variant="ghost" onClick={showDiscussion} className="text-sm py-3">
                    <MessageCircle className="w-4 h-4 mr-2 inline" /> Покажи дискусия
                  </CyberButton>
                )}
                {(phase === "revealed" || phase === "explained" || phase === "discussion") && (
                  <CyberButton onClick={nextMission} className="text-sm py-3">
                    Следваща <ChevronRight className="w-4 h-4 ml-1 inline" />
                  </CyberButton>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 bg-secondary rounded-full mb-8">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={false}
                animate={{ width: `${((currentMissionIdx + 1) / totalMissions) * 100}%` }}
                transition={{ duration: 0.5 }}
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

                {(phase === "revealed") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-5 rounded-xl bg-safe/10 border border-safe/20 relative z-10"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Check className="w-4 h-4 text-safe" />
                      <span className="font-display font-bold uppercase text-safe text-sm tracking-widest">Верен отговор</span>
                    </div>
                    <p className="text-2xl font-display font-black text-safe">{currentMission.answer === "STOP" ? "ОПАСНО" : currentMission.answer}</p>
                  </motion.div>
                )}

                {phase === "explained" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-5 rounded-xl bg-primary/10 border border-primary/20 relative z-10"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span className="font-display font-bold uppercase text-primary text-sm tracking-widest">Обяснение</span>
                    </div>
                    <p className="text-secondary-foreground leading-relaxed font-body">{currentMission.explanation}</p>
                    <div className="mt-3 inline-block px-3 py-1 rounded-md bg-safe/20 text-safe text-xs font-bold uppercase font-body">
                      Верен отговор: {currentMission.answer === "STOP" ? "ОПАСНО" : currentMission.answer}
                    </div>
                  </motion.div>
                )}

                {phase === "discussion" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-5 rounded-xl bg-warn/10 border border-warn/20 relative z-10"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-4 h-4 text-warn" />
                      <span className="font-display font-bold uppercase text-warn text-sm tracking-widest">Въпрос за дискусия</span>
                    </div>
                    <p className="text-foreground leading-relaxed font-body text-lg">{currentMission.discussionQuestion || "Няма въпрос за дискусия."}</p>
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
                      const displayLabel = type === "STOP" ? "ОПАСНО" : type;
                      const isCorrect = (phase === "revealed" || phase === "explained" || phase === "discussion") && currentMission.answer === type;

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
                            <span className="font-display font-black uppercase tracking-wider text-sm text-foreground">{displayLabel}</span>
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
                      const isConnected = connectedTeams.includes(num);
                      const statusLabel = voted ? "Отговори" : isConnected ? "Свързан" : "Очаква връзка";
                      const statusColor = voted ? "text-safe" : isConnected ? "text-primary" : "text-muted-foreground";
                      return (
                        <motion.div
                          key={num}
                          animate={voted ? { boxShadow: "0 0 12px hsla(199,89%,48%,0.2)" } : { boxShadow: "none" }}
                          className={`flex-1 p-4 rounded-xl transition-all ${
                            voted
                              ? "bg-primary/10 ring-1 ring-primary/30 text-primary"
                              : isConnected
                              ? "bg-primary/5 ring-1 ring-primary/10 text-foreground"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          <div className="text-[10px] font-bold uppercase mb-1 font-body">{teamNames[num] || `Отбор ${num}`}</div>
                          <div className={`text-[10px] font-bold uppercase font-body ${statusColor}`}>{statusLabel}</div>
                          {voted && (phase === "revealed" || phase === "explained" || phase === "discussion") && (
                            <div className={`text-[10px] mt-1 font-body ${voted.answer === currentMission.answer ? "text-safe" : "text-destructive"}`}>
                              {voted.answer === "STOP" ? "ОПАСНО" : voted.answer} {voted.answer === currentMission.answer ? "✓" : "✗"}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

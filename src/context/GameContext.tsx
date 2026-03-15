import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { MISSIONS, type AnswerType } from "@/data/missions";

export type UserRole = "student" | "teacher" | null;
export type GameView = "landing" | "team-select" | "student-game" | "teacher-dash" | "final" | "projector";
export type GamePhase = "waiting" | "active" | "revealed" | "explained";

interface Vote {
  team: number;
  answer: AnswerType;
}

interface GameState {
  view: GameView;
  role: UserRole;
  selectedTeam: number | null;
  currentMissionIdx: number;
  phase: GamePhase;
  votes: Vote[];
  scores: Record<number, number>;
  hasVoted: boolean;
}

interface GameContextType extends GameState {
  setView: (v: GameView) => void;
  setRole: (r: UserRole) => void;
  selectTeam: (t: number) => void;
  submitVote: (answer: AnswerType) => void;
  startGame: () => void;
  nextMission: () => void;
  revealAnswers: () => void;
  showExplanation: () => void;
  awardPoints: (team: number, pts: number) => void;
  resetGame: () => void;
  currentMission: typeof MISSIONS[0];
  totalMissions: number;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>({
    view: "landing",
    role: null,
    selectedTeam: null,
    currentMissionIdx: 0,
    phase: "waiting",
    votes: [],
    scores: { 1: 0, 2: 0, 3: 0 },
    hasVoted: false,
  });

  const setView = useCallback((view: GameView) => setState((s) => ({ ...s, view })), []);
  const setRole = useCallback((role: UserRole) => setState((s) => ({ ...s, role })), []);

  const selectTeam = useCallback((team: number) => {
    setState((s) => ({ ...s, selectedTeam: team, view: "student-game" }));
  }, []);

  const submitVote = useCallback((answer: AnswerType) => {
    setState((s) => {
      if (s.hasVoted) return s;
      return { ...s, votes: [...s.votes, { team: s.selectedTeam!, answer }], hasVoted: true };
    });
  }, []);

  const startGame = useCallback(() => {
    setState((s) => ({ ...s, phase: "active", currentMissionIdx: 0, votes: [], hasVoted: false }));
  }, []);

  const nextMission = useCallback(() => {
    setState((s) => {
      if (s.currentMissionIdx >= MISSIONS.length - 1) return { ...s, view: "final" };
      return { ...s, currentMissionIdx: s.currentMissionIdx + 1, phase: "active", votes: [], hasVoted: false };
    });
  }, []);

  const revealAnswers = useCallback(() => setState((s) => ({ ...s, phase: "revealed" })), []);
  const showExplanation = useCallback(() => setState((s) => ({ ...s, phase: "explained" })), []);

  const awardPoints = useCallback((team: number, pts: number) => {
    setState((s) => ({ ...s, scores: { ...s.scores, [team]: s.scores[team] + pts } }));
  }, []);

  const resetGame = useCallback(() => {
    setState({
      view: "landing",
      role: null,
      selectedTeam: null,
      currentMissionIdx: 0,
      phase: "waiting",
      votes: [],
      scores: { 1: 0, 2: 0, 3: 0 },
      hasVoted: false,
    });
  }, []);

  return (
    <GameContext.Provider
      value={{
        ...state,
        setView,
        setRole,
        selectTeam,
        submitVote,
        startGame,
        nextMission,
        revealAnswers,
        showExplanation,
        awardPoints,
        resetGame,
        currentMission: MISSIONS[state.currentMissionIdx],
        totalMissions: MISSIONS.length,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}

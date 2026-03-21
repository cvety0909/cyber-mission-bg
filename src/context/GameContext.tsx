import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo, ReactNode } from "react";
import { MISSIONS as DEFAULT_MISSIONS, type AnswerType, type Mission } from "@/data/missions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type UserRole = "student" | "teacher" | null;
export type GameView = "landing" | "join-session" | "team-select" | "mission-manager" | "student-game" | "teacher-dash" | "final" | "projector";
export type GamePhase = "waiting" | "active" | "revealed" | "explained" | "discussion" | "final";

interface Vote {
  team: number;
  answer: AnswerType;
  mission_idx: number;
}

interface TeacherSettings {
  cinematicsEnabled: boolean;
  musicEnabled: boolean;
}

interface GameState {
  view: GameView;
  role: UserRole;
  sessionId: string | null;
  sessionCode: string | null;
  teacherToken: string | null;
  selectedTeam: number | null;
  currentMissionIdx: number;
  phase: GamePhase;
  votes: Vote[];
  scores: Record<number, number>;
  prevScores: Record<number, number>;
  teamNames: Record<number, string>;
  missions: Mission[];
  teacherSettings: TeacherSettings;
  showCinematic: number | null; // waveIndex 0-4 or null
  showCountdown: boolean;
  connectedTeams: number[];
}

interface GameContextType extends GameState {
  hasVoted: boolean;
  currentMission: Mission;
  totalMissions: number;
  currentMissionVotes: Vote[];
  isTeacherTransitioning: boolean;
  setView: (v: GameView) => void;
  setRole: (r: UserRole) => void;
  selectTeam: (t: number) => void;
  createSession: (missions: Mission[]) => Promise<void>;
  joinSession: (code: string) => Promise<boolean>;
  submitVote: (answer: AnswerType) => void;
  startGame: () => void;
  nextMission: () => void;
  revealAnswers: () => void;
  showExplanation: () => void;
  showDiscussion: () => void;
  awardPoints: (team: number, pts: number) => void;
  renameTeam: (team: number, name: string) => void;
  resetGame: () => void;
  updateTeacherSettings: (s: Partial<TeacherSettings>) => void;
  dismissCinematic: () => void;
  dismissCountdown: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

function generateSessionCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

const FALLBACK_MISSION: Mission = {
  id: 0,
  title: "Мисия не е намерена",
  scenario: "Няма налична мисия. Моля, свържете се с учителя.",
  answer: "STOP",
  explanation: "Няма налично обяснение.",
  discussionQuestion: "",
  difficulty: "quick",
  category: "Неизвестна",
};

const INITIAL_SCORES = { 1: 0, 2: 0, 3: 0, 4: 0 };
const INITIAL_TEAM_NAMES = { 1: "Отбор 1", 2: "Отбор 2", 3: "Отбор 3", 4: "Отбор 4" };

const INITIAL_STATE: GameState = {
  view: "landing",
  role: null,
  sessionId: null,
  sessionCode: null,
  teacherToken: null,
  selectedTeam: null,
  currentMissionIdx: 0,
  phase: "waiting",
  votes: [],
  scores: { ...INITIAL_SCORES },
  prevScores: { ...INITIAL_SCORES },
  teamNames: { ...INITIAL_TEAM_NAMES },
  missions: DEFAULT_MISSIONS,
  teacherSettings: { cinematicsEnabled: true, musicEnabled: false },
  showCinematic: null,
  showCountdown: false,
  connectedTeams: [],
};

// Which cinematic to show at which mission boundary
function getCinematicWave(missionIdx: number): number | null {
  if (missionIdx === 5) return 1;
  if (missionIdx === 10) return 2;
  if (missionIdx === 15) return 3;
  return null;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    sessionIdRef.current = state.sessionId;
  }, [state.sessionId]);

  const currentMissionVotes = useMemo(
    () => state.votes.filter(v => v.mission_idx === state.currentMissionIdx),
    [state.votes, state.currentMissionIdx]
  );
  const hasVoted = useMemo(
    () => state.selectedTeam !== null && currentMissionVotes.some(v => v.team === state.selectedTeam),
    [state.selectedTeam, currentMissionVotes]
  );
  const isTeacherTransitioning = state.showCinematic !== null || state.showCountdown;

  const getSafeMission = (missions: Mission[], idx: number): Mission => {
    if (!missions || missions.length === 0) return FALLBACK_MISSION;
    const m = missions[idx];
    if (!m || !m.title || !m.scenario) return FALLBACK_MISSION;
    return m;
  };

  const currentMission = getSafeMission(state.missions, state.currentMissionIdx);
  const totalMissions = state.missions?.length || 0;

  // Fetch all votes for the current session
  const fetchVotes = useCallback(async (sessionId: string) => {
    const { data } = await (supabase as any).from('votes').select('*').eq('session_id', sessionId);
    if (data) {
      setState(s => ({
        ...s,
        votes: data.map((v: any) => ({ team: v.team, answer: v.answer as AnswerType, mission_idx: v.mission_idx })),
      }));
    }
  }, []);

  // Fetch latest session state
  const fetchSession = useCallback(async (sessionId: string) => {
    const { data } = await (supabase as any).from('sessions').select('*').eq('id', sessionId).single();
    if (data) {
      setState(s => {
        const newPhase = data.phase as GamePhase;
        let newView = s.view;
        if (newPhase === 'final' && s.role === 'student') {
          newView = 'final';
        }
        return {
          ...s,
          phase: newPhase,
          currentMissionIdx: data.current_mission_idx,
          prevScores: { ...s.scores },
          scores: data.scores,
          teamNames: data.team_names,
          missions: data.missions || s.missions,
          connectedTeams: Array.isArray(data.connected_teams) ? data.connected_teams : s.connectedTeams,
          view: newView,
        };
      });
    }
  }, []);

  // Realtime subscription
  useEffect(() => {
    if (!state.sessionId) return;
    const sid = state.sessionId;

    // Initial hydration
    fetchVotes(sid);
    fetchSession(sid);

    const channel = supabase
      .channel(`game-${sid}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'sessions',
        filter: `id=eq.${sid}`,
      }, (payload: any) => {
        const d = payload.new;
        setState(s => {
          const newPhase = d.phase as GamePhase;
          let newView = s.view;
          if (newPhase === 'final' && s.role === 'student') {
            newView = 'final';
          }
          return {
            ...s,
            phase: newPhase,
            currentMissionIdx: d.current_mission_idx,
            prevScores: { ...s.scores },
            scores: d.scores,
            teamNames: d.team_names,
            missions: d.missions || s.missions,
            view: newView,
          };
        });
        // Re-fetch votes when mission changes to ensure we have all votes
        fetchVotes(sid);
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'votes',
        filter: `session_id=eq.${sid}`,
      }, (payload: any) => {
        const v = payload.new;
        setState(s => {
          const exists = s.votes.some(
            ev => ev.team === v.team && ev.mission_idx === v.mission_idx
          );
          if (exists) return s;
          return {
            ...s,
            votes: [...s.votes, { team: v.team, answer: v.answer as AnswerType, mission_idx: v.mission_idx }],
          };
        });
      })
      .subscribe();

    // Polling fallback every 5s for school network reliability
    const pollInterval = setInterval(() => {
      fetchVotes(sid);
      fetchSession(sid);
    }, 5000);

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [state.sessionId, fetchVotes, fetchSession]);

  const setView = useCallback((view: GameView) => setState(s => ({ ...s, view })), []);
  const setRole = useCallback((role: UserRole) => setState(s => ({ ...s, role })), []);

  const selectTeam = useCallback(async (team: number) => {
    setState(s => ({ ...s, selectedTeam: team, view: "student-game" }));
    // Persist team connection to DB
    const sid = sessionIdRef.current;
    if (sid) {
      const { data } = await (supabase as any).from('sessions').select('connected_teams').eq('id', sid).single();
      const current: number[] = Array.isArray(data?.connected_teams) ? data.connected_teams : [];
      if (!current.includes(team)) {
        await (supabase as any).from('sessions').update({ connected_teams: [...current, team] }).eq('id', sid);
      }
    }
  }, []);

  const updateSession = useCallback(async (updates: Record<string, any>) => {
    const sid = sessionIdRef.current;
    if (!sid) return;
    await (supabase as any).from('sessions').update(updates).eq('id', sid);
  }, []);

  const createSession = useCallback(async (missions: Mission[]) => {
    const code = generateSessionCode();
    const teacherToken = crypto.randomUUID();

    const { data, error } = await (supabase as any).from('sessions').insert({
      code,
      teacher_token: teacherToken,
      missions,
      phase: 'waiting',
      current_mission_idx: 0,
      scores: { ...INITIAL_SCORES },
      team_names: { ...INITIAL_TEAM_NAMES },
    }).select().single();

    if (error || !data) {
      toast.error("Грешка при създаване на сесия");
      console.error(error);
      return;
    }

    localStorage.setItem('teacherToken', teacherToken);
    setState(s => ({
      ...s,
      sessionId: data.id,
      sessionCode: code,
      teacherToken,
      missions,
      view: 'teacher-dash',
      role: 'teacher',
      phase: 'waiting',
      currentMissionIdx: 0,
      scores: { ...INITIAL_SCORES },
      prevScores: { ...INITIAL_SCORES },
      teamNames: { ...INITIAL_TEAM_NAMES },
      votes: [],
    }));
  }, []);

  const joinSession = useCallback(async (code: string): Promise<boolean> => {
    const { data, error } = await (supabase as any)
      .from('sessions')
      .select('*')
      .eq('code', code.trim())
      .eq('status', 'active')
      .single();

    if (error || !data) {
      toast.error("Невалиден код на сесия");
      return false;
    }

    setState(s => ({
      ...s,
      sessionId: data.id,
      sessionCode: code.trim(),
      phase: data.phase as GamePhase,
      currentMissionIdx: data.current_mission_idx,
      scores: data.scores,
      prevScores: data.scores,
      teamNames: data.team_names,
      missions: data.missions || DEFAULT_MISSIONS,
      view: 'team-select',
      role: 'student',
    }));

    return true;
  }, []);

  const submitVote = useCallback(async (answer: AnswerType) => {
    const sid = sessionIdRef.current;
    if (!sid) return;

    const team = state.selectedTeam;
    const missionIdx = state.currentMissionIdx;
    if (team === null) return;

    // Optimistic local update
    const alreadyVoted = state.votes.some(v => v.mission_idx === missionIdx && v.team === team);
    if (alreadyVoted) return;

    const newVote: Vote = { team, answer, mission_idx: missionIdx };
    setState(s => ({ ...s, votes: [...s.votes, newVote] }));

    const { error } = await (supabase as any).from('votes').insert({
      session_id: sid,
      mission_idx: missionIdx,
      team,
      answer,
    });

    if (error) {
      if (error.code === '23505') {
        toast.error("Вашият отбор вече е гласувал");
      } else {
        toast.error("Грешка при гласуване");
        console.error(error);
      }
    }
  }, [state.selectedTeam, state.currentMissionIdx, state.votes]);

  const startGame = useCallback(() => {
    setState(s => {
      const base = { ...s, currentMissionIdx: 0, votes: [] };
      if (s.teacherSettings.cinematicsEnabled) {
        // Keep DB phase 'waiting' during cinematic — students stay on waiting screen
        return { ...base, phase: 'active' as GamePhase, showCinematic: 0 };
      }
      // No cinematic → show countdown, still keep DB waiting until countdown ends
      return { ...base, phase: 'active' as GamePhase, showCountdown: true };
    });
  }, [updateSession]);

  const nextMission = useCallback(() => {
    setState(s => {
      const nextIdx = s.currentMissionIdx + 1;
      if (nextIdx >= s.missions.length) {
        updateSession({ phase: 'final' });
        return { ...s, phase: 'final' as GamePhase, view: 'final' as GameView };
      }

      // Check for cinematic at wave boundary
      const cinematicWave = getCinematicWave(nextIdx);
      const shouldShowCinematic = cinematicWave !== null && s.teacherSettings.cinematicsEnabled;

      if (shouldShowCinematic) {
        // Don't update DB yet — wait for cinematic+countdown to finish
        return {
          ...s,
          phase: 'active' as GamePhase,
          currentMissionIdx: nextIdx,
          showCinematic: cinematicWave,
          showCountdown: false,
        };
      }

      // No cinematic — update DB immediately
      updateSession({ phase: 'active', current_mission_idx: nextIdx });
      return {
        ...s,
        phase: 'active' as GamePhase,
        currentMissionIdx: nextIdx,
        showCinematic: null,
        showCountdown: false,
      };
    });
  }, [updateSession]);

  const revealAnswers = useCallback(() => {
    setState(s => {
      const mission = getSafeMission(s.missions, s.currentMissionIdx);
      const missionVotes = s.votes.filter(v => v.mission_idx === s.currentMissionIdx);
      const points = mission.difficulty === "discussion" ? 2 : 1;
      const prevScores = { ...s.scores };
      const newScores = { ...s.scores };

      missionVotes.forEach(v => {
        if (v.answer === mission.answer) {
          newScores[v.team] = (newScores[v.team] || 0) + points;
        }
      });

      updateSession({ phase: 'revealed', scores: newScores });
      return { ...s, phase: 'revealed' as GamePhase, prevScores, scores: newScores };
    });
  }, [updateSession]);

  const showExplanation = useCallback(() => {
    updateSession({ phase: 'explained' });
    setState(s => ({ ...s, phase: 'explained' as GamePhase }));
  }, [updateSession]);

  const showDiscussion = useCallback(() => {
    updateSession({ phase: 'discussion' });
    setState(s => ({ ...s, phase: 'discussion' as GamePhase }));
  }, [updateSession]);

  const awardPoints = useCallback((team: number, pts: number) => {
    setState(s => {
      const prevScores = { ...s.scores };
      const newScores = { ...s.scores, [team]: (s.scores[team] || 0) + pts };
      updateSession({ scores: newScores });
      return { ...s, prevScores, scores: newScores };
    });
  }, [updateSession]);

  const renameTeam = useCallback((team: number, name: string) => {
    setState(s => {
      const newNames = { ...s.teamNames, [team]: name };
      updateSession({ team_names: newNames });
      return { ...s, teamNames: newNames };
    });
  }, [updateSession]);

  const resetGame = useCallback(() => {
    setState({ ...INITIAL_STATE });
  }, []);

  const updateTeacherSettings = useCallback((updates: Partial<TeacherSettings>) => {
    setState(s => ({
      ...s,
      teacherSettings: { ...s.teacherSettings, ...updates },
    }));
  }, []);

  const dismissCinematic = useCallback(() => {
    // After cinematic ends, show countdown (except for final cinematic wave 4)
    setState(s => {
      if (s.showCinematic === 4) {
        return { ...s, showCinematic: null };
      }
      return { ...s, showCinematic: null, showCountdown: true };
    });
  }, []);

  const dismissCountdown = useCallback(() => {
    // Now actually set DB phase to 'active' so students see the mission
    updateSession({ phase: 'active', current_mission_idx: state.currentMissionIdx });
    setState(s => ({ ...s, showCountdown: false }));
  }, [updateSession, state.currentMissionIdx]);

  // Final cinematic after last mission
  const handleFinalView = useCallback(() => {
    setState(s => {
      if (s.phase === 'final' && s.view !== 'final') {
        if (s.teacherSettings.cinematicsEnabled) {
          return { ...s, showCinematic: 4, view: 'final' as GameView };
        }
        return { ...s, view: 'final' as GameView };
      }
      return s;
    });
  }, []);

  useEffect(() => {
    if (state.phase === 'final') handleFinalView();
  }, [state.phase, handleFinalView]);

  return (
    <GameContext.Provider
      value={{
        ...state,
        hasVoted,
        currentMission,
        totalMissions,
        currentMissionVotes,
        isTeacherTransitioning,
        setView,
        setRole,
        selectTeam,
        createSession,
        joinSession,
        submitVote,
        startGame,
        nextMission,
        revealAnswers,
        showExplanation,
        showDiscussion,
        awardPoints,
        renameTeam,
        resetGame,
        updateTeacherSettings,
        dismissCinematic,
        dismissCountdown,
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

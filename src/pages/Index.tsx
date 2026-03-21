import React from "react";
import { GameProvider, useGame } from "@/context/GameContext";
import { AnimatePresence } from "framer-motion";
import LandingScreen from "@/components/game/LandingScreen";
import JoinSession from "@/components/game/JoinSession";
import TeamSelect from "@/components/game/TeamSelect";
import MissionManager from "@/components/game/MissionManager";
import StudentGame from "@/components/game/StudentGame";
import TeacherDashboard from "@/components/game/TeacherDashboard";
import ProjectorView from "@/components/game/ProjectorView";
import FinalScreen from "@/components/game/FinalScreen";
import CinematicScene from "@/components/game/CinematicScene";
import CountdownScreen from "@/components/game/CountdownScreen";
import WaveBackground from "@/components/game/WaveBackground";

const CINEMATIC_LINES: Record<number, [string, string]> = {
  0: [
    "Дигиталният свят е под заплаха…",
    "Вие сте киберзащитниците на училищната мрежа.",
  ],
  1: [
    "Първата атака е спряна.",
    "Училищната мрежа е защитена.",
  ],
  2: [
    "Опит за пробив в личните данни.",
    "Продължете защитата.",
  ],
  3: [
    "Дигиталният град е под атака.",
    "Вашият екип е последната защита.",
  ],
  4: [
    "Системата е стабилизирана.",
    "Дигиталният свят е спасен.",
  ],
};

class ViewErrorBoundary extends React.Component<
  { fallbackView: string; setView: (v: any) => void; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.error("View render error:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center grid-bg relative z-10">
          <div className="text-center cyber-surface p-8 max-w-md">
            <p className="text-xl font-display font-bold text-foreground mb-4">Възникна грешка при зареждане</p>
            <p className="text-sm text-muted-foreground font-body mb-6">Моля, върнете се обратно.</p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                this.props.setView(this.props.fallbackView as any);
              }}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-display font-bold uppercase text-sm"
            >
              Назад към панела
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function GameRouter() {
  const { view, showCinematic, showCountdown, dismissCinematic, dismissCountdown, currentMissionIdx, phase, setView } = useGame();

  const isOverlayActive = showCinematic !== null || showCountdown;
  const showWaveBg = phase !== "waiting" && view !== "landing" && view !== "join-session" && view !== "team-select" && view !== "mission-manager";

  const getFallbackView = () => {
    if (view === "projector") return "teacher-dash";
    if (view === "student-game") return "landing";
    return "landing";
  };

  return (
    <>
      {showWaveBg && <WaveBackground missionIdx={currentMissionIdx} />}

      <AnimatePresence>
        {showCinematic !== null && CINEMATIC_LINES[showCinematic] && (
          <CinematicScene
            key={`cine-${showCinematic}`}
            lines={CINEMATIC_LINES[showCinematic]}
            waveIndex={showCinematic}
            onComplete={dismissCinematic}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCountdown && showCinematic === null && (
          <CountdownScreen key="countdown" onComplete={dismissCountdown} />
        )}
      </AnimatePresence>

      {!isOverlayActive && (
        <ViewErrorBoundary fallbackView={getFallbackView()} setView={setView}>
          {(() => {
            switch (view) {
              case "landing": return <LandingScreen />;
              case "join-session": return <JoinSession />;
              case "team-select": return <TeamSelect />;
              case "mission-manager": return <MissionManager />;
              case "student-game": return <StudentGame />;
              case "teacher-dash": return <TeacherDashboard />;
              case "projector": return <ProjectorView />;
              case "final": return <FinalScreen />;
              default: return <LandingScreen />;
            }
          })()}
        </ViewErrorBoundary>
      )}
    </>
  );
}

export default function Index() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  );
}

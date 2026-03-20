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

function GameRouter() {
  const { view, showCinematic, showCountdown, dismissCinematic, dismissCountdown, currentMissionIdx, phase } = useGame();

  const isOverlayActive = showCinematic !== null || showCountdown;
  const showWaveBg = phase !== "waiting" && view !== "landing" && view !== "join-session" && view !== "team-select" && view !== "mission-manager";

  return (
    <>
      {showWaveBg && <WaveBackground missionIdx={currentMissionIdx} />}

      {/* Cinematic overlay */}
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

      {/* Countdown overlay */}
      <AnimatePresence>
        {showCountdown && showCinematic === null && (
          <CountdownScreen key="countdown" onComplete={dismissCountdown} />
        )}
      </AnimatePresence>

      {/* Main view — hidden while cinematic or countdown plays */}
      {!isOverlayActive && (() => {
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

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
import WaveBackground from "@/components/game/WaveBackground";

const CINEMATIC_LINES: Record<number, [string, string]> = {
  0: [
    "Системите на училището показват необичайна активност...",
    "Нужни са киберзащитници. Вашата мисия започва.",
  ],
  1: [
    "Училищната мрежа е временно стабилизирана.",
    "Но атаките се разпространяват извън нея.",
  ],
  2: [
    "Личните данни са основна цел на киберзаплахите.",
    "Вашите решения защитават дигиталната идентичност.",
  ],
  3: [
    "Заплахата вече засяга цели дигитални системи.",
    "Киберзащитници, подгответе се за финалната битка.",
  ],
  4: [
    "Благодарение на вашите действия системите са защитени.",
    "Дигиталният свят е по-безопасен днес.",
  ],
};

function GameRouter() {
  const { view, showCinematic, dismissCinematic, currentMissionIdx, phase } = useGame();

  const showWaveBg = phase !== "waiting" && view !== "landing" && view !== "join-session" && view !== "team-select" && view !== "mission-manager";

  return (
    <>
      {/* Wave background on active game views */}
      {showWaveBg && <WaveBackground missionIdx={currentMissionIdx} />}

      {/* Cinematic overlay */}
      <AnimatePresence>
        {showCinematic !== null && CINEMATIC_LINES[showCinematic] && (
          <CinematicScene
            key={showCinematic}
            lines={CINEMATIC_LINES[showCinematic]}
            waveIndex={showCinematic}
            onComplete={dismissCinematic}
          />
        )}
      </AnimatePresence>

      {/* Main view */}
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

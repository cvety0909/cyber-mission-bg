import { GameProvider, useGame } from "@/context/GameContext";
import LandingScreen from "@/components/game/LandingScreen";
import TeamSelect from "@/components/game/TeamSelect";
import StudentGame from "@/components/game/StudentGame";
import TeacherDashboard from "@/components/game/TeacherDashboard";
import ProjectorView from "@/components/game/ProjectorView";
import FinalScreen from "@/components/game/FinalScreen";

function GameRouter() {
  const { view } = useGame();

  switch (view) {
    case "landing": return <LandingScreen />;
    case "team-select": return <TeamSelect />;
    case "student-game": return <StudentGame />;
    case "teacher-dash": return <TeacherDashboard />;
    case "projector": return <ProjectorView />;
    case "final": return <FinalScreen />;
    default: return <LandingScreen />;
  }
}

export default function Index() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  );
}

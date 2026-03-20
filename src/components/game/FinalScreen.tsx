import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import Confetti from "react-confetti";
import { useEffect, useState } from "react";
import CyberButton from "./CyberButton";
import { useGame } from "@/context/GameContext";

export default function FinalScreen() {
  const { scores, teamNames, resetGame } = useGame();
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const handle = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  const sortedTeams = ([1, 2, 3, 4] as number[]).sort((a, b) => scores[b] - scores[a]);

  const podiumData = [
    { team: sortedTeams[1], place: "2 място", height: "h-32 md:h-40", width: "w-24 md:w-28", bg: "bg-secondary", textColor: "text-muted-foreground", delay: 0.5 },
    { team: sortedTeams[0], place: "1 място", height: "h-44 md:h-56", width: "w-28 md:w-36", bg: "bg-primary", textColor: "text-warn", delay: 0.3 },
    { team: sortedTeams[2], place: "3 място", height: "h-24 md:h-32", width: "w-24 md:w-28", bg: "bg-card", textColor: "text-muted-foreground", delay: 0.7 },
    { team: sortedTeams[3], place: "4 място", height: "h-16 md:h-24", width: "w-24 md:w-28", bg: "bg-card", textColor: "text-muted-foreground", delay: 0.9 },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 grid-bg relative z-10">
      <Confetti width={windowSize.w} height={windowSize.h} colors={["#0ea5e9", "#10b981", "#f59e0b", "#a855f7"]} recycle={false} numberOfPieces={300} />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: 2, ease: "easeInOut" }}
        >
          <Trophy className="w-24 md:w-32 h-24 md:h-32 text-warn mx-auto mb-6 drop-shadow-[0_0_30px_hsla(45,93%,47%,0.5)]" />
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-display font-black uppercase italic mb-12 tracking-tighter text-foreground">
          Мисията Изпълнена!
        </h1>

        <div className="flex items-end justify-center gap-3 md:gap-4 mb-12">
          {podiumData.map(({ team, place, height, width, bg, textColor, delay }, i) => (
            <motion.div
              key={place}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay, type: "spring", stiffness: 150, damping: 15 }}
              className="flex flex-col items-center"
            >
              <div className={`${textColor} font-display font-bold mb-2 text-sm md:text-base`}>{place}</div>
              <div className={`${bg} ${width} ${height} rounded-t-3xl flex flex-col items-center justify-center ${i === 1 ? "cyber-glow-primary" : ""}`}>
                <span className="text-sm md:text-lg font-display font-bold text-foreground">{teamNames[team] || `Отбор ${team}`}</span>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: delay + 0.3, type: "spring" }}
                  className="text-3xl md:text-5xl font-display font-black text-foreground"
                >
                  {scores[team]}
                </motion.span>
              </div>
            </motion.div>
          ))}
        </div>

        <CyberButton variant="ghost" onClick={resetGame}>
          Нова игра
        </CyberButton>
      </motion.div>
    </div>
  );
}

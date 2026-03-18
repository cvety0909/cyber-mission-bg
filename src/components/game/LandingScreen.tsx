import { motion } from "framer-motion";
import { Shield, Users, Monitor } from "lucide-react";
import CyberButton from "./CyberButton";
import { useGame } from "@/context/GameContext";

export default function LandingScreen() {
  const { setView, setRole } = useGame();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 grid-bg">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center max-w-2xl"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block mb-8"
        >
          <Shield className="w-24 h-24 text-primary mx-auto drop-shadow-[0_0_25px_hsla(199,89%,48%,0.6)]" />
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-display font-black mb-4 tracking-tighter uppercase italic text-foreground">
          Кибер<span className="text-primary">защитници</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-4 font-body">
          Мисия: Защити дигиталния свят
        </p>
        <p className="text-sm text-muted-foreground/60 mb-12 max-w-md mx-auto font-body">
          Интерактивна игра за киберсигурност. Раздели се на отбори, отговаряй на мисии и спечели!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <CyberButton
            onClick={() => { setRole("student"); setView("join-session"); }}
            className="text-lg"
          >
            <Users className="w-5 h-5 mr-2 inline" />
            Влез като Ученик
          </CyberButton>
          <CyberButton
            variant="ghost"
            onClick={() => { setRole("teacher"); setView("mission-manager"); }}
            className="text-lg"
          >
            <Monitor className="w-5 h-5 mr-2 inline" />
            Панел на Учител
          </CyberButton>
        </div>
      </motion.div>
    </div>
  );
}

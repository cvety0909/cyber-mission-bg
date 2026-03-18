import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, LogIn, Shield } from "lucide-react";
import CyberButton from "./CyberButton";
import { useGame } from "@/context/GameContext";

export default function JoinSession() {
  const { joinSession, setView, setRole } = useGame();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (code.trim().length < 4) return;
    setLoading(true);
    await joinSession(code);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 grid-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <button
          onClick={() => { setView("landing"); setRole(null); }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Назад
        </button>

        <div className="cyber-surface p-8 md:p-10 text-center">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-display font-black uppercase tracking-tight mb-2 text-foreground">
            Присъедини се
          </h2>
          <p className="text-muted-foreground font-body text-sm mb-8">
            Въведи кода от учителя, за да се присъединиш към урока
          </p>

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="w-full text-center text-4xl md:text-5xl font-display font-black tracking-[0.3em] bg-background border-2 border-border rounded-xl px-4 py-5 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary transition-colors"
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          />

          <CyberButton
            onClick={handleJoin}
            disabled={code.trim().length < 6 || loading}
            className="w-full mt-6 text-lg"
          >
            <LogIn className="w-5 h-5 mr-2 inline" />
            {loading ? "Свързване..." : "Влез в играта"}
          </CyberButton>
        </div>
      </motion.div>
    </div>
  );
}

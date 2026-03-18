import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowUp, ArrowDown, Play, Plus, Copy, Pencil, Trash2, Check, X, Shield,
} from "lucide-react";
import CyberButton from "./CyberButton";
import { useGame } from "@/context/GameContext";
import { MISSIONS as DEFAULT_MISSIONS, type Mission, type AnswerType, type DifficultyType } from "@/data/missions";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface MissionWithActive extends Mission {
  active: boolean;
}

const EMPTY_MISSION: Mission = {
  id: 0,
  title: "",
  scenario: "",
  answer: "STOP",
  explanation: "",
  discussionQuestion: "",
  difficulty: "quick",
  category: "",
};

export default function MissionManager() {
  const { createSession, setView, setRole } = useGame();
  const [missions, setMissions] = useState<MissionWithActive[]>(
    DEFAULT_MISSIONS.map(m => ({ ...m, active: true }))
  );
  const [editingMission, setEditingMission] = useState<MissionWithActive | null>(null);
  const [editIdx, setEditIdx] = useState<number>(-1);
  const [loading, setLoading] = useState(false);

  const activeMissions = missions.filter(m => m.active);

  const toggleMission = (idx: number) => {
    setMissions(ms => ms.map((m, i) => i === idx ? { ...m, active: !m.active } : m));
  };

  const moveMission = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= missions.length) return;
    setMissions(ms => {
      const copy = [...ms];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    });
  };

  const duplicateMission = (idx: number) => {
    setMissions(ms => {
      const copy = [...ms];
      const dup = { ...copy[idx], id: Date.now() + Math.random() };
      copy.splice(idx + 1, 0, dup);
      return copy;
    });
  };

  const deleteMission = (idx: number) => {
    setMissions(ms => ms.filter((_, i) => i !== idx));
  };

  const openEdit = (idx: number) => {
    setEditIdx(idx);
    setEditingMission({ ...missions[idx] });
  };

  const openNew = () => {
    setEditIdx(-1);
    setEditingMission({ ...EMPTY_MISSION, id: Date.now(), active: true });
  };

  const saveEdit = () => {
    if (!editingMission) return;
    if (editIdx >= 0) {
      setMissions(ms => ms.map((m, i) => i === editIdx ? editingMission : m));
    } else {
      setMissions(ms => [...ms, editingMission]);
    }
    setEditingMission(null);
  };

  const handleStart = async () => {
    if (activeMissions.length === 0) return;
    setLoading(true);
    await createSession(activeMissions);
    setLoading(false);
  };

  const answerColor = (a: AnswerType) =>
    a === "STOP" ? "text-destructive" : a === "ВНИМАНИЕ" ? "text-warn" : "text-safe";

  return (
    <div className="min-h-screen grid-bg">
      <div className="max-w-4xl mx-auto p-6 lg:p-10">
        <button
          onClick={() => { setView("landing"); setRole(null); }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Назад
        </button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-black uppercase tracking-tight text-foreground">
              Управление на мисии
            </h1>
            <p className="text-muted-foreground font-body text-sm mt-1">
              {activeMissions.length} от {missions.length} мисии са активни
            </p>
          </div>
          <div className="flex gap-2">
            <CyberButton variant="ghost" onClick={openNew} className="text-sm py-3">
              <Plus className="w-4 h-4 mr-1 inline" /> Нова мисия
            </CyberButton>
            <CyberButton onClick={handleStart} disabled={activeMissions.length === 0 || loading} className="text-sm py-3">
              <Play className="w-4 h-4 mr-1 inline" />
              {loading ? "Създаване..." : `Започни урок (${activeMissions.length})`}
            </CyberButton>
          </div>
        </div>

        <div className="space-y-2">
          {missions.map((m, idx) => (
            <motion.div
              key={`${m.id}-${idx}`}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`cyber-surface p-4 flex items-center gap-3 transition-opacity ${!m.active ? "opacity-40" : ""}`}
            >
              {/* Reorder */}
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveMission(idx, -1)} disabled={idx === 0}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors p-0.5">
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => moveMission(idx, 1)} disabled={idx === missions.length - 1}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors p-0.5">
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Toggle */}
              <button
                onClick={() => toggleMission(idx)}
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  m.active ? "bg-primary border-primary" : "border-border"
                }`}
              >
                {m.active && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
              </button>

              {/* Info */}
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-bold text-sm text-foreground truncate">{m.title}</span>
                  <span className={`text-xs font-bold uppercase font-body ${answerColor(m.answer)}`}>{m.answer}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-body uppercase">
                    {m.difficulty === "quick" ? "бърза" : "дискусия"}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-body">
                    {m.category}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-body truncate mt-0.5">{m.scenario}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => openEdit(idx)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => duplicateMission(idx)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary">
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deleteMission(idx)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-secondary">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingMission} onOpenChange={(open) => !open && setEditingMission(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display font-bold uppercase text-foreground">
              {editIdx >= 0 ? "Редактирай мисия" : "Нова мисия"}
            </DialogTitle>
          </DialogHeader>
          {editingMission && (
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground font-body block mb-1">Заглавие</label>
                <input
                  value={editingMission.title}
                  onChange={e => setEditingMission({ ...editingMission, title: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground font-body focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground font-body block mb-1">Сценарий</label>
                <textarea
                  value={editingMission.scenario}
                  onChange={e => setEditingMission({ ...editingMission, scenario: e.target.value })}
                  rows={3}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground font-body focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground font-body block mb-1">Верен отговор</label>
                  <select
                    value={editingMission.answer}
                    onChange={e => setEditingMission({ ...editingMission, answer: e.target.value as AnswerType })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground font-body focus:outline-none focus:border-primary"
                  >
                    <option value="STOP">STOP</option>
                    <option value="ВНИМАНИЕ">ВНИМАНИЕ</option>
                    <option value="БЕЗОПАСНО">БЕЗОПАСНО</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground font-body block mb-1">Трудност</label>
                  <select
                    value={editingMission.difficulty}
                    onChange={e => setEditingMission({ ...editingMission, difficulty: e.target.value as DifficultyType })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground font-body focus:outline-none focus:border-primary"
                  >
                    <option value="quick">Бърза</option>
                    <option value="discussion">Дискусия</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground font-body block mb-1">Категория</label>
                <input
                  value={editingMission.category}
                  onChange={e => setEditingMission({ ...editingMission, category: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground font-body focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground font-body block mb-1">Обяснение</label>
                <textarea
                  value={editingMission.explanation}
                  onChange={e => setEditingMission({ ...editingMission, explanation: e.target.value })}
                  rows={2}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground font-body focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground font-body block mb-1">Въпрос за дискусия</label>
                <textarea
                  value={editingMission.discussionQuestion}
                  onChange={e => setEditingMission({ ...editingMission, discussionQuestion: e.target.value })}
                  rows={2}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground font-body focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <CyberButton onClick={saveEdit} className="flex-1 text-sm py-3"
                  disabled={!editingMission.title || !editingMission.scenario}>
                  <Check className="w-4 h-4 mr-1 inline" /> Запази
                </CyberButton>
                <CyberButton variant="ghost" onClick={() => setEditingMission(null)} className="text-sm py-3">
                  <X className="w-4 h-4 mr-1 inline" /> Откажи
                </CyberButton>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

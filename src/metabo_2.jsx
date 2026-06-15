import { useEffect, useState } from "react";

import HomeScreen from "./components/metabo/HomeScreen.jsx";
import LearnScreen from "./components/metabo/LearnScreen.jsx";
import { S } from "./components/metabo/styles.js";
import TimelineScreen from "./components/metabo/TimelineScreen.jsx";
import { buildFastingCoach } from "./lib/fastingCoach.js";
import {
  appendFastHistory,
  buildCompletedFast,
  calculateElapsedSeconds,
  findOverlappingFast,
  formatDuration,
  getPhase,
  nowLocal,
  readStoredFastHistory,
  readStoredStartTime,
  summarizeFastHistory,
  syncStoredFastHistory,
  syncStoredStartTime,
  validateFastEndTime,
} from "./lib/metaboState.js";

export default function Metabo() {
  const [screen, setScreen] = useState("home");
  const [startTime, setStartTime] = useState(() => readStoredStartTime());
  const [fastHistory, setFastHistory] = useState(() => readStoredFastHistory());
  const [elapsed, setElapsed] = useState(() => {
    const storedStartTime = readStoredStartTime();
    return calculateElapsedSeconds(storedStartTime);
  });
  const [showPicker, setShowPicker] = useState(false);
  const [customTime, setCustomTime] = useState("");
  const [customTimeError, setCustomTimeError] = useState("");
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [endTime, setEndTime] = useState("");
  const [endTimeError, setEndTimeError] = useState("");

  useEffect(() => {
    if (!startTime) return;

    const iv = setInterval(() => {
      setElapsed(calculateElapsedSeconds(startTime));
    }, 1000);

    return () => clearInterval(iv);
  }, [startTime]);

  useEffect(() => {
    syncStoredStartTime(startTime);
  }, [startTime]);

  useEffect(() => {
    syncStoredFastHistory(fastHistory);
  }, [fastHistory]);

  const hoursElapsed = elapsed / 3600;
  const phase = startTime ? getPhase(hoursElapsed) : null;
  const coach = startTime ? buildFastingCoach(hoursElapsed) : null;
  const historySummary = summarizeFastHistory(fastHistory);
  const { h, m, s } = formatDuration(elapsed);

  function startNow() {
    setCustomTimeError("");
    setEndTimeError("");
    setShowEndPicker(false);
    setEndTime("");
    setStartTime(Date.now());
    setElapsed(0);
    setShowPicker(false);
  }

  function startCustom() {
    const val = customTime || nowLocal();
    const t = new Date(val);
    if (isNaN(t.getTime()) || t > new Date()) return;

    const overlappingFast = findOverlappingFast(fastHistory, t.getTime());
    if (overlappingFast) {
      setCustomTimeError(
        `Chevauchement détecté : ce jeûne commencerait avant la fin d’un jeûne déjà enregistré (${new Date(overlappingFast.endTime).toLocaleString("fr-CA", { dateStyle: "medium", timeStyle: "short" })}). Corrigez l’heure avant de continuer.`,
      );
      return;
    }

    setCustomTimeError("");
    setEndTimeError("");
    setStartTime(t.getTime());
    setElapsed(calculateElapsedSeconds(t.getTime()));
    setShowPicker(false);
    setShowEndPicker(false);
    setEndTime("");
  }

  function finalizeFast(completedFast) {
    if (completedFast) {
      setFastHistory(current => appendFastHistory(current, completedFast));
    }

    setCustomTimeError("");
    setEndTimeError("");
    setStartTime(null);
    setElapsed(0);
    setCustomTime("");
    setEndTime("");
    setShowPicker(false);
    setShowEndPicker(false);
  }

  function finishNow() {
    if (!startTime) return;
    finalizeFast(buildCompletedFast(startTime, Date.now()));
  }

  function finishCustom() {
    if (!startTime) return;

    const value = endTime || nowLocal();
    const parsedEnd = new Date(value).getTime();
    const validation = validateFastEndTime(startTime, parsedEnd);

    if (validation.error || !validation.endTime) {
      setEndTimeError(validation.error || "Entrez une date et une heure de fin valides.");
      return;
    }

    const completedFast = buildCompletedFast(startTime, validation.endTime);
    if (!completedFast) {
      setEndTimeError("Impossible d’enregistrer ce jeûne avec cette heure de fin.");
      return;
    }

    finalizeFast(completedFast);
  }

  function clearHistory() {
    setFastHistory([]);
    setCustomTimeError("");
  }

  const progressPct = phase
    ? Math.min(((hoursElapsed - phase.start) / (phase.end - phase.start)) * 100, 100)
    : 0;

  return (
    <div style={S.root}>
      <div style={S.header}>
        <span style={S.logo}>Métabo</span>
        <div style={S.tabs}>
          {[["home", "Accueil"], ["timeline", "Timeline"], ["learn", "Apprendre"]].map(([sc, label]) => (
            <button key={sc} style={screen === sc ? S.tabActive : S.tab} onClick={() => setScreen(sc)}>{label}</button>
          ))}
        </div>
      </div>

      <div style={S.body}>
        {screen === "home" && (
          <HomeScreen
            clearHistory={clearHistory}
            coach={coach}
            customTime={customTime}
            customTimeError={customTimeError}
            endTime={endTime}
            endTimeError={endTimeError}
            fastHistory={fastHistory}
            finishCustom={finishCustom}
            finishNow={finishNow}
            historySummary={historySummary}
            h={h}
            hoursElapsed={hoursElapsed}
            m={m}
            phase={phase}
            progressPct={progressPct}
            s={s}
            setCustomTime={setCustomTime}
            setCustomTimeError={setCustomTimeError}
            setEndTime={setEndTime}
            setEndTimeError={setEndTimeError}
            setShowEndPicker={setShowEndPicker}
            setShowPicker={setShowPicker}
            showEndPicker={showEndPicker}
            showPicker={showPicker}
            startCustom={startCustom}
            startNow={startNow}
            startTime={startTime}
          />
        )}
        {screen === "timeline" && <TimelineScreen hoursElapsed={hoursElapsed} startTime={startTime} />}
        {screen === "learn" && <LearnScreen currentPhase={phase} />}
      </div>

      <div style={S.disclaimer}>
        Ne fournit pas de conseils médicaux · Consultez un professionnel avant tout jeûne prolongé
      </div>
    </div>
  );
}

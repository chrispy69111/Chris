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
  formatDuration,
  getPhase,
  nowLocal,
  readStoredFastHistory,
  readStoredStartTime,
  syncStoredFastHistory,
  syncStoredStartTime,
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
  const { h, m, s } = formatDuration(elapsed);

  function startNow() {
    setStartTime(Date.now());
    setElapsed(0);
    setShowPicker(false);
  }

  function startCustom() {
    const val = customTime || nowLocal();
    const t = new Date(val);
    if (isNaN(t.getTime()) || t > new Date()) return;

    setStartTime(t.getTime());
    setElapsed(calculateElapsedSeconds(t.getTime()));
    setShowPicker(false);
  }

  function reset() {
    if (startTime) {
      const completedFast = buildCompletedFast(startTime, Date.now());
      if (completedFast) {
        setFastHistory(current => appendFastHistory(current, completedFast));
      }
    }

    setStartTime(null);
    setElapsed(0);
    setCustomTime("");
    setShowPicker(false);
  }

  function clearHistory() {
    setFastHistory([]);
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
            fastHistory={fastHistory}
            h={h}
            hoursElapsed={hoursElapsed}
            m={m}
            phase={phase}
            progressPct={progressPct}
            reset={reset}
            s={s}
            setCustomTime={setCustomTime}
            setShowPicker={setShowPicker}
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

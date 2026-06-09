import { useState } from "react";

import { CONFIDENCE_META } from "../../data/metaboPhases.js";
import { nowLocal } from "../../lib/metaboState.js";
import { S } from "./styles.js";

export default function HomeScreen({
  startTime,
  h,
  m,
  s,
  phase,
  hoursElapsed,
  progressPct,
  showPicker,
  setShowPicker,
  customTime,
  setCustomTime,
  startNow,
  startCustom,
  reset,
}) {
  const [tab, setTab] = useState("science");
  const conf = phase ? CONFIDENCE_META[phase.confidence] : null;

  return (
    <div style={S.homeWrap}>
      <div style={S.chronoCard}>
        <div style={S.chronoLabel}>depuis le dernier repas</div>
        {startTime ? (
          <div style={S.chronoTime}>
            <span style={S.chronoH}>{String(h).padStart(2, "0")}</span>
            <span style={S.chronoSep}>h </span>
            <span style={S.chronoH}>{String(m).padStart(2, "0")}</span>
            <span style={S.chronoSep}>min </span>
            <span style={S.chronoS}>{String(s).padStart(2, "0")}s</span>
          </div>
        ) : (
          <div style={S.chronoIdle}>— h —</div>
        )}
      </div>

      {phase ? (
        <div style={S.phaseCard}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>{phase.emoji}</span>
              <span style={S.phaseTitle}>{phase.label}</span>
            </div>
            <span style={{ ...S.badge, background: conf.bg, color: conf.color }}>● {conf.label}</span>
          </div>

          <div style={S.progressTrack}>
            <div style={{ ...S.progressFill, width: `${progressPct}%`, background: phase.color }} />
          </div>
          <div style={S.progressLabels}>
            <span>{phase.start}h</span>
            <span style={{ color: phase.color, fontWeight: 600 }}>
              {String(Math.floor(hoursElapsed)).padStart(2, "0")}h{String(Math.floor((hoursElapsed % 1) * 60)).padStart(2, "0")}
            </span>
            <span>{phase.end}h</span>
          </div>

          <p style={S.phaseDesc}>{phase.description}</p>

          <div style={S.subTabs}>
            {[["science", "🔬 Science"], ["feelings", "💭 Ressentis"], ["tips", "💡 Conseils"]].map(([key, label]) => (
              <button key={key} style={tab === key ? S.subTabActive : S.subTab} onClick={() => setTab(key)}>{label}</button>
            ))}
          </div>

          {tab === "science" && (
            <div style={S.contentBlock}>
              {phase.science.map((item, index) => (
                <div key={index} style={S.scienceItem}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: phase.color, flexShrink: 0, marginTop: 5 }} />
                  <div>
                    <span style={{ fontSize: 12, color: "#3A4A5C", lineHeight: 1.5 }}>{item.text}</span>
                    <span style={S.sourceTag}>{item.source}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "feelings" && (
            <div style={S.contentBlock}>
              {phase.feelings.map((feeling, index) => (
                <div key={index} style={S.feelingItem}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{feeling.icon}</span>
                  <span style={{ fontSize: 13, color: "#3A4A5C", lineHeight: 1.5 }}>{feeling.text}</span>
                </div>
              ))}
            </div>
          )}

          {tab === "tips" && (
            <div style={S.contentBlock}>
              {phase.tips.map((tip, index) => (
                <div key={index} style={{ ...S.tipCard, borderLeft: `3px solid ${phase.color}` }}>
                  <div style={S.tipHeader}>
                    <span style={{ fontSize: 18 }}>{tip.icon}</span>
                    <span style={S.tipTitle}>{tip.title}</span>
                  </div>
                  <p style={S.tipText}>{tip.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={S.phaseCard}>
          <p style={{ color: "#8A9BB0", textAlign: "center", margin: 0, lineHeight: 1.7, fontSize: 14 }}>
            Enregistrez votre dernier repas<br />pour commencer le suivi métabolique.
          </p>
        </div>
      )}

      {!startTime ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {!showPicker ? (
            <>
              <button style={S.btnPrimary} onClick={startNow}>Dernier repas : maintenant</button>
              <button
                style={S.btnSecondary}
                onClick={() => {
                  setCustomTime(nowLocal());
                  setShowPicker(true);
                }}
              >
                Entrer la date et l'heure
              </button>
            </>
          ) : (
            <div style={S.pickerWrap}>
              <p style={S.pickerLabel}>Date et heure du dernier repas</p>
              <input
                type="datetime-local"
                value={customTime}
                max={nowLocal()}
                onChange={(event) => setCustomTime(event.target.value)}
                style={S.timeInput}
              />
              <div style={{ display: "flex", gap: 10 }}>
                <button style={S.btnPrimary} onClick={startCustom}>Confirmer</button>
                <button style={S.btnGhost} onClick={() => setShowPicker(false)}>Annuler</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button style={S.btnGhost} onClick={reset}>Réinitialiser</button>
      )}
    </div>
  );
}

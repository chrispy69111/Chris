import { useState } from "react";

import { CONFIDENCE_META } from "../../data/metaboPhases.js";
import { formatDuration, getFastScore, nowLocal } from "../../lib/metaboState.js";
import { S } from "./styles.js";

function formatHistoryDate(timestamp) {
  return new Date(timestamp).toLocaleString("fr-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatHistoryDuration(seconds) {
  const { h, m } = formatDuration(seconds);
  if (h > 0) return `${h} h ${String(m).padStart(2, "0")} min`;
  return `${m} min`;
}

function getScoreBadgeStyle(score) {
  if (!score) return S.fastScoreMuted;

  if (score.tone === "good") return S.fastScoreGood;
  if (score.tone === "advanced") return S.fastScoreAdvanced;
  if (score.tone === "caution") return S.fastScoreCaution;
  if (score.tone === "base") return S.fastScoreBase;
  return S.fastScoreMuted;
}

export default function HomeScreen({
  startTime,
  h, m, s,
  phase,
  coach,
  hoursElapsed,
  progressPct,
  showPicker,
  showEndPicker,
  setShowPicker,
  setShowEndPicker,
  customTime,
  customTimeError,
  endTime,
  endTimeError,
  setCustomTime,
  setCustomTimeError,
  setEndTime,
  setEndTimeError,
  startNow,
  startCustom,
  finishNow,
  finishCustom,
  fastHistory,
  historySummary,
  clearHistory,
}) {
  // "coach" est le premier onglet si disponible, sinon "science"
  const defaultTab = coach ? "coach" : "science";
  const [tab, setTab] = useState(defaultTab);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const conf = phase ? CONFIDENCE_META[phase.confidence] : null;

  // Synchroniser l'onglet par défaut quand la phase change
  // (coach apparaît dès qu'un jeûne démarre)
  const tabs = coach
    ? [["coach", "🧭 Coach"], ["science", "🔬 Science"], ["feelings", "💭 Ressentis"], ["tips", "💡 Conseils"]]
    : [["science", "🔬 Science"], ["feelings", "💭 Ressentis"], ["tips", "💡 Conseils"]];

  return (
    <div style={S.homeWrap}>

      {/* ── Chronomètre ── */}
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
          <>
            <div style={S.chronoIdle}>— h —</div>
            <p style={{ margin:"10px 0 0", fontSize:13, color:"#8A9BB0", lineHeight:1.6 }}>
              Enregistrez votre dernier repas pour<br />découvrir ce qui se passe dans votre corps.
            </p>
          </>
        )}
      </div>

      {/* ── Carte phase + onglets (fusionnée avec coach) ── */}
      {phase ? (
        <div style={S.phaseCard}>

          {/* En-tête phase */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:20 }}>{phase.emoji}</span>
              <span style={S.phaseTitle}>{phase.label}</span>
            </div>
            <span style={{ ...S.badge, background:conf.bg, color:conf.color }}>● {conf.label}</span>
          </div>

          {/* Barre de progression */}
          <div style={S.progressTrack}>
            <div style={{ ...S.progressFill, width:`${progressPct}%`, background:phase.color }} />
          </div>
          <div style={S.progressLabels}>
            <span>{phase.start}h</span>
            <span style={{ color:phase.color, fontWeight:600 }}>
              {String(Math.floor(hoursElapsed)).padStart(2,"0")}h
              {String(Math.floor((hoursElapsed % 1) * 60)).padStart(2,"0")}
            </span>
            <span>{phase.end}h</span>
          </div>

          <p style={S.phaseDesc}>{phase.description}</p>

          {/* Onglets — Coach intégré en premier */}
          <div style={S.subTabs}>
            {tabs.map(([key, label]) => (
              <button
                key={key}
                style={tab === key ? S.subTabActive : S.subTab}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Contenu onglet Coach */}
          {tab === "coach" && coach && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div style={S.coachHeader}>
                <div>
                  <p style={S.coachEyebrow}>Coach prudent</p>
                  <h3 style={S.coachTitle}>{coach.headline}</h3>
                </div>
                <span style={{
                  ...S.badge,
                  ...(coach.proof.tone === "high" ? S.coachProofHigh
                    : coach.proof.tone === "medium" ? S.coachProofMedium
                    : S.coachProofLow),
                }}>
                  {coach.proof.label}
                </span>
              </div>

              <p style={S.coachSummary}>{coach.summary}</p>

              <div style={S.coachList}>
                {coach.actions.map((action) => (
                  <div key={action.title} style={S.coachItem}>
                    <div style={S.coachItemTitle}>{action.title}</div>
                    <div style={S.coachItemText}>{action.text}</div>
                  </div>
                ))}
              </div>

              {coach.safety.length > 0 && (
                <div style={S.coachSafetyBox}>
                  <div style={S.coachSafetyTitle}>⚠️ Signaux de prudence</div>
                  <ul style={S.coachSafetyList}>
                    {coach.safety.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Contenu onglet Science */}
          {tab === "science" && (
            <div style={S.contentBlock}>
              {phase.science.map((item, i) => (
                <div key={i} style={S.scienceItem}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:phase.color, flexShrink:0, marginTop:5 }} />
                  <div>
                    <span style={{ fontSize:13, color:"#3A4A5C", lineHeight:1.5 }}>{item.text}</span>
                    <span style={S.sourceTag}>{item.source}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contenu onglet Ressentis */}
          {tab === "feelings" && (
            <div style={S.contentBlock}>
              {phase.feelings.map((feeling, i) => (
                <div key={i} style={S.feelingItem}>
                  <span style={{ fontSize:22, flexShrink:0 }}>{feeling.icon}</span>
                  <span style={{ fontSize:13, color:"#3A4A5C", lineHeight:1.5 }}>{feeling.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Contenu onglet Conseils */}
          {tab === "tips" && (
            <div style={S.contentBlock}>
              {phase.tips.map((tip, i) => (
                <div key={i} style={{ ...S.tipCard, borderLeft:`3px solid ${phase.color}` }}>
                  <div style={S.tipHeader}>
                    <span style={{ fontSize:18 }}>{tip.icon}</span>
                    <span style={S.tipTitle}>{tip.title}</span>
                  </div>
                  <p style={S.tipText}>{tip.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* État vide — aperçu de la valeur */
        <div style={{ ...S.phaseCard, textAlign:"center", padding:"20px 18px" }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🍽️ → 🔥 → 🫀</div>
          <p style={{ color:"#5A6A7E", fontSize:13, lineHeight:1.7, margin:"0 0 4px" }}>
            Chaque heure sans manger déclenche<br />des changements mesurables dans votre corps.
          </p>
          <p style={{ color:"#A0AABB", fontSize:11, margin:0 }}>
            Métabo vous explique ce qui se passe, phase par phase.
          </p>
        </div>
      )}

      {fastHistory.length > 0 && (
        <div style={S.historyCard}>
          <div style={S.historyHeader}>
            <div>
              <p style={S.historyEyebrow}>Statistiques principales</p>
              <h3 style={S.historyTitle}>Jeûne principal du soir au premier repas</h3>
            </div>
          </div>

          <p style={S.historyHelper}>
            Les statistiques principales ignorent les périodes de moins de 12 h. Elles visent surtout le dernier apport calorique du soir → premier repas du lendemain.
          </p>

          <div style={S.statsGrid}>
            <div style={S.statCard}>
              <div style={S.statLabel}>Jeûnes principaux comptabilisés</div>
              <div style={S.statValue}>{historySummary.mainFastCount}</div>
            </div>
            <div style={S.statCard}>
              <div style={S.statLabel}>Micro-jeûnes ignorés</div>
              <div style={S.statValue}>{historySummary.microFastCount}</div>
            </div>
            <div style={S.statCard}>
              <div style={S.statLabel}>Durée moyenne principale</div>
              <div style={S.statValue}>
                {historySummary.mainFastCount > 0 ? formatHistoryDuration(historySummary.averageMainDurationSeconds) : "—"}
              </div>
            </div>
            <div style={S.statCard}>
              <div style={S.statLabel}>Dernier score principal</div>
              {historySummary.latestMainFastScore ? (
                <span style={{ ...S.badge, ...getScoreBadgeStyle(historySummary.latestMainFastScore) }}>
                  {historySummary.latestMainFastScore.label}
                </span>
              ) : (
                <div style={S.statValue}>—</div>
              )}
            </div>
          </div>

          <div style={S.recentStatsSection}>
            <div>
              <p style={S.historyEyebrow}>Fenêtres récentes</p>
              <h4 style={S.statsSectionTitle}>Rythme sur 7 et 30 jours</h4>
            </div>
            <div style={S.statsGrid}>
              <div style={S.statCard}>
                <div style={S.statLabel}>7 derniers jours</div>
                <div style={S.statValue}>{historySummary.last7Days.count}</div>
                <div style={S.statSubvalue}>
                  {historySummary.last7Days.count > 0
                    ? `${formatHistoryDuration(historySummary.last7Days.averageDurationSeconds)} en moyenne`
                    : "Aucun jeûne principal"}
                </div>
              </div>
              <div style={S.statCard}>
                <div style={S.statLabel}>30 derniers jours</div>
                <div style={S.statValue}>{historySummary.last30Days.count}</div>
                <div style={S.statSubvalue}>
                  {historySummary.last30Days.count > 0
                    ? `${formatHistoryDuration(historySummary.last30Days.averageDurationSeconds)} en moyenne`
                    : "Aucun jeûne principal"}
                </div>
              </div>
            </div>
          </div>

          <div style={S.recentStatsSection}>
            <div>
              <p style={S.historyEyebrow}>Meilleur récent</p>
              <h4 style={S.statsSectionTitle}>Meilleur score des 30 derniers jours</h4>
            </div>
            {historySummary.bestRecentFastScore ? (
              <div style={S.bestRecentCard}>
                <div style={S.historyItemTopRow}>
                  <div>
                    <div style={S.statValue}>{formatHistoryDuration(historySummary.bestRecentFast.durationSeconds)}</div>
                    <div style={S.statSubvalue}>
                      terminé le {formatHistoryDate(historySummary.bestRecentFast.endTime)}
                    </div>
                  </div>
                  <span style={{ ...S.badge, ...getScoreBadgeStyle(historySummary.bestRecentFastScore) }}>
                    {historySummary.bestRecentFastScore.label}
                  </span>
                </div>
              </div>
            ) : (
              <div style={S.bestRecentCard}>
                <div style={S.statSubvalue}>Pas encore de jeûne principal récent à comparer.</div>
              </div>
            )}
          </div>

          <div style={S.scoreLegend}>
            <span style={{ ...S.badge, ...S.fastScoreMuted }}>moins de 12 h · non comptabilisé</span>
            <span style={{ ...S.badge, ...S.fastScoreBase }}>12–15 h · base</span>
            <span style={{ ...S.badge, ...S.fastScoreGood }}>16–18 h · très bon</span>
            <span style={{ ...S.badge, ...S.fastScoreAdvanced }}>18–24 h · avancé</span>
            <span style={{ ...S.badge, ...S.fastScoreCaution }}>24 h+ · prudent / ponctuel</span>
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      {!startTime ? (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {!showPicker ? (
            <>
              <button style={S.btnPrimary} onClick={startNow}>
                Dernier repas : maintenant
              </button>
              <button
                style={S.btnSecondary}
                onClick={() => { setCustomTimeError(""); setCustomTime(nowLocal()); setShowPicker(true); }}
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
                onChange={(e) => {
                  setCustomTime(e.target.value);
                  if (customTimeError) setCustomTimeError("");
                }}
                style={S.timeInput}
              />
              {customTimeError && <div style={S.alertBox}>{customTimeError}</div>}
              <div style={{ display:"flex", gap:10 }}>
                <button style={S.btnPrimary} onClick={startCustom}>Confirmer</button>
                <button style={S.btnGhost} onClick={() => { setCustomTimeError(""); setShowPicker(false); }}>Annuler</button>
              </div>
            </div>
          )}
        </div>
      ) : showEndPicker ? (
        <div style={S.pickerWrap}>
          <p style={S.pickerLabel}>Date et heure de fin du jeûne</p>
          <p style={S.pickerHelper}>
            Utile si vous terminez votre jeûne après coup et voulez enregistrer l’heure réelle.
          </p>
          <input
            type="datetime-local"
            value={endTime}
            min={new Date(startTime).toISOString().slice(0, 16)}
            max={nowLocal()}
            onChange={(e) => {
              setEndTime(e.target.value);
              if (endTimeError) setEndTimeError("");
            }}
            style={S.timeInput}
          />
          {endTimeError && <div style={S.alertBox}>{endTimeError}</div>}
          <div style={S.inlineActions}>
            <button style={S.btnPrimary} onClick={finishCustom}>Enregistrer cette heure</button>
            <button style={S.btnGhost} onClick={() => { setEndTimeError(""); setShowEndPicker(false); }}>Annuler</button>
          </div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <button style={S.btnGhost} onClick={finishNow}>
            Terminer maintenant
          </button>
          <button
            style={S.btnSecondary}
            onClick={() => {
              setEndTimeError("");
              setEndTime(nowLocal());
              setShowEndPicker(true);
            }}
          >
            Terminer avec une heure précise
          </button>
        </div>
      )}

      {/* ── Historique repliable ── */}
      {fastHistory.length > 0 && (
        <div style={S.historyCard}>
          <div style={S.historyHeader}>
            <div>
              <p style={S.historyEyebrow}>Historique complet</p>
              <h3 style={S.historyTitle}>
                {fastHistory.length} période{fastHistory.length > 1 ? "s" : ""} enregistrée{fastHistory.length > 1 ? "s" : ""}
              </h3>
            </div>
            <button
              style={S.historyClearBtn}
              onClick={() => setHistoryOpen(o => !o)}
            >
              {historyOpen ? "Réduire ↑" : "Voir ↓"}
            </button>
          </div>

          {historyOpen && (
            <>
              <div style={S.historyList}>
                {fastHistory.slice().reverse().map((entry) => {
                  const entryScore = getFastScore(entry.durationSeconds);

                  return (
                  <div key={entry.id} style={S.historyItem}>
                    <div style={S.historyItemTopRow}>
                      <div style={S.historyDuration}>{formatHistoryDuration(entry.durationSeconds)}</div>
                      <span style={{ ...S.badge, ...getScoreBadgeStyle(entryScore) }}>{entryScore.counted ? entryScore.label : "Micro-jeûne ignoré"}</span>
                    </div>
                    <div style={S.historyMeta}>
                      {formatHistoryDate(entry.startTime)} → {formatHistoryDate(entry.endTime)}
                    </div>
                  </div>
                  )
                })}
              </div>

              {/* Confirmation avant suppression */}
              {!confirmClear ? (
                <button
                  style={{ ...S.btnGhost, marginTop:8, width:"100%", color:"#E74C3C", borderColor:"#E74C3C" }}
                  onClick={() => setConfirmClear(true)}
                >
                  Vider l'historique
                </button>
              ) : (
                <div style={{ display:"flex", gap:8, marginTop:8 }}>
                  <button
                    style={{ ...S.btnGhost, flex:1, color:"#E74C3C", borderColor:"#E74C3C" }}
                    onClick={() => { clearHistory(); setConfirmClear(false); setHistoryOpen(false); }}
                  >
                    Confirmer la suppression
                  </button>
                  <button
                    style={{ ...S.btnGhost, flex:1 }}
                    onClick={() => setConfirmClear(false)}
                  >
                    Annuler
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

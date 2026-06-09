import { useEffect, useState } from "react";
import { PHASES } from "../../data/metaboPhases.js";
import { S } from "./styles.js";

export default function LearnScreen({ currentPhase }) {
  const [selected, setSelected] = useState(currentPhase || PHASES[0]);

  // Sync quand la phase active change pendant le jeûne
  useEffect(() => {
    if (currentPhase) setSelected(currentPhase);
  }, [currentPhase?.id]);

  return (
    <div style={S.learnWrap}>
      <h2 style={S.tlTitle}>Comprendre votre métabolisme</h2>
      <p style={S.tlSub}>Un concept clé par phase. Basé sur la recherche récente.</p>

      {/* Sélecteur de phase */}
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {PHASES.map(ph => (
          <button
            key={ph.id}
            style={{
              ...S.learnPill,
              borderLeft:`3px solid ${ph.color}`,
              background: selected?.id === ph.id ? "#EEF3F8" : "#fff",
              color: selected?.id === ph.id ? "#1A2B3C" : "#5A6A7E",
              fontWeight: selected?.id === ph.id ? 600 : 400,
            }}
            onClick={() => setSelected(ph)}
          >
            <span>{ph.emoji}</span>
            <span style={{ fontSize:13 }}>{ph.label}</span>
            <span style={{ marginLeft:"auto", fontSize:11, color:"#A0AABB" }}>{ph.start}–{ph.end}h</span>
            {currentPhase?.id === ph.id && (
              <span style={{ fontSize:10, color:ph.color, fontWeight:700, marginLeft:4 }}>← actuelle</span>
            )}
          </button>
        ))}
      </div>

      {/* Contenu pédagogique */}
      {selected && (
        <div style={{ ...S.learnCard, borderTop:`4px solid ${selected.color}` }}>

          <div style={S.learnConceptBadge}>
            <span style={{ fontSize:22 }}>{selected.emoji}</span>
            <div>
              <div style={{ fontSize:10, color:"#8A9BB0", textTransform:"uppercase", letterSpacing:1 }}>
                Concept clé
              </div>
              <div style={{ fontSize:15, fontWeight:700, color:"#1A2B3C" }}>
                {selected.learn.concept}
              </div>
            </div>
          </div>

          <p style={{ fontSize:13, color:"#3A4A5C", lineHeight:1.75, margin:"0 0 16px" }}>
            {selected.learn.explanation}
          </p>

          <div style={{
            background: selected.color + "15",
            borderRadius:10,
            padding:"12px 14px",
            borderLeft:`3px solid ${selected.color}`,
            marginBottom:16,
          }}>
            <div style={{ fontSize:10, fontWeight:700, color:selected.color, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>
              À retenir
            </div>
            <p style={{ margin:0, fontSize:13, color:"#3A4A5C", lineHeight:1.6 }}>
              {selected.learn.keyFact}
            </p>
          </div>

          <div>
            <div style={{ fontSize:11, fontWeight:600, color:"#8A9BB0", textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>
              Sources citées
            </div>
            {selected.science.map((item, i) => (
              <div key={i} style={{ display:"flex", gap:8, marginBottom:6, alignItems:"flex-start" }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:selected.color, flexShrink:0, marginTop:6 }} />
                <div>
                  <span style={{ fontSize:12, color:"#5A6A7E", lineHeight:1.5 }}>{item.text}</span>
                  <span style={S.sourceTag}>{item.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

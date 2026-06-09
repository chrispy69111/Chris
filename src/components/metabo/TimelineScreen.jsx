import { useState } from "react";
import { PHASES, CONFIDENCE_META } from "../../data/metaboPhases.js";
import { S } from "./styles.js";

export default function TimelineScreen({ hoursElapsed, startTime }) {
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("science");

  return (
    <div style={S.timelineWrap}>
      <h2 style={S.tlTitle}>Timeline métabolique</h2>
      <p style={S.tlSub}>72h de physiologie du jeûne. Appuyez pour explorer.</p>

      <div style={S.tlTrack}>
        {PHASES.map(phase => {
          const isActive = startTime && hoursElapsed >= phase.start && hoursElapsed < phase.end;
          const isPast   = startTime && hoursElapsed >= phase.end;
          const width    = ((phase.end - phase.start) / 72) * 100;
          return (
            <div key={phase.id}
              style={{ ...S.tlSegment, width:`${width}%`,
                background: isPast ? phase.color : isActive ? phase.color : "#E8EDF3",
                opacity: isPast ? 0.6 : 1,
                boxShadow: isActive ? `0 0 0 3px ${phase.color}44` : "none",
              }}
              onClick={() => { setSelected(selected?.id === phase.id ? null : phase); setTab("science"); }}
            >
              <span style={{ fontSize:8, color: isPast||isActive ? "#fff" : "#5A6A7E", fontWeight:600 }}>{phase.start}h</span>
            </div>
          );
        })}
      </div>

      <div style={S.tlLabels}>
        {PHASES.map(phase => {
          const isActive = startTime && hoursElapsed >= phase.start && hoursElapsed < phase.end;
          const isPast   = startTime && hoursElapsed >= phase.end;
          const conf = CONFIDENCE_META[phase.confidence];
          return (
            <div key={phase.id}
              style={{ ...S.tlLabelCard, borderLeft:`3px solid ${phase.color}`,
                background: isActive ? "#F0F4F8" : "#fff", opacity: isPast ? 0.75 : 1, cursor:"pointer" }}
              onClick={() => { setSelected(selected?.id === phase.id ? null : phase); setTab("science"); }}
            >
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span>{phase.emoji}</span>
                  <span style={{ fontWeight:600, color:"#1A2B3C", fontSize:13 }}>{phase.label}</span>
                </div>
                <span style={{ fontSize:10, color:conf.color, background:conf.bg, padding:"2px 6px", borderRadius:10 }}>{conf.label}</span>
              </div>
              <span style={{ fontSize:11, color:"#8A9BB0" }}>{phase.start}h – {phase.end}h</span>
              {isActive && <span style={{ fontSize:10, color:phase.color, fontWeight:700 }}>← Phase actuelle</span>}
            </div>
          );
        })}
      </div>

      {selected && (
        <div style={{ ...S.detailPanel, borderTop:`4px solid ${selected.color}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
            <div>
              <h3 style={{ margin:"0 0 2px", color:"#1A2B3C" }}>{selected.emoji} {selected.label}</h3>
              <span style={{ fontSize:12, color:"#8A9BB0" }}>{selected.start}h – {selected.end}h · {CONFIDENCE_META[selected.confidence].desc}</span>
            </div>
          </div>
          <p style={{ color:"#3A4A5C", lineHeight:1.6, margin:"0 0 12px", fontSize:13 }}>{selected.description}</p>

          <div style={S.subTabs}>
            {[["science","🔬 Science"],["feelings","💭 Ressentis"],["tips","💡 Conseils"]].map(([k,label]) => (
              <button key={k} style={tab===k ? S.subTabActive : S.subTab} onClick={() => setTab(k)}>{label}</button>
            ))}
          </div>

          {tab === "science" && (
            <div style={S.contentBlock}>
              {selected.science.map((item, i) => (
                <div key={i} style={S.scienceItem}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:selected.color, flexShrink:0, marginTop:5 }} />
                  <div>
                    <span style={{ fontSize:12, color:"#3A4A5C", lineHeight:1.5 }}>{item.text}</span>
                    <span style={S.sourceTag}>{item.source}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "feelings" && (
            <div style={S.contentBlock}>
              {selected.feelings.map((f, i) => (
                <div key={i} style={S.feelingItem}>
                  <span style={{ fontSize:22, flexShrink:0 }}>{f.icon}</span>
                  <span style={{ fontSize:13, color:"#3A4A5C", lineHeight:1.5 }}>{f.text}</span>
                </div>
              ))}
            </div>
          )}
          {tab === "tips" && (
            <div style={S.contentBlock}>
              {selected.tips.map((t, i) => (
                <div key={i} style={{ ...S.tipCard, borderLeft:`3px solid ${selected.color}` }}>
                  <div style={S.tipHeader}>
                    <span style={{ fontSize:18 }}>{t.icon}</span>
                    <span style={S.tipTitle}>{t.title}</span>
                  </div>
                  <p style={S.tipText}>{t.text}</p>
                </div>
              ))}
            </div>
          )}

          <button style={{ ...S.btnGhost, marginTop:16, width:"100%" }} onClick={() => setSelected(null)}>Fermer</button>
        </div>
      )}
    </div>
  );
}

"use client"

import React from "react"

const VOICES = ["Rachel", "Clyde", "Domi", "Dave", "Fin", "Bella", "Antoni", "Thomas", "Emily"]

interface SpeakerCardProps {
  label: string
  mode: "standard" | "clone"
  voice: string
  pitch: number
  lang: string
  cloned: boolean
  onSetStd: () => void
  onSetClone: () => void
  onVoiceChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onPitchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onLangChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function SpeakerCard({
  label, mode, voice, pitch, lang, cloned,
  onSetStd, onSetClone, onVoiceChange, onPitchChange, onLangChange, onUpload,
}: SpeakerCardProps) {
  const isStd = mode === "standard"
  return (
    <div style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.13)", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h4 style={{ fontSize: 13, fontWeight: 600, color: "rgba(240,238,255,0.75)", letterSpacing: "0.04em" }}>{label}</h4>
        <div style={{ display: "flex", background: "rgba(0,0,0,0.25)", borderRadius: 9, padding: 3, gap: 2 }}>
          <button onClick={onSetStd} style={{ padding: "5px 13px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "none", background: isStd ? "rgba(139,92,246,0.22)" : "transparent", color: isStd ? "#c4b5fd" : "rgba(240,238,255,0.4)", fontFamily: "'DM Sans',sans-serif", transition: "background 0.2s,color 0.2s" }}>Standard</button>
          <button onClick={onSetClone} style={{ padding: "5px 13px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "none", background: !isStd ? "rgba(139,92,246,0.22)" : "transparent", color: !isStd ? "#c4b5fd" : "rgba(240,238,255,0.4)", fontFamily: "'DM Sans',sans-serif", transition: "background 0.2s,color 0.2s" }}>Clone Voice</button>
        </div>
      </div>

      {isStd && (
        <select value={voice} onChange={onVoiceChange} className="podify-select-sm">
          {VOICES.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      )}

      {!isStd && (
        <>
          <div style={{ border: "1.5px dashed rgba(139,92,246,0.28)", borderRadius: 12, padding: 20, textAlign: "center", background: "rgba(139,92,246,0.03)" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.65)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", margin: "0 auto 10px" }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <p style={{ fontSize: 13, color: "rgba(240,238,255,0.45)", marginBottom: 10 }}>Drop an audio sample here</p>
            <label style={{ cursor: "pointer" }}>
              <input type="file" accept="audio/*" onChange={onUpload} style={{ display: "none" }} />
              <span style={{ display: "inline-block", background: "rgba(139,92,246,0.14)", border: "1px solid rgba(139,92,246,0.28)", borderRadius: 8, padding: "7px 16px", fontSize: 12, color: "#c4b5fd", fontWeight: 500 }}>Browse File</span>
            </label>
            <p style={{ fontSize: 11, color: "rgba(240,238,255,0.25)", marginTop: 8, lineHeight: 1.5 }}>MP3, WAV, M4A — 15–30s expressive speech works best</p>
          </div>

          {cloned && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 9, background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: "10px 14px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{ fontSize: 13, color: "#4ade80", fontWeight: 500 }}>Voice cloned — ready to use</span>
              </div>
              <select value={lang} onChange={onLangChange} className="podify-select-sm">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </>
          )}
        </>
      )}

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(240,238,255,0.35)", letterSpacing: "0.07em" }}>PITCH</label>
          <span style={{ fontSize: 12, color: "#c4b5fd", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{(pitch / 100).toFixed(2)}×</span>
        </div>
        <input type="range" min="50" max="200" step="1" value={pitch} onChange={onPitchChange} />
      </div>
    </div>
  )
}

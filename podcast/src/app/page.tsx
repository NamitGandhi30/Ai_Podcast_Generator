"use client"

import { useState, useEffect } from "react"
import SpeakerCard from "@/components/speaker-card"

type SpeakerMode = "standard" | "clone"

const WAVEFORM_BARS: [number, number, number][] = [
  [42,0.9,0.00],[65,1.1,0.05],[38,0.8,0.10],[78,1.3,0.15],[52,1.0,0.20],[35,0.7,0.25],
  [70,0.9,0.30],[48,1.1,0.35],[60,0.8,0.40],[85,1.3,0.45],[40,1.0,0.50],[72,0.7,0.55],
  [55,0.9,0.60],[38,1.1,0.65],[80,0.8,0.70],[45,1.3,0.75],[65,1.0,0.80],[52,0.7,0.85],
  [75,0.9,0.90],[35,1.1,0.95],[68,0.8,1.00],[50,1.3,1.05],[42,1.0,1.10],[78,0.7,1.15],
  [60,0.9,1.20],[45,1.1,1.25],[72,0.8,1.30],[38,1.3,1.35],[55,1.0,1.40],[80,0.7,1.45],
  [42,0.9,1.50],[65,1.1,1.55],
]

const FEATURES = [
  { icon: <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>, title: "AI Script Generation", desc: "Generate engaging, contextually rich podcast scripts using state-of-the-art language models tailored to your topic." },
  { icon: <><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></>, title: "Neural Voice Synthesis", desc: "Convert scripts to natural-sounding audio with customizable voices, pitch control, and emotional tone." },
  { icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>, title: "Voice Cloning", desc: "Upload a short audio sample to clone any voice — narrate podcasts in your own unique voice or anyone's." },
  { icon: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>, title: "Multi-Speaker Dialogue", desc: "Simulate dynamic conversations between two speakers, each with their own distinct voice and persona." },
  { icon: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>, title: "AI Topic Recommender", desc: "Get intelligent topic suggestions based on trending subjects and your specific domain of interest." },
  { icon: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>, title: "Multi-Language Support", desc: "Create and narrate podcast content in multiple languages — English, Hindi, and more via voice cloning." },
]

const STEPS = [
  { icon: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>, step: "STEP 01", title: "Configure Your Episode", desc: "Enter your topic, choose the tone, configure voices — standard or cloned." },
  { icon: <><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>, step: "STEP 02", title: "AI Writes the Script", desc: "Our LLM crafts a professional, engaging script tailored to your topic and emotional tone." },
  { icon: <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></>, step: "STEP 03", title: "Listen & Download", desc: "Preview your synthesized podcast and download the finished episode in high quality audio." },
]

const TESTIMONIALS = [
  { quote: "The AI voice quality blew me away. My listeners couldn't tell it was generated — it sounded completely natural and professional.", name: "Sarah Chen", role: "Tech Podcast Host", initial: "S", grad: "linear-gradient(135deg,#7c3aed,#a78bfa)" },
  { quote: "Voice cloning is a game-changer. I uploaded a 20-second clip and it cloned my voice perfectly. Saves me hours of recording every week.", name: "Marcus Thompson", role: "Content Creator", initial: "M", grad: "linear-gradient(135deg,#4f46e5,#818cf8)" },
  { quote: "The topic recommender is brilliant. It suggested angles I never would have thought of, and the scripts it generates are genuinely engaging.", name: "Priya Patel", role: "Digital Journalist", initial: "P", grad: "linear-gradient(135deg,#6d28d9,#c4b5fd)" },
]

export default function PodcastApp() {
  const [scrolled, setScrolled] = useState(false)
  const [topic, setTopic] = useState("")
  const [location, setLocation] = useState("")
  const [emotion, setEmotion] = useState("Neutral")
  const [numSpeakers, setNumSpeakers] = useState<"1" | "2">("1")
  const [sp1Mode, setSp1Mode] = useState<SpeakerMode>("standard")
  const [sp1Voice, setSp1Voice] = useState("Rachel")
  const [sp1Pitch, setSp1Pitch] = useState(100)
  const [sp1Lang, setSp1Lang] = useState("en")
  const [sp1Cloned, setSp1Cloned] = useState(false)
  const [sp1VoiceId, setSp1VoiceId] = useState<string | null>(null)
  const [sp2Mode, setSp2Mode] = useState<SpeakerMode>("standard")
  const [sp2Voice, setSp2Voice] = useState("Clyde")
  const [sp2Pitch, setSp2Pitch] = useState(100)
  const [sp2Lang, setSp2Lang] = useState("en")
  const [sp2Cloned, setSp2Cloned] = useState(false)
  const [sp2VoiceId, setSp2VoiceId] = useState<string | null>(null)
  const [recOpen, setRecOpen] = useState(false)
  const [recTopic, setRecTopic] = useState("")
  const [recs, setRecs] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)
  const [script, setScript] = useState("")
  const [audioUrl, setAudioUrl] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const onScroll = () => {
      const s = window.scrollY > 48
      setScrolled(prev => (prev !== s ? s : prev))
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const generate = async () => {
    setGenerating(true)
    setError("")
    setScript("")
    setAudioUrl("")
    try {
      const speakers: Record<string, unknown> = {
        "Speaker 1": {
          voice: sp1Voice, pitch: sp1Pitch / 100, loudness: 1.0, emotion,
          ...(sp1Mode === "clone" && sp1VoiceId ? { cloned_voice_id: sp1VoiceId, language: sp1Lang } : {}),
        },
      }
      if (numSpeakers === "2") {
        speakers["Speaker 2"] = {
          voice: sp2Voice, pitch: sp2Pitch / 100, loudness: 1.0, emotion,
          ...(sp2Mode === "clone" && sp2VoiceId ? { cloned_voice_id: sp2VoiceId, language: sp2Lang } : {}),
        }
      }
      const scriptRes = await fetch("http://127.0.0.1:5000/generate_script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, location, emotion, duration: "5", speakers: Object.keys(speakers), mood: emotion }),
      })
      const scriptData = await scriptRes.json()
      if (scriptData.error) throw new Error(scriptData.error)
      setScript(scriptData.script)

      const audioRes = await fetch("http://127.0.0.1:5000/generate_audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script: scriptData.script, speakers }),
      })
      if (!audioRes.ok) throw new Error(await audioRes.text())
      setAudioUrl(URL.createObjectURL(await audioRes.blob()))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate. Ensure the backend (port 5000) is running.")
    } finally {
      setGenerating(false)
    }
  }

  const handleSp1Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append("reference_audio", file)
    try {
      const res = await fetch("http://127.0.0.1:5000/clone-voice", { method: "POST", body: fd })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSp1VoiceId(data.voice_id)
      setSp1Cloned(true)
    } catch (e: unknown) {
      setError("Voice clone upload failed: " + (e instanceof Error ? e.message : "Unknown error"))
    }
  }

  const handleSp2Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append("reference_audio", file)
    try {
      const res = await fetch("http://127.0.0.1:5000/clone-voice", { method: "POST", body: fd })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSp2VoiceId(data.voice_id)
      setSp2Cloned(true)
    } catch (e: unknown) {
      setError("Voice clone upload failed: " + (e instanceof Error ? e.message : "Unknown error"))
    }
  }

  const getRecommendations = async () => {
    if (!recTopic.trim()) return
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: recTopic }),
      })
      const data = await res.json()
      setRecs(data.topics || [])
    } catch {
      setRecs(["The Future of Renewable Energy", "AI in Healthcare", "Remote Work Culture", "Space Exploration 2050", "Digital Mental Health"])
    }
  }

  const isSolo = numSpeakers === "1"
  const isDuo = numSpeakers === "2"
  const canGen = topic.trim() !== "" && !generating

  return (
    <div style={{ background: "#06080f", color: "#f0eeff", fontFamily: "'DM Sans',system-ui,sans-serif", WebkitFontSmoothing: "antialiased", overflowX: "hidden" }}>

      {/* ── NAV ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, height: 70, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 52px", transition: "background 0.4s,backdrop-filter 0.4s,border-bottom 0.4s", background: scrolled ? "rgba(6,8,15,0.94)" : "transparent", backdropFilter: scrolled ? "blur(22px) saturate(180%)" : "none", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(124,58,237,0.4)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>
          </div>
          <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 19, fontWeight: 700, letterSpacing: "-0.02em" }}>Podify</span>
          <span style={{ fontSize: 11, color: "rgba(139,92,246,0.85)", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.22)", borderRadius: 100, padding: "2px 8px", fontWeight: 500, letterSpacing: "0.06em" }}>AI</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          {["Studio:#create","Features:#features","How It Works:#how"].map(item => {
            const [label, href] = item.split(":")
            return <a key={href} href={href} className="nav-link" style={{ color: "rgba(240,238,255,0.55)", textDecoration: "none", fontSize: 14, fontWeight: 500, letterSpacing: "0.01em" }}>{label}</a>
          })}
        </div>
        <a href="#create" className="cta-primary" style={{ background: "#8b5cf6", color: "white", padding: "10px 22px", borderRadius: 50, fontSize: 13, fontWeight: 600, textDecoration: "none", letterSpacing: "0.02em", boxShadow: "0 4px 16px rgba(139,92,246,0.35)", display: "flex", alignItems: "center", gap: 7 }}>
          Start Creating
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </nav>

      {/* ── HERO ── */}
      <section id="hero" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 80px", position: "relative", overflow: "hidden", background: "radial-gradient(ellipse at 18% 55%,rgba(124,58,237,0.16) 0%,transparent 52%),radial-gradient(ellipse at 85% 15%,rgba(168,85,247,0.08) 0%,transparent 48%),radial-gradient(ellipse at 60% 90%,rgba(76,29,149,0.1) 0%,transparent 40%),#06080f" }}>
        <div style={{ position: "absolute", width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.11) 0%,transparent 70%)", top: -120, left: -200, animation: "floatOrb 9s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle,rgba(168,85,247,0.07) 0%,transparent 70%)", bottom: 40, right: -100, animation: "floatOrb 12s ease-in-out infinite 2s", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,0.09) 0%,transparent 70%)", top: "35%", right: "8%", animation: "floatOrb 7s ease-in-out infinite 0.8s", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 740 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.22)", borderRadius: 100, padding: "6px 18px", marginBottom: 36 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#8b5cf6", animation: "pulse 1.8s ease-in-out infinite", display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#c4b5fd", letterSpacing: "0.08em", fontWeight: 500 }}>AI-POWERED PODCAST STUDIO</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(50px,8vw,92px)", fontWeight: 700, lineHeight: 1.03, letterSpacing: "-0.028em", marginBottom: 28 }}>
            Your Voice,<br />
            <em style={{ fontStyle: "italic", background: "linear-gradient(135deg,#8b5cf6,#c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Amplified</em>
            <span style={{ display: "block", marginTop: 4 }}> by AI.</span>
          </h1>
          <p style={{ fontSize: "clamp(15px,2vw,18px)", color: "rgba(240,238,255,0.5)", maxWidth: 510, margin: "0 auto 44px", lineHeight: 1.75, fontWeight: 300 }}>
            Generate studio-quality episodes with AI-written scripts and neural voice synthesis — including your own cloned voice.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 72 }}>
            <a href="#create" className="cta-primary" style={{ background: "#8b5cf6", color: "white", padding: "15px 34px", borderRadius: 50, fontWeight: 600, fontSize: 15, textDecoration: "none", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 6px 22px rgba(139,92,246,0.38)", letterSpacing: "0.01em" }}>
              Start Creating
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <a href="#how" className="cta-ghost" style={{ background: "transparent", color: "rgba(240,238,255,0.72)", padding: "15px 34px", borderRadius: 50, fontWeight: 500, fontSize: 15, textDecoration: "none", border: "1px solid rgba(255,255,255,0.13)", letterSpacing: "0.01em" }}>How It Works</a>
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 3, height: 80, opacity: 0.82 }}>
            {WAVEFORM_BARS.map((b, i) => (
              <div key={i} style={{ width: 3, height: b[0], background: i % 3 === 0 ? "linear-gradient(to top,#7c3aed,#c4b5fd)" : "linear-gradient(to top,rgba(139,92,246,0.5),rgba(196,181,253,0.28))", borderRadius: 2, transformOrigin: "center", animation: `waveBar ${b[1]}s ${b[2]}s ease-in-out infinite` }} />
            ))}
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 0.28 }}>
          <span style={{ fontSize: 10, letterSpacing: "0.14em" }}>SCROLL</span>
          <div style={{ width: 1, height: 28, background: "linear-gradient(to bottom,rgba(240,238,255,0.5),transparent)" }} />
        </div>
      </section>

      {/* ── STUDIO ── */}
      <section id="create" style={{ padding: "100px 52px", background: "linear-gradient(180deg,#06080f 0%,#0a0c1e 100%)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 100, padding: "5px 16px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, color: "#c4b5fd", letterSpacing: "0.1em", fontWeight: 600 }}>STUDIO</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(34px,5vw,54px)", fontWeight: 700, letterSpacing: "-0.022em", marginBottom: 14 }}>Create Your Podcast</h2>
            <p style={{ color: "rgba(240,238,255,0.42)", fontSize: 17, fontWeight: 300, maxWidth: 440, margin: "0 auto" }}>Configure your episode, choose voices, and let the AI handle the rest.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }}>
            {/* Controls */}
            <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 24, padding: 30, display: "flex", flexDirection: "column", gap: 22 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", color: "rgba(240,238,255,0.4)" }}>STUDIO CONTROLS</h3>

              {/* Recommender */}
              <div>
                <button onClick={() => setRecOpen(p => !p)} style={{ width: "100%", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 12, padding: "11px 16px", color: "#c4b5fd", fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.03em", transition: "background 0.2s" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    AI Topic Recommender
                  </span>
                  <svg width="11" height="11" viewBox="0 0 12 8" fill="none" style={{ transition: "transform 0.2s", transform: recOpen ? "rotate(180deg)" : "rotate(0deg)" }}><path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                {recOpen && (
                  <div style={{ marginTop: 10, background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.14)", borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input value={recTopic} onChange={e => setRecTopic(e.target.value)} placeholder="Enter a broad subject area…" className="podify-input-sm" style={{ flex: 1 }} />
                      <button onClick={getRecommendations} style={{ background: "#8b5cf6", color: "white", border: "none", borderRadius: 10, padding: "10px 15px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'DM Sans',sans-serif" }}>Suggest</button>
                    </div>
                    {recs.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                        {recs.map((rec, i) => (
                          <button key={i} onClick={() => { setTopic(rec); setRecOpen(false) }} className="rec-chip" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.22)", borderRadius: 8, padding: "6px 13px", color: "#c4b5fd", fontSize: 12, fontWeight: 500, fontFamily: "'DM Sans',sans-serif" }}>{rec}</button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(240,238,255,0.38)", letterSpacing: "0.09em", marginBottom: 8 }}>PODCAST TOPIC</label>
                <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. The Future of Renewable Energy" className="podify-input" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(240,238,255,0.38)", letterSpacing: "0.09em", marginBottom: 8 }}>LOCATION</label>
                  <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Studio, Home…" className="podify-input" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(240,238,255,0.38)", letterSpacing: "0.09em", marginBottom: 8 }}>TONE</label>
                  <select value={emotion} onChange={e => setEmotion(e.target.value)} className="podify-select">
                    {["Neutral","Professional","Happy","Excited","Calm","Sad","Angry"].map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(240,238,255,0.38)", letterSpacing: "0.09em", marginBottom: 10 }}>SPEAKERS</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {(["1","2"] as const).map(n => (
                    <button key={n} onClick={() => setNumSpeakers(n)} style={{ flex: 1, padding: 11, borderRadius: 11, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1px solid ${numSpeakers === n ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.08)"}`, background: numSpeakers === n ? "rgba(139,92,246,0.18)" : "rgba(255,255,255,0.04)", color: numSpeakers === n ? "#c4b5fd" : "rgba(240,238,255,0.45)", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s" }}>{n === "1" ? "Solo" : "Duo"}</button>
                  ))}
                </div>
              </div>

              <SpeakerCard label="SPEAKER 1" mode={sp1Mode} voice={sp1Voice} pitch={sp1Pitch} lang={sp1Lang} cloned={sp1Cloned}
                onSetStd={() => setSp1Mode("standard")} onSetClone={() => setSp1Mode("clone")}
                onVoiceChange={e => setSp1Voice(e.target.value)} onPitchChange={e => setSp1Pitch(parseInt(e.target.value))}
                onLangChange={e => setSp1Lang(e.target.value)} onUpload={handleSp1Upload} />

              {isDuo && (
                <SpeakerCard label="SPEAKER 2" mode={sp2Mode} voice={sp2Voice} pitch={sp2Pitch} lang={sp2Lang} cloned={sp2Cloned}
                  onSetStd={() => setSp2Mode("standard")} onSetClone={() => setSp2Mode("clone")}
                  onVoiceChange={e => setSp2Voice(e.target.value)} onPitchChange={e => setSp2Pitch(parseInt(e.target.value))}
                  onLangChange={e => setSp2Lang(e.target.value)} onUpload={handleSp2Upload} />
              )}

              {error && (
                <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "13px 16px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span style={{ fontSize: 13, color: "#f87171", lineHeight: 1.5 }}>{error}</span>
                </div>
              )}

              <button onClick={generate} disabled={!canGen} style={{ width: "100%", background: canGen ? "linear-gradient(135deg,#6d28d9,#9f7aea)" : "rgba(109,40,217,0.35)", color: "white", border: "none", borderRadius: 14, padding: 16, fontSize: 15, fontWeight: 600, cursor: canGen ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.02em", transition: "transform 0.2s,box-shadow 0.2s", boxShadow: canGen ? "0 8px 28px rgba(109,40,217,0.38)" : "none" }}>
                {generating ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 2, height: 16 }}>
                    {[0.7,0.9,0.8,0.75].map((d,i) => (
                      <div key={i} style={{ width: 2, height: 12, background: "rgba(255,255,255,0.75)", borderRadius: 1, transformOrigin: "center", animation: `waveBar ${d}s ${(i*0.12).toFixed(2)}s ease-in-out infinite` }} />
                    ))}
                  </div>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                )}
                {generating ? "Generating Episode…" : "Generate Podcast"}
              </button>
            </div>

            {/* Output */}
            <div style={{ display: "flex", flexDirection: "column", gap: 22, position: "sticky", top: 90 }}>
              {!script && !audioUrl && (
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 24, padding: "64px 40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
                  <div style={{ width: 68, height: 68, borderRadius: 20, background: "rgba(139,92,246,0.09)", border: "1px solid rgba(139,92,246,0.18)", display: "flex", alignItems: "center", justifyContent: "center", animation: "glow 3s ease-in-out infinite" }}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 22, fontWeight: 600, color: "rgba(240,238,255,0.6)", marginBottom: 8 }}>Your episode awaits</h3>
                    <p style={{ fontSize: 14, color: "rgba(240,238,255,0.28)", maxWidth: 240, lineHeight: 1.65, fontWeight: 300, margin: "0 auto" }}>Configure your settings on the left, then hit Generate to create your episode.</p>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
                    {["AI Script","Neural Voice","Instant Download"].map(tag => (
                      <span key={tag} style={{ fontSize: 11, background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)", color: "rgba(196,181,253,0.6)", borderRadius: 6, padding: "4px 10px", letterSpacing: "0.04em" }}>{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {script && (
                <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 26 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(139,92,246,0.14)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: "rgba(240,238,255,0.8)" }}>Generated Script</h3>
                  </div>
                  <div style={{ maxHeight: 300, overflowY: "auto", background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: 18 }}>
                    <p style={{ fontSize: 13, color: "rgba(240,238,255,0.68)", lineHeight: 1.85, whiteSpace: "pre-wrap", fontWeight: 300 }}>{script}</p>
                  </div>
                </div>
              )}

              {audioUrl && (
                <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 26 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(139,92,246,0.14)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: "rgba(240,238,255,0.8)" }}>Audio Preview</h3>
                  </div>
                  <audio src={audioUrl} controls style={{ width: "100%", accentColor: "#8b5cf6", borderRadius: 8 }} />
                  <a href={audioUrl} download="podify-episode.wav" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 14, padding: 11, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 11, color: "#c4b5fd", textDecoration: "none", fontSize: 13, fontWeight: 500, transition: "background 0.2s" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Download Episode
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "100px 52px", background: "#06080f" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 100, padding: "5px 16px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, color: "#c4b5fd", letterSpacing: "0.1em", fontWeight: 600 }}>CAPABILITIES</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(34px,5vw,54px)", fontWeight: 700, letterSpacing: "-0.022em", marginBottom: 14 }}>Everything You Need</h2>
            <p style={{ color: "rgba(240,238,255,0.42)", fontSize: 17, fontWeight: 300, maxWidth: 420, margin: "0 auto" }}>A complete toolkit for AI-powered podcast production.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: "linear-gradient(135deg,rgba(124,58,237,0.28),rgba(139,92,246,0.12))", border: "1px solid rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{f.icon}</svg>
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: "rgba(240,238,255,0.42)", lineHeight: 1.7, fontWeight: 300 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding: "100px 52px", background: "linear-gradient(180deg,#06080f 0%,#0a0c1e 100%)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 100, padding: "5px 16px", marginBottom: 18 }}>
            <span style={{ fontSize: 11, color: "#c4b5fd", letterSpacing: "0.1em", fontWeight: 600 }}>PROCESS</span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(34px,5vw,54px)", fontWeight: 700, letterSpacing: "-0.022em", marginBottom: 14 }}>How It Works</h2>
          <p style={{ color: "rgba(240,238,255,0.42)", fontSize: 17, fontWeight: 300, marginBottom: 72 }}>Three steps from idea to polished episode.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, position: "relative" }}>
            <div style={{ position: "absolute", top: 35, left: "22%", right: "22%", height: 1, background: "linear-gradient(90deg,transparent,rgba(139,92,246,0.35),transparent)" }} />
            {STEPS.map((s, i) => (
              <div key={i} className="step-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "32px 22px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 22 }}>
                <div style={{ width: 70, height: 70, borderRadius: "50%", background: "linear-gradient(135deg,#6d28d9,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(109,40,217,0.4)", position: "relative", zIndex: 1 }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
                </div>
                <div>
                  <span style={{ display: "block", fontSize: 10, color: "rgba(139,92,246,0.75)", letterSpacing: "0.12em", fontWeight: 600, marginBottom: 9 }}>{s.step}</span>
                  <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 10 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: "rgba(240,238,255,0.42)", lineHeight: 1.7, fontWeight: 300 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={{ padding: "100px 52px", background: "#06080f" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 100, padding: "5px 16px", marginBottom: 18 }}>
              <span style={{ fontSize: 11, color: "#c4b5fd", letterSpacing: "0.1em", fontWeight: 600 }}>TESTIMONIALS</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(34px,5vw,54px)", fontWeight: 700, letterSpacing: "-0.022em", marginBottom: 14 }}>What Creators Say</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testi-card" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ color: "#c4a843", fontSize: 15, letterSpacing: 2 }}>★★★★★</div>
                <p style={{ fontSize: 14, color: "rgba(240,238,255,0.58)", lineHeight: 1.75, fontWeight: 300, fontStyle: "italic" }}>&quot;{t.quote}&quot;</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 4, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: t.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{t.initial}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#f0eeff" }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(240,238,255,0.38)", marginTop: 2 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "60px 52px 40px", background: "#06080f" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(124,58,237,0.35)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                </div>
                <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 17, fontWeight: 700 }}>Podify AI</span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(240,238,255,0.36)", lineHeight: 1.7, fontWeight: 300 }}>Create studio-quality AI podcast episodes in minutes — with your own voice or any of our expressive presets.</p>
              <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
                {[
                  <><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></>,
                  <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></>,
                  <><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></>,
                ].map((icon, i) => (
                  <a key={i} href={i === 2 ? "https://github.com/NamitGandhi30/Ai_Podcast_Generator" : "#"} target={i === 2 ? "_blank" : undefined} rel={i === 2 ? "noreferrer" : undefined} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", transition: "background 0.2s" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(240,238,255,0.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
                  </a>
                ))}
              </div>
            </div>

            {[
              { heading: "PRODUCT", links: [["Create Podcast","#create"],["Features","#features"],["How It Works","#how"],["Testimonials","#testimonials"]] },
              { heading: "RESOURCES", links: [["Documentation","#"],["API Reference","#"],["Changelog","#"]] },
              { heading: "CONTACT", links: [] },
            ].map(col => (
              <div key={col.heading} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(240,238,255,0.3)", letterSpacing: "0.1em" }}>{col.heading}</span>
                {col.heading === "CONTACT" ? (
                  <>
                    <span style={{ fontSize: 13, color: "rgba(240,238,255,0.42)", display: "flex", alignItems: "center", gap: 8 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      contact@podifyai.com
                    </span>
                    <a href="#" className="footer-link" style={{ fontSize: 13, color: "rgba(240,238,255,0.48)", textDecoration: "none" }}>Privacy Policy</a>
                    <a href="#" className="footer-link" style={{ fontSize: 13, color: "rgba(240,238,255,0.48)", textDecoration: "none" }}>Terms of Service</a>
                  </>
                ) : col.links.map(([label, href]) => (
                  <a key={label} href={href} className="footer-link" style={{ fontSize: 13, color: "rgba(240,238,255,0.48)", textDecoration: "none" }}>{label}</a>
                ))}
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "rgba(240,238,255,0.22)" }}>© 2025 Podify AI. All rights reserved.</span>
            <span style={{ fontSize: 12, color: "rgba(240,238,255,0.2)" }}>Built with Generative AI · Next.js · Flask</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

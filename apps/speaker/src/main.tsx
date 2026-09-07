import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

type Lang = 'tr' | 'en'
type Mode = 'idle' | 'water' | 'speaker' | 'left' | 'right'

const copy = {
  tr: {
    title: 'DOKUNTAG Speaker',
    subtitle: 'Hoparlörü test et. Suyu çıkarmaya yardımcı ol.',
    water: 'Suyu Çıkar',
    waterHint: 'Düşük frekanslı titreşimlerle hoparlör ızgarasındaki suyun dışarı atılmasına yardımcı olur.',
    speaker: 'Hoparlör Testi',
    speakerHint: 'Kısa bir test tonu çalar.',
    left: 'Sol Kanal',
    right: 'Sağ Kanal',
    stop: 'Durdur',
    running: 'Çalışıyor',
    ready: 'Hazır',
    seconds: 'sn',
    privacy: 'Hesap yok · İnternet yok · Reklam yok · Veri toplanmaz',
    safety: 'Sesi rahat bir seviyede tut. Bu araç fiziksel hasarı onarmaz ve su çıkarma sonucu garanti etmez.',
    waterDone: 'Tamamlandı. Sesi tekrar kontrol edebilirsin.',
  },
  en: {
    title: 'DOKUNTAG Speaker',
    subtitle: 'Test your speaker. Help eject trapped water.',
    water: 'Eject Water',
    waterHint: 'Uses low-frequency vibration to help move water out of the speaker grille.',
    speaker: 'Speaker Test',
    speakerHint: 'Plays a short test tone.',
    left: 'Left Channel',
    right: 'Right Channel',
    stop: 'Stop',
    running: 'Running',
    ready: 'Ready',
    seconds: 'sec',
    privacy: 'No account · No internet · No ads · No data collection',
    safety: 'Keep volume at a comfortable level. This tool cannot repair hardware and water-ejection results are not guaranteed.',
    waterDone: 'Finished. You can test the speaker again.',
  },
} as const

function App() {
  const [lang, setLang] = useState<Lang>('tr')
  const [mode, setMode] = useState<Mode>('idle')
  const [remaining, setRemaining] = useState(0)
  const [message, setMessage] = useState('')
  const ctxRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<AudioNode[]>([])
  const timerRef = useRef<number | null>(null)
  const endTimerRef = useRef<number | null>(null)
  const t = copy[lang]

  const clearTimers = () => {
    if (timerRef.current) window.clearInterval(timerRef.current)
    if (endTimerRef.current) window.clearTimeout(endTimerRef.current)
    timerRef.current = null
    endTimerRef.current = null
  }

  const stopAudio = () => {
    clearTimers()
    for (const node of nodesRef.current) {
      try {
        if ('stop' in node && typeof (node as OscillatorNode).stop === 'function') {
          ;(node as OscillatorNode).stop()
        }
        node.disconnect()
      } catch {
        // Node may already be stopped/disconnected.
      }
    }
    nodesRef.current = []
    setMode('idle')
    setRemaining(0)
  }

  useEffect(() => stopAudio, [])

  const ensureContext = async () => {
    if (!ctxRef.current) ctxRef.current = new AudioContext()
    if (ctxRef.current.state === 'suspended') await ctxRef.current.resume()
    return ctxRef.current
  }

  const startCountdown = (seconds: number, onDone?: () => void) => {
    const started = Date.now()
    setRemaining(seconds)
    timerRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - started) / 1000)
      setRemaining(Math.max(0, seconds - elapsed))
    }, 250)
    endTimerRef.current = window.setTimeout(() => {
      stopAudio()
      onDone?.()
    }, seconds * 1000)
  }

  const playTone = async (targetMode: Mode, frequency: number, seconds = 3, pan = 0) => {
    stopAudio()
    setMessage('')
    const ctx = await ensureContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const panner = ctx.createStereoPanner()

    osc.type = 'sine'
    osc.frequency.value = frequency
    gain.gain.value = 0.12
    panner.pan.value = pan

    osc.connect(gain)
    gain.connect(panner)
    panner.connect(ctx.destination)
    nodesRef.current = [osc, gain, panner]
    setMode(targetMode)
    osc.start()
    startCountdown(seconds)
  }

  const playWaterEject = async () => {
    stopAudio()
    setMessage('')
    const ctx = await ensureContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    gain.gain.value = 0.14
    osc.connect(gain)
    gain.connect(ctx.destination)

    const now = ctx.currentTime
    const duration = 30
    osc.frequency.setValueAtTime(165, now)
    for (let i = 0; i < duration; i += 2) {
      osc.frequency.linearRampToValueAtTime(210, now + i + 1)
      osc.frequency.linearRampToValueAtTime(150, now + i + 2)
    }

    nodesRef.current = [osc, gain]
    setMode('water')
    osc.start()
    startCountdown(duration, () => setMessage(t.waterDone))
  }

  const activeLabel = mode === 'water' ? t.water : mode === 'speaker' ? t.speaker : mode === 'left' ? t.left : mode === 'right' ? t.right : t.ready

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <div className="brand">DOKUNTAG</div>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
        <button className="lang" onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')} aria-label="Change language">
          {lang === 'tr' ? 'EN' : 'TR'}
        </button>
      </header>

      <section className="status-card" aria-live="polite">
        <span className={`status-dot ${mode !== 'idle' ? 'active' : ''}`} />
        <div>
          <strong>{mode === 'idle' ? t.ready : `${t.running}: ${activeLabel}`}</strong>
          {remaining > 0 && <span>{remaining} {t.seconds}</span>}
        </div>
      </section>

      <section className="hero-card">
        <div className="speaker-icon" aria-hidden="true">◉</div>
        <button className="primary" onClick={mode === 'water' ? stopAudio : playWaterEject}>
          {mode === 'water' ? t.stop : t.water}
        </button>
        <p>{t.waterHint}</p>
      </section>

      <section className="grid">
        <article className="tool-card">
          <h2>{t.speaker}</h2>
          <p>{t.speakerHint}</p>
          <button onClick={() => playTone('speaker', 440, 3, 0)}>{t.speaker}</button>
        </article>

        <article className="tool-card">
          <h2>L / R</h2>
          <p>{t.left} · {t.right}</p>
          <div className="split-actions">
            <button onClick={() => playTone('left', 440, 2, -1)}>{t.left}</button>
            <button onClick={() => playTone('right', 440, 2, 1)}>{t.right}</button>
          </div>
        </article>
      </section>

      {mode !== 'idle' && mode !== 'water' && (
        <button className="stop-wide" onClick={stopAudio}>{t.stop}</button>
      )}

      {message && <div className="message">{message}</div>}

      <footer>
        <p>{t.privacy}</p>
        <small>{t.safety}</small>
      </footer>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

import { useCallback, useEffect, useRef, useState } from 'react'
import { markIntroPlayed } from './introUtils.js'
import './IntroLoader.css'

// ===================== Easy settings =====================
const VIDEO_DESKTOP = '/intro.mp4' // your video, in public/intro.mp4. Set to null to use only the spotlight.
const VIDEO_MOBILE = null // keep null so phones show your 16:9 video centred on black
const VIDEO_START_TIMEOUT = 3000 // if the video hasn't started by then, the spotlight plays instead
const VIDEO_MAX = 10000 // never let the video run longer than this (ms)

const MIN_SHOW = 2000 // ms the spotlight plays (about 2 seconds)
const ASSET_CAP = 3000 // never wait longer than this for fonts/photo
const FADE = 650 // ms to fade into the homepage (matches the CSS)
const PHOTO = '/images/barath.png' // preloaded so the homepage appears fully ready
// =========================================================

// Picks the portrait video on phones (if you provided one), otherwise the main video
function pickVideo() {
  if (!VIDEO_DESKTOP) return null
  const phone = window.matchMedia('(max-width: 820px) and (orientation: portrait)').matches
  return (phone && VIDEO_MOBILE) || VIDEO_DESKTOP
}

// Resolves when fonts, your photo and the page itself are ready
function assetsReady() {
  const fonts = document.fonts?.ready ?? Promise.resolve()

  const photo = new Promise((resolve) => {
    const img = new Image()
    img.onload = img.onerror = resolve
    img.src = PHOTO
  })

  const pageLoaded =
    document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise((resolve) => window.addEventListener('load', resolve, { once: true }))

  return Promise.all([fonts, photo, pageLoaded])
}

function IntroLoader({ onReveal }) {
  const [phase, setPhase] = useState('playing') // playing -> leaving -> gone
  const [src] = useState(pickVideo)
  const [mode, setMode] = useState(src ? 'video' : 'spot') // video, or the spotlight backup

  const videoRef = useRef(null)
  const startedRef = useRef(false) // has the video actually started playing?
  const doneRef = useRef(false) // so we only ever finish once
  const leaveTimer = useRef(null)

  // Fade out and reveal the homepage (once the fonts and photo are ready)
  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true

    const cap = new Promise((resolve) => setTimeout(resolve, ASSET_CAP))
    Promise.race([assetsReady(), cap]).then(() => {
      markIntroPlayed()
      document.body.style.overflow = ''
      onReveal() // mounts the homepage now, so its own entrance plays as we fade out
      setPhase('leaving')
      leaveTimer.current = setTimeout(() => setPhase('gone'), FADE)
    })
  }, [onReveal])

  // No scrolling behind the intro
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      clearTimeout(leaveTimer.current)
    }
  }, [])

  // Timing for whichever mode is showing
  useEffect(() => {
    const timers = []

    if (mode === 'video') {
      const v = videoRef.current
      if (v) {
        v.muted = true // autoplay is only allowed when muted
        const p = v.play()
        if (p && p.catch) p.catch(() => setMode('spot')) // autoplay blocked: use the spotlight
      }
      timers.push(
        setTimeout(() => {
          if (!startedRef.current) setMode('spot') // video never started
        }, VIDEO_START_TIMEOUT),
      )
      timers.push(setTimeout(finish, VIDEO_MAX))
    } else {
      timers.push(setTimeout(finish, MIN_SHOW))
    }

    return () => timers.forEach(clearTimeout)
  }, [mode, finish])

  if (phase === 'gone') return null

  return (
    <div
      className={`loader ${phase === 'leaving' ? 'is-leaving' : ''}`}
      aria-hidden="true"
      onClick={mode === 'video' ? finish : undefined} // tap or click skips the video
    >
      {mode === 'video' && (
        <video
          ref={videoRef}
          className="loader__video"
          src={src}
          autoPlay
          muted
          playsInline
          preload="auto"
          onPlaying={() => {
            startedRef.current = true
          }}
          onEnded={finish}
          onError={() => (startedRef.current ? finish() : setMode('spot'))}
        />
      )}

      {mode === 'spot' && (
        <>
          <div className="loader__spot">
            <div className="loader__glow">
              <div className="loader__beam">
                <div className="loader__cone" />
              </div>
              <div className="loader__pool" />
            </div>
            <div className="loader__floor" />
          </div>

          {/* Studio-style stage microphone */}
          <svg className="loader__mic" viewBox="0 0 200 490">
            <defs>
              <radialGradient id="mic-head" cx="36%" cy="30%" r="75%">
                <stop offset="0" stopColor="#f3ece0" />
                <stop offset="0.35" stopColor="#a79d90" />
                <stop offset="0.75" stopColor="#4a443d" />
                <stop offset="1" stopColor="#1b1814" />
              </radialGradient>

              <pattern id="mic-mesh" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <path d="M0 0H8M0 0V8" stroke="rgba(0,0,0,0.35)" strokeWidth="1.2" />
              </pattern>

              <linearGradient id="mic-body" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#1a1714" />
                <stop offset="0.22" stopColor="#5c5348" />
                <stop offset="0.38" stopColor="#d9cfbf" />
                <stop offset="0.55" stopColor="#8b8072" />
                <stop offset="0.8" stopColor="#3a342d" />
                <stop offset="1" stopColor="#14110f" />
              </linearGradient>

              <linearGradient id="mic-ring" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#25201b" />
                <stop offset="0.3" stopColor="#bfb4a2" />
                <stop offset="0.45" stopColor="#f1e8d8" />
                <stop offset="0.7" stopColor="#6f655a" />
                <stop offset="1" stopColor="#1e1a16" />
              </linearGradient>

              {/* Light falls off towards the bottom of the microphone */}
              <linearGradient id="mic-shade" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="490">
                <stop offset="0" stopColor="#000" stopOpacity="0" />
                <stop offset="0.5" stopColor="#000" stopOpacity="0.05" />
                <stop offset="1" stopColor="#000" stopOpacity="0.6" />
              </linearGradient>

              <filter id="mic-blur">
                <feGaussianBlur stdDeviation="5" />
              </filter>
            </defs>

            {/* Handle */}
            <path d="M58 184 H142 L129 462 Q100 486 71 462 Z" fill="url(#mic-body)" />
            <rect x="60" y="222" width="80" height="6" rx="2" fill="url(#mic-ring)" />
            <rect x="69" y="428" width="62" height="6" rx="2" fill="url(#mic-ring)" />
            <path d="M58 184 H142 L129 462 Q100 486 71 462 Z" fill="url(#mic-shade)" />

            {/* Mesh head */}
            <circle cx="100" cy="100" r="78" fill="url(#mic-head)" />
            <circle cx="100" cy="100" r="78" fill="url(#mic-mesh)" />
            <ellipse
              cx="72"
              cy="62"
              rx="26"
              ry="14"
              fill="#fff"
              opacity="0.35"
              filter="url(#mic-blur)"
              transform="rotate(-30 72 62)"
            />
            <circle cx="100" cy="100" r="78" fill="url(#mic-shade)" />

            {/* Collar between head and handle */}
            <rect x="40" y="166" width="120" height="22" rx="8" fill="url(#mic-ring)" />
          </svg>
        </>
      )}
    </div>
  )
}

export default IntroLoader
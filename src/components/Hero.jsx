import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import './Hero.css'

const PHOTO = '/images/barath.png' // your transparent cutout
const VIEW_W = 1000
const VIEW_H = 800

// ===================== Easy settings =====================
// Arrow animation (milliseconds)
const ARROW_START = 400 // wait before the first arrow leaves
const ARROW_STAGGER = 200 // gap between one arrow and the next
const ARROW_DURATION = 1100 // time one arrow takes to reach its role

// Photo hover effect (only runs while hovered or touched)
const HOVER_SCALE = 1.035 // pop-up size (1.035 = 3.5% bigger). Try 1.02 for subtler.
const HOVER_WIGGLE_DEG = 0.9 // how far it sways side to side
const HOVER_WIGGLE_PERIOD = 2400 // ms for one full sway (bigger = slower)
const TOUCH_HOLD = 700 // ms the effect stays after a quick tap on touch screens

// Arrow shape
const LEN_X = 100 // how far each arrow reaches sideways past your outline
const HEAD = 16 // length of each arrowhead wing
const HEAD_ANGLE = 30 // angle of each wing from the shaft (degrees)
const STRAIGHT = 44 // length of the straight final part of every arrow
const LEAN = 20 // degrees the final part leans outward from vertical
// =========================================================

// ===================== Social links =====================
// REPLACE these two addresses with your own profile links.
const SOCIALS = [
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/your-username' },
  { name: 'Instagram', href: 'https://www.instagram.com/your-username' },
]
// ========================================================

// The three rows of arrows.
// f: how far down the photo the arrows start (0 = top, 1 = bottom)
// rise: climb (negative) or drop (positive)
const ROWS = [
  { f: 0.22, rise: -90 },
  { f: 0.5, rise: -90 },
  { f: 0.74, rise: 90 },
]

// side: 'l' = left of you, 'r' = right of you. row: which of the three rows
const ROLES = [
  { id: 'dev', text: ['Full Stack', 'Developer'], row: 0, side: 'l' },
  { id: 'ai', text: ['AI Engineer'], row: 0, side: 'r' },
  { id: 'content', text: ['Content Creator'], row: 1, side: 'l' },
  { id: 'director', text: ['Director of', 'Operations'], row: 1, side: 'r' },
  { id: 'emcee', text: ['Emcee'], row: 2, side: 'l' },
  { id: 'dancer', text: ['Dancer'], row: 2, side: 'r' },
]

const NAV = ['Home', 'About', 'Roles', 'Experience', 'Projects', 'Contact']

// Arrowhead: exact trigonometry, so both wings are identical mirror images around the shaft.
const HEAD_RAD = (HEAD_ANGLE * Math.PI) / 180
const WING_X = (-HEAD * Math.cos(HEAD_RAD)).toFixed(3)
const WING_Y = (HEAD * Math.sin(HEAD_RAD)).toFixed(3)
const HEAD_PATH = `M${WING_X} ${-WING_Y} L0 0 L${WING_X} ${WING_Y}`

// When the intro arrow animation is finished (the loop can then go idle)
const INTRO_END = ARROW_START + 5 * ARROW_STAGGER + ARROW_DURATION + 100

// Smooth start and finish
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Reads your PNG's transparency:
//  - rows: your left and right edge on each arrow row
//  - mask: the opaque pixels, used so the hover only reacts over YOU (not empty space)
function scanImage(img) {
  const W = 240
  const H = Math.round((W * img.naturalHeight) / img.naturalWidth)
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, W, H)
  const data = ctx.getImageData(0, 0, W, H).data

  const rows = ROWS.map((row) => {
    const y = Math.round(row.f * H)
    let min = W
    let max = -1
    for (let dy = -2; dy <= 2; dy++) {
      const yy = Math.min(H - 1, Math.max(0, y + dy))
      for (let x = 0; x < W; x++) {
        if (data[(yy * W + x) * 4 + 3] > 40) {
          if (x < min) min = x
          if (x > max) max = x
        }
      }
    }
    return max < 0 ? { l: 0.3, r: 0.7 } : { l: min / W, r: (max + 1) / W }
  })

  return { rows, mask: { data, W, H } }
}

const FALLBACK_EDGES = ROWS.map(() => ({ l: 0.3, r: 0.7 }))

function Hero() {
  const [open, setOpen] = useState(false)
  const [geo, setGeo] = useState(null)

  const stageRef = useRef(null)
  const personRef = useRef(null)
  const swayRef = useRef(null)
  const imgRef = useRef(null)
  const edgesRef = useRef(null)
  const maskRef = useRef(null)

  const lineRefs = useRef([])
  const headRefs = useRef([])
  const startRef = useRef(null) // when the intro began (never restarts on resize)

  // Hover state, shared with the animation loop
  const hoverRef = useRef({ target: 0, pop: 0, wob: 0, phase: 0, last: 0 })
  const kickRef = useRef(null) // wakes the animation loop up
  const holdTimer = useRef(null)

  // Works out where every arrow starts and ends.
  const layout = useCallback(() => {
    const stage = stageRef.current
    const person = personRef.current
    const img = imgRef.current
    const edges = edgesRef.current
    if (!stage || !person || !img || !edges) return

    const sw = stage.offsetWidth
    const imgW = img.offsetWidth
    const imgH = img.offsetHeight
    if (!sw || !imgW) return

    const k = VIEW_W / sw // grid units per pixel
    const left = (sw - person.offsetWidth) / 2
    const top = person.offsetTop

    const cx = (left + imgW / 2) * k // your centre line
    const bottom = (top + imgH) * k // the hover effect pivots here
    const gap = 5 * k // arrows start just outside your stroke
    const lean = (LEAN * Math.PI) / 180

    const rows = ROWS.map((row, i) => {
      const y = (top + row.f * imgH) * k
      const xl = (left + edges[i].l * imgW) * k - gap
      const xr = (left + edges[i].r * imgW) * k + gap
      const D = Math.max(cx - xl, xr - cx) + LEN_X
      return { y, xl, xr, D, ey: y + row.rise, dirY: row.rise < 0 ? -1 : 1 }
    })

    const arrows = ROLES.map((r) => {
      const g = rows[r.row]
      const isLeft = r.side === 'l'
      const sideSign = isLeft ? -1 : 1

      // Direction of the final straight part (mirrored left/right)
      const ux = sideSign * Math.sin(lean)
      const uy = g.dirY * Math.cos(lean)

      const ex = cx + sideSign * g.D
      const ey = g.ey

      return {
        id: r.id,
        sx: isLeft ? g.xl : g.xr,
        sy: g.y,
        ex,
        ey,
        bx: ex - ux * STRAIGHT,
        by: ey - uy * STRAIGHT,
        ux,
        uy,
      }
    })

    setGeo({ arrows, px: cx, py: bottom })
  }, [])

  const handleLoad = useCallback(() => {
    try {
      const scan = scanImage(imgRef.current)
      edgesRef.current = scan.rows
      maskRef.current = scan.mask
    } catch {
      edgesRef.current = FALLBACK_EDGES
      maskRef.current = null
    }
    layout()
  }, [layout])

  useEffect(() => {
    const img = imgRef.current
    if (img && img.complete && img.naturalWidth) handleLoad()

    const ro = new ResizeObserver(layout)
    ro.observe(stageRef.current)
    return () => ro.disconnect()
  }, [handleLoad, layout])

  // ---------- Hover / touch handling (photo only) ----------

  // Is the pointer over YOU (an opaque part of the cutout), not the empty box around it?
  const overPhoto = (e) => {
    const img = imgRef.current
    const m = maskRef.current
    if (!img) return false
    if (!m) return true
    const r = img.getBoundingClientRect()
    if (!r.width || !r.height) return false
    const x = Math.floor(((e.clientX - r.left) / r.width) * m.W)
    const y = Math.floor(((e.clientY - r.top) / r.height) * m.H)
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const xx = x + dx
        const yy = y + dy
        if (xx >= 0 && yy >= 0 && xx < m.W && yy < m.H && m.data[(yy * m.W + xx) * 4 + 3] > 40) {
          return true
        }
      }
    }
    return false
  }

  const setHover = (on) => {
    if (prefersReducedMotion()) return
    const next = on ? 1 : 0
    if (hoverRef.current.target === next) return
    hoverRef.current.target = next
    if (kickRef.current) kickRef.current()
  }

  const onPointerMove = (e) => {
    if (e.pointerType === 'touch') return
    setHover(overPhoto(e))
  }

  const onPointerDown = (e) => {
    if (e.pointerType !== 'touch') return
    clearTimeout(holdTimer.current)
    setHover(overPhoto(e))
  }

  const onPointerUp = (e) => {
    if (e.pointerType === 'touch') {
      // A quick tap keeps the effect visible for a moment
      clearTimeout(holdTimer.current)
      holdTimer.current = setTimeout(() => setHover(false), TOUCH_HOLD)
    } else {
      setHover(false)
    }
  }

  const onPointerLeave = (e) => {
    if (e.pointerType !== 'touch') setHover(false)
  }

  const onPointerCancel = () => {
    clearTimeout(holdTimer.current)
    setHover(false) // e.g. the visitor started scrolling
  }

  useEffect(() => () => clearTimeout(holdTimer.current), [])

  // ---------- The animation loop ----------
  // Runs during the intro and while the hover effect is active, then goes completely idle.
  useLayoutEffect(() => {
    if (!geo) return

    const reduce = prefersReducedMotion()
    if (startRef.current === null) startRef.current = performance.now()
    let raf = 0

    const frame = (now) => {
      raf = 0
      const st = hoverRef.current
      const dt = Math.min(64, now - (st.last || now))
      st.last = now
      const t = reduce ? Infinity : now - startRef.current

      // Pop-up follows quickly; the wiggle fades in a little later (pop first, then wiggle)
      const on = st.target === 1
      st.pop += (st.target - st.pop) * (1 - Math.exp(-dt / (on ? 150 : 240)))
      st.wob += (st.target - st.wob) * (1 - Math.exp(-dt / (on ? 500 : 260)))
      if (st.wob > 0.002) st.phase += dt

      const settled = !on && st.pop < 0.002 && st.wob < 0.002
      if (settled) {
        st.pop = 0
        st.wob = 0
        st.phase = 0
      }

      const s = 1 + (HOVER_SCALE - 1) * st.pop
      const theta = HOVER_WIGGLE_DEG * st.wob * Math.sin((st.phase * 2 * Math.PI) / HOVER_WIGGLE_PERIOD)

      if (swayRef.current) {
        swayRef.current.style.transform = settled ? 'none' : `rotate(${theta}deg) scale(${s})`
      }

      const rad = (theta * Math.PI) / 180
      const cos = Math.cos(rad)
      const sin = Math.sin(rad)

      geo.arrows.forEach((a, i) => {
        const line = lineRefs.current[i]
        const head = headRefs.current[i]
        if (!line || !head) return

        // Each arrow's start point stays attached to your outline as you pop and sway
        const dx = (a.sx - geo.px) * s
        const dy = (a.sy - geo.py) * s
        const sx = geo.px + dx * cos - dy * sin
        const sy = geo.py + dx * sin + dy * cos

        const c1x = sx + (a.bx - sx) * 0.55
        const c1y = sy
        const c2x = a.bx - a.ux * 50
        const c2y = a.by - a.uy * 50
        const f = (n) => n.toFixed(2)
        line.setAttribute(
          'd',
          `M${f(sx)} ${f(sy)} C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(a.bx)} ${f(a.by)} L${f(a.ex)} ${f(a.ey)}`,
        )

        // How far along its journey this arrow is (0 to 1)
        const local = Math.min(1, Math.max(0, (t - ARROW_START - i * ARROW_STAGGER) / ARROW_DURATION))

        if (local === 0) {
          line.style.opacity = 0
          head.style.opacity = 0
          return
        }

        const len = line.getTotalLength()
        const dist = len * easeInOut(local)
        line.style.opacity = 1
        line.style.strokeDasharray = `${len}`
        line.style.strokeDashoffset = `${len - dist}`

        // Head tip sits exactly on the end of the drawn line, turned along the shaft
        const tip = line.getPointAtLength(dist)
        const back = line.getPointAtLength(Math.max(0, dist - 10))
        const angle = (Math.atan2(tip.y - back.y, tip.x - back.x) * 180) / Math.PI
        head.setAttribute('transform', `translate(${f(tip.x)} ${f(tip.y)}) rotate(${f(angle)})`)
        head.style.opacity = 1
      })

      // Keep going only while something is still moving
      if (!reduce && (t < INTRO_END || !settled)) raf = requestAnimationFrame(frame)
    }

    kickRef.current = () => {
      if (!raf) {
        hoverRef.current.last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    }

    frame(performance.now())
    return () => {
      cancelAnimationFrame(raf)
      kickRef.current = null
    }
  }, [geo])

  return (
    <>
      {/* Pencil texture for the heading + stroke around your cutout */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id="pencil">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
        </filter>

        {/* Outline: change radius="5" to make the stroke thicker or thinner */}
        <filter id="cutout-stroke" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="d" />
          <feGaussianBlur in="d" stdDeviation="2.5" result="b" />
          <feComponentTransfer in="b" result="r">
            <feFuncA type="linear" slope="8" intercept="-3" />
          </feComponentTransfer>
          <feFlood floodColor="#E8DCC8" result="c" />
          <feComposite in="c" in2="r" operator="in" result="o" />
          <feMerge>
            <feMergeNode in="o" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </svg>

      <header className="top">
        <button
          className={`menu ${open ? 'open' : ''}`}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <i></i>
          <i></i>
          <i></i>
        </button>

        <nav className={`panel ${open ? 'open' : ''}`} aria-label="Main">
          {NAV.map((name) => (
            <a key={name} href={`#${name.toLowerCase()}`} onClick={() => setOpen(false)}>
              {name}
            </a>
          ))}
        </nav>

        <div className="socials">
          {SOCIALS.map((s) => (
            <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name}>
              {s.name === 'LinkedIn' ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              )}
            </a>
          ))}
        </div>

        <h1>My Creative Space</h1>
      </header>

      <section className="hero" id="home">
        <div className="stage" ref={stageRef}>
          <div
            className="person"
            ref={personRef}
            onContextMenu={(e) => e.preventDefault()}
            onPointerMove={onPointerMove}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerLeave}
            onPointerCancel={onPointerCancel}
          >
            <div className="sway" ref={swayRef}>
              <img ref={imgRef} src={PHOTO} alt="Barath M" draggable="false" onLoad={handleLoad} />
            </div>
          </div>

          <svg className="arrows" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} aria-hidden="true">
            {geo &&
              geo.arrows.map((a, i) => (
                <g key={a.id}>
                  {/* Shaft: flat end, so it stops exactly at the arrowhead's tip */}
                  <path
                    className="arrow-line"
                    ref={(el) => (lineRefs.current[i] = el)}
                    style={{ opacity: 0, strokeLinecap: 'butt' }}
                  />
                  {/* Arrowhead: two equal wings, equal angles, centred on the shaft */}
                  <path
                    className="arrow-head"
                    d={HEAD_PATH}
                    ref={(el) => (headRefs.current[i] = el)}
                    style={{ opacity: 0 }}
                  />
                </g>
              ))}
          </svg>

          {/* Role labels: placed right at the tip of each arrow */}
          {geo &&
            ROLES.map((r, i) => {
              const a = geo.arrows[i]
              const isUp = ROWS[r.row].rise < 0
              return (
                <div
                  key={r.id}
                  className={`role ${isUp ? 'up' : 'down'}`}
                  style={{
                    left: `${(a.ex / VIEW_W) * 100}%`,
                    top: `${(a.ey / VIEW_H) * 100}%`,
                    // The label appears just as its arrow arrives
                    animationDelay: `${(ARROW_START + i * ARROW_STAGGER + ARROW_DURATION * 0.75) / 1000}s`,
                  }}
                >
                  {r.text.map((line, n) => (
                    <span key={line}>
                      {line}
                      {n < r.text.length - 1 && <br />}
                    </span>
                  ))}
                </div>
              )
            })}
        </div>

        <div className="intro">
          <p className="hi">hello I’m</p>
          <h2 className="name">
            BARATH <span>M</span>
          </h2>

          <p className="tag">B.Tech., Artificial Intelligence and Data Science</p>

          <p className="loc">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
              <circle cx="12" cy="9.5" r="2.5" />
            </svg>
            Chennai
          </p>

          <div className="contact">
            <a href="mailto:barathmr1702@gmail.com">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
              barathmr1702@gmail.com
            </a>
            <a href="tel:+917358534116">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="7" y="2" width="10" height="20" rx="2" />
                <path d="M11 18h2" />
              </svg>
              +91 7358534116
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

export default Hero
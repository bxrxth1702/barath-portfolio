import { useCallback, useEffect, useRef, useState } from 'react'
import './Hero.css'

const PHOTO = '/images/barath.png' // your transparent cutout
const VIEW_W = 1000
const VIEW_H = 800

// side: which edge of you the arrow starts from
// f: how far down the photo it starts (0 = top, 1 = bottom)
// end: where the arrow points to, on the 1000 x 800 grid
const ROLES = [
  { id: 'dev', text: ['Full Stack', 'Developer'], cls: 'role1', right: false, side: 'l', f: 0.22, end: [120, 165] },
  { id: 'ai', text: ['AI Engineer'], cls: 'role2', right: true, side: 'r', f: 0.22, end: [890, 150] },
  { id: 'content', text: ['Content Creator'], cls: 'role3', right: false, side: 'l', f: 0.5, end: [115, 390] },
  { id: 'director', text: ['Director of', 'Operations'], cls: 'role4', right: true, side: 'r', f: 0.5, end: [885, 395] },
  { id: 'emcee', text: ['Emcee'], cls: 'role5', right: false, side: 'l', f: 0.78, end: [95, 685] },
  { id: 'dancer', text: ['Dancer'], cls: 'role6', right: true, side: 'r', f: 0.78, end: [905, 685] },
]

const NAV = ['Home', 'About', 'Roles', 'Experience', 'Projects', 'Contact']

// Fallback if the image can't be scanned
const FALLBACK = Object.fromEntries(ROLES.map((r) => [r.id, r.side === 'l' ? 0.3 : 0.7]))

// Finds the left/right edge of your body at each arrow height by reading the PNG's transparency
function scanEdges(img) {
  const W = 240
  const H = Math.round((W * img.naturalHeight) / img.naturalWidth)
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, W, H)
  const data = ctx.getImageData(0, 0, W, H).data

  const out = {}
  ROLES.forEach((r) => {
    const y = Math.round(r.f * H)
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
    out[r.id] = max < 0 ? FALLBACK[r.id] : r.side === 'l' ? min / W : (max + 1) / W
  })
  return out
}

function Hero() {
  const [open, setOpen] = useState(false)
  const [arrows, setArrows] = useState(null)
  const stageRef = useRef(null)
  const imgRef = useRef(null)
  const edgesRef = useRef(null)

  // Turns the scanned edges into arrow paths that start exactly on your outline
  const layout = useCallback(() => {
    const stage = stageRef.current
    const img = imgRef.current
    const edges = edgesRef.current
    if (!stage || !img || !edges) return

    const s = stage.getBoundingClientRect()
    const p = img.getBoundingClientRect()
    if (!s.width || !p.width) return

    const k = VIEW_W / s.width
    const gap = 5 * k // sits just outside the stroke

    setArrows(
      ROLES.map((r) => {
        const sx = (p.left - s.left + edges[r.id] * p.width) * k + (r.side === 'l' ? -gap : gap)
        const sy = (p.top - s.top + r.f * p.height) * k
        const [ex, ey] = r.end
        const c1 = [sx + (ex - sx) * 0.55, sy]
        const c2 = [ex, ey + (sy - ey) * 0.5]
        const f = (n) => n.toFixed(1)
        return {
          id: r.id,
          sx,
          sy,
          d: `M${f(sx)} ${f(sy)} C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${ex} ${ey}`,
        }
      }),
    )
  }, [])

  const handleLoad = useCallback(() => {
    try {
      edgesRef.current = scanEdges(imgRef.current)
    } catch {
      edgesRef.current = FALLBACK
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

        <h1>My Creative Space</h1>
      </header>

      <section className="hero" id="home">
        <div className="stage" ref={stageRef}>
          <div className="person">
            <img ref={imgRef} src={PHOTO} alt="Barath M" onLoad={handleLoad} />
          </div>

          <svg className="arrows" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} aria-hidden="true">
            <defs>
              <marker
                id="arrowhead"
                viewBox="0 0 12 12"
                refX="9"
                refY="6"
                markerWidth="9"
                markerHeight="9"
                orient="auto-start-reverse"
              >
                <path
                  d="M2 1.5 L10 6 L2 10.5"
                  fill="none"
                  stroke="#E8DCC8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ animation: 'none', strokeDasharray: 'none', strokeDashoffset: 0 }}
                />
              </marker>
            </defs>

            {arrows &&
              arrows.map((a, i) => (
                <g key={a.id}>
                  <path
                    d={a.d}
                    pathLength="1"
                    markerEnd="url(#arrowhead)"
                    style={{ animationDelay: `${0.4 + i * 0.2}s` }}
                  />
                  <circle cx={a.sx} cy={a.sy} r="5" style={{ animationDelay: `${0.4 + i * 0.2}s` }} />
                </g>
              ))}
          </svg>

          {ROLES.map((r, i) => (
            <div
              key={r.id}
              className={`role ${r.cls} ${r.right ? 'right' : ''}`}
              style={{ animationDelay: `${0.9 + i * 0.2}s` }}
            >
              {r.text.map((line, n) => (
                <span key={line}>
                  {line}
                  {n < r.text.length - 1 && <br />}
                </span>
              ))}
            </div>
          ))}
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
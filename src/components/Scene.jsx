import { useEffect, useRef } from 'react'
import Hero from './Hero.jsx'
import Projects from './Projects.jsx'
import './Scene.css'

// Smooth start and finish for the drop
const smooth = (t) => t * t * (3 - 2 * t)

// Page 1 (Hero) and page 2 (Projects) live in one pinned "stage".
// While you scroll, the burgundy hero drops down and reveals the beige grid underneath.
function Scene() {
  const trackRef = useRef(null)
  const stickRef = useRef(null)
  const spacerRef = useRef(null)
  const endRef = useRef(null)

  useEffect(() => {
    const track = trackRef.current
    const stick = stickRef.current
    const spacer = spacerRef.current
    const end = endRef.current
    let raf = 0

    const update = () => {
      raf = 0
      const vh = window.innerHeight
      const H = stick.offsetHeight // height of page 1
      const D = spacer.offsetHeight // scroll distance used by the drop
      const off = Math.max(0, H - vh) // extra height when page 1 is taller than the screen (phones)
      const scrolled = -track.getBoundingClientRect().top

      // 0 = hero fully in place, 1 = hero fully dropped
      const p = Math.min(1, Math.max(0, (scrolled - off) / D))

      stick.style.top = `${-off}px`
      stick.style.setProperty('--off', `${off}px`)
      stick.style.setProperty('--p', smooth(p).toFixed(4))
      end.style.top = `${off + D}px` // where the "#projects" menu link scrolls to
    }

    const request = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request)
    const ro = new ResizeObserver(request)
    ro.observe(stick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', request)
      ro.disconnect()
    }
  }, [])

  return (
    <div className="scene" ref={trackRef}>
      {/* Menu anchors: #home = very top, #projects = after the drop is finished */}
      <div id="home" className="scene-anchor" style={{ top: 0 }} />
      <div id="projects" className="scene-anchor" ref={endRef} />

      <div className="scene-stick" ref={stickRef}>
        {/* Page 2 sits underneath */}
        <div className="scene-layer">
          <Projects />
        </div>

        {/* Page 1 sits on top (header + burgundy hero) */}
        <Hero />
      </div>

      {/* Scroll distance used while the burgundy drops */}
      <div className="scene-spacer" ref={spacerRef} />
    </div>
  )
}

export default Scene
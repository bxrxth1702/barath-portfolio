import { useEffect, useRef } from 'react'
import Hero from './Hero.jsx'
import Projects from './Projects.jsx'
import MoreAbout from './MoreAbout.jsx'
import './Scene.css'

// Smooth start and finish for each move
const smooth = (t) => t * t * (3 - 2 * t)
const clamp01 = (t) => Math.min(1, Math.max(0, t))

// Page 1 (Hero), page 2 (Projects) and page 3 (More about me) live in one pinned "stage".
//  1) While you scroll, the burgundy hero drops down and reveals page 2.   (--p, 0 to 1)
//  2) Then the whole of page 2 is pushed up and out of the screen while the
//     near-black burgundy page 3 comes up from the bottom right behind it.  (--q, 0 to 1)
function Scene() {
  const trackRef = useRef(null)
  const stickRef = useRef(null)
  const spacerRef = useRef(null)
  const spacer2Ref = useRef(null)
  const endRef = useRef(null)
  const end2Ref = useRef(null)

  useEffect(() => {
    const track = trackRef.current
    const stick = stickRef.current
    const spacer = spacerRef.current
    const spacer2 = spacer2Ref.current
    const end = endRef.current
    const end2 = end2Ref.current
    let raf = 0

    const update = () => {
      raf = 0
      const vh = window.innerHeight
      const H = stick.offsetHeight // height of page 1
      const D1 = spacer.offsetHeight // scroll distance used by the drop
      const D2 = spacer2.offsetHeight // scroll distance used by the turn to page 3
      const off = Math.max(0, H - vh) // extra height when page 1 is taller than the screen (phones)
      const scrolled = -track.getBoundingClientRect().top - off

      const p = clamp01(scrolled / D1) // 0 = hero in place, 1 = hero fully dropped
      const q = clamp01((scrolled - D1) / D2) // 0 = page 2 showing, 1 = page 3 showing

      stick.style.top = `${-off}px`
      stick.style.setProperty('--off', `${off}px`)
      stick.style.setProperty('--p', smooth(p).toFixed(4))
      stick.style.setProperty('--q', smooth(q).toFixed(4))
      stick.classList.toggle('show-3', q > 0.5) // page 3 can be clicked once it is mostly in place

      end.style.top = `${off + D1}px` // where the "#projects" menu link scrolls to
      end2.style.top = `${off + D1 + D2}px` // where the "#about" menu link scrolls to
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
      {/* Menu anchors: #home = very top, #projects = after the drop, #about = after the turn */}
      <div id="home" className="scene-anchor" style={{ top: 0 }} />
      <div id="projects" className="scene-anchor" ref={endRef} />
      <div id="about" className="scene-anchor" ref={end2Ref} />

      <div className="scene-stick" ref={stickRef}>
        {/* Page 3 waits below the screen */}
        <div className="scene-page3">
          <MoreAbout />
        </div>

        {/* Page 2 sits underneath page 1 */}
        <div className="scene-layer">
          <Projects />
        </div>

        {/* Page 1 sits on top (header + burgundy hero) */}
        <Hero />
      </div>

      {/* Scroll distance used while the burgundy drops */}
      <div className="scene-spacer" ref={spacerRef} />
      {/* Scroll distance used while page 2 gives way to page 3 */}
      <div className="scene-spacer" ref={spacer2Ref} />
    </div>
  )
}

export default Scene
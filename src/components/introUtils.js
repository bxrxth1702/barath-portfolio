const KEY = 'barath-intro-played'

// Should the intro play? Once per browser tab session, never for reduced motion.
// Open the site with ?intro on the end of the address to force it (handy for testing).
export function shouldPlayIntro() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  if (new URLSearchParams(window.location.search).has('intro')) return true
  try {
    return sessionStorage.getItem(KEY) !== '1'
  } catch {
    return true // storage blocked: just play it
  }
}

export function markIntroPlayed() {
  try {
    sessionStorage.setItem(KEY, '1')
  } catch {
    // ignore: storage blocked
  }
}
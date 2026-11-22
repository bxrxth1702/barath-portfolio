import { useCallback, useState } from 'react'
import Hero from './components/Hero.jsx'
import IntroLoader from './components/IntroLoader.jsx'
import { shouldPlayIntro } from './components/introUtils.js'

function App() {
  const [playIntro] = useState(shouldPlayIntro) // decided once, on first load
  const [homeVisible, setHomeVisible] = useState(!playIntro)
  const revealHome = useCallback(() => setHomeVisible(true), [])

  return (
    <>
      {playIntro && <IntroLoader onReveal={revealHome} />}

      <main>{homeVisible && <Hero />}</main>
    </>
  )
}

export default App
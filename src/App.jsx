import { useCallback, useState } from 'react'
import Scene from './components/Scene.jsx'
import IntroLoader from './components/IntroLoader.jsx'
import { shouldPlayIntro } from './components/introUtils.js'

function App() {
  const [playIntro] = useState(shouldPlayIntro) // decided once, on first load
  const [homeVisible, setHomeVisible] = useState(!playIntro)
  const revealHome = useCallback(() => setHomeVisible(true), [])

  return (
    <>
      {playIntro && <IntroLoader onReveal={revealHome} />}

      {/* Scene holds Hero (page 1) + Projects (page 2) and runs the drop transition */}
      <main>{homeVisible && <Scene />}</main>
    </>
  )
}

export default App
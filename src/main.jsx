import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CardTilt from './components/CardTilt.jsx'
import CapabilitiesStack from './components/CapabilitiesStack.jsx'

function App() {
  return <CardTilt />
}

const mount = document.createElement('div')
mount.id = 'tier2-root'
document.body.appendChild(mount)

createRoot(mount).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// Capability cards scroll-stack: desktop only, skipped under reduced-motion
// (the static grid already in index.html stays as the fallback in both cases).
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const fxOff = document.documentElement.hasAttribute('data-fx-off')
const stackRoot = document.getElementById('capabilities-stack-root')
if (stackRoot && !reduceMotion && !fxOff) {
  document.documentElement.classList.add('has-capabilities-stack')
  createRoot(stackRoot).render(
    <StrictMode>
      <CapabilitiesStack />
    </StrictMode>
  )
}

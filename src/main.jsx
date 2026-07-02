import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CardTilt from './components/CardTilt.jsx'
import CapabilitiesStack from './components/CapabilitiesStack.jsx'
import Masonry from './components/Masonry.jsx'
import Lanyard from './components/Lanyard.jsx'

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

// Bookshelf: masonry grid of real book covers, each linking to an Amazon
// search for that title (no fabricated product links).
const BOOKS = [
  { id: 'atomic-habits', title: 'Atomic Habits', file: 'Atomic Habit.png' },
  { id: 'attitude', title: 'Attitude', file: 'Attitude.png' },
  { id: 'design-as-art', title: 'Design as Art', file: 'Design as Art.png' },
  { id: 'ikigai', title: 'Ikigai', file: 'Ikigai.png' },
  { id: 'show-your-work', title: 'Show Your Work!', file: 'Show your work.png' },
  { id: 'steal-like-an-artist', title: 'Steal Like an Artist', file: 'Steal like an artist.png' },
  { id: 'graphic-design-bible', title: 'The Graphic Design Bible', file: 'TheGraphic  Bibblie.png' },
]

const bookshelfRoot = document.getElementById('bookshelf-masonry')
if (bookshelfRoot) {
  const items = BOOKS.map((b) => ({
    id: b.id,
    title: b.title,
    img: `Assets/Books/${encodeURIComponent(b.file)}`,
    url: `https://www.amazon.com/s?k=${encodeURIComponent(b.title + ' book')}`,
  }))

  createRoot(bookshelfRoot).render(
    <StrictMode>
      <Masonry
        items={items}
        ease="power3.out"
        duration={0.6}
        stagger={0.05}
        animateFrom="bottom"
        scaleOnHover
        hoverScale={0.96}
        blurToFocus
        colorShiftOnHover={false}
      />
    </StrictMode>
  )
}

// Hero lanyard: desktop only, skipped under reduced-motion (the physics/WebGL
// canvas isn't worth mounting — even hidden — on narrow viewports or when
// motion is reduced; the hero falls back to its original one-column layout).
const isWideViewport = window.matchMedia('(min-width: 861px)').matches
const lanyardRoot = document.getElementById('hero-lanyard-root')
if (lanyardRoot && !reduceMotion && !fxOff && isWideViewport) {
  document.documentElement.classList.add('has-hero-lanyard')
  createRoot(lanyardRoot).render(
    <StrictMode>
      <Lanyard
        position={[0, 2, 13]}
        gravity={[0, -32, 0]}
        frontImage="Assets/source/avatar-sip.png"
        imageFit="cover"
      />
    </StrictMode>
  )
}

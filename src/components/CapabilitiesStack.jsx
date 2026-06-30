import { useLayoutEffect, useRef } from 'react'
import Lenis from 'lenis'
import './CapabilitiesStack.css'

const CAPABILITIES = [
  {
    num: '01',
    title: 'Product design',
    desc: 'End-to-end product thinking — from problem framing to shipped, measurable interfaces.',
  },
  {
    num: '02',
    title: 'Design systems',
    desc: 'Token architecture and component libraries that keep teams fast and consistent.',
  },
  {
    num: '03',
    title: 'Interface direction',
    desc: 'Setting the visual and interaction language a product speaks in.',
  },
  {
    num: '04',
    title: 'Web design',
    desc: 'Marketing sites and web apps that load fast and feel considered.',
  },
  {
    num: '05',
    title: 'Brand identity',
    desc: 'Voice, marks, and systems that make a product recognisably itself.',
  },
]

// ---- stacking dials ------------------------------------------------------
const N = CAPABILITIES.length
const TRANSITIONS = N - 1            // 4 card-advances across the pin
const ENTER_VH = 0.72               // how far below rest a card starts (× viewport h)
const STACK_DISTANCE = 22           // px each later card sits lower (top edges peek)
const BASE_SCALE = 0.9              // scale of card 01
const SCALE_STEP = 0.025            // scale added per index (later cards larger / in front)
const RECEDE_LIFT = 5               // px a card lifts per card stacked on top of it
const RECEDE_SCALE = 0.012          // extra scale-down per card stacked on top
const BLUR = 1.4                    // px blur per card stacked on top

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

export default function CapabilitiesStack() {
  const trackRef = useRef(null)
  const cardsRef = useRef([])
  const lenisRef = useRef(null)
  const rafRef = useRef(null)
  const lastRef = useRef([])

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return
    const cards = cardsRef.current.filter(Boolean)
    if (!cards.length) return

    const update = () => {
      // Skip work when the pin is hidden (mobile / reduced-motion fallback grid).
      if (track.offsetParent === null) return

      const scrollable = track.offsetHeight - window.innerHeight
      const trackTop = track.getBoundingClientRect().top + window.scrollY
      const p = scrollable > 0 ? clamp((window.scrollY - trackTop) / scrollable, 0, 1) : 0
      const advance = p * TRANSITIONS      // 0 → 4
      const enterPx = window.innerHeight * ENTER_VH

      cards.forEach((card, i) => {
        // entrance: card 01 is the pinned base (always in); 02..05 slide up in turn
        const enter = i === 0 ? 1 : clamp(advance - (i - 1), 0, 1)
        // depth: how many cards are now stacked on top of this one (fractional → smooth)
        const depth = clamp(advance - i, 0, TRANSITIONS)

        const restTop = i * STACK_DISTANCE
        const translateY = restTop + (1 - enter) * enterPx - depth * RECEDE_LIFT
        const scale = BASE_SCALE + i * SCALE_STEP - depth * RECEDE_SCALE
        const blur = depth * BLUR

        const prev = lastRef.current[i]
        const next = { translateY, scale, blur }
        if (
          prev &&
          Math.abs(prev.translateY - translateY) < 0.1 &&
          Math.abs(prev.scale - scale) < 0.001 &&
          Math.abs(prev.blur - blur) < 0.05
        ) {
          return
        }
        lastRef.current[i] = next
        card.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`
        card.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : ''
      })
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      lerp: 0.1,
    })
    lenis.on('scroll', update)
    const raf = time => {
      lenis.raf(time)
      rafRef.current = requestAnimationFrame(raf)
    }
    rafRef.current = requestAnimationFrame(raf)
    lenisRef.current = lenis

    window.addEventListener('resize', update)
    update()

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', update)
      lenis.destroy()
      lenisRef.current = null
      lastRef.current = []
    }
  }, [])

  return (
    <div className="cap-pin-track" ref={trackRef}>
      <div className="cap-pin-stage">
        <div className="section__head cap-pin-head">
          <p className="eyebrow">What I do</p>
          <h2>Five things, done with care.</h2>
        </div>
        <div className="cap-pin-viewport">
          {CAPABILITIES.map((cap, i) => (
            <article
              key={cap.num}
              ref={el => (cardsRef.current[i] = el)}
              className="cap-card cap-card--stacked"
              style={{ zIndex: i + 1 }}
            >
              <div className="cap-card__bg" aria-hidden="true" />
              <span className="cap-card__corner tl" aria-hidden="true" />
              <span className="cap-card__corner tr" aria-hidden="true" />
              <span className="cap-card__corner bl" aria-hidden="true" />
              <span className="cap-card__corner br" aria-hidden="true" />
              <div className="cap-card__body">
                <span className="cap-card__num">{cap.num}</span>
                <h3 className="cap-card__title">{cap.title}</h3>
                <p className="cap-card__desc">{cap.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

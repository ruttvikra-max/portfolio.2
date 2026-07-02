import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'

import './Masonry.css'

const useMedia = (queries, values, defaultValue) => {
  const get = () => values[queries.findIndex(q => matchMedia(q).matches)] ?? defaultValue

  const [value, setValue] = useState(get)

  useEffect(() => {
    const handler = () => setValue(get)
    queries.forEach(q => matchMedia(q).addEventListener('change', handler))
    return () => queries.forEach(q => matchMedia(q).removeEventListener('change', handler))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries])

  return value
}

const useMeasure = () => {
  const ref = useRef(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useLayoutEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])

  return [ref, size]
}

// Book-cover aspect ratio if a src fails to load — a typical portrait cover.
const FALLBACK_RATIO = 1.5

// Resolves each url's real height/width ratio so grid cells can be sized to
// match their image exactly, instead of guessing a height up front.
const loadAspectRatios = async urls => {
  const entries = await Promise.all(
    urls.map(
      src =>
        new Promise(resolve => {
          const img = new Image()
          img.onload = () => resolve([src, img.naturalHeight / img.naturalWidth])
          img.onerror = () => resolve([src, FALLBACK_RATIO])
          img.src = src
        })
    )
  )
  return Object.fromEntries(entries)
}

const Masonry = ({
  items,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.05,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = false
}) => {
  const columns = useMedia(
    ['(min-width:1500px)', '(min-width:1000px)', '(min-width:600px)', '(min-width:400px)'],
    [3, 3, 2, 2],
    1
  )

  const [containerRef, { width }] = useMeasure()
  const [imagesReady, setImagesReady] = useState(false)
  const [aspectRatios, setAspectRatios] = useState({})

  const getInitialPosition = item => {
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return { x: item.x, y: item.y }

    let direction = animateFrom

    if (animateFrom === 'random') {
      const directions = ['top', 'bottom', 'left', 'right']
      direction = directions[Math.floor(Math.random() * directions.length)]
    }

    switch (direction) {
      case 'top':
        return { x: item.x, y: -200 }
      case 'bottom':
        return { x: item.x, y: window.innerHeight + 200 }
      case 'left':
        return { x: -200, y: item.y }
      case 'right':
        return { x: window.innerWidth + 200, y: item.y }
      case 'center':
        return {
          x: containerRect.width / 2 - item.w / 2,
          y: containerRect.height / 2 - item.h / 2
        }
      default:
        return { x: item.x, y: item.y + 100 }
    }
  }

  useEffect(() => {
    let cancelled = false
    loadAspectRatios(items.map(i => i.img)).then(ratios => {
      if (cancelled) return
      setAspectRatios(ratios)
      setImagesReady(true)
    })
    return () => { cancelled = true }
  }, [items])

  const grid = useMemo(() => {
    if (!width || !imagesReady) return []

    const colHeights = new Array(columns).fill(0)
    const columnWidth = width / columns

    return items.map(child => {
      const col = colHeights.indexOf(Math.min(...colHeights))
      const x = columnWidth * col
      const ratio = aspectRatios[child.img] ?? FALLBACK_RATIO
      const height = columnWidth * ratio
      const y = colHeights[col]

      colHeights[col] += height

      return { ...child, x, y, w: columnWidth, h: height }
    })
  }, [columns, items, width, imagesReady, aspectRatios])

  // Items are position:absolute, so the container never grows to fit them on
  // its own — without this, the tallest column (e.g. a single mobile column
  // stacking every item) overflows into whatever follows in the document.
  const containerHeight = useMemo(
    () => grid.reduce((max, item) => Math.max(max, item.y + item.h), 0),
    [grid]
  )

  const hasMounted = useRef(false)

  useLayoutEffect(() => {
    if (!imagesReady) return

    grid.forEach((item, index) => {
      const selector = `[data-key="${item.id}"]`
      const animationProps = {
        x: item.x,
        y: item.y,
        width: item.w,
        height: item.h
      }

      if (!hasMounted.current) {
        const initialPos = getInitialPosition(item, index)
        const initialState = {
          opacity: 0,
          x: initialPos.x,
          y: initialPos.y,
          width: item.w,
          height: item.h,
          ...(blurToFocus && { filter: 'blur(10px)' })
        }

        gsap.fromTo(selector, initialState, {
          opacity: 1,
          ...animationProps,
          ...(blurToFocus && { filter: 'blur(0px)' }),
          duration: 0.8,
          ease: 'power3.out',
          delay: index * stagger
        })
      } else {
        gsap.to(selector, {
          ...animationProps,
          duration: duration,
          ease: ease,
          overwrite: 'auto'
        })
      }
    })

    hasMounted.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid, imagesReady, stagger, animateFrom, blurToFocus, duration, ease])

  const handleMouseEnter = (e, item) => {
    const element = e.currentTarget
    const selector = `[data-key="${item.id}"]`

    if (scaleOnHover) {
      gsap.to(selector, {
        scale: hoverScale,
        duration: 0.3,
        ease: 'power2.out'
      })
    }

    if (colorShiftOnHover) {
      const overlay = element.querySelector('.color-overlay')
      if (overlay) {
        gsap.to(overlay, {
          opacity: 0.3,
          duration: 0.3
        })
      }
    }
  }

  const handleMouseLeave = (e, item) => {
    const element = e.currentTarget
    const selector = `[data-key="${item.id}"]`

    if (scaleOnHover) {
      gsap.to(selector, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      })
    }

    if (colorShiftOnHover) {
      const overlay = element.querySelector('.color-overlay')
      if (overlay) {
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.3
        })
      }
    }
  }

  return (
    <div ref={containerRef} className="list" style={containerHeight ? { height: containerHeight } : undefined}>
      {grid.map(item => {
        return (
          <div
            key={item.id}
            data-key={item.id}
            className="item-wrapper"
            role="listitem"
            aria-label={item.title || 'Book'}
            onClick={() => item.url && window.open(item.url, '_blank', 'noopener')}
            onMouseEnter={e => handleMouseEnter(e, item)}
            onMouseLeave={e => handleMouseLeave(e, item)}
          >
            <div className="item-img" style={{ backgroundImage: `url(${item.img})` }}>
              {colorShiftOnHover && (
                <div
                  className="color-overlay"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(45deg, rgba(255,0,150,0.5), rgba(0,150,255,0.5))',
                    opacity: 0,
                    pointerEvents: 'none',
                    borderRadius: '8px'
                  }}
                />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Masonry

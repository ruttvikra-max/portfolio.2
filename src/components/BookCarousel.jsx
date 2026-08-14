import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform } from 'motion/react'

import './BookCarousel.css'

const useMeasure = () => {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])

  return [ref, width]
}

const GAP = 16
const DRAG_BUFFER = 40
const VELOCITY_THRESHOLD = 500
const SPRING_OPTIONS = { type: 'spring', stiffness: 300, damping: 30 }

function BookCard({ item, index, itemWidth, trackItemOffset, x, transition, onOpen }) {
  const range = [-(index + 1) * trackItemOffset, -index * trackItemOffset, -(index - 1) * trackItemOffset]
  const rotateY = useTransform(x, range, [40, 0, -40], { clamp: false })
  return (
    <motion.div
      className="book-carousel-item"
      style={{ width: itemWidth, rotateY }}
      transition={transition}
      onTap={() => onOpen(item)}
      role="listitem"
      aria-label={item.title || 'Book'}
    >
      <div className="book-carousel-item-frame">
        <img src={item.img} alt={item.title || ''} loading="lazy" draggable="false" />
      </div>
    </motion.div>
  )
}

export default function BookCarousel({ items, loop = true }) {
  const [containerRef, containerWidth] = useMeasure()
  // Cards at ~70% of the available width instead of filling it, so both
  // neighbors peek in symmetrically (previous on the left, next on the
  // right) — a full-width card only ever showed one side's neighbor.
  const itemWidth = containerWidth * 0.7
  const trackItemOffset = itemWidth + GAP
  // Constant offset, applied as a static margin (not part of the animated
  // `x` motion value) so it centers the track without touching the
  // position-based math that drives rotateY and perspectiveOrigin below.
  const centerOffset = Math.max((containerWidth - itemWidth) / 2, 0)

  const itemsForRender = useMemo(() => {
    if (!loop || items.length === 0) return items
    return [items[items.length - 1], ...items, items[0]]
  }, [items, loop])

  const [position, setPosition] = useState(loop ? 1 : 0)
  const x = useMotionValue(0)
  const [isJumping, setIsJumping] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const effectiveTransition = isJumping ? { duration: 0 } : SPRING_OPTIONS

  const handleAnimationComplete = () => {
    if (!loop || itemsForRender.length <= 1) { setIsAnimating(false); return }
    const lastCloneIndex = itemsForRender.length - 1

    if (position === lastCloneIndex) {
      setIsJumping(true)
      setPosition(1)
      x.set(-1 * trackItemOffset)
      requestAnimationFrame(() => { setIsJumping(false); setIsAnimating(false) })
      return
    }
    if (position === 0) {
      setIsJumping(true)
      setPosition(items.length)
      x.set(-items.length * trackItemOffset)
      requestAnimationFrame(() => { setIsJumping(false); setIsAnimating(false) })
      return
    }
    setIsAnimating(false)
  }

  const handleDragEnd = (_, info) => {
    const { offset, velocity } = info
    const direction =
      offset.x < -DRAG_BUFFER || velocity.x < -VELOCITY_THRESHOLD ? 1
      : offset.x > DRAG_BUFFER || velocity.x > VELOCITY_THRESHOLD ? -1
      : 0
    if (direction === 0) return
    setPosition(prev => {
      const next = prev + direction
      const max = itemsForRender.length - 1
      return Math.max(0, Math.min(next, max))
    })
  }

  const dragProps = loop
    ? {}
    : { dragConstraints: { left: -trackItemOffset * Math.max(itemsForRender.length - 1, 0), right: 0 } }

  const activeIndex =
    items.length === 0 ? 0 : loop ? (position - 1 + items.length) % items.length : Math.min(position, items.length - 1)

  const handleOpen = item => { item.url && window.open(item.url, '_blank', 'noopener') }

  return (
    <div ref={containerRef} className="book-carousel-container" role="list" aria-label="Books that shaped me">
      {itemWidth > 0 && (
        <>
          <motion.div
            className="book-carousel-track"
            drag={isAnimating ? false : 'x'}
            {...dragProps}
            style={{
              gap: `${GAP}px`,
              marginLeft: centerOffset,
              perspective: 1000,
              perspectiveOrigin: `${position * trackItemOffset + itemWidth / 2}px 50%`,
              x
            }}
            onDragEnd={handleDragEnd}
            animate={{ x: -(position * trackItemOffset) }}
            transition={effectiveTransition}
            onAnimationStart={() => setIsAnimating(true)}
            onAnimationComplete={handleAnimationComplete}
          >
            {itemsForRender.map((item, index) => (
              <BookCard
                key={`${item.id}-${index}`}
                item={item}
                index={index}
                itemWidth={itemWidth}
                trackItemOffset={trackItemOffset}
                x={x}
                transition={effectiveTransition}
                onOpen={handleOpen}
              />
            ))}
          </motion.div>
          <div className="book-carousel-indicators">
            {items.map((_, index) => (
              <button
                type="button"
                key={index}
                className={`book-carousel-indicator ${activeIndex === index ? 'is-active' : ''}`}
                aria-label={`Go to book ${index + 1}`}
                aria-current={activeIndex === index}
                onClick={() => setPosition(loop ? index + 1 : index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

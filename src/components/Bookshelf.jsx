import { useEffect, useState } from 'react'
import Masonry from './Masonry.jsx'
import BookCarousel from './BookCarousel.jsx'

// Desktop keeps the packed masonry grid; narrow viewports swap to a
// swipeable carousel instead of a squeezed single-column stack — reacts
// to actual resize, not just the viewport at page load.
export default function Bookshelf({ items, ...masonryProps }) {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 640px)').matches)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const handler = e => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return isMobile ? <BookCarousel items={items} /> : <Masonry items={items} {...masonryProps} />
}

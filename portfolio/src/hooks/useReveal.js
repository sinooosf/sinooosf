import { useEffect, useRef, useState } from 'react'

/**
 * Adds a smooth "fade + slide up" reveal the first time an element
 * scrolls into view. Returns a ref to attach and a boolean for whether
 * it has become visible yet.
 *
 * Usage:
 *   const [ref, visible] = useReveal()
 *   <div ref={ref} className={visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}>
 */
export default function useReveal({ threshold = 0.15, rootMargin = '0px 0px -80px 0px' } = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold, rootMargin },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return [ref, visible]
}

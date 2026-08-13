import { useEffect, useState } from 'react'

/**
 * True when the viewport is narrower than the given breakpoint (default
 * matches Tailwind's `sm` at 640px). Used to decide when the project grid
 * is stacked into a single column ("phone" layout) vs. a 3-column grid.
 */
export default function useIsMobile(breakpoint = 640) {
  const getIsMobile = () =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false

  const [isMobile, setIsMobile] = useState(getIsMobile)

  useEffect(() => {
    const handleResize = () => setIsMobile(getIsMobile())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breakpoint])

  return isMobile
}

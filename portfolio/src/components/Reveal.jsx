import useReveal from '../hooks/useReveal'

/**
 * Wrap any block of content in <Reveal> to make it fade + slide up
 * smoothly the first time it scrolls into the viewport.
 * `delay` (ms) lets you stagger a group of children.
 */
export default function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }) {
  const [ref, visible] = useReveal()

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </Tag>
  )
}

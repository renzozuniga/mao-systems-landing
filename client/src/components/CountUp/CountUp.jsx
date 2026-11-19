import { useEffect, useRef, useState } from 'react'

const DURATION_MS = 900

/**
 * Counts from 0 up to the numeric part of `value` (e.g. "15+") the first time
 * it scrolls into view, keeping any suffix. Renders the final value straight
 * away when reduced motion is requested.
 */
export default function CountUp({ value, className }) {
  const match  = String(value).match(/^(\d+)(.*)$/)
  const target = match ? Number(match[1]) : null
  const suffix = match ? match[2] : ''

  const ref = useRef(null)
  const [current, setCurrent] = useState(target === null ? value : 0)

  useEffect(() => {
    if (target === null) return
    const el = ref.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !('IntersectionObserver' in window)) {
      setCurrent(target)
      return
    }

    let frame
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      const start = performance.now()
      const tick = (now) => {
        const t = Math.min((now - start) / DURATION_MS, 1)
        // easeOutCubic so the last digits settle slowly, matching --ease-out.
        const eased = 1 - Math.pow(1 - t, 3)
        setCurrent(Math.round(eased * target))
        if (t < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }, { threshold: 0.6 })

    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [target])

  return (
    <span ref={ref} className={className} aria-label={String(value)}>
      <span aria-hidden="true">{target === null ? value : `${current}${suffix}`}</span>
    </span>
  )
}

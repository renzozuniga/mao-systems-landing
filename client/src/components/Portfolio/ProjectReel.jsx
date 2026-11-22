import { useEffect, useState } from 'react'

const STEP_MS = 1600

// Touch screens have no hover to stop the loop, and reduced-motion users asked
// for stillness; both keep the static cover and never download the reel.
const canAnimate = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Hover preview over a project cover.
 *
 * - `slides`: product screens cross-fading with a slow zoom. The cycle wraps
 *   from the last screen back to the first with the same cross-fade, so there
 *   is no visible restart.
 * - `scroll`: a full-page capture panning down and back up (alternate), which
 *   also loops without a jump.
 *
 * The first frame matches the cover, so starting is seamless. Images are only
 * requested on the first hover, keeping the initial page load unchanged.
 */
export default function ProjectReel({ reel, active }) {
  const [primed, setPrimed] = useState(false)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (active && !primed && canAnimate()) setPrimed(true)
  }, [active, primed])

  useEffect(() => {
    if (!active || reel.type !== 'slides') return
    const id = setInterval(() => setIndex((i) => (i + 1) % reel.frames.length), STEP_MS)
    return () => clearInterval(id)
  }, [active, reel])

  // Rewind slides once hidden, so the next hover starts again from the cover.
  useEffect(() => {
    if (active) return
    const t = setTimeout(() => setIndex(0), 500)
    return () => clearTimeout(t)
  }, [active])

  if (!primed) return null

  return (
    <div className={`reel${active ? ' is-playing' : ''}`} aria-hidden="true">
      {reel.type === 'scroll' ? (
        <img
          src={reel.src}
          alt=""
          decoding="async"
          className="reel__scroll"
          style={{ '--reel-dur': `${reel.duration}s` }}
        />
      ) : (
        reel.frames.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            decoding="async"
            className={`reel__frame${i === index ? ' is-current' : ''}`}
          />
        ))
      )}
    </div>
  )
}

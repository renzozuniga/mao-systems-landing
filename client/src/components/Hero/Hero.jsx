import { useEffect, useRef } from 'react'
import './Hero.css'

/**
 * Full-viewport hero section with entrance animations and floating tech badges.
 * Apple-inspired layout: left text block, right visual element.
 */
export default function Hero() {
  const textRef   = useRef(null)
  const visualRef = useRef(null)

  useEffect(() => {
    // Staggered entrance on mount (not scroll-driven)
    requestAnimationFrame(() => {
      textRef.current?.classList.add('hero__text--visible')
      setTimeout(() => visualRef.current?.classList.add('hero__visual--visible'), 180)
    })
  }, [])

  return (
    <section className="hero" id="home" aria-label="MAO Systems — presentación">

      {/* Ambient background blobs */}
      <div className="hero__blobs" aria-hidden="true">
        <div className="hero__blob hero__blob--1" />
        <div className="hero__blob hero__blob--2" />
        <div className="hero__blob hero__blob--3" />
      </div>

      <div className="hero__container">

        {/* --- Text block --- */}
        <div className="hero__text" ref={textRef}>
          <span className="hero__eyebrow">MAO Systems · Perú</span>

          <h1 className="hero__headline">
            Software a medida para empresas que quieren <em>crecer</em>
          </h1>

          <p className="hero__subtitle">
            Diseñamos y desarrollamos soluciones digitales que transforman
            procesos, mejoran la experiencia de tus clientes y escalan con
            tu negocio.
          </p>

          <div className="hero__actions">
            <a href="#portfolio" className="btn btn--primary btn--lg">
              Ver Portfolio
            </a>
            <a href="#contact" className="btn btn--outline btn--lg">
              Contáctanos
            </a>
          </div>

          <p className="hero__trust">
            <span className="hero__trust-dot" /> Respondemos en menos de 24 h
          </p>
        </div>

        {/* --- Visual block --- */}
        <div className="hero__visual" ref={visualRef} aria-hidden="true">

          {/* Central icon */}
          <div className="hero__icon-wrap">
            <img src="/assets/mao-icon.svg" alt="" className="hero__icon" />
          </div>

          {/* Floating tech badges */}
          <div className="hero__badge hero__badge--1">
            <span className="hero__badge-dot" />
            React · Angular · Node.js
          </div>
          <div className="hero__badge hero__badge--2">
            <span className="hero__badge-dot" />
            Python · .NET · AWS
          </div>
          <div className="hero__badge hero__badge--3">
            <span className="hero__badge-dot hero__badge-dot--alt" />
            Figma · Jira · GitHub
          </div>

          {/* Decorative ring */}
          <div className="hero__ring" />
        </div>
      </div>

      {/* Scroll cue */}
      <a href="#about" className="hero__scroll" aria-label="Siguiente sección">
        <span className="hero__scroll-wheel" />
      </a>
    </section>
  )
}

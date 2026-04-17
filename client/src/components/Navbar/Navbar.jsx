import { useState, useEffect } from 'react'
import './Navbar.css'

/** Navigation links definition */
const NAV_LINKS = [
  { label: 'Nosotros',  href: '#about'     },
  { label: 'Servicios', href: '#services'  },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Contacto',  href: '#contact'   },
]

/**
 * Sticky navbar with frosted-glass effect on scroll and mobile hamburger menu.
 */
export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const close = () => setMenuOpen(false)

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__container">

        {/* Logo */}
        <a href="#home" className="navbar__logo" aria-label="MAO Systems — inicio" onClick={close}>
          <img src="/assets/mao-logo.svg" alt="MAO Systems" height="34" />
        </a>

        {/* Desktop nav */}
        <nav className="navbar__nav" aria-label="Navegación principal">
          {NAV_LINKS.map(({ label, href }) => (
            <a key={href} href={href} className="navbar__link">
              {label}
            </a>
          ))}
          <a href="#contact" className="btn btn--primary btn--sm navbar__cta">
            Hablemos
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button
          className={`navbar__hamburger${menuOpen ? ' navbar__hamburger--open' : ''}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu panel */}
      <div className={`navbar__mobile${menuOpen ? ' navbar__mobile--open' : ''}`} aria-hidden={!menuOpen}>
        {NAV_LINKS.map(({ label, href }) => (
          <a key={href} href={href} className="navbar__mobile-link" onClick={close}>
            {label}
          </a>
        ))}
        <a href="#contact" className="btn btn--primary btn--md navbar__mobile-cta" onClick={close}>
          Hablemos
        </a>
      </div>
    </header>
  )
}

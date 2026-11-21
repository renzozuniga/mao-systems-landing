import { useEffect } from 'react'
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import About from './components/About/About'
import Services from './components/Services/Services'
import Portfolio from './components/Portfolio/Portfolio'
import Contact from './components/Contact/Contact'
import Footer from './components/Footer/Footer'
import CookieConsent from './components/CookieConsent/CookieConsent'

/**
 * Root application component.
 * Sets up scroll-triggered entrance animations via IntersectionObserver
 * for all elements with the `.animate-on-scroll` class.
 */
function App() {
  useEffect(() => {
    const elements = document.querySelectorAll('.animate-on-scroll')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target
            el.classList.add('is-visible')
            observer.unobserve(el)
            // Hand transitions back to the component once the staggered entrance
            // has played (max delay 0.48s + title beat + 600ms), so hovers aren't lagged.
            setTimeout(() => el.classList.add('reveal-done'), 1300)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Portfolio />
        <Contact />
      </main>
      <Footer />
      <CookieConsent />
    </>
  )
}

export default App

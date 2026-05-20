import './Footer.css'

const YEAR = new Date().getFullYear()

const SERVICES_LINKS = [
  'Desarrollo Web a Medida',
  'Dashboards & Analytics',
  'APIs & Microservicios',
  'Consultoría Tecnológica',
  'Automatización de Procesos',
]

/**
 * Site footer — dark green background with logo, navigation links and social links.
 */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">

        {/* Brand column */}
        <div className="footer__brand">
          <a href="#home" className="footer__logo" aria-label="MAO Systems — inicio">
            <img src="/assets/mao-icon-light.svg" alt="" className="footer__logo-icon" />
            <div className="footer__logo-text">
              <span className="footer__logo-name">MAO Systems</span>
              <span className="footer__logo-tagline">Engineering Digital Solutions</span>
            </div>
          </a>
          <p className="footer__brand-desc">
            Empresa de desarrollo de software operada desde Perú.<br />
            Construimos soluciones digitales que escalan con tu negocio,
            trabajando de forma 100% remota y colaborativa.
          </p>
          <div className="footer__social">
            <a
              href="https://linkedin.com/in/renzo-zuniga"
              target="_blank" rel="noopener noreferrer"
              className="footer__social-link" aria-label="LinkedIn"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect x="2" y="9" width="4" height="12"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
            <a
              href="https://github.com/renzozuniga"
              target="_blank" rel="noopener noreferrer"
              className="footer__social-link" aria-label="GitHub"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                <path d="M9 18c-4.51 2-5-2-7-2"/>
              </svg>
            </a>
            <a
              href="https://www.renzozuniga.dev"
              target="_blank" rel="noopener noreferrer"
              className="footer__social-link" aria-label="Portfolio"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2a14.5 14.5 0 0 1 0 20 14.5 14.5 0 0 1 0-20"/>
                <path d="M2 12h20"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Services */}
        <div className="footer__col">
          <h4 className="footer__col-title">Servicios</h4>
          <ul className="footer__links">
            {SERVICES_LINKS.map((s) => (
              <li key={s}>
                <a href="#services" className="footer__link">{s}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div className="footer__col">
          <h4 className="footer__col-title">Empresa</h4>
          <ul className="footer__links">
            <li><a href="#about"     className="footer__link">Quiénes somos</a></li>
            <li><a href="#portfolio" className="footer__link">Portfolio</a></li>
            <li><a href="#contact"   className="footer__link">Contacto</a></li>
          </ul>
        </div>

        {/* Contact info */}
        <div className="footer__col">
          <h4 className="footer__col-title">Contacto</h4>
          <ul className="footer__links">
            <li>
              <a href="mailto:rzuniga@maosystems.io" className="footer__link">
                rzuniga@maosystems.io
              </a>
            </li>
            <li>
              <a href="https://www.renzozuniga.dev" target="_blank" rel="noopener noreferrer" className="footer__link">
                renzozuniga.dev
              </a>
            </li>
            <li className="footer__location">
              <span className="footer__avail-dot" />Disponible · Remoto 🌐
            </li>
          </ul>
        </div>

      </div>

      <div className="footer__bottom">
        <p className="footer__copy">
          © {YEAR} MAO Systems. Todos los derechos reservados.
        </p>
        <p className="footer__domain">maosystems.io</p>
      </div>
    </footer>
  )
}

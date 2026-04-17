import './Services.css'

const SERVICES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    title: 'Desarrollo Web a Medida',
    description:
      'Aplicaciones web modernas con React, Angular y Node.js. Desde MVPs hasta plataformas empresariales escalables, con UX profesional y código limpio.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>
      </svg>
    ),
    title: 'Dashboards & Analytics',
    description:
      'Paneles de control con visualizaciones interactivas que convierten tus datos en decisiones. Integración con cualquier fuente de datos existente en tu empresa.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    ),
    title: 'APIs & Microservicios',
    description:
      'Arquitecturas backend robustas con Python (FastAPI/Django) o Node.js, documentadas con Swagger/OpenAPI y aseguradas con JWT. Listas para producción.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
      </svg>
    ),
    title: 'Consultoría Tecnológica',
    description:
      'Asesoría estratégica en arquitectura de software, selección de tecnologías y hoja de ruta digital para PYMEs que quieren escalar sin desperdiciar presupuesto.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Automatización de Procesos',
    description:
      'Flujos de trabajo automatizados que eliminan tareas repetitivas, reducen errores humanos y liberan a tu equipo para lo que realmente importa.',
  },
]

/**
 * Services grid — 3 cards in first row, 2 centered in second row.
 */
export default function Services() {
  return (
    <section className="services section" id="services">
      <div className="services__container section__container">

        <header className="section__header animate-on-scroll">
          <span className="section__eyebrow">Qué ofrecemos</span>
          <h2 className="section__title">Soluciones para cada etapa<br />de tu negocio digital</h2>
          <p className="section__subtitle">
            No trabajamos con plantillas — cada proyecto es construido desde los
            requerimientos reales de tu empresa.
          </p>
        </header>

        <div className="services__grid">
          {SERVICES.map(({ icon, title, description }, i) => (
            <article
              key={title}
              className={`service-card animate-on-scroll delay-${i + 1}`}
            >
              <div className="service-card__icon">{icon}</div>
              <h3 className="service-card__title">{title}</h3>
              <p className="service-card__desc">{description}</p>
            </article>
          ))}
        </div>

      </div>
    </section>
  )
}

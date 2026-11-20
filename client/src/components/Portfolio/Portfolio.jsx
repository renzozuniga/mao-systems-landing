import './Portfolio.css'

const PROJECTS = [
  {
    gradient: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
    tags: ['Angular', 'Node.js', 'MongoDB'],
    title: 'TaskBoard',
    description:
      'Sistema de gestión de tareas estilo Kanban con drag & drop, asignación de responsables y seguimiento en tiempo real.',
    status: 'En vivo',
    url: 'https://taskboard-client.vercel.app/',
  },
  {
    gradient: 'linear-gradient(135deg, #0891B2 0%, #0E7490 100%)',
    tags: ['Angular', 'Python', 'FastAPI'],
    title: 'Analytics Dashboard',
    description:
      'Panel de métricas empresariales con gráficas interactivas, filtros dinámicos y exportación a Excel para equipos de operaciones.',
    status: 'En vivo',
    url: 'https://mao-analytics.vercel.app',
  },
  {
    gradient: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
    tags: ['Python', 'FastAPI', 'Swagger'],
    title: 'REST API Core',
    description:
      'API REST con autenticación JWT, roles de usuario, documentación automática con Swagger y cobertura de pruebas al 90%.',
    status: 'En vivo',
    url: 'https://mao-rest-api.onrender.com/docs',
  },
  {
    gradient: 'linear-gradient(135deg, #EA580C 0%, #DC2626 100%)',
    tags: ['React', 'Node.js', 'Vite'],
    title: 'MAO Systems Landing',
    description:
      'Identidad digital corporativa con landing page profesional, formulario de contacto y despliegue continuo en maosystems.io.',
    status: 'Este sitio',
  },
  {
    gradient: 'linear-gradient(135deg, #9333EA 0%, #DB2777 100%)',
    tags: ['Angular', 'Node.js', 'PostgreSQL'],
    title: 'Mini CRM',
    description:
      'Gestión de clientes y pipeline de ventas para PYMEs: contactos, seguimiento de oportunidades y reportes de cierre.',
    status: 'En vivo',
    url: 'https://mao-mini-crm.vercel.app',
  },
]

/**
 * Portfolio grid showcasing the 5 planned/delivered projects.
 */
export default function Portfolio() {
  return (
    <section className="portfolio section" id="portfolio">
      <div className="portfolio__container section__container">

        <header className="section__header animate-on-scroll">
          <span className="section__eyebrow">Portfolio</span>
          <h2 className="section__title">Proyectos que hablan<br />por sí solos</h2>
          <p className="section__subtitle">
            Cada proyecto es construido con código limpio, diseño profesional
            y entregado en tiempo y forma.
          </p>
        </header>

        <div className="portfolio__grid">
          {PROJECTS.map(({ gradient, tags, title, description, status, url }, i) => (
            <article
              key={title}
              className={`project-card animate-on-scroll delay-${i + 1}${url ? ' project-card--linked' : ''}`}
            >
              {/* Color header */}
              <div className="project-card__header" style={{ background: gradient }}>
                <span className="project-card__status">{status}</span>
                {url && (
                  <span className="project-card__header-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="project-card__body">
                <div className="project-card__tags">
                  {tags.map((t) => (
                    <span key={t} className="project-card__tag">{t}</span>
                  ))}
                </div>
                <h3 className="project-card__title">{title}</h3>
                <p className="project-card__desc">{description}</p>
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-card__link"
                  >
                    Ver proyecto
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  )
}

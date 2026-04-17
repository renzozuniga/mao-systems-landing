import './Portfolio.css'

const PROJECTS = [
  {
    gradient: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
    tags: ['Angular', 'Node.js', 'MongoDB'],
    title: 'TaskBoard',
    description:
      'Sistema de gestión de tareas estilo Kanban con drag & drop, asignación de responsables y seguimiento en tiempo real.',
    status: 'En vivo',
  },
  {
    gradient: 'linear-gradient(135deg, #0891B2 0%, #0E7490 100%)',
    tags: ['Angular', 'Python', 'FastAPI'],
    title: 'Analytics Dashboard',
    description:
      'Panel de métricas empresariales con gráficas interactivas, filtros dinámicos y exportación a Excel para equipos de operaciones.',
    status: 'En vivo',
  },
  {
    gradient: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
    tags: ['Python', 'FastAPI', 'Swagger'],
    title: 'REST API Core',
    description:
      'API REST con autenticación JWT, roles de usuario, documentación automática con Swagger y cobertura de pruebas al 90%.',
    status: 'En vivo',
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
    tags: ['Angular', '.NET', 'SQL Server'],
    title: 'Mini CRM',
    description:
      'Gestión de clientes y pipeline de ventas para PYMEs: contactos, seguimiento de oportunidades y reportes de cierre.',
    status: 'En desarrollo',
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
          {PROJECTS.map(({ gradient, tags, title, description, status }, i) => (
            <article
              key={title}
              className={`project-card animate-on-scroll delay-${i + 1}`}
            >
              {/* Color header */}
              <div className="project-card__header" style={{ background: gradient }}>
                <span className="project-card__status">{status}</span>
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
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  )
}

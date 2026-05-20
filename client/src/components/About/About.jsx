import './About.css'

const STATS = [
  { value: '7+',  label: 'Años de experiencia' },
  { value: '15+', label: 'Proyectos entregados'  },
  { value: '3',   label: 'Países de clientes'    },
]

/**
 * "Quiénes somos" section — two-column layout with stats and brand card.
 */
export default function About() {
  return (
    <section className="about section" id="about">
      <div className="about__container section__container">

        {/* Left: text + stats */}
        <div className="about__content animate-on-scroll">
          <span className="section__eyebrow">Quiénes somos</span>
          <h2 className="section__title about__title">
            Tu socio tecnológico,<br />no solo un proveedor
          </h2>
          <p className="about__body">
            MAO Systems es una empresa de desarrollo de software fundada y operada
            desde Perú. Entendemos tu negocio antes de escribir una sola línea de
            código. Combinamos experiencia técnica en Angular, React, Python y Node.js
            con visión estratégica para crear soluciones que realmente hacen crecer
            tu empresa.
          </p>
          <p className="about__body">
            No somos una fábrica de código — trabajamos de forma remota y colaborativa,
            adaptándonos a los procesos de cada cliente desde el primer día hasta el
            despliegue en producción y más allá.
          </p>

          <div className="about__stats">
            {STATS.map(({ value, label }) => (
              <div className="about__stat" key={label}>
                <span className="about__stat-value">{value}</span>
                <span className="about__stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: brand card */}
        <div className="about__visual animate-on-scroll delay-2">
          <div className="about__card">
            <img src="/assets/mao-icon-light.svg" alt="MAO Systems" className="about__card-icon" />
            <div className="about__card-text">
              <p className="about__card-name">MAO Systems</p>
              <p className="about__card-tagline">Engineering Digital Solutions</p>
            </div>
            <div className="about__card-tag">
              <span className="about__dot" />Disponible · Trabajo remoto 🌐
            </div>
          </div>

          {/* Floating stack detail */}
          <div className="about__float about__float--stack animate-on-scroll delay-3">
            <span className="about__float-label">Stack principal</span>
            <div className="about__chips">
              {['Angular', 'React', 'Python', 'Node.js', '.NET', 'AWS'].map((t) => (
                <span key={t} className="about__chip">{t}</span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

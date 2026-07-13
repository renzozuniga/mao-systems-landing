import { useState } from 'react'
import './Contact.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const INITIAL_FORM = { name: '', email: '', company: '', message: '' }

/**
 * Contact section with form (sends to server) and contact info.
 */
export default function Contact() {
  const [form,     setForm]    = useState(INITIAL_FORM)
  const [status,   setStatus]  = useState('idle')  // 'idle' | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res  = await fetch(`${API_URL}/api/contact`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al enviar el mensaje.')
      setStatus('success')
      setForm(INITIAL_FORM)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || 'No se pudo enviar el mensaje. Intenta nuevamente.')
    }
  }

  return (
    <section className="contact section" id="contact">
      <div className="contact__container section__container">

        {/* Left: info */}
        <div className="contact__info animate-on-scroll">
          <span className="section__eyebrow">Contacto</span>
          <h2 className="section__title contact__title">
            ¿Tienes un proyecto<br />en mente?
          </h2>
          <p className="contact__body">
            Cuéntanos qué necesitas y te respondemos en menos de 24 horas con
            una propuesta inicial sin compromiso.
          </p>

          <div className="contact__items">
            {/* Email */}
            <a href="mailto:maosystems.dev@gmail.com" className="contact__item">
              <span className="contact__item-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </span>
              <div>
                <span className="contact__item-label">Email</span>
                <span className="contact__item-value">maosystems.dev@gmail.com</span>
              </div>
            </a>

            {/* Portfolio */}
            <a href="https://www.renzozuniga.dev" target="_blank" rel="noopener noreferrer" className="contact__item">
              <span className="contact__item-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a14.5 14.5 0 0 1 0 20 14.5 14.5 0 0 1 0-20"/>
                  <path d="M2 12h20"/>
                </svg>
              </span>
              <div>
                <span className="contact__item-label">Portfolio</span>
                <span className="contact__item-value">renzozuniga.dev</span>
              </div>
            </a>

            {/* LinkedIn */}
            <a href="https://linkedin.com/in/renzo-zuniga" target="_blank" rel="noopener noreferrer" className="contact__item">
              <span className="contact__item-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </span>
              <div>
                <span className="contact__item-label">LinkedIn</span>
                <span className="contact__item-value">linkedin.com/in/renzo-zuniga</span>
              </div>
            </a>

            {/* Remote */}
            <div className="contact__item">
              <span className="contact__item-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="3" width="20" height="14" rx="2"/>
                  <path d="M8 21h8M12 17v4"/>
                </svg>
              </span>
              <div>
                <span className="contact__item-label">Modalidad</span>
                <span className="contact__item-value">Trabajo remoto · Perú 🇵🇪</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="contact__form-wrap animate-on-scroll delay-2">
          {status === 'success' ? (
            <div className="contact__success">
              <span className="contact__success-icon">✓</span>
              <h3>¡Mensaje enviado!</h3>
              <p>Gracias por contactarnos. Te responderemos en menos de 24 horas.</p>
              <button className="btn btn--outline btn--md" onClick={() => setStatus('idle')}>
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form className="contact__form" onSubmit={handleSubmit} noValidate>
              <div className="contact__field">
                <label htmlFor="name" className="contact__label">Nombre completo *</label>
                <input
                  id="name" name="name" type="text"
                  className="contact__input"
                  placeholder="Tu nombre"
                  value={form.name} onChange={handleChange}
                  required autoComplete="name"
                />
              </div>

              <div className="contact__field">
                <label htmlFor="email" className="contact__label">Correo electrónico *</label>
                <input
                  id="email" name="email" type="email"
                  className="contact__input"
                  placeholder="tu@empresa.com"
                  value={form.email} onChange={handleChange}
                  required autoComplete="email"
                />
              </div>

              <div className="contact__field">
                <label htmlFor="company" className="contact__label">Empresa</label>
                <input
                  id="company" name="company" type="text"
                  className="contact__input"
                  placeholder="Nombre de tu empresa (opcional)"
                  value={form.company} onChange={handleChange}
                  autoComplete="organization"
                />
              </div>

              <div className="contact__field">
                <label htmlFor="message" className="contact__label">Mensaje *</label>
                <textarea
                  id="message" name="message"
                  className="contact__input contact__textarea"
                  placeholder="Cuéntanos sobre tu proyecto o lo que necesitas..."
                  rows={5}
                  value={form.message} onChange={handleChange}
                  required
                />
              </div>

              {status === 'error' && (
                <p className="contact__error">{errorMsg}</p>
              )}

              <button
                type="submit"
                className="btn btn--primary btn--lg contact__submit"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Enviando…' : 'Enviar mensaje'}
              </button>
            </form>
          )}
        </div>

      </div>
    </section>
  )
}

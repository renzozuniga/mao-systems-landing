import { useEffect, useState } from 'react'
import { GA_ID, getConsent, setConsent } from '../../lib/analytics'
import './CookieConsent.css'

/**
 * Asks before loading Google Analytics (cookies). Hidden when GA isn't
 * configured, and renders nothing on the server so prerendered HTML and the
 * first client render match.
 */
export default function CookieConsent() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (GA_ID && !getConsent()) setOpen(true)
  }, [])

  if (!open) return null

  const choose = (value) => {
    setConsent(value)
    setOpen(false)
  }

  return (
    <div className="consent" role="dialog" aria-live="polite" aria-label="Uso de cookies">
      <p className="consent__text">
        Usamos cookies de analítica para entender qué funciona en el sitio y medir
        nuestros anuncios. Puedes aceptarlas o seguir solo con las esenciales.
      </p>
      <div className="consent__actions">
        <button type="button" className="btn btn--outline btn--sm" onClick={() => choose('denied')}>
          Solo esenciales
        </button>
        <button type="button" className="btn btn--primary btn--sm" onClick={() => choose('granted')}>
          Aceptar
        </button>
      </div>
    </div>
  )
}

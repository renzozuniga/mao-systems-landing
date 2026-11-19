import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import useTurnstile from './useTurnstile'
import './Contact.css'

// Phone metadata + flags are heavy; load them only when the phone step shows.
const loadPhoneField = () => import('./PhoneField')
const PhoneField = lazy(loadPhoneField)

/** Country from the browser language (es-MX → MX) without loading the phone chunk. */
const initialCountry = () => {
  const langs = typeof navigator !== 'undefined' ? navigator.languages || [navigator.language] : []
  const region = langs.map((l) => (l || '').split('-')[1]).find((r) => /^[A-Za-z]{2}$/.test(r || ''))
  return region ? region.toUpperCase() : 'PE'
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/**
 * Deliberately broad questions: one tap each, so visitors commit before we ask
 * for anything personal. The long form this replaced was being abandoned halfway.
 */
const QUESTIONS = [
  {
    question: '¿Qué necesitas construir?',
    options:  ['Una web o tienda online', 'Un sistema a medida para mi empresa', 'Aún no lo tengo claro'],
  },
  {
    question: '¿En qué punto estás?',
    options:  ['Tengo una idea', 'Ya tengo algo y quiero mejorarlo', 'Necesito resolver algo urgente'],
  },
  {
    question: '¿Cuándo te gustaría empezar?',
    options:  ['Este mes', 'En 1 a 3 meses', 'Solo estoy explorando'],
  },
]

const KEYS        = ['A', 'B', 'C']
const TOTAL_STEPS = QUESTIONS.length + 1   // questions + phone
const PICK_MS     = 240                    // let the selected fill register before leaving
const LEAVE_MS    = 260                    // matches .stepper__step--leaving transition

/**
 * Contact section: info column + a step-by-step "carousel" that asks three
 * one-tap questions and then only a phone number.
 */
export default function Contact() {
  const [step,     setStep]     = useState(0)        // 0..2 questions, 3 phone, 4 done
  const [answers,  setAnswers]  = useState([])
  const [selected, setSelected] = useState(null)
  const [leaving,  setLeaving]  = useState(false)
  const [dir,      setDir]      = useState('fwd')
  const [phone,    setPhone]    = useState(() => ({ country: initialCountry(), national: '' }))
  const [website,  setWebsite]  = useState('')       // honeypot — humans never see it
  const [error,    setError]    = useState('')
  const [status,   setStatus]   = useState('idle')   // 'idle' | 'sending'

  const timers      = useRef([])
  const headingRef  = useRef(null)
  const interacted  = useRef(false)
  const captchaRef  = useRef(null)

  // Mounted only on the phone step so the challenge runs while the visitor types.
  const turnstile = useTurnstile(captchaRef, step === QUESTIONS.length)

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // Fetch the phone chunk while the visitor answers the last question, so the
  // picker is ready (no skeleton flash) when the phone step slides in.
  useEffect(() => {
    if (step >= QUESTIONS.length - 1) loadPhoneField().catch(() => {})
  }, [step])

  // Move focus to each new question for keyboard and screen-reader users, but
  // never on first render, which would yank the page down to this section.
  useEffect(() => {
    if (interacted.current) headingRef.current?.focus({ preventScroll: true })
  }, [step])

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))

  const goTo = (next, direction) => {
    interacted.current = true
    setDir(direction)
    setLeaving(true)
    later(() => {
      setStep(next)
      setSelected(null)
      setLeaving(false)
    }, LEAVE_MS)
  }

  const pick = (optionIndex) => {
    if (step >= QUESTIONS.length || leaving || selected !== null) return
    setSelected(optionIndex)
    setAnswers((prev) => {
      const copy = [...prev]
      copy[step] = QUESTIONS[step].options[optionIndex]
      return copy
    })
    later(() => goTo(step + 1, 'fwd'), PICK_MS)
  }

  const back = () => {
    if (step === 0 || step > QUESTIONS.length || leaving) return
    setError('')
    goTo(step - 1, 'back')
  }

  const onKeyDown = (e) => {
    if (e.target.tagName === 'INPUT' || e.metaKey || e.ctrlKey || e.altKey) return
    const i = KEYS.indexOf(e.key.toUpperCase())
    if (i !== -1) pick(i)
  }

  const onPhoneChange = (next) => {
    setPhone(next)
    if (error) setError('')
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!phone.national) {
      setError('Ingresa tu número de celular.')
      return
    }
    const { describePhone } = await loadPhoneField()
    const info = describePhone(phone.country, phone.national)
    if (!info.valid) {
      setError(`Revisa tu número: no parece un celular válido de ${info.countryName}.`)
      return
    }
    setStatus('sending')
    setError('')
    try {
      const turnstileToken = await turnstile.getToken()
      if (turnstile.enabled && !turnstileToken) {
        throw new Error('No pudimos verificar que no eres un robot. Recarga la página e inténtalo otra vez.')
      }
      const res = await fetch(`${API_URL}/api/contact`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          answers: QUESTIONS.map((q, i) => ({ question: q.question, answer: answers[i] })),
          phone: info.e164,
          website,
          // Omit rather than send null while Turnstile has no site key.
          ...(turnstileToken && { turnstileToken }),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message)
      setStatus('idle')
      goTo(TOTAL_STEPS, 'fwd')
    } catch (err) {
      setStatus('idle')
      setError(err.message || 'No pudimos enviar tu número. Inténtalo otra vez.')
      turnstile.reset()
    }
  }

  const restart = () => {
    setAnswers([])
    setPhone((p) => ({ ...p, national: '' }))
    setError('')
    goTo(0, 'back')
  }

  const progress = Math.min(step + 1, TOTAL_STEPS)
  const isQuestion = step < QUESTIONS.length
  const isDone = step >= TOTAL_STEPS

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
            Responde tres preguntas rápidas y déjanos tu número. Te escribimos
            por WhatsApp en menos de 24 horas, sin compromiso.
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
                <span className="contact__item-value">Trabajo remoto · Perú</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: stepper */}
        <div className="stepper animate-on-scroll delay-2" onKeyDown={onKeyDown}>
          {!isDone && (
            <>
              <div className="stepper__meta">
                <span>Paso {String(progress).padStart(2, '0')} / {String(TOTAL_STEPS).padStart(2, '0')}</span>
              </div>
              <div
                className="stepper__bar"
                role="progressbar"
                aria-label="Progreso"
                aria-valuemin={1}
                aria-valuemax={TOTAL_STEPS}
                aria-valuenow={progress}
              >
                <span style={{ transform: `scaleX(${progress / TOTAL_STEPS})` }} />
              </div>
            </>
          )}

          <div
            key={step}
            className={`stepper__step stepper__step--${dir}${leaving ? ' stepper__step--leaving' : ''}`}
          >
            {isQuestion && (
              <>
                <h3 className="stepper__question" ref={headingRef} tabIndex={-1}>
                  {QUESTIONS[step].question}
                </h3>
                <div className="stepper__options" role="group" aria-label={QUESTIONS[step].question}>
                  {QUESTIONS[step].options.map((option, i) => (
                    <button
                      key={option}
                      type="button"
                      className={`stepper__option${selected === i || (selected === null && answers[step] === option) ? ' is-selected' : ''}`}
                      style={{ '--i': i }}
                      onClick={() => pick(i)}
                    >
                      <kbd className="stepper__key" aria-hidden="true">{KEYS[i]}</kbd>
                      <span>{option}</span>
                      <svg className="stepper__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6"/>
                      </svg>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === QUESTIONS.length && (
              <form className="stepper__phone-form" onSubmit={submit} noValidate>
                <h3 className="stepper__question" ref={headingRef} tabIndex={-1}>
                  Listo. ¿A qué número te escribimos?
                </h3>
                <label htmlFor="contact-phone" className="visually-hidden">Número de celular</label>
                <Suspense fallback={<div className="phone__skeleton" aria-hidden="true" />}>
                  <PhoneField
                    inputId="contact-phone"
                    country={phone.country}
                    national={phone.national}
                    onChange={onPhoneChange}
                    invalid={Boolean(error)}
                    describedBy="contact-phone-help"
                  />
                </Suspense>
                {/* Honeypot: off-screen field bots tend to fill in. */}
                <input
                  type="text"
                  name="website"
                  className="stepper__hp"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  aria-hidden="true"
                />
                <div ref={captchaRef} className="stepper__captcha" />
                <p className="stepper__error" role="alert">{error}</p>
                <button type="submit" className="btn btn--primary btn--lg stepper__submit" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Enviando…' : 'Enviar mi número'}
                </button>
                <p className="stepper__help" id="contact-phone-help">
                  Te escribimos por WhatsApp en menos de 24 h. Solo usamos tu número
                  para esta conversación.
                </p>
              </form>
            )}

            {isDone && (
              <div className="stepper__done">
                <svg className="stepper__check" viewBox="0 0 56 56" aria-hidden="true">
                  <circle cx="28" cy="28" r="26" />
                  <path d="M17 29l7 7 15-16" />
                </svg>
                <h3 className="stepper__question" ref={headingRef} tabIndex={-1}>
                  Recibido. Te escribimos pronto.
                </h3>
                <p className="stepper__summary">{answers.join(' · ')}</p>
                <button type="button" className="stepper__link" onClick={restart}>
                  Empezar de nuevo
                </button>
              </div>
            )}
          </div>

          {step > 0 && !isDone && (
            <div className="stepper__footer">
              <button type="button" className="stepper__link" onClick={back}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 12H5M11 18l-6-6 6-6"/>
                </svg>
                Volver
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  )
}

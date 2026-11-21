import express              from 'express'
import { Resend }            from 'resend'
import { body, validationResult } from 'express-validator'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { verifyTurnstile }   from '../lib/turnstile.js'

const regionName = new Intl.DisplayNames(['es'], { type: 'region' })

/**
 * Accepts an international number in E.164 ("+5215512345678") or, for web
 * clients deployed before the country picker, a bare Peruvian mobile
 * ("987654321"). Returns the parsed number only when it's valid for its country.
 */
const parsePhone = (value) => {
  const raw = String(value ?? '').trim()
  if (raw.length > 32) return null
  const digits = raw.replace(/\D/g, '')
  const candidate = raw.startsWith('+') ? `+${digits}`
    : /^9\d{8}$/.test(digits) ? `+51${digits}`
    : null
  const parsed = candidate && parsePhoneNumberFromString(candidate)
  return parsed?.isValid() ? parsed : null
}

const router = express.Router()

// Created lazily: the Resend constructor throws without a key, which would
// crash the whole API at import time on a machine with no .env.
let resend
const getResend = () => (resend ??= new Resend(process.env.RESEND_API_KEY))

/** Escape user input before it goes into the email's HTML. */
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
))

// ── Validation rules ──────────────────────────────────────────────────────────
const contactValidation = [
  body('answers')
    .isArray({ min: 1, max: 5 }).withMessage('Faltan respuestas.'),

  body('answers.*.question')
    .isString().trim()
    .notEmpty().isLength({ max: 160 }).withMessage('Pregunta inválida.'),

  body('answers.*.answer')
    .isString().trim()
    .notEmpty().isLength({ max: 160 }).withMessage('Respuesta inválida.'),

  body('phone').custom((value, { req }) => {
    const parsed = parsePhone(value)
    if (!parsed) throw new Error('Revisa tu número: no parece un celular válido para el país elegido.')
    req.parsedPhone = parsed
    return true
  }),

  body('website').optional(),

  // values: 'null' — the deployed client sent null when Turnstile had no keys,
  // and plain optional() only skips undefined, which rejected every submission.
  body('turnstileToken').optional({ values: 'null' }).isString(),

  // Partner referral code from ?ref= links. Never rejects a lead: anything
  // that isn't a plain code is just dropped.
  body('ref').customSanitizer((v) => {
    const code = String(v ?? '').trim().toLowerCase()
    return /^[a-z0-9-]{1,40}$/.test(code) ? code : ''
  }),
]

// ── POST / ────────────────────────────────────────────────────────────────────
/**
 * Receives the contact stepper's answers plus a phone number from any country
 * and emails them to CONTACT_TO_EMAIL via Resend.
 *
 * @param {object} req.body - { answers: [{ question, answer }], phone (E.164), website?, turnstileToken?, ref? }
 * @returns {200} { message }
 * @returns {403} { message } when Turnstile verification fails
 * @returns {422} { message, errors[] } on validation failure
 * @returns {429} { message } when the per-IP rate limit is hit (see app.js)
 * @returns {500} { message } on send error
 */
router.post('/', contactValidation, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const first = errors.array()[0]
    return res.status(422).json({
      message: first?.msg || 'Datos de formulario inválidos.',
      errors: errors.array().map((e) => ({ field: e.path, msg: e.msg })),
    })
  }

  const { answers, website, turnstileToken, ref } = req.body
  const phone = req.parsedPhone

  // Honeypot filled → almost certainly a bot. Answer 200 so it doesn't retry.
  if (website) {
    console.warn('[CONTACT] Honeypot triggered, dropping submission')
    return res.status(200).json({ message: 'Recibido.' })
  }

  const human = await verifyTurnstile(turnstileToken, req.get('cf-connecting-ip') || req.ip)
  if (!human.ok) {
    console.warn('[CONTACT] Turnstile rejected:', human.codes)
    return res.status(403).json({
      message: 'No pudimos verificar que no eres un robot. Recarga la página e inténtalo otra vez.',
    })
  }

  const prettyPhone = phone.formatInternational()
  const country     = phone.country ? regionName.of(phone.country) : ''
  const waLink      = `https://wa.me/${phone.number.slice(1)}`
  const toEmail     = process.env.CONTACT_TO_EMAIL || 'maosystems.dev@gmail.com'
  const sentAt      = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })

  // Lets the stepper be tried end-to-end locally without Resend credentials.
  if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== 'production') {
    console.log('[CONTACT] (dev, no RESEND_API_KEY) Lead:', prettyPhone, ref ? `ref=${ref}` : '(sin ref)', answers)
    return res.status(200).json({ message: 'Recibido.' })
  }

  const rows = answers.map(({ question, answer }) => `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #E2DED3; color: #5F5C55; font-size: 13px; width: 45%;">${esc(question)}</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #E2DED3; color: #15140F; font-size: 15px; font-weight: 600;">${esc(answer)}</td>
          </tr>`).join('')

  const html = `
    <div style="font-family: 'Geist', 'Inter', 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F1E9DA; padding: 24px;">
      <div style="background: #0E4F45; padding: 24px 32px; border-radius: 14px 14px 0 0;">
        <p style="margin: 0 0 6px; color: #7BB89E; font-family: 'Geist Mono', monospace; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;">maosystems.io · nuevo contacto</p>
        <h1 style="color: #F7F5EF; margin: 0; font-size: 22px; font-weight: 700;">${prettyPhone}</h1>
        ${country ? `<p style="margin: 6px 0 0; color: #A8C7B7; font-size: 14px;">${esc(country)}</p>` : ''}
      </div>
      <div style="background: #FFFFFF; padding: 28px 32px; border: 1px solid #E2DED3; border-top: none; border-radius: 0 0 14px 14px;">
        ${ref ? `<p style="margin: 0 0 18px; padding: 10px 14px; background: #FBE6DF; border-radius: 10px; color: #7A3A26; font-size: 14px;"><strong>Recomendado por:</strong> ${esc(ref)}</p>` : ''}
        <a href="${waLink}" style="display: inline-block; background: #0E4F45; color: #F7F5EF; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 20px; border-radius: 10px;">Escribir por WhatsApp</a>
        <table style="width: 100%; border-collapse: collapse; margin-top: 24px;">${rows}
        </table>
        <p style="margin: 24px 0 0; font-size: 12px; color: #8B877E;">Enviado desde maosystems.io · ${sentAt}</p>
      </div>
    </div>
  `

  const text = [
    `Nuevo contacto: ${prettyPhone}${country ? ` (${country})` : ''}`,
    `WhatsApp: ${waLink}`,
    ...(ref ? [`Recomendado por: ${ref}`] : []),
    '',
    ...answers.map(({ question, answer }) => `${question} ${answer}`),
    '',
    `Enviado: ${sentAt}`,
  ].join('\n')

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

  try {
    const { error } = await getResend().emails.send({
      from:    `MAO Systems Web <${fromEmail}>`,
      to:      [toEmail],
      subject: `[maosystems.io] Nuevo contacto · ${prettyPhone}${country ? ` · ${country}` : ''}${ref ? ` · ref: ${ref}` : ''}`,
      html,
      text,
    })

    if (error) {
      console.error('[CONTACT] Resend error:', error)
      return res.status(500).json({ message: 'No pudimos enviar tu número. Inténtalo otra vez.' })
    }

    console.log(`[CONTACT] Lead ${prettyPhone} sent to ${toEmail}`)
    return res.status(200).json({ message: 'Recibido.' })
  } catch (err) {
    console.error('[CONTACT] Resend error:', err.message)
    return res.status(500).json({ message: 'No pudimos enviar tu número. Inténtalo otra vez.' })
  }
})

export default router

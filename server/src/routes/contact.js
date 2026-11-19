import express              from 'express'
import { Resend }            from 'resend'
import { body, validationResult } from 'express-validator'

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

  body('phone')
    .customSanitizer((v) => String(v ?? '').replace(/\D/g, ''))
    .matches(/^9\d{8}$/).withMessage('Ingresa un celular de 9 dígitos que empiece con 9.'),

  body('website').optional(),
]

// ── POST / ────────────────────────────────────────────────────────────────────
/**
 * Receives the contact stepper's answers plus a Peruvian mobile number and
 * emails them to CONTACT_TO_EMAIL via Resend.
 *
 * @param {object} req.body - { answers: [{ question, answer }], phone, website? }
 * @returns {200} { message }
 * @returns {422} { message, errors[] } on validation failure
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

  const { answers, phone, website } = req.body

  // Honeypot filled → almost certainly a bot. Answer 200 so it doesn't retry.
  if (website) {
    console.warn('[CONTACT] Honeypot triggered, dropping submission')
    return res.status(200).json({ message: 'Recibido.' })
  }

  const prettyPhone = `+51 ${phone.replace(/(\d{3})(?=\d)/g, '$1 ')}`
  const waLink      = `https://wa.me/51${phone}`
  const toEmail     = process.env.CONTACT_TO_EMAIL || 'maosystems.dev@gmail.com'
  const sentAt      = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })

  // Lets the stepper be tried end-to-end locally without Resend credentials.
  if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== 'production') {
    console.log('[CONTACT] (dev, no RESEND_API_KEY) Lead:', prettyPhone, answers)
    return res.status(200).json({ message: 'Recibido.' })
  }

  const rows = answers.map(({ question, answer }) => `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #E2DED3; color: #5F5C55; font-size: 13px; width: 45%;">${esc(question)}</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #E2DED3; color: #15140F; font-size: 15px; font-weight: 600;">${esc(answer)}</td>
          </tr>`).join('')

  const html = `
    <div style="font-family: 'Geist', 'Inter', 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F7F5EF; padding: 24px;">
      <div style="background: #0F3D2E; padding: 24px 32px; border-radius: 14px 14px 0 0;">
        <p style="margin: 0 0 6px; color: #7BB89E; font-family: 'Geist Mono', monospace; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;">maosystems.io · nuevo contacto</p>
        <h1 style="color: #F7F5EF; margin: 0; font-size: 22px; font-weight: 700;">${prettyPhone}</h1>
      </div>
      <div style="background: #FFFFFF; padding: 28px 32px; border: 1px solid #E2DED3; border-top: none; border-radius: 0 0 14px 14px;">
        <a href="${waLink}" style="display: inline-block; background: #0F3D2E; color: #F7F5EF; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 20px; border-radius: 10px;">Escribir por WhatsApp</a>
        <table style="width: 100%; border-collapse: collapse; margin-top: 24px;">${rows}
        </table>
        <p style="margin: 24px 0 0; font-size: 12px; color: #8B877E;">Enviado desde maosystems.io · ${sentAt}</p>
      </div>
    </div>
  `

  const text = [
    `Nuevo contacto: ${prettyPhone}`,
    `WhatsApp: ${waLink}`,
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
      subject: `[maosystems.io] Nuevo contacto · ${prettyPhone}`,
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

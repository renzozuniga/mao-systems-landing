import express              from 'express'
import nodemailer            from 'nodemailer'
import { body, validationResult } from 'express-validator'

const router = express.Router()

// ── Nodemailer transporter ────────────────────────────────────────────────────
/** Creates a reusable SMTP transporter from environment variables. */
const createTransporter = () =>
  nodemailer.createTransport({
    host:   process.env.SMTP_HOST || 'smtp.gmail.com',
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

// ── Validation rules ──────────────────────────────────────────────────────────
const contactValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isLength({ max: 120 }).withMessage('Nombre demasiado largo.'),

  body('email')
    .trim()
    .notEmpty().withMessage('El correo es obligatorio.')
    .isEmail().withMessage('Formato de correo inválido.')
    .normalizeEmail(),

  body('company')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 120 }).withMessage('Nombre de empresa demasiado largo.'),

  body('message')
    .trim()
    .notEmpty().withMessage('El mensaje es obligatorio.')
    .isLength({ min: 10, max: 2000 }).withMessage('El mensaje debe tener entre 10 y 2000 caracteres.'),
]

// ── POST / ────────────────────────────────────────────────────────────────────
/**
 * Receives contact form data, validates it, and sends an email
 * to the configured CONTACT_TO_EMAIL address via SMTP.
 *
 * @param {object} req.body - { name, email, company?, message }
 * @returns {200} { message: 'Mensaje enviado correctamente.' }
 * @returns {422} { message, errors[] } on validation failure
 * @returns {500} { message } on SMTP error
 */
router.post('/', contactValidation, async (req, res) => {
  // Validate input
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Datos de formulario inválidos.',
      errors: errors.array().map((e) => ({ field: e.path, msg: e.msg })),
    })
  }

  const { name, email, company, message } = req.body
  const toEmail = process.env.CONTACT_TO_EMAIL || 'maosystems.dev@gmail.com'

  // Build email content
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #16A34A; padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 800;">
          MAO Systems — Nuevo mensaje de contacto
        </h1>
      </div>
      <div style="background: #F8FAFC; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; font-weight: 700; color: #6B7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; width: 120px;">Nombre</td>
            <td style="padding: 10px 0; color: #0F172A; font-size: 15px;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: 700; color: #6B7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em;">Email</td>
            <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #16A34A; font-size: 15px;">${email}</a></td>
          </tr>
          ${company ? `
          <tr>
            <td style="padding: 10px 0; font-weight: 700; color: #6B7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em;">Empresa</td>
            <td style="padding: 10px 0; color: #0F172A; font-size: 15px;">${company}</td>
          </tr>` : ''}
          <tr>
            <td colspan="2" style="padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="font-weight: 700; color: #6B7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 10px;">Mensaje</p>
              <p style="color: #0F172A; font-size: 15px; line-height: 1.7; white-space: pre-wrap; margin: 0;">${message}</p>
            </td>
          </tr>
        </table>
        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #94A3B8;">
          Enviado desde maosystems.io — ${new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })}
        </div>
      </div>
    </div>
  `

  try {
    const transporter = createTransporter()
    await transporter.sendMail({
      from:    `"MAO Systems Web" <${process.env.SMTP_USER}>`,
      to:      toEmail,
      replyTo: email,
      subject: `[maosystems.io] Nuevo contacto de ${name}`,
      html,
      text: `Nombre: ${name}\nEmail: ${email}\n${company ? `Empresa: ${company}\n` : ''}Mensaje:\n${message}`,
    })

    console.log(`[CONTACT] Message from ${email} sent to ${toEmail}`)
    return res.status(200).json({ message: 'Mensaje enviado correctamente.' })
  } catch (err) {
    console.error('[CONTACT] SMTP error:', err.message)
    return res.status(500).json({ message: 'Error al enviar el mensaje. Inténtalo nuevamente.' })
  }
})

export default router

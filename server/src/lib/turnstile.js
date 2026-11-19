const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

let warnedMissingSecret = false

/**
 * Checks a Cloudflare Turnstile token server-side.
 *
 * Until TURNSTILE_SECRET_KEY is configured this lets requests through (with a
 * one-time warning) so deploying the code before the keys exist doesn't take
 * the contact form down; the honeypot and rate limit still apply meanwhile.
 *
 * @returns {Promise<{ ok: boolean, skipped?: boolean, codes?: string[] }>}
 */
export async function verifyTurnstile(token, remoteip) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    if (!warnedMissingSecret) {
      console.warn('[TURNSTILE] TURNSTILE_SECRET_KEY not set — skipping bot verification')
      warnedMissingSecret = true
    }
    return { ok: true, skipped: true }
  }

  if (!token || typeof token !== 'string' || token.length > 2048) {
    return { ok: false, codes: ['missing-input-response'] }
  }

  try {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip }),
      signal: AbortSignal.timeout(8000),
    })
    const data = await res.json()
    return { ok: Boolean(data.success), codes: data['error-codes'] || [] }
  } catch (err) {
    // Cloudflare unreachable: fail closed; the visitor can retry and still has
    // the email link on the page.
    console.error('[TURNSTILE] Verification request failed:', err.message)
    return { ok: false, codes: ['internal-error'] }
  }
}

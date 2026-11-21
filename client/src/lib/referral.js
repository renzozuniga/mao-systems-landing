/**
 * Partner referral links: maosystems.io/?ref=agencia-x
 *
 * The code is remembered for 6 months (the referral validity in the partner
 * program) and sent with the contact form, so the lead email says who
 * recommended the visitor even if they come back days later without the link.
 * First referral wins: a later link doesn't take the commission from the
 * partner who brought the visitor first.
 */

const KEY = 'mao-ref'
const MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000
const VALID = /^[a-z0-9-]{1,40}$/

const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null') } catch { return null }
}

/** Current referral code, or '' if none or expired. */
export function getReferral() {
  const saved = read()
  if (!saved || !VALID.test(saved.code || '')) return ''
  if (Date.now() - (saved.at || 0) > MAX_AGE_MS) return ''
  return saved.code
}

/** Reads ?ref= from the URL on page load and stores it if there isn't a live one. */
export function captureReferral() {
  if (typeof window === 'undefined') return
  const code = (new URLSearchParams(window.location.search).get('ref') || '').trim().toLowerCase()
  if (!VALID.test(code) || getReferral()) return
  try {
    localStorage.setItem(KEY, JSON.stringify({ code, at: Date.now() }))
  } catch { /* private mode: still sent this visit via the URL below */ }
}

/** Same as getReferral, falling back to the URL when storage is blocked. */
export function currentReferral() {
  const stored = getReferral()
  if (stored) return stored
  const code = (new URLSearchParams(window.location.search).get('ref') || '').trim().toLowerCase()
  return VALID.test(code) ? code : ''
}
